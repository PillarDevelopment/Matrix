pragma solidity ^0.5.12;

interface ILeaderPool {
    function setLeaderPool(address payable) external returns (bool);

    function getLeaderPool() external view returns (address payable);
}
