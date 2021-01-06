const PriceController = artifacts.require('PriceController');
const MatrixThree = artifacts.require('MatrixThree');

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

module.exports = async function(deployer, network, accounts) {

    const OWNER_ADDRESS = accounts[0];
    const ROOT_ADDRESS = accounts[1];

    if (network == "development") {
        const priceController = await PriceController.new();
        await priceController.updateUsdRate(1);
        await deployer.deploy(MatrixThree, ROOT_ADDRESS, priceController.address);

        const instance = await MatrixThree.at((await MatrixThree.deployed()).address);

        for (let i = 2; i < 92; i++) {
            await instance.register(ROOT_ADDRESS, {from: accounts[i], value: 50});
            
        }
    }
    if (network == "production") {
        //
    }
};