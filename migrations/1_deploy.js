const PriceController = artifacts.require('PriceController');
const MatrixTwo = artifacts.require('MatrixTwo');

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

module.exports = async function(deployer, network, accounts) {

    const OWNER_ADDRESS = accounts[0];
    const ROOT_ADDRESS = accounts[1];

    if (network == "development") {
        const priceController = await PriceController.new();
        await priceController.updateUsdRate(1);
        await deployer.deploy(MatrixTwo, ROOT_ADDRESS, priceController.address);

        const instance = await MatrixTwo.at((await MatrixTwo.deployed()).address);

        await instance.register(ROOT_ADDRESS, {from: accounts[2], value: 50});
        await instance.register(ROOT_ADDRESS, {from: accounts[3], value: 50});
        await instance.register(ROOT_ADDRESS, {from: accounts[4], value: 50});
    }
    if (network == "production") {
        //
    }
};