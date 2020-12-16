/**
 *
 * ooo        ooooo               .             o8o                      .o  
 * `88.       .888'             .o8             `"'                    o888  
 *  888b     d'888   .oooo.   .o888oo oooo d8b oooo  oooo    ooo        888  
 *  8 Y88. .P  888  `P  )88b    888   `888""8P `888   `88b..8P'         888  
 *  8  `888'   888   .oP"888    888    888      888     Y888'           888  
 *  8    Y     888  d8(  888    888 .  888      888   .o8"'88b          888  
 * o8o        o888o `Y888""8o   "888" d888b    o888o o88'   888o       o888o 
 *
 **/

pragma solidity ^0.5.12;

import "./core/MatrixCore.sol";

contract MatrixOne is MatrixCore {

    using SafeMath for uint256;

    //
    // Constructor
    //

    constructor(address payable _rootUser, address _priceController) MatrixCore(_rootUser, _priceController) public {}

    //
    // Hooks implementations
    //

    function _makeRewards(uint256 _newMatrixIndex) internal {
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
        return _localRootMatrix;
    }

    function _getSubtreeHeight() internal pure returns(uint256) {
        return 1;
    }

    function _getRefferalsLimit() internal pure returns(uint256) {
        return 3;
    }
}