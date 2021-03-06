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
                totalSupply : 1000000000,
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
            
            
            for (let i = 1; i < 90; i++) {
                await wait();
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
        await matrixInstance.changeEntryCost(50, { from: accounts[0] });
        await priceController.updateUsdRate(1);
        // await matrixInstance.changeEntryCost(50, {from: accounts[0]});

        //
        // create new user1
        //

        await matrixInstance.register(ROOT_ADDRESS, {
            from: accounts[2],
            tokenId: "1000001",
            tokenValue: 50,
            shouldPollResponse: true,
        });

        // await wait(0.5);

        // check user1
        const user1 = await matrixInstance.getUser(accounts[2]);
        await assert.equal(user1.id, 1, "Check user1 properties (id)");
        await assert.equal(tronWeb.address.fromHex(user1.referrerAddress), ROOT_ADDRESS, "Check user1 properties (referrerAddress)");
        await assert.equal(user1.referralsCount, 0, "Check user1 properties (referralsCount)");
        await assert.equal(user1.matrixIds.length, 1, "Check user1 properties (matrixIds)");

        // check user1 matrix
        const matrixUser1 = await matrixInstance.getMatrix(user1.matrixIds[0].toNumber());
        await assert.equal(matrixUser1.parentMatrixId, 1, "Check matrix properties (parentMatrixId)");
        await assert.equal(tronWeb.address.fromHex(matrixUser1.userAddress), accounts[2], "Check matrix properties (userAddress)");
        await assert.equal(matrixUser1.closed, false, "Check matrix properties (closed)");
        await assert.equal(matrixUser1.subtreeMatrixCount, 0, "Check matrix properties (subtreeMatrixCount)");
        await assert.equal(matrixUser1.childMatrixIds.length, 0, "Check matrix properties (childMatrixIds)");
        // return;

        //
        // create new user2
        //
        await matrixInstance.register(ROOT_ADDRESS, {
            from: accounts[3],
            tokenId: "1000001",
            tokenValue: 50,
            shouldPollResponse: true,
        });

        // await wait(0.5);

        // check user2
        const user2 = await matrixInstance.getUser(accounts[3]);
        await assert.equal(user2.id, 2, "Check user2 properties (id)");
        await assert.equal(tronWeb.address.fromHex(user2.referrerAddress), ROOT_ADDRESS, "Check user2 properties (referrerAddress)");
        await assert.equal(user2.referralsCount, 0, "Check user2 properties (referralsCount)");
        await assert.equal(user2.matrixIds.length, 1, "Check user2 properties (matrixIds)");

        // check user2 matrix
        const matrixUser2 = await matrixInstance.getMatrix(user2.matrixIds[0].toNumber());
        await assert.equal(matrixUser2.parentMatrixId, 1, "Check matrix properties (parentMatrixId)");
        await assert.equal(tronWeb.address.fromHex(matrixUser2.userAddress), accounts[3], "Check matrix properties (userAddress)");
        await assert.equal(matrixUser2.closed, false, "Check matrix properties (closed)");
        await assert.equal(matrixUser2.subtreeMatrixCount, 0, "Check matrix properties (subtreeMatrixCount)");
        await assert.equal(matrixUser2.childMatrixIds.length, 0, "Check matrix properties (childMatrixIds)");
        
        //
        // check root user & matrix
        //
        const parent = await matrixInstance.getUser(ROOT_ADDRESS);
        await assert.equal(parent.id, 0, "Check parent properties (id)");
        await assert.equal(tronWeb.address.fromHex(parent.referrerAddress), ZERO_ADDRESS, "Check parent properties (referrerAddress)");
        await assert.equal(parent.referralsCount, 2, "Check parent properties (referralsCount)");
        await assert.equal(parent.matrixIds.length, 1, "Check parent properties (matrixIds)");

        const matrixParent = await matrixInstance.getMatrix(parent.matrixIds[0].toNumber());
        await assert.equal(matrixParent.parentMatrixId, 0, "Check matrix properties (parentMatrixId)");
        await assert.equal(tronWeb.address.fromHex(matrixParent.userAddress), ROOT_ADDRESS, "Check matrix properties (userAddress)");
        await assert.equal(matrixParent.closed, false, "Check matrix properties (closed)");
        await assert.equal(matrixParent.subtreeMatrixCount, 2, "Check matrix properties (subtreeMatrixCount)");
        await assert.equal(matrixParent.childMatrixIds.length, 2, "Check matrix properties (childMatrixIds)");

        await assert.equal(matrixParent.childMatrixIds[0], 2, "Check matrix properties (childMatrixIds)");
        await assert.equal(matrixParent.childMatrixIds[1], 3, "Check matrix properties (childMatrixIds)");
    });

    it('changeEntryCost(...)', async () => {
        // check cost
        let entryCost = await matrixInstance.matrixEntryCost();
        await assert.equal(entryCost, 50, "Check entryCost");
        
        // check no revert
        await matrixInstance.register(ROOT_ADDRESS, {
            from: accounts[4],
            tokenId: "1000001",
            tokenValue: 50,
            shouldPollResponse: true,
        });

        await wait(0.5);

        // check revert
        await assert.rejects(
            matrixInstance.register(ROOT_ADDRESS, {
                    from: accounts[5],
                    tokenId: "1000001",
                    tokenValue: 51,
                    shouldPollResponse: true,
            })
        );

        await matrixInstance.changeEntryCost(100, {from: accounts[0]});

        // await wait(0.5);

        // check cost
        entryCost = await matrixInstance.matrixEntryCost();
        await assert.equal(entryCost, 100, "Check entryCost");

        // check no revert
        await matrixInstance.register(ROOT_ADDRESS, {
            from: accounts[6],
            tokenId: "1000001",
            tokenValue: 100,
            shouldPollResponse: true,
        })

        
        // check revert
        await assert.rejects(
            matrixInstance.register(ROOT_ADDRESS, {
                from: accounts[7],
                tokenId: "1000001",
                tokenValue: 50,
                shouldPollResponse: true,
            })
        );
    });



    it('_rewardLeaders()', async () => {
        // prepare price
        await priceController.updateUsdRate(20);
        await matrixInstance.changeEntryCost(100, { from: accounts[0] });
        
        var contractBalance;
        if ((await tronWeb.trx.getAccount(matrixInstance.address)).assetV2) {
            contractBalance = (await tronWeb.trx.getAccount(matrixInstance.address)).assetV2[0].value
        }

        //check payment
        const usrBalance = (await tronWeb.trx.getAccount(accounts[0])).assetV2[0].value;
        
        const rootBalance = (await tronWeb.trx.getAccount(accounts[6])).assetV2[0].value;

        const acc2Balance = (await tronWeb.trx.getAccount(accounts[2])).assetV2[0].value;
        const acc1Balance = (await tronWeb.trx.getAccount(accounts[1])).assetV2[0].value;

        await matrixInstance.register(accounts[6], {
            from: accounts[8],
            tokenId: "1000001",
            tokenValue: 2000,
            shouldPollResponse: true,
        });
        
        // await console.log((await tronWeb.trx.getAccount(matrixInstance.address)).assetV2[0].value);
        await console.log(tronWeb.address.fromHex(matrixInstance.address))

        await assert.equal((await tronWeb.trx.getAccount(accounts[0])).assetV2[0].value, usrBalance + 0, "Check leader balance");
        await assert.equal((await tronWeb.trx.getAccount(accounts[1])).assetV2[0].value, acc1Balance + 1500, "Check ROOT_ADDRESS balance");
        await assert.equal((await tronWeb.trx.getAccount(accounts[2])).assetV2[0].value, acc2Balance + 300, "Check ROOT_ADDRESS balance");
        await assert.equal((await tronWeb.trx.getAccount(accounts[6])).assetV2[0].value, rootBalance + 200, "Check ROOT_ADDRESS balance");


        await assert.equal(
            contractBalance + 0,
            (await tronWeb.trx.getAccount(matrixInstance.address)).assetV2[0].value,
            "Check contract balance"
        );
    });

    it('negative register(...)', async () => {
        await matrixInstance.changeEntryCost(50, {from: accounts[0]});
        await priceController.updateUsdRate(1);

        // await wait(0.5);

        // add new user
        await matrixInstance.register(ROOT_ADDRESS, {
            from: accounts[9],
            tokenId: "1000001",
            tokenValue: 50,
            shouldPollResponse: true,
        });

        // await wait(0.5);
        
        //
        // check reverts
        //

        // user restrictions

        await assert.rejects(
            matrixInstance.register(ZERO_ADDRESS, {
                from: accounts[10],
                tokenId: "1000001",
                tokenValue: 50,
                shouldPollResponse: true,
            })
        );

        await assert.rejects(
            matrixInstance.register(accounts[10], {
                from: accounts[10],
                tokenId: "1000001",
                tokenValue: 50,
                shouldPollResponse: true,
            })
        );
        
        await assert.rejects(
            matrixInstance.register(ROOT_ADDRESS, {
                from: accounts[1],
                tokenId: "1000001",
                tokenValue: 50,
                shouldPollResponse: true,
            })
        );

        await assert.rejects(
            matrixInstance.register(accounts[70], {
                from: accounts[10],
                tokenId: "1000001",
                tokenValue: 50,
                shouldPollResponse: true,
            })
        );

        // funds restrictions

        await assert.rejects(
            matrixInstance.register(ROOT_ADDRESS, {
                from: accounts[10],
                tokenId: "1000001",
                tokenValue: 49,
                shouldPollResponse: true,
            })
        );

        await assert.rejects(
            matrixInstance.register(ROOT_ADDRESS, {
                from: accounts[10],
                tokenId: "1000001",
                tokenValue: 51,
                shouldPollResponse: true,
            })
        );

        await assert.rejects(
            matrixInstance.register(ROOT_ADDRESS, {
                from: accounts[10],
                tokenId: "1000001",
                tokenValue: 1,
                shouldPollResponse: true,
            })
        );

    });

})