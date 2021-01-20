/**
 *
 * ooo        ooooo               .             o8o                       .o   
 * `88.       .888'             .o8             `"'                     .d88   
 *  888b     d'888   .oooo.   .o888oo oooo d8b oooo  oooo    ooo      .d'888   
 *  8 Y88. .P  888  `P  )88b    888   `888""8P `888   `88b..8P'     .d'  888   
 *  8  `888'   888   .oP"888    888    888      888     Y888'       88ooo888oo 
 *  8    Y     888  d8(  888    888 .  888      888   .o8"'88b           888   
 * o8o        o888o `Y888""8o   "888" d888b    o888o o88'   888o        o888o  
 *
 **/

pragma solidity ^0.5.12;

import "./core/MatrixCore.sol";

contract MatrixFour is MatrixCore {

    using SafeMath for uint256;

    //
    // Constructor
    //

    constructor(address payable _rootUser, address _priceController) MatrixCore(_rootUser, _priceController) public {}

    //
    // Private methods
    //

    function _search(uint256 id) public view returns(uint256) {

        uint256[] memory queue = new uint256[](100);
        queue[0] = id;
        uint256 queueLength = 1;

        for (uint256 i = 0; i < queue.length; i++) {
            if (matrix[queue[i]].childMatrixIds.length < 3) {
                return queue[i];
            }
            else if (i <= 39) {
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
        uint256[5] memory uplineRewards = [msg.tokenvalue.mul(1).div(10), msg.tokenvalue.mul(3).div(20), msg.tokenvalue.mul(1).div(5), msg.tokenvalue.mul(1).div(4), msg.tokenvalue.mul(3).div(10)];
        // uint256 leaderPoolReward = msg.tokenvalue.mul(1).div(10);

        // reward parent matrices
        uint256 uplineMatrixId = _parentMatrixId;
        for (uint256 i = 0; i < uplineRewards.length; i++) {
            if (matrix[uplineMatrixId].subtreeMatrixCount == 360) {
                if ((uplineMatrixId == 0)||(matrix[uplineMatrixId].userAddress == idToAddress[rootUserId])) {    
                    _nonBlockingTransfer(idToAddress[rootUserId], msg.tokenvalue.div(10));        
                } else {
                    _nonBlockingTransfer(matrix[uplineMatrixId].userAddress, msg.tokenvalue.div(10));
                    uplineMatrixId = matrix[uplineMatrixId].parentMatrixId;
                }
                continue;
            }
            if (matrix[uplineMatrixId].subtreeMatrixCount >= 361) {
                continue;
            }

            if ((uplineMatrixId == 0)||(matrix[uplineMatrixId].userAddress == idToAddress[rootUserId])) {    
                _nonBlockingTransfer(idToAddress[rootUserId], uplineRewards[i]);        
            } else {
                _nonBlockingTransfer(matrix[uplineMatrixId].userAddress, uplineRewards[i]);
                uplineMatrixId = matrix[uplineMatrixId].parentMatrixId;
            }
        }

        // reward leader pool
        // _rewardLeaders(leaderPoolReward);

        emit MakedRewards(_parentMatrixId, msg.tokenvalue, block.timestamp);
    }

    function _getParentMatrixId(uint256 _localRootMatrix) internal view returns(uint256) {
        return _search(_localRootMatrix);
    }

    function _getSubtreeHeight() internal pure returns(uint256) {
        return 5;
    }

    function _getRefferalsLimit() internal pure returns(uint256) {
        return 363;
    }

    function resolveFilling(uint256 _id) external view returns(uint) {
        return _getParentMatrixId(_id);
    }

}