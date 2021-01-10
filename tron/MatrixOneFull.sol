
// File: @openzeppelin/contracts/math/SafeMath.sol

pragma solidity ^0.5.0;

/**
 * @dev Wrappers over Solidity's arithmetic operations with added overflow
 * checks.
 *
 * Arithmetic operations in Solidity wrap on overflow. This can easily result
 * in bugs, because programmers usually assume that an overflow raises an
 * error, which is the standard behavior in high level programming languages.
 * `SafeMath` restores this intuition by reverting the transaction when an
 * operation overflows.
 *
 * Using this library instead of the unchecked operations eliminates an entire
 * class of bugs, so it's recommended to use it always.
 */
library SafeMath {
    /**
     * @dev Returns the addition of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `+` operator.
     *
     * Requirements:
     * - Addition cannot overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting with custom message on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     * - Subtraction cannot overflow.
     *
     * _Available since v2.4.0._
     */
    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `*` operator.
     *
     * Requirements:
     * - Multiplication cannot overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts with custom message on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     *
     * _Available since v2.4.0._
     */
    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        // Solidity only automatically asserts when dividing by 0
        require(b > 0, errorMessage);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return mod(a, b, "SafeMath: modulo by zero");
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts with custom message when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     *
     * _Available since v2.4.0._
     */
    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b != 0, errorMessage);
        return a % b;
    }
}

// File: contracts/core/MatrixOwnable.sol

pragma solidity ^0.5.0;


