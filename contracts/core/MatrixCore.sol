pragma solidity ^0.5.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./MatrixOwnable.sol";
import "../interfaces/ILeaderPool.sol";
import "../interfaces/IMatrix.sol";
import "../interfaces/IPriceController.sol";

contract MatrixCore is IMatrix, ILeaderPool, MatrixOwnable {

    using SafeMath for uint256;

    //
    // Storage
    //

    uint256 public lastUserId = 0;
    mapping(address => User) internal users;
    mapping(uint256 => address payable) public idToAddress;

    uint256 public matrixCount = 1;
    mapping(uint256 => MatrixPosition) internal matrix;

    uint256 public matrixEntryCost = 50;
    uint256 public rootUserId;

    IPriceController public priceController;

    address payable[10] internal leaderPool;

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

    event MakedRewards(address payable indexed _contextUpline, uint256 timestamp);
    event TransferSuccess(address payable indexed recipient, uint256 indexed value, uint256 timestamp);
    event TransferError(address payable indexed recipient, uint256 indexed value, uint256 timestamp);

    event MatrixEntryCostChanged(uint256 indexed newCost, uint256 indexed oldCost, uint256 timestamp);

    //
    // External / public methods
    //

    constructor(address payable _rootUser, address _priceController) public {

        // init default user
        rootUserId = _createUser(_rootUser, address(0));
        priceController = IPriceController(_priceController);
        _createMatrix(_rootUser, address(0));
    }

    function() external payable {
        if (msg.data.length == 0) {
            _register(msg.sender, idToAddress[rootUserId]);
        } else {
            _register(msg.sender, _bytesToAddress(msg.data));
        }
    }

    function register(address _referrerAddress) external payable returns(uint) {
        return _register(msg.sender, _referrerAddress);
    }


    function changeEntryCost(uint256 _newCost) external onlyOwner returns(uint) {
        return _changeEntryCost(_newCost);
    }

    function setLeaderPool(address payable[10] calldata _leaderPool) external onlyOwner returns(bool) {
        leaderPool = _leaderPool;
    }

    function getLeaderPool() external view returns(address payable[10] memory) {
        return leaderPool;
    }

    function getUser(address _userAddress) external view returns(uint256, address, uint256, uint256[] memory) {
        return (
            users[_userAddress].id,
            users[_userAddress].referrerAddress,
            users[_userAddress].referralsCount,
            users[_userAddress].matrixIds
        );
    }

    function getMatrix(uint256 _matrixId) external view returns(
        uint256,
        address payable,
        bool,
        uint256,
        uint256[] memory
    ) {
        return (
            matrix[_matrixId].parentMatrixId,
            matrix[_matrixId].userAddress,
            matrix[_matrixId].closed,
            matrix[_matrixId].subtreeMatrixCount,
            matrix[_matrixId].childMatrixIds
        );
    }

    function getCostSunPrice() public view returns(uint256) {
        return matrixEntryCost.mul(priceController.getCurrentUsdRate());
    }

    //
    // Private methods
    //

    function _register(address payable _userAddress, address _referrerAddress) private returns(uint256) {
        require(msg.value == getCostSunPrice(), "Matrix: invalid sending value");
        require(_userAddress != _referrerAddress, "Matrix: invalid _userAddress value");
        require(_referrerAddress != address(0), "Matrix: invalid _userAddress value");

        uint256 newUserId = _createUser(_userAddress, _referrerAddress);

        uint256 newMatrixId = _createMatrix(_userAddress, _referrerAddress);

        emit RegisterSuccessful(
            _userAddress,
            newUserId,
            _referrerAddress,
            users[_referrerAddress].id,
            newMatrixId,
            msg.value,
            block.timestamp
        );

        return newUserId;
    }

    function _changeEntryCost(uint256 _newCost) private onlyOwner returns(uint256) {
        uint256 oldCost = matrixEntryCost;
        matrixEntryCost = _newCost;

        emit MatrixEntryCostChanged(_newCost, oldCost, block.timestamp);

        return _newCost;
    }

    function _createUser(address payable _userAddress, address _referrerAddress) private returns(uint256) {
        require(!_isUserExists(_userAddress), "Matrix: user exists");
        require(_isUserExists(_referrerAddress) || users[_userAddress].id == rootUserId, "Matrix: referrer not exists");

        // the referrer cannot be contract
        // solhint-disable-next-line no-inline-assembly
        uint256 codeSize;
        assembly { codeSize := extcodesize(_userAddress) }
        require(codeSize == 0, "Matrix: new user cannot be a contract");

        // create user
        uint256 newUserId = lastUserId;
        users[_userAddress] = User({
            id: newUserId,
            referrerAddress: _referrerAddress,
            referralsCount: uint256(0),
            matrixIds: new uint256[](0)
        });
        idToAddress[newUserId] = _userAddress;

        // update upline user
        users[_referrerAddress].referralsCount = users[_referrerAddress].referralsCount.add(1);

        emit UserCreated(_userAddress, _referrerAddress, newUserId, block.timestamp);

        lastUserId = lastUserId.add(1);

        return newUserId;
    }

    function _createMatrix(address payable _userAddress, address _parentAddress) private returns(uint256) {
        
        // create matrix position
        matrix[matrixCount] = MatrixPosition({
            parentMatrixId: uint(0),
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
            _makeRewards(0);
            emit MatrixCreated(newMatrixIndex, uint(0), _userAddress, block.timestamp);
            return newMatrixIndex;
        }

        // find matrix where to attach
        uint256 referrerActualMatrixId = users[_parentAddress].matrixIds[users[_parentAddress].matrixIds.length.sub(1)];
        uint256 parentMatrixId = _getParentMatrixId(referrerActualMatrixId);

        // binding new matrix to parent matrix
        matrix[newMatrixIndex].parentMatrixId = parentMatrixId;
        matrix[parentMatrixId].childMatrixIds.push(newMatrixIndex);

        // recalculate subtree params
        uint256 subtreeParentId = newMatrixIndex;
        for (uint256 i = 0; i < _getSubtreeHeight(); i++) {
            subtreeParentId = matrix[subtreeParentId].parentMatrixId;
            if (subtreeParentId == 0) {
                _makeRewards(0);  // TODO maybe bug
                emit MatrixCreated(newMatrixIndex, parentMatrixId, _userAddress, block.timestamp);
                return newMatrixIndex;
            }
            matrix[subtreeParentId].subtreeMatrixCount = matrix[subtreeParentId].subtreeMatrixCount.add(1); 
        }

        // make rewards or reinvest
        if (matrix[subtreeParentId].subtreeMatrixCount < _getRefferalsLimit()) {
            // _makeRewards(parentLastMatrixId);
        } else {
            matrix[subtreeParentId].closed = true;
            _createMatrix(
                matrix[subtreeParentId].userAddress,
                users[matrix[subtreeParentId].userAddress].referrerAddress
            );

            emit Reinvest(newMatrixIndex, _userAddress, block.timestamp);
        }

        emit MatrixCreated(newMatrixIndex, parentMatrixId, _userAddress, block.timestamp);

        return newMatrixIndex; 
    }

    function resolveFilling(uint256 _id) external view returns(uint) {
        return _getParentMatrixId(_id);
    }

    //
    // Internal methods
    //

    function _rewardLeaders(uint256 _rewardAmount) internal {
        uint256 value30Percent = _rewardAmount.mul(30).div(100);
        uint256 value20Percent = _rewardAmount.mul(20).div(100);
        uint256 value10Percent = _rewardAmount.mul(10).div(100);
        uint256 value5Percent = _rewardAmount.mul(5).div(100);

        _nonBlockingTransfer(leaderPool[0], value30Percent);
        _nonBlockingTransfer(leaderPool[1], value20Percent);
        _nonBlockingTransfer(leaderPool[2], value10Percent);
        _nonBlockingTransfer(leaderPool[3], value10Percent);
        _nonBlockingTransfer(leaderPool[4], value5Percent);
        _nonBlockingTransfer(leaderPool[5], value5Percent);
        _nonBlockingTransfer(leaderPool[6], value5Percent);
        _nonBlockingTransfer(leaderPool[7], value5Percent);
        _nonBlockingTransfer(leaderPool[8], value5Percent);
        _nonBlockingTransfer(leaderPool[9], value5Percent);
    }

    function _nonBlockingTransfer(address payable _target, uint256 _amount) internal {
        if (_target.send(_amount)) {
            emit TransferSuccess(_target, _amount, block.timestamp);
        } else {
            emit TransferError(_target, _amount, block.timestamp);
        }
    }

    function _isUserExists(address _user) internal view returns(bool) {
        if (_user == address(0)) {
            return true;
        }
        return (users[_user].id != 0);
    }

    function _bytesToAddress(bytes memory _data) internal pure returns (address addr) {
        assembly {
            addr := mload(add(_data, 20))
        }
    }

    //
    // Hooks
    // 

    function _makeRewards(uint256 _newMatrixIndex) internal;

    function _getParentMatrixId(uint256 _localRootMatrix) internal view returns(uint256);

    function _getSubtreeHeight() internal pure returns(uint256);

    function _getRefferalsLimit() internal pure returns(uint256);

}
