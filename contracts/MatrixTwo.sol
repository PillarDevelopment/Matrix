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
        // TODO <--
    }


    function _makeRewards(address payable _upline) internal {
        // TODO <--
    }

    function _isFilledMatrix(uint256 _matrixId) internal view returns(bool) {
        // TODO <--
    }
}