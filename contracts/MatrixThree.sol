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

contract MatrixThree is MatrixCore {

    using SafeMath for uint256;

    //
    // Constructor
    //

    constructor(address payable _rootUser, address _priceController) MatrixCore(_rootUser, _priceController) public {}

    //
    // Private methods
    //

    function _search(uint256 id, uint256 depth) public view returns(uint256) {
    
        if (matrix[id].childMatrixIds.length >= 1) {
            if (depth < _getSubtreeHeight() - 1) {
                uint256 newId = _search(matrix[id].childMatrixIds[0], depth + 1);
                if (newId != 0) return newId;
            }
        }
        
        if (matrix[id].childMatrixIds.length >= 2) {
            if (depth < _getSubtreeHeight() - 1) {
                uint256 newId = _search(matrix[id].childMatrixIds[1], depth + 1);
                if (newId != 0) return newId;
            }
        }

        if (matrix[id].childMatrixIds.length >= 3) {
            if (depth < _getSubtreeHeight() - 1) {
                uint256 newId = _search(matrix[id].childMatrixIds[2], depth + 1);
                if (newId != 0) return newId;
            } else return 0;
        }
        
        return id;
    }

    //
    // Hooks implementations
    //

    function _makeRewards(uint256 _newMatrixIndex) internal {
        // TODO release after testing
        uint256 uplineReward = msg.value.mul(9).div(10);
        uint256 leaderPoolReward = msg.value.sub(uplineReward);

        // reward upline
        address payable upline = matrix[matrix[_newMatrixIndex].parentMatrixId].userAddress;
        _nonBlockingTransfer(upline, uplineReward);

        // reward leader pool
        _rewardLeaders(leaderPoolReward);

        emit MakedRewards(upline, block.timestamp);

    }

    function _getParentMatrixId(uint256 _localRootMatrix) internal view returns(uint256) {
        return _search(_localRootMatrix, 0);
    }

    function _getSubtreeHeight() internal pure returns(uint256) {
        return 3;
    }

    function _getRefferalsLimit() internal pure returns(uint256) {
        return 39;
    }

}