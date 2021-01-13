pragma solidity ^0.5.12;

import "./core/MatrixOwnable.sol";
import "./interfaces/IPriceController.sol";


contract PriceController is IPriceController, MatrixOwnable {

    trcToken private tokenID;  // 1000495

    address public priceProvider;

    uint256 private currentUsdRate;

    modifier onlyPriceProvider() {
        require(msg.sender == priceProvider, "PriceProvider: caller is not the priceProvider");
        _;
    }

    constructor(uint256 _tokenID) public {
        tokenID = trcToken(_tokenID);
        priceProvider = msg.sender;
    }

    function setPriceProvider(address _newPriceProvider) external onlyOwner {
        priceProvider = _newPriceProvider;
    }

    function updateUsdRate(uint256 _newRate) external onlyPriceProvider {
        currentUsdRate = _newRate;
    }


    function getCurrentUsdRate() external view returns(uint256) {
        return currentUsdRate;
    }

    function getTokenID() public view returns(trcToken) {
        return tokenID;
    }

}
