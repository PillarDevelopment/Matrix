// SPDX-License-Identifier: MIT

pragma solidity ^0.5.12;

interface IMatrix {

    struct MatrixPosition {
        uint256 parentMatrixId;
        address userAddress;
        bool closed;
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
}