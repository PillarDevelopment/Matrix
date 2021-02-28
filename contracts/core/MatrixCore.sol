pragma solidity ^0.5.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./MatrixOwnable.sol";
import "../interfaces/IMatrix.sol";
import "../interfaces/IPriceController.sol";

/**
 * @dev Implementation of the core of Matrix system.
 * Contains basic methods for working with mlm.
 */
contract MatrixCore is IMatrix, MatrixOwnable {
    using SafeMath for uint256;

    //
    // Storage
    //

    uint256 public userCount = 0;
    mapping(address => User) internal users;
    mapping(uint256 => address payable) public idToAddress;

    uint256 public matrixCount = 1;
    mapping(uint256 => MatrixPosition) internal matrix;

    uint256 public matrixEntryCost = 50;
    uint256 public rootUserId;

    IPriceController public priceController;

    //
    // Events
    //

    event RegisterSuccessful(
        address indexed newUserAddress,
        uint256 indexed newUserId,
        address indexed referrerAddress,
        uint256 referrerId,
        uint256 newMatrixId,
        uint256 sendingValue,
        uint256 timestamp
    );
    event UserCreated(
        address indexed newUserAddress,
        address indexed referrerAddress,
        uint256 indexed newUserId,
        uint256 timestamp
    );
    event MatrixCreated(
        uint256 indexed matrixId,
        uint256 indexed parentMatrixId,
        address indexed userAddress,
        uint256 timestamp
    );
    event Reinvest(
        uint256 indexed matrixId,
        address indexed userAddress,
        uint256 timestamp
    );
    event Rewards(
        uint256 indexed parentMatrixIndex,
        uint256 indexed rewardValue,
        uint256 timestamp
    );
    event TransferSuccess(
        address payable indexed recipient,
        uint256 indexed value,
        uint256 timestamp
    );
    event MatrixEntryCostChanged(
        uint256 indexed newCost,
        uint256 indexed oldCost,
        uint256 timestamp
    );

    //
    // External / public methods
    //

    constructor(address payable _rootUser, address _priceController) public {
        // init default user
        rootUserId = _createUser(_rootUser, address(0));
        priceController = IPriceController(_priceController);
        _createMatrix(_rootUser, address(0));
    }

    /**
     * @dev Register a new user and ask him a matrix.
     * The new matrix binds to the parent matrix.
     * @param _referrerAddress Inviter's (referral's) wallet address
     * @return userId New User ID
     */
    function register(address _referrerAddress)
        external
        payable
        returns (uint256 userId)
    {
        return _register(msg.sender, _referrerAddress);
    }

    /**
     * @dev Administrator function.
     * Changes registration cost (US dollars).
     * @param _newCost New registration cost
     * @return newEnryCost New registration cost
     */
    function changeEntryCost(uint256 _newCost)
        external
        onlyOwner
        returns (uint256 newEnryCost)
    {
        return _changeEntryCost(_newCost);
    }

    function setPriceController(address _newController)
        external
        onlyOwner
        returns (bool)
    {
        priceController = IPriceController(_newController);
        return true;
    }

    function withdrawTrx(uint256 _amount)
        external
        onlyOwner
        returns (bool success)
    {
        msg.sender.transfer(_amount);
        return true;
    }

    function withdrawTrc10(uint256 _amount, trcToken tokenID)
        external
        onlyOwner
        returns (bool success)
    {
        msg.sender.transferToken(_amount, tokenID);
        return true;
    }

    /**
     * @dev Get detailed information about a user
     * @param _userAddress Target wallet address
     * @return isCreated was created or not
     * @return id User Id
     * @return referrerAddress Referrer Address
     * @return referralsCount Referrals Count
     * @return matrixIds User Matrix IDs
     */
    function getUser(address _userAddress)
        external
        view
        returns (
            bool isCreated,
            uint256 id,
            address referrerAddress,
            uint256 referralsCount,
            uint256[] memory matrixIds
        )
    {
        return (
            users[_userAddress].isCreated,
            users[_userAddress].id,
            users[_userAddress].referrerAddress,
            users[_userAddress].referralsCount,
            users[_userAddress].matrixIds
        );
    }

    /**
     * @dev Get detailed information about a matrix
     * @param _matrixId Target matrix ID
     * @return isCreated was created or not
     * @return parentMatrixId ID of the matrix this matrix is bound to
     * @return userAddress Matrix owner address
     * @return closed Is the matrix full
     * @return subtreeMatrixCount Number of matrices in a subtree
     * @return childMatrixIds Matrices bound to this matrix
     */
    function getMatrix(uint256 _matrixId)
        external
        view
        returns (
            bool isCreated,
            uint256 parentMatrixId,
            address payable userAddress,
            bool closed,
            uint256 subtreeMatrixCount,
            uint256[] memory childMatrixIds
        )
    {
        return (
            matrix[_matrixId].isCreated,
            matrix[_matrixId].parentMatrixId,
            matrix[_matrixId].userAddress,
            matrix[_matrixId].closed,
            matrix[_matrixId].subtreeMatrixCount,
            matrix[_matrixId].childMatrixIds
        );
    }

    /**
     * @dev Get the current registration price in tokens
     */
    function getCostSunPrice() public view returns (uint256) {
        return matrixEntryCost.mul(priceController.getCurrentUsdRate());
    }

    //
    // Private methods
    //

    function _changeEntryCost(uint256 _newCost) private returns (uint256) {
        uint256 oldCost = matrixEntryCost;
        matrixEntryCost = _newCost;

        emit MatrixEntryCostChanged(_newCost, oldCost, block.timestamp);

        return _newCost;
    }

    function _register(address payable _userAddress, address _referrerAddress)
        private
        returns (uint256)
    {
        require(
            msg.tokenid == priceController.getTokenID(),
            "Matrix: invalid ProgramToken ID"
        );
        require(
            msg.tokenvalue == getCostSunPrice(),
            "Matrix: invalid sending value"
        );
        require(
            _userAddress != _referrerAddress,
            "Matrix: invalid _userAddress value"
        );
        require(
            _referrerAddress != address(0),
            "Matrix: parent must not be zero"
        );

        uint256 newUserId = _createUser(_userAddress, _referrerAddress);

        uint256 newMatrixId = _createMatrix(_userAddress, _referrerAddress);

        emit RegisterSuccessful(
            _userAddress,
            newUserId,
            _referrerAddress,
            users[_referrerAddress].id,
            newMatrixId,
            msg.tokenvalue,
            block.timestamp
        );

        return newUserId;
    }

    function _createUser(address payable _userAddress, address _referrerAddress)
        private
        returns (uint256)
    {
        require(!_isUserExists(_userAddress), "Matrix: user exists");
        require(
            _isUserExists(_referrerAddress) || _referrerAddress == address(0),
            "Matrix: referrer not exists"
        );

        // the referrer cannot be contract
        // solhint-disable-next-line no-inline-assembly
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(_userAddress)
        }
        require(codeSize == 0, "Matrix: new user cannot be a contract");

        // create user
        uint256 newUserId = userCount;
        users[_userAddress] = User({
            isCreated: true,
            id: newUserId,
            referrerAddress: _referrerAddress,
            referralsCount: uint256(0),
            matrixIds: new uint256[](0)
        });
        idToAddress[newUserId] = _userAddress;

        // update upline user
        users[_referrerAddress].referralsCount = users[_referrerAddress]
            .referralsCount
            .add(1);

        emit UserCreated(
            _userAddress,
            _referrerAddress,
            newUserId,
            block.timestamp
        );

        userCount = userCount.add(1);

        return newUserId;
    }

    function _createMatrix(address payable _userAddress, address _parentAddress)
        private
        returns (uint256)
    {
        // create matrix position
        matrix[matrixCount] = MatrixPosition({
            isCreated: true,
            parentMatrixId: uint256(0),
            userAddress: _userAddress,
            closed: false,
            subtreeMatrixCount: 0,
            childMatrixIds: new uint256[](0)
        });
        users[_userAddress].matrixIds.push(matrixCount);
        uint256 newMatrixIndex = matrixCount;
        matrixCount = matrixCount.add(1);

        // if parent user is root
        if (_parentAddress == address(0)) {
            if (matrixCount > 2) _makeRewards(0);
            emit MatrixCreated(
                newMatrixIndex,
                uint256(0),
                _userAddress,
                block.timestamp
            );
            return newMatrixIndex;
        }

        // find the matrix to attach to
        uint256 referrerActualMatrixId =
            users[_parentAddress].matrixIds[
                users[_parentAddress].matrixIds.length.sub(1)
            ];
        uint256 parentMatrixId = _getParentMatrixId(referrerActualMatrixId);

        // binding new matrix to parent matrix
        matrix[newMatrixIndex].parentMatrixId = parentMatrixId;
        matrix[parentMatrixId].childMatrixIds.push(newMatrixIndex);

        // recalculate subtree params
        uint256 subtreeParentId = newMatrixIndex;
        for (uint256 i = 0; i < _getSubtreeHeight(); i++) {
            subtreeParentId = matrix[subtreeParentId].parentMatrixId;
            if (subtreeParentId == 0) {
                break;
            }
            matrix[subtreeParentId].subtreeMatrixCount = matrix[subtreeParentId]
                .subtreeMatrixCount
                .add(1);
        }

        // make rewards or reinvest
        if (matrix[subtreeParentId].subtreeMatrixCount < _getRefferalsLimit()) {
            _makeRewards(parentMatrixId);
        } else {
            matrix[subtreeParentId].closed = true;
            _makeRewards(parentMatrixId);
            _createMatrix(
                matrix[subtreeParentId].userAddress,
                users[matrix[subtreeParentId].userAddress].referrerAddress
            );

            emit Reinvest(newMatrixIndex, _userAddress, block.timestamp);
        }

        emit MatrixCreated(
            newMatrixIndex,
            parentMatrixId,
            _userAddress,
            block.timestamp
        );

        return newMatrixIndex;
    }

    //
    // Internal methods
    //

    function _nonBlockingTransfer(address payable _target, uint256 _amount)
        internal
    {
        _target.transferToken(_amount, msg.tokenid);
        emit TransferSuccess(_target, _amount, block.timestamp);
    }

    function _isUserExists(address _user) internal view returns (bool) {
        return (users[_user].isCreated == true);
    }

    //
    // Hooks
    //

    function _makeRewards(uint256 _newMatrixIndex) internal;

    function _getParentMatrixId(uint256 _localRootMatrix)
        internal
        view
        returns (uint256);

    function _getSubtreeHeight() internal pure returns (uint256);

    function _getRefferalsLimit() internal pure returns (uint256);
}
