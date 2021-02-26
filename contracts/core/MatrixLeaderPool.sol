pragma solidity ^0.5.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "../interfaces/ILeaderPool.sol";
import "./MatrixPoolOracle.sol";

/**
 * @dev Leader pool implementation
 */
contract MatrixLeaderPool is ILeaderPool, MatrixPoolOracle {
    using SafeMath for uint256;

    address payable[10] internal leaderPool;

    event PoolRewardSuccess(
        address payable indexed recipient,
        uint256 indexed value,
        uint256 timestamp
    );

    /**
     * @dev Administrator function.
     * Set the top 10 best participants in the system.
     * Repetitions are allowed.
     * @param _leaderPool New leader pool
     * @return success Indicates the success of operation
     */
    function setLeaderPool(address payable[10] calldata _leaderPool)
        external
        onlyPoolOracle
        returns (bool success)
    {
        leaderPool = _leaderPool;
        return true;
    }

    /**
     * @dev Get a list of the best participants
     */
    function getLeaderPool()
        external
        view
        returns (address payable[10] memory)
    {
        return leaderPool;
    }

    function _nonBlockingPoolTransfer(address payable _target, uint256 _amount)
        internal
    {
        _target.transferToken(_amount, msg.tokenid);
        emit PoolRewardSuccess(_target, _amount, block.timestamp);
    }

    function _rewardLeaders(uint256 _rewardAmount) internal {
        uint256 value30Percent = _rewardAmount.mul(30).div(100);
        uint256 value20Percent = _rewardAmount.mul(20).div(100);
        uint256 value10Percent = _rewardAmount.mul(10).div(100);
        uint256 value5Percent = _rewardAmount.mul(5).div(100);

        _nonBlockingPoolTransfer(leaderPool[0], value30Percent);
        _nonBlockingPoolTransfer(leaderPool[1], value20Percent);
        _nonBlockingPoolTransfer(leaderPool[2], value10Percent);
        _nonBlockingPoolTransfer(leaderPool[3], value10Percent);
        _nonBlockingPoolTransfer(leaderPool[4], value5Percent);
        _nonBlockingPoolTransfer(leaderPool[5], value5Percent);
        _nonBlockingPoolTransfer(leaderPool[6], value5Percent);
        _nonBlockingPoolTransfer(leaderPool[7], value5Percent);
        _nonBlockingPoolTransfer(leaderPool[8], value5Percent);
        _nonBlockingPoolTransfer(leaderPool[9], value5Percent);
    }
}
