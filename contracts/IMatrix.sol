// SPDX-License-Identifier: MIT

pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;
// pragma experimental SMTChecker;

interface IMatrix {

    enum MatixType {FIRST, SECOND, THIRD, FOURTH}

    struct UserNode {
        uint256 userId;
        UserNode[] children;
    }

    struct MatrixEntity {
        MatixType matrixType;
        uint256 parentUserId;
        uint256 parentMatrixNumber;
        bool closed;
        UserNode root;
    }

    struct User {
        uint256 id;
        uint256 referrerId;
        uint256 referralsCount;
        uint256 matrixCount;
    }

    // function register(address _referrerAddress) external payable returns(uint);
    // function createMatrix(MatixType _matrixType) external returns(uint);
}