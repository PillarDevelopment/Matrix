// SPDX-License-Identifier: MIT

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

pragma solidity ^0.5.12;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./ILeaderPool.sol";
import "./IMatrix.sol";
import "./IPriceController.sol";

contract Matrix is IMatrix, ILeaderPool, Ownable {

    using SafeMath for uint256;

    //
    // Storage
    //

    uint256 public constant matrixReferralsLimit = 3;

    uint256 public lastUserId = 0;
    mapping(address => User) public users;
    mapping(uint256 => address) public idToAddress;

    uint256 public matrixCount = 1;
    mapping(uint256 => MatrixPosition) public matrix;

    uint256 public matrixEntryCost = 50;
    uint256 public rootUserId;

    IPriceController public priceController;

    address payable[10] private leaderPool;

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
    // External methods
    //

    constructor(address payable _rootUser, address _priceController) public {

        // init default user
        rootUserId = _createUser(_rootUser, address(0));
        priceController = IPriceController(_priceController);
        _createMatrix(_rootUser, address(0));
    }

    function register(address _referrerAddress) external payable returns(uint) {
        return _register(msg.sender, _referrerAddress);
    }

    function() external payable {
        if (msg.data.length == 0) {
            _register(msg.sender, idToAddress[rootUserId]);
        } else {
            _register(msg.sender, _bytesToAddress(msg.data));
        }
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

    function getMatrix(uint256 _matrixId) external view returns(uint256, address payable, bool, uint256[] memory) {
        return (
            matrix[_matrixId].parentMatrixId,
            matrix[_matrixId].userAddress,
            matrix[_matrixId].closed,
            matrix[_matrixId].childMatrixIds
        );
    }

    function getCostSunPrice() public view returns(uint256) {
        return matrixEntryCost.mul(priceController.getCurrentUsdRate());
    }

    //
    // Internal methods
    //

    function _register(address payable _userAddress, address _referrerAddress) internal returns(uint256) {
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

    function _changeEntryCost(uint256 _newCost) internal onlyOwner returns(uint256) {
        uint256 oldCost = matrixEntryCost;
        matrixEntryCost = _newCost;

        emit MatrixEntryCostChanged(_newCost, oldCost, block.timestamp);

        return _newCost;
    }

    function _createUser(address _userAddress, address _referrerAddress) internal returns(uint256) {
        require(!_isUserExists(_userAddress), "Matrix: user exists");
        require(_isUserExists(_referrerAddress) || users[_userAddress].id == rootUserId, "Matrix: referrer not exists");

        // the referrer cannot be contract
        // solhint-disable-next-line no-inline-assembly
        uint256 codeSize;
        assembly { codeSize := extcodesize(_userAddress) }
        require(codeSize == 0, "Matrix: new user cannot be a contract");

        // create user
        lastUserId = lastUserId.add(1);
        users[_userAddress] = User({
            id: lastUserId,
            referrerAddress: _referrerAddress,
            referralsCount: uint256(0),
            matrixIds: new uint256[](0)
        });
        idToAddress[lastUserId] = _userAddress;

        // update upline user
        users[_referrerAddress].referralsCount = users[_referrerAddress].referralsCount.add(1);

        emit UserCreated(_userAddress, _referrerAddress, lastUserId, block.timestamp);

        return lastUserId;
    }

    function _createMatrix(address payable _userAddress, address _parentAddress) internal returns(uint256) {
        
        // create matrix position
        matrix[matrixCount] = MatrixPosition({
            parentMatrixId: uint(0),
            userAddress: _userAddress,
            closed: false,
            childMatrixIds: new uint256[](0)
        });
        users[_userAddress].matrixIds.push(matrixCount);
        
        uint256 parentLastMatrixId = _getParentMatrixId(_parentAddress);
        matrix[matrixCount].parentMatrixId = parentLastMatrixId;
        matrix[parentLastMatrixId].childMatrixIds.push(matrixCount);

        uint256 newMatrixIndex = matrixCount;
        matrixCount = matrixCount.add(1);

        if (matrix[parentLastMatrixId].childMatrixIds.length < matrixReferralsLimit || parentLastMatrixId == 0) {
            _makeRewards(matrix[parentLastMatrixId].userAddress);
        } else {
            _createMatrix(
                matrix[parentLastMatrixId].userAddress,
                matrix[matrix[parentLastMatrixId].parentMatrixId].userAddress
            );

            emit Reinvest(newMatrixIndex, _userAddress, block.timestamp);
        }

        emit MatrixCreated(newMatrixIndex, parentLastMatrixId, _userAddress, block.timestamp);

        return newMatrixIndex; 
    }

    function _makeRewards(address payable _upline) internal {
        uint256 uplineReward = msg.value.mul(9).div(10);
        uint256 leaderPoolReward = msg.value.sub(uplineReward);

        // reward upline
        _nonBlockingTransfer(_upline, uplineReward);

        // reward leader pool
        _rewardLeaders(leaderPoolReward);

        emit MakedRewards(_upline, block.timestamp);
    }

    function _rewardLeaders(uint256 _rewardAmount) internal returns(address payable[10] memory) {
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

    function _isUserExists(address _user) internal view returns (bool) {
        return (users[_user].id != 0);
    }

    function _getParentMatrixId(address _userAddress) internal view returns(uint256) {
        if (_userAddress == address(0)) {
            return 0;
        }
        return users[_userAddress].matrixIds[users[_userAddress].matrixIds.length.sub(1)];
    }

    function _bytesToAddress(bytes memory _data) internal pure returns (address addr) {
        assembly {
            addr := mload(add(_data, 20))
        }
    }

    // function sendETHDividends(address userAddress, address _from, uint8 matr, uint8 level) private {
    //     (address receiver, bool isExtraDividends) = findEthReceiver(userAddress, _from, matr, level);

    //     if (!address(uint160(receiver)).send(levelPrice[level])) {
    //         return address(uint160(receiver)).transfer(address(this).balance);
    //     }
    
    // }
}
