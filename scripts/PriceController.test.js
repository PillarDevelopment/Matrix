const { BN, constants, expectRevert } = require("@openzeppelin/test-helpers");
var wait = require('../helpers/wait')

const PriceController = artifacts.require('PriceController');

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

contract('PriceController', (accounts) => {
    const OWNER_ADDRESS = accounts[0];

    var priceController;

    beforeEach(async () => {
        priceController = await PriceController.deployed();
    });

    it('setPriceProvider(...)', async () => {
        await priceController.setPriceProvider(accounts[1], {from: OWNER_ADDRESS});

        await assert.equal(await priceController.priceProvider(), tronWeb.address.toHex(accounts[1]), "check new priceProvider");
        
        await priceController.setPriceProvider(accounts[2], {from: accounts[2]});

        await assert.equal(await priceController.priceProvider(), tronWeb.address.toHex(accounts[1]), "check new priceProvider");
        // await expectRevert(
        //     priceController.setPriceProvider(accounts[1], {from: accounts[2]}),
        //     "Ownable: caller is not the owner."
        // );
    });

    // it('getCurrentUsdRate(...)', async () => {
    //     await priceController.updateUsdRate(10, {from: OWNER_ADDRESS});

    //     await assert.equal(await priceController.getCurrentUsdRate(), 10, "check new getCurrentUsdRate");

    //     await expectRevert(
    //         priceController.updateUsdRate(15, {from: accounts[2]}),
    //         "PriceProvider: caller is not the priceProvider"
    //     );
    // });
})