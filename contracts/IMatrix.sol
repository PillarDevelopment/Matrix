// SPDX-License-Identifier: MIT

pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;
// pragma experimental SMTChecker;

interface IMatrix {

    enum MatixType {FIRST, SECOND, THIRD, FOURTH}

    struct userNode {
        uint256 userId;
        userNode[] children;
    }

    struct MatrixEntity {
        MatixType matrixType;
        uint8 parentUserId;
        uint8 parentMatrixNumber;
        bool closed;
        userNode root;
    }

    struct User {
        uint id;
        uint referrerId;
        uint referralsCount;
    }

    function register(uint256 _referrerId) external payable returns(uint);
    function registerOther(address _userAddress, uint256 _referrerId) external payable returns(uint);
    function createMatrixFirst(MatixType _matrixType) external returns(uint);
}