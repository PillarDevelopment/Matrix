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
    // Constants
    //

    uint256 public constant matrixReferralsLimit = 3;

    //
    // Constructor
    //

    constructor(address payable _rootUser, address _priceController) MatrixCore(_rootUser, _priceController) public {}

    //
    // Hooks implementations
    //

    function _getParentMatrixId(address _userAddress) internal view returns(uint256) {
        if (_userAddress == address(0)) {
            return 0;
        }
        return users[_userAddress].matrixIds[users[_userAddress].matrixIds.length.sub(1)];
    }


    function _makeRewards(address payable _upline) internal {
        uint256 uplineReward = msg.value.mul(9).div(10);
        uint256 leaderPoolReward = msg.value.sub(uplineReward);

        // reward upline
        _nonBlockingTransfer(_upline, uplineReward);

        // reward leader pool
        _rewardLeaders(leaderPoolReward);

        emit MakedRewards(_upline, block.timestamp);
    }

    function _isFilledMatrix(uint256 _matrixId) internal view returns(bool) {
        return (matrix[_matrixId].childMatrixIds.length >= matrixReferralsLimit);
    }
}