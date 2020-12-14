pragma solidity ^0.5.12;

interface IPriceController {

    function getCurrentUsdRate() external view returns(uint256);
    function getTokenID() external view returns(trcToken);
}