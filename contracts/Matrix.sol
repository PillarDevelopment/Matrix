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

    mapping(uint256 => mapping(MatixType => MatrixEntity[])) matrix;

    mapping(uint256 => mapping(MatixType => uint8)) matrixCount;

    mapping(uint256 => address) public idToAddress;

    uint256 public userCount;

    mapping(uint8 => uint256) public matrixEntryCost;


    //
    // Events
    //

    event RegisterSuccessful(address indexed newUserAddress, uint256 indexed newUserId, MatixType indexed matrix, uint256 timestamp);

    event Reinvest(address indexed user, address indexed currentReferrer, address indexed caller, uint8 matrix, uint8 level);

    event TransferError(address payable indexed recipient, uint256 indexed value);
    event TransferSuccess(address payable indexed recipient, uint256 indexed value);

    event MatrixEntryCostChanged(uint256 indexed newCost, uint256 indexed oldCost);
    event OwnerChanged(address payable indexed newOwnerAddress, address payable indexed oldOwnerAddress);

    //
    // External methods
    //

    constructor(address rootUser) {
        _setupRole(OWNER_ROLE, msg.sender);
        _setupRole(MANAGER_ROLE, msg.sender);

        // setting the cost of entering the system
        matrixEntryCost[uint8(MatixType.FIRST)] = 50;
        matrixEntryCost[uint8(MatixType.SECOND)] = 50;
        matrixEntryCost[uint8(MatixType.THIRD)] = 50;
        matrixEntryCost[uint8(MatixType.FOURTH)] = 100;


        // init default user
        uint256 defaultUserId = _createUser(rootUser, 0);

    }

    function register(uint256 _referrerId) external payable override returns(uint) {
        return _register(msg.sender, _referrerId);
    }

    function registerOther(address _userAddress, uint256 _referrerId) external payable override returns(uint) {
        return _register(_userAddress, _referrerId);
    }

    function createMatrixFirst(MatixType _matrixType) external override returns(uint) {
        // TODO
    }

    //
    // Internal methods
    //

    function _register(address _userAddress, uint256 _referrerId) internal returns(uint256) {
        // TODO
    }

    function _createMatrix(uint256 userId, MatixType _matrixType) internal returns(uint256) {
        // TODO
    }

    function _createUser(address _userAddress, uint256 _referrerId) internal returns(uint256) {
        User memory user = User({
            id: userCount,
            referrerId: _referrerId,
            referralsCount: uint256(0)
        });
        users[_userAddress] = user;
        idToAddress[userCount] = _userAddress;

        userCount.add(1);
    }

    function _numberToMatrixPosition(uint256 _userNumber, MatixType _matrixType) internal view returns(uint256[] memory) {
        require(_userNumber > 0, "Matrix: invalid _userNumber value");

        uint256[] memory result = new uint256[](1);
        result = FILLING_RULE_MATRIX_1[_userNumber.sub(1)];
        return result;
    }
}
