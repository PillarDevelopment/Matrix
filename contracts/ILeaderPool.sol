// SPDX-License-Identifier: MIT

pragma solidity ^0.5.12;

interface ILeaderPool {

    function setLeaderPool(address payable[10] calldata) external returns(bool);

    function getLeaderPool() external view returns(address payable[10] memory);

}