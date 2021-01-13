var wait = require('../helpers/wait');

var PriceController = artifacts.require('PriceController');
var MatrixThree = artifacts.require('MatrixThree');

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

module.exports = async function(deployer, network, accounts) {

    const OWNER_ADDRESS = accounts;
    const ROOT_ADDRESS = "TDFc5YGwNGy1jfVZgP1WKzheb9YQnfZfb9";

    if (network == "development") {
        
        await deployer.deploy(PriceController);
        var priceControllerInst = await PriceController.deployed()

        await priceControllerInst.call('updateUsdRate', [1]);
        await console.log(network);
        await console.log(accounts);

        
        await deployer.deploy(MatrixThree, ROOT_ADDRESS, priceControllerInst.address);

        // const MatrixThreeInst = await MatrixThree.at((await MatrixThree.deployed()).address);
        // await console.log(MatrixThreeInst);
        // let contract = await tronWeb.contract.at('contractAddress'); 
        // await MatrixThreeInst.call("register", [ROOT_ADDRESS]);
        // for (let i = 2; i < 92; i++) {
        //     await MatrixThreeInst.register(ROOT_ADDRESS, {from: accounts[i], value: 50});
        //     await wait(1);
        // }
    }
    if (network == "production") {
        //
    }
};