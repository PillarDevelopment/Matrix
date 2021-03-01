var wait = require('../helpers/wait');

var PriceController = artifacts.require('PriceController');
var MatrixOne = artifacts.require('MatrixOne');
var MatrixTwo = artifacts.require('MatrixTwo');
var MatrixThree = artifacts.require('MatrixThree');
var MatrixFour = artifacts.require('MatrixFour');
var MatrixLeader = artifacts.require('MatrixLeader');

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

module.exports = function(deployer, network, account) {

    const OWNER_ADDRESS = account;
    let ROOT_ADDRESS;

    if (network == "development") {
        deployer.then(async () => {
            ROOT_ADDRESS = await "TZCapZtaxJ7i9LCmbg85rxfCX92soyCaAH"; // hardcoded cause account != accounts in tronbox, use with special mnemonic (scripts/)
            await deployer.deploy(PriceController, 1000001);
            var priceControllerInst = await PriceController.deployed();
            await wait();
            await deployer.deploy(MatrixLeader, priceControllerInst.address, 0);
            var matrixLeaderInst = await MatrixLeader.deployed();
            await wait(2);
            await deployer.deploy(MatrixOne, ROOT_ADDRESS, priceControllerInst.address, matrixLeaderInst.address);
            await wait();
            await deployer.deploy(MatrixTwo, ROOT_ADDRESS, priceControllerInst.address, matrixLeaderInst.address);
            await wait();
            await deployer.deploy(MatrixThree, ROOT_ADDRESS, priceControllerInst.address, matrixLeaderInst.address);
            await wait();
            await deployer.deploy(MatrixFour, ROOT_ADDRESS, priceControllerInst.address);
            await wait();
            await priceControllerInst.call('updateUsdRate', [1]);
            await wait();
        });
    }
    if (network == "shasta") {
        deployer.then(async () => {
            ROOT_ADDRESS = await "TVa2C5Q8u7dimokCLJo9dN8Ksm6fSXjKCb";
            await deployer.deploy(PriceController, 1000495);
            var priceControllerInst = await PriceController.deployed();
            await wait();
            await deployer.deploy(MatrixLeader, priceControllerInst.address);
            var matrixLeaderInst = await MatrixLeader.deployed();
            await wait();
            await deployer.deploy(MatrixOne, ROOT_ADDRESS, priceControllerInst.address, matrixLeaderInst.address);
            await wait();
            await deployer.deploy(MatrixTwo, ROOT_ADDRESS, priceControllerInst.address, matrixLeaderInst.address);
            await wait();
            await deployer.deploy(MatrixThree, ROOT_ADDRESS, priceControllerInst.address, matrixLeaderInst.address);
            await wait();
            await deployer.deploy(MatrixFour, ROOT_ADDRESS, priceControllerInst.address);
            await wait();
            await priceControllerInst.call('updateUsdRate', [1]);
            await wait();
        });
    }
};