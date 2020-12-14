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
import "./IMatrix.sol";
import "./IPriceController.sol";

contract Matrix is IMatrix, Ownable {

    using SafeMath for uint256;

    //
    // Storage
    //

    uint256 public lastUserId = 0;
    mapping(address => User) public users;
    mapping(uint256 => address) public idToAddress;

    uint256 public lastMatrixId = 0;
    mapping(uint256 => MatrixPosition) public matrix;

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
        address indexed userAddress
    );
    event Reinvest(address indexed user, address indexed currentReferrer, address indexed caller, uint8 matrix, uint8 level);

    event TransferError(address payable indexed recipient, uint256 indexed value);
    event TransferSuccess(address payable indexed recipient, uint256 indexed value);

    event MatrixEntryCostChanged(uint256 indexed newCost, uint256 indexed oldCost, uint256 timestamp);

    //
    // External methods
    //

    constructor(address rootUser, address _priceController) public {

        // init default user
        rootUserId = _createUser(rootUser, address(0));
        priceController = IPriceController(_priceController);
        _createMatrix(rootUser, address(0));
    }

    function register(address _referrerAddress) external payable returns(uint) {
        return _register(msg.sender, _referrerAddress);
    }

    function changeEntryCost(uint256 _newCost) external onlyOwner returns(uint) {
        return _changeEntryCost(_newCost);
    }

    function() external payable {
        if (msg.data.length == 0) {
            _register(msg.sender, idToAddress[rootUserId]);
        } else {
            _register(msg.sender, _bytesToAddress(msg.data));
        }
    }

    function getCostSunPrice() public view returns(uint256) {
        return matrixEntryCost.mul(priceController.getCurrentUsdRate());
    }

    //
    // Internal methods
    //

    function _register(address _userAddress, address _referrerAddress) internal returns(uint256) {
        require(msg.value == getCostSunPrice(), "Matrix: invalid sending value");

        uint256 newUserId = _createUser(_userAddress, _referrerAddress);

        uint256 newMatrixId = _createMatrix(_userAddress, _referrerAddress);

        emit RegisterSuccessful(_userAddress, newUserId, _referrerAddress, users[_referrerAddress].id, newMatrixId, msg.value, block.timestamp);

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
        require(codeSize == 0, "Matrix: cannot be a contract");

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

    function _createMatrix(address _userAddress, address _parentAddress) internal returns(uint256) {
        
        // create matrix position
        lastMatrixId = lastMatrixId.add(1);
        matrix[lastMatrixId] = MatrixPosition({
            parentMatrixId: uint(0),
            userAddress: _userAddress,
            closed: false,
            childMatrixIds: new uint256[](0)
        });
        users[_userAddress].matrixIds.push(lastMatrixId);
        
        // add a binding to the upline
        if (users[_userAddress].id != rootUserId) {
            uint256 parentLastMatrixId = _getLastMatrixId(_parentAddress);

            // <-- TODO closed matrix check

            matrix[lastMatrixId].parentMatrixId = parentLastMatrixId;
            matrix[parentLastMatrixId].childMatrixIds.push(lastMatrixId);
        }

        emit MatrixCreated(lastMatrixId, matrix[lastMatrixId].parentMatrixId, _userAddress);

        return lastMatrixId; 
    }

    // function _numberToMatrixPosition(uint256 _userNumber, MatixType _matrixType) internal view returns(uint256[] memory) {
    //     require(_userNumber > 0, "Matrix: invalid _userNumber value");

    //     uint256[] memory result = new uint256[](1);
    //     result = FILLING_RULE_MATRIX_1[_userNumber.sub(1)];
    //     return result;
    // }

    // function _getLastMatrixIndex(uint256 _userNumber) internal view returns(uint256) {
    //     return users[idToAddress[_userNumber]].matrixCount - 1;
    // }

    function _isUserExists(address _user) internal view returns (bool) {
        return (users[_user].id != 0);
    }

    function _getLastMatrixId(address _userAddress) internal view returns(uint256) {
        uint256 matrixArrayLength = users[_userAddress].matrixIds.length;
        if (matrixArrayLength == 0) {
            revert("Matrix: array index error in _getLastMatrix(...)");
        }
        return matrixArrayLength;
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
