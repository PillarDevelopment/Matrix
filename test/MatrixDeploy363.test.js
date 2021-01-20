var wait = require('../helpers/wait');
var assert = require('assert');

var PriceController = artifacts.require('PriceController');
var MatrixFour = artifacts.require('MatrixFour');

const ZERO_ADDRESS = "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb";

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
  
    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.
  
    for (var i = 0; i < a.length; ++i) {
      if (a[i] != b[i]) return false;
    }
    return true;
  }

contract('MatrixFour', (accounts) => {
    const OWNER_ADDRESS = accounts[0];
    const ROOT_ADDRESS = accounts[1];

    let priceController, matrixInstance;


    before(async () => {
        await wait(0.5);
        priceController = await PriceController.deployed();
        matrixInstance = await MatrixFour.deployed();

        const accountBalances = await tronWeb.trx.getAccount(
            accounts[0],
        );

        // await console.log(accountBalances); // 1000001 id

        if (!accountBalances.assetV2) {
            const trc_options = {
                name : "test",
                abbreviation : "tt",
                description : "fortest",
                url : "www.baidu.com",
                totalSupply : 10000000000,
                trxRatio : 1,
                tokenRatio : 1,
                saleStart : 2581929489000,
                saleEnd : 2581938187000,
                freeBandwidth : 0,
                freeBandwidthLimit : 0,
                frozenAmount : 0,
                frozenDuration : 0,
                precision : 6
            }
            
            const tradeobj = await tronWeb.transactionBuilder.createAsset(
                trc_options,
                accounts[0]
            ).then(output => {
                // console.log('- Output:', output, '\n');
                return output;
            });
            
            //sign 
            const signedtxn = await tronWeb.trx.sign(
                tradeobj,
                tronWeb.defaultPrivateKey
            );

            //broadcast 
            const receipt = await tronWeb.trx.sendRawTransaction(
                signedtxn
            )
            .then(output => {
                // console.log('- Output:', output, '\n');
                return output;
            });

            await wait(0.5);

            const tradeobj1 = await tronWeb.trx.getAccount(
                accounts[0],
            );
            // await console.log('- Output:', tradeobj1, '\n');
            
            
            for (let i = 2; i < 365; i++) {
                await wait(0.3);
                var tokenID = "1000001";
                var amount = 100000;
                var fromAddress = accounts[0];

                const tradeobj = await tronWeb.transactionBuilder.sendToken(
                    accounts[i],
                    amount,
                    tokenID,
                    fromAddress,    
                ).then(output => {
                // console.log('- Output:', output, '\n');
                return output;
                });
                //sign
                const signedtxn = await tronWeb.trx.sign(
                    tradeobj,
                    tronWeb.defaultPrivateKey
                );
                //broadcast
                const receipt = await tronWeb.trx.sendRawTransaction(
                    signedtxn
                ).then(output => {
                // console.log('- Output:', output, '\n');
                return output;
                });
            }
            
        }

        await wait(0.5);
    });

    it('register(...)', async () => {

        //
        // create new user1
        //

        await console.log('contract address: ' + matrixInstance.address);
        for (let i = 3; i < 66; i++) {
            // await wait(1.5);

            await matrixInstance.register(ROOT_ADDRESS, {
                from: accounts[i],
                tokenId: "1000001",
                tokenValue: 50,
                shouldPollResponse: true,
            });

        }
    });
})