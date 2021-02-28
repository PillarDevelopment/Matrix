pragma solidity ^0.5.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./MatrixOwnable.sol";
import "../interfaces/ILeaderPool.sol";

/**
 * @dev Leader pool implementation
 */
contract MatrixLeaderPool is ILeaderPool, MatrixOwnable {
    using SafeMath for uint256;

    address payable internal leaderPool;

    event PoolRewardSuccess(
        address payable indexed recipient,
        uint256 indexed value,
        uint256 timestamp
    );

    function setLeaderPool(address payable _leaderPool)
        external
        onlyOwner
        returns (bool success)
    {
        leaderPool = _leaderPool;
        return true;
    }

    function getLeaderPool() external view returns (address payable) {
        return leaderPool;
    }

    function _nonBlockingPoolTransfer(address payable _target, uint256 _amount)
        internal
    {
        _target.transferToken(_amount, msg.tokenid);
        emit PoolRewardSuccess(_target, _amount, block.timestamp);
    }

    function _rewardLeaders(uint256 _rewardAmount) internal {
        _nonBlockingPoolTransfer(leaderPool, _rewardAmount);
    }
}