/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
contract MatrixOwnable {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor () internal {
        address msgSender = msg.sender;
        _owner = msgSender;
        emit OwnershipTransferred(address(0), msgSender);
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(isOwner(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Returns true if the caller is the current owner.
     */
    function isOwner() public view returns (bool) {
        return msg.sender == _owner;
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     */
    function _transferOwnership(address newOwner) internal {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

// File: contracts/interfaces/ILeaderPool.sol

pragma solidity ^0.5.9;

interface ILeaderPool {

    function setLeaderPool(address payable[10] calldata) external returns(bool);

    function getLeaderPool() external view returns(address payable[10] memory);

}

// File: contracts/interfaces/IMatrix.sol

pragma solidity ^0.5.9;

interface IMatrix {

    struct MatrixPosition {
        uint256 parentMatrixId;
        address payable userAddress;
        bool closed;
        uint256 subtreeMatrixCount;
        uint256[] childMatrixIds;
    }

    struct User {
        uint256 id;
        address referrerAddress;
        uint256 referralsCount;
        uint256[] matrixIds;
    }

    function register(address _referrerAddress) external payable returns(uint256);

    function changeEntryCost(uint256 _newCost) external returns(uint256);

    function getUser(address _userAddress) external view returns(uint256, address, uint256, uint256[] memory);

    function getMatrix(uint256 _matrixId) external view returns(
        uint256,
        address payable,
        bool,
        uint256,
        uint256[] memory
    );

}

// File: contracts/interfaces/IPriceController.sol

pragma solidity ^0.5.9;

interface IPriceController {

    function setPriceProvider(address _newPriceProvider) external;
    
    function updateUsdRate(uint256 _newRate) external;

    function getCurrentUsdRate() external view returns(uint256);

    function getTokenID() external view returns(trcToken);
}

// File: contracts/core/MatrixCore.sol

pragma solidity ^0.5.9;






/**
 * @dev Implementation of the core of Matrix system.
 * Contains basic methods for working with mlm.
 */
contract MatrixCore is IMatrix, ILeaderPool, MatrixOwnable {

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

    event MakedRewards(
        uint256 indexed parentMatrixIndex,
        uint256 indexed rewardValue,
        uint256 timestamp
    );
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

    /**
    * @dev User can register in the system by directly transferring funds to the contract
    */
    function() external payable {
        if (msg.data.length == 0) {
            _register(msg.sender, idToAddress[rootUserId]);
        } else {
            revert("Matrix: Wrong method signature");
        }
    }

    /**
    * @dev Register a new user and ask him a matrix.
    * The new matrix binds to the parent matrix.
    * @param _referrerAddress Inviter's (referral's) wallet address
    * @return userId New User ID
    */
    function register(address _referrerAddress) external payable returns(uint256 userId) {
        return _register(msg.sender, _referrerAddress);
    }


    /**
    * @dev Administrator function.
    * Changes registration cost (US dollars).
    * @param _newCost New registration cost
    * @return newEnryCost New registration cost
    */
    function changeEntryCost(uint256 _newCost) external onlyOwner returns(uint256 newEnryCost) {
        return _changeEntryCost(_newCost);
    }

    /**
    * @dev Administrator function.
    * Set the top 10 best participants in the system.
    * Repetitions are allowed.
    * @param _leaderPool New leader pool
    * @return success Indicates the success of operation
    */
    function setLeaderPool(address payable[10] calldata _leaderPool) external onlyOwner returns(bool success) {
        leaderPool = _leaderPool;
        return true;
    }

    /**
    * @dev Get a list of the best participants
    */
    function getLeaderPool() external view returns(address payable[10] memory) {
        return leaderPool;
    }

    /**
    * @dev Get detailed information about a user
    * @param _userAddress Target wallet address
    * @return id User Id
    * @return referrerAddress Referrer Address
    * @return referralsCount Referrals Count
    * @return matrixIds User Matrix IDs
    */
    function getUser(address _userAddress) external view returns(
        uint256 id,
        address referrerAddress,
        uint256 referralsCount,
        uint256[] memory matrixIds
    ) {
        return (
            users[_userAddress].id,
            users[_userAddress].referrerAddress,
            users[_userAddress].referralsCount,
            users[_userAddress].matrixIds
        );
    }

    /**
    * @dev Get detailed information about a matrix
    * @param _matrixId Target matrix ID
    * @return parentMatrixId ID of the matrix this matrix is bound to
    * @return userAddress Matrix owner address
    * @return closed Is the matrix full
    * @return subtreeMatrixCount Number of matrices in a subtree
    * @return childMatrixIds Matrices bound to this matrix
    */
    function getMatrix(uint256 _matrixId) external view returns(
        uint256 parentMatrixId,
        address payable userAddress,
        bool closed,
        uint256 subtreeMatrixCount,
        uint256[] memory childMatrixIds
    ) {
        return (
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
    function getCostSunPrice() public view returns(uint256) {
        return matrixEntryCost.mul(priceController.getCurrentUsdRate());
    }

    //
    // Private methods
    //

    function _register(address payable _userAddress, address _referrerAddress) private returns(uint256) {
        require(msg.tokenid == priceController.getTokenID(), "Matrix: invalid ProgramToken ID");
        require(msg.tokenvalue == getCostSunPrice(), "Matrix: invalid sending value");
        require(_userAddress != _referrerAddress, "Matrix: invalid _userAddress value");
        require(_referrerAddress != address(0), "Matrix: user must not be null");

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
        require(
            _isUserExists(_referrerAddress) || _referrerAddress ==  idToAddress[rootUserId],
            "Matrix: referrer not exists"
        );

        // the referrer cannot be contract
        // solhint-disable-next-line no-inline-assembly
        uint256 codeSize;
        assembly { codeSize := extcodesize(_userAddress) }
        require(codeSize == 0, "Matrix: new user cannot be a contract");

        // create user
        uint256 newUserId = userCount;
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

        userCount = userCount.add(1);

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
            // _makeRewards(0);
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
                break;
            }
            matrix[subtreeParentId].subtreeMatrixCount = matrix[subtreeParentId].subtreeMatrixCount.add(1); 
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

        emit MatrixCreated(newMatrixIndex, parentMatrixId, _userAddress, block.timestamp);

        return newMatrixIndex; 
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
        _target.transferToken(_amount, msg.tokenid);
        emit TransferSuccess(_target, _amount, block.timestamp);
    }

    function _isUserExists(address _user) internal view returns(bool) {
        if (_user == address(0)) {
            return true;
        }
        return (users[_user].id != 0);
    }

    //
    // Hooks
    // 

    function _makeRewards(uint256 _newMatrixIndex) internal;

    function _getParentMatrixId(uint256 _localRootMatrix) internal view returns(uint256);

    function _getSubtreeHeight() internal pure returns(uint256);

    function _getRefferalsLimit() internal pure returns(uint256);

}

// File: contracts/MatrixOne.sol

/**
 *
 * ooo        ooooo               .             o8o                      .o  
 * `88.       .888'             .o8             `"'                    o888  
 *  888b     d'888   .oooo.   .o888oo oooo d8b oooo  oooo    ooo        888  
 *  8 Y88. .P  888  `P  )88b    888   `888""8P `888   `88b..8P'         888  
 *  8  `888'   888   .oP"888    888    888      888     Y888'           888  
 *  8    Y     888  d8(  888    888 .  888      888   .o8"'88b          888  
 * o8o        o888o `Y888""8o   "888" d888b    o888o o88'   888o       o888o 
 *
 **/

pragma solidity ^0.5.9;


contract MatrixOne is MatrixCore {

    using SafeMath for uint256;

    //
    // Constructor
    //

    constructor(address payable _rootUser, address _priceController) MatrixCore(_rootUser, _priceController) public {}

    //
    // Hooks implementations
    //

    function _makeRewards(uint256 _parentMatrixIndex) internal {
        if (matrix[_parentMatrixIndex].subtreeMatrixCount < 3) {
            uint256 uplineReward = msg.value.mul(9).div(10);
            uint256 leaderPoolReward = msg.value.sub(uplineReward);

            // reward matrix owner
            address payable upline;
            if (_parentMatrixIndex != 0) {
                upline = matrix[_parentMatrixIndex].userAddress;
            } else {
                upline = idToAddress[rootUserId];
            }
            _nonBlockingTransfer(upline, uplineReward);
        

            // reward leader pool
            _rewardLeaders(leaderPoolReward);

            emit MakedRewards(_parentMatrixIndex, msg.value, block.timestamp);
        }
    }

    function _getParentMatrixId(uint256 _localRootMatrix) internal view returns(uint256) {
        return _localRootMatrix;
    }

    function _getSubtreeHeight() internal pure returns(uint256) {
        return 1;
    }

    function _getRefferalsLimit() internal pure returns(uint256) {
        return 3;
    }
}
