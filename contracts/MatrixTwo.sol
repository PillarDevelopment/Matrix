/**
 *
 * ooo        ooooo               .             o8o                     .oooo.
 * `88.       .888'             .o8             `"'                   .dP""Y88b
 *  888b     d'888   .oooo.   .o888oo oooo d8b oooo  oooo    ooo            ]8P'
 *  8 Y88. .P  888  `P  )88b    888   `888""8P `888   `88b..8P'           .d8P'
 *  8  `888'   888   .oP"888    888    888      888     Y888'           .dP'
 *  8    Y     888  d8(  888    888 .  888      888   .o8"'88b        .oP     .o
 * o8o        o888o `Y888""8o   "888" d888b    o888o o88'   888o      8888888888
 *
 **/

pragma solidity ^0.5.12;

import "./core/MatrixCore.sol";
import "./core/MatrixLeaderPool.sol";

contract MatrixTwo is MatrixCore, MatrixLeaderPool {
    using SafeMath for uint256;

    //
    // Constructor
    //

    constructor(address payable _rootUser, address _priceController)
        public
        MatrixCore(_rootUser, _priceController)
    {
        address payable initialLeaderWallet =
            address(uint160(address(owner())));
        for (uint256 i = 0; i < 10; i++) {
            leaderPool[i] = initialLeaderWallet;
        }
    }

    //
    // Private methods
    //

    function _search(uint256 id) public view returns (uint256) {
        if (matrix[id].childMatrixIds.length < 2) return id;

        if (matrix[matrix[id].childMatrixIds[0]].childMatrixIds.length < 2)
            return matrix[id].childMatrixIds[0];

        return matrix[id].childMatrixIds[1];
    }

    //
    // Hooks implementations
    //

    function _makeRewards(uint256 _parentMatrixId) internal {
        uint256[2] memory uplineRewards =
            [msg.tokenvalue.mul(4).div(10), msg.tokenvalue.mul(5).div(10)];
        uint256 leaderPoolReward = msg.tokenvalue.mul(1).div(10);

        // reward parent matrices
        uint256 uplineMatrixId = _parentMatrixId;
        for (uint256 i = 0; i < uplineRewards.length; i++) {
            if (matrix[uplineMatrixId].subtreeMatrixCount >= 5) {
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
        return 2;
    }

    function _getRefferalsLimit() internal pure returns (uint256) {
        return 6;
    }
}
