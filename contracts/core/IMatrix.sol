pragma solidity ^0.5.12;

interface IMatrix {

    struct MatrixPosition {
        uint256 parentMatrixId;
        address payable userAddress;
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

    function getUser(address _userAddress) external view returns(uint256, address, uint256, uint256[] memory);

    function getMatrix(uint256 _matrixId) external view returns(uint256, address payable, bool, uint256[] memory);

}