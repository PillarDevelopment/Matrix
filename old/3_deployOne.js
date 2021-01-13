var wait = require('../helpers/wait');

var PriceController = artifacts.require('PriceController');
var MatrixOne = artifacts.require('MatrixOne');

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

module.exports = async function(deployer, network, accounts) {

    const ROOT_ADDRESS = accounts;

    if (network == "development") {
        
        await deployer.deploy(PriceController);
        var priceControllerInst = await PriceController.deployed()

        await priceControllerInst.call('updateUsdRate', [1]);
        await console.log(network);
        await console.log(accounts);

        
        await deployer.deploy(MatrixOne, ROOT_ADDRESS, priceControllerInst.address);


    }
    if (network == "shasta") {
        // const priceControllerAddress = await "TN3cgiTRKcyEPPLJfu5DdsuWDjNYDyDd91";

        await deployer.deploy(PriceController);
        var priceControllerInst = await PriceController.deployed()
        await priceControllerInst.call('updateUsdRate', [1]);

        await deployer.deploy(MatrixOne, ROOT_ADDRESS, priceControllerInst.address);
    }
};