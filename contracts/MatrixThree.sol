/**
 *
 * ooo        ooooo               .             o8o                     .oooo.
 * `88.       .888'             .o8             `"'                   .dP""Y88b
 *  888b     d'888   .oooo.   .o888oo oooo d8b oooo  oooo    ooo            ]8P'
 *  8 Y88. .P  888  `P  )88b    888   `888""8P `888   `88b..8P'           <88b.
 *  8  `888'   888   .oP"888    888    888      888     Y888'              `88b.
 *  8    Y     888  d8(  888    888 .  888      888   .o8"'88b        o.   .88P
 * o8o        o888o `Y888""8o   "888" d888b    o888o o88'   888o      `8bd88P'
 *
 **/

pragma solidity ^0.5.12;

import "./core/MatrixCore.sol";
import "./core/MatrixLeaderPool.sol";

contract MatrixThree is MatrixCore, MatrixLeaderPool {
    using SafeMath for uint256;

    //
    // Constructor
    //

    constructor(
        address payable _rootUser,
        address _priceController,
        address payable _leaderPool
    ) public MatrixCore(_rootUser, _priceController) {
        leaderPool = _leaderPool;
    }

    //
    // Private methods
    //

    function _search(uint256 id) public view returns (uint256) {
        uint256[] memory queue = new uint256[](13);
        queue[0] = id;
        uint256 queueLength = 1;

        for (uint256 i = 0; i < queue.length; i++) {
            if (matrix[queue[i]].childMatrixIds.length < 3) {
                return queue[i];
            } else if (i <= 3) {
                for (uint256 j = 0; j < 3; j++) {
                    queue[queueLength] = matrix[queue[i]].childMatrixIds[j];
                    queueLength++;
                }
            }
        }

        return id;
    }

    //
    // Hooks implementations
    //

    function _makeRewards(uint256 _parentMatrixId) internal {
        uint256[3] memory uplineRewards =
            [
                msg.tokenvalue.mul(1).div(10),
                msg.tokenvalue.mul(3).div(10),
                msg.tokenvalue.mul(5).div(10)
            ];
        uint256 leaderPoolReward = msg.tokenvalue.mul(1).div(10);

        // reward parent matrices
        uint256 uplineMatrixId = _parentMatrixId;
        for (uint256 i = 0; i < uplineRewards.length; i++) {
            if (matrix[uplineMatrixId].subtreeMatrixCount >= 38) {
                continue;
            }

            if (
                (uplineMatrixId == 0) ||
                (matrix[uplineMatrixId].userAddress == idToAddress[rootUserId])
            ) {
                _nonBlockingTransfer(idToAddress[rootUserId], uplineRewards[i]);
            } else {
                _nonBlockingTransfer(
                    matrix[uplineMatrixId].userAddress,
                    uplineRewards[i]
                );
                uplineMatrixId = matrix[uplineMatrixId].parentMatrixId;
            }
        }

        // reward leader pool
        _rewardLeaders(leaderPoolReward);

        emit Rewards(_parentMatrixId, msg.tokenvalue, block.timestamp);
    }

    function _getParentMatrixId(uint256 _localRootMatrix)
        internal
        view
        returns (uint256)
    {
        return _search(_localRootMatrix);
    }

    function _getSubtreeHeight() internal pure returns (uint256) {
        return 3;
    }

    function _getRefferalsLimit() internal pure returns (uint256) {
        return 39;
    }
}
