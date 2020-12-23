// SPDX-License-Identifier: MIT

pragma solidity ^0.5.12;

import "@openzeppelin/contracts/math/SafeMath.sol";

contract LeaderPool {

    using SafeMath for uint256;

    address payable[10] private leaderPool;

    function setLeaderPool(address payable[10] calldata _leaderPool) external returns(bool) {
        leaderPool = _leaderPool;
    }

    function getLeaderPool() external view returns(address payable[10] memory) {
        return leaderPool;
    }

    function _rewardLeaders(uint256 rewardAmount) internal returns(address payable[10] memory) {
        uint256 value30Percent = rewardAmount.mul(30).div(100);
        uint256 value20Percent = rewardAmount.mul(20).div(100);
        uint256 value10Percent = rewardAmount.mul(10).div(100);
        uint256 value5Percent = rewardAmount.mul(5).div(100);

        leaderPool[0].send(value30Percent);
        leaderPool[1].send(value20Percent);
        leaderPool[2].send(value10Percent);
        leaderPool[3].send(value10Percent);
        leaderPool[4].send(value5Percent);
        leaderPool[5].send(value5Percent);
        leaderPool[6].send(value5Percent);
        leaderPool[7].send(value5Percent);
        leaderPool[8].send(value5Percent);
        leaderPool[9].send(value5Percent);
    }

}