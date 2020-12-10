// SPDX-License-Identifier: MIT

/**
 *
 * ooo        ooooo               .             o8o              
 * `88.       .888'             .o8             `"'              
 * 888b     d'888   .oooo.   .o888oo oooo d8b oooo  oooo    ooo 
 * 8 Y88. .P  888  `P  )88b    888   `888""8P `888   `88b..8P'  
 * 8  `888'   888   .oP"888    888    888      888     Y888'    
 * 8    Y     888  d8(  888    888 .  888      888   .o8"'88b   
 * o8o        o888o `Y888""8o   "888" d888b    o888o o88'   888o 
 *
 *
 **/

pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;
// pragma experimental SMTChecker;
// pragma abicoder v2;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./IMatrix.sol";


contract Matrix is IMatrix, AccessControl {

    using SafeMath for uint256;

    //
    // User positioning information within tree
    //

    uint[][] private FILLING_RULE_MATRIX_1 = [[1],[2],[3]];
    uint[][] private FILLING_RULE_MATRIX_2 = [[1, 0],[2, 0],[1, 1],[1, 2],[2, 1],[2, 2]];
    uint[][] private FILLING_RULE_MATRIX_3;
    uint[][] private FILLING_RULE_MATRIX_4;

    //
    // Manager roles
    //

    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    //
    // Storage
    //

    mapping(address => User) public users;

    mapping(uint256 => address) public idToAddress;

    mapping(uint256 => mapping(MatixType => mapping (uint256 => MatrixEntity))) matrix;

    uint256 public lastUserId = 0;

    mapping(uint8 => uint256) public matrixEntryCost;

    uint256 public defaultUserId;


    //
    // Events
    //

    event RegisterSuccessful(address indexed newUserAddress, uint256 indexed newUserId, address indexed referrerAddress, uint256 referrerId, uint256 timestamp);

    event Reinvest(address indexed user, address indexed currentReferrer, address indexed caller, uint8 matrix, uint8 level);

    event TransferError(address payable indexed recipient, uint256 indexed value);
    event TransferSuccess(address payable indexed recipient, uint256 indexed value);

    event MatrixEntryCostChanged(uint256 indexed newCost, uint256 indexed oldCost);
    event OwnerChanged(address payable indexed newOwnerAddress, address payable indexed oldOwnerAddress);

    //
    // External methods
    //

    constructor(address rootUser) public {
        _setupRole(OWNER_ROLE, msg.sender);
        _setupRole(MANAGER_ROLE, msg.sender);

        // setting the cost of entering the system
        matrixEntryCost[uint8(MatixType.FIRST)] = 50;
        matrixEntryCost[uint8(MatixType.SECOND)] = 50;
        matrixEntryCost[uint8(MatixType.THIRD)] = 50;
        matrixEntryCost[uint8(MatixType.FOURTH)] = 100;

        // init default user
        defaultUserId = _createUser(rootUser, 0);

        _createMatrix(defaultUserId, MatixType.FIRST, 0);
    }

    function register(address _referrerAddress) external payable returns(uint) {
        return _register(msg.sender, _referrerAddress);
    }

    receive() external payable {
        if (msg.data.length == 0) {
            _register(msg.sender, idToAddress[defaultUserId]);
        } else {
            _register(msg.sender, _bytesToAddress(msg.data));
        }
    }

    //
    // Internal methods
    //

    function _register(address _userAddress, address _referrerAddress) internal returns(uint256) {
        require(msg.value == matrixEntryCost[0], "Matrix: invalid sending value");

        require(!_isUserExists(_userAddress), "Matrix: user exists");
        require(_isUserExists(_referrerAddress), "Matrix: referrer not exists");
        
        uint256 referrerId = users[_referrerAddress].id;
        uint256 newUserId = _createUser(_userAddress, referrerId);
        
        uint256 lastParentMatrix;
        _createMatrix(newUserId, MatixType.FIRST, referrerId);

        
        emit RegisterSuccessful(_userAddress, newUserId, _referrerAddress, referrerId, block.timestamp);
    }

    function _createMatrix(uint256 _userId, MatixType _matrixType, uint256 _parentUserId) internal returns(uint256) {
        UserNode memory userNode = UserNode({
            userId: _userId,
            children: new UserNode[](0)
        });

        MatrixEntity memory newMatrix = MatrixEntity({
            matrixType: _matrixType,
            parentUserId: _parentUserId,
            parentMatrixNumber: 0,
            closed: false,
            root: userNode
        });

        if (_parentUserId != 0) {
            uint256 patentMatrixNumber = _getLastMatrixIndex(_parentUserId, _matrixType);
            newMatrix.parentMatrixNumber = patentMatrixNumber;
            // matrix[_parentUserId][_matrixType][patentMatrixNumber].root.children.push(userNode);
        }

        // matrix[_userId][_matrixType].push(newMatrix);
        // return matrix[_userId][_matrixType].length - 1;
    }

    function _createUser(address _userAddress, uint256 _referrerId) internal returns(uint256) {
        // solhint-disable-next-line no-inline-assembly
        uint256 codeSize;
        assembly { codeSize := extcodesize(_userAddress) }
        require(codeSize == 0, "Matrix: cannot be a contract");

        lastUserId = lastUserId.add(1);
        User memory user = User({
            id: lastUserId,
            referrerId: _referrerId,
            referralsCount: uint256(0),
            matrixCount: 0
        });
        users[_userAddress] = user;
        idToAddress[lastUserId] = _userAddress;
    }

    function _numberToMatrixPosition(uint256 _userNumber, MatixType _matrixType) internal view returns(uint256[] memory) {
        require(_userNumber > 0, "Matrix: invalid _userNumber value");

        uint256[] memory result = new uint256[](1);
        result = FILLING_RULE_MATRIX_1[_userNumber.sub(1)];
        return result;
    }

    function _getLastMatrixIndex(uint256 _userNumber, MatixType _matrixType) internal view returns(uint256) {
        return users[idToAddress[_userNumber]].matrixCount - 1;
    }

    function _isUserExists(address user) internal view returns (bool) {
        return (users[user].id != 0);
    }

    function _bytesToAddress(bytes memory data) internal pure returns (address addr) {
        assembly {
            addr := mload(add(data, 20))
        }
    }

    // function sendETHDividends(address userAddress, address _from, uint8 matr, uint8 level) private {
    //     (address receiver, bool isExtraDividends) = findEthReceiver(userAddress, _from, matr, level);

    //     if (!address(uint160(receiver)).send(levelPrice[level])) {
    //         return address(uint160(receiver)).transfer(address(this).balance);
    //     }
    
    // }
}
