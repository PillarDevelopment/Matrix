var wait = require('../helpers/wait');
var assert = require('assert');

var PriceController = artifacts.require('PriceController');
var MatrixThree = artifacts.require('MatrixThree');

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

contract('MatrixThree', (accounts) => {
    const OWNER_ADDRESS = accounts[0];
    const ROOT_ADDRESS = accounts[1];

    let priceController, matrixInstance;


    before(async () => {
        await wait(0.5);
        priceController = await PriceController.deployed();
        matrixInstance = await MatrixThree.deployed();

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

        // await wait(0.5);

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

    it('getLeaderPool(...)', async () => {
        // check zeros leader pool
        const zeroArray = await [
            accounts[0],
            accounts[0],
            accounts[0],
            accounts[0],
            accounts[0],
            accounts[0],
            accounts[0],
            accounts[0],
            accounts[0],
            accounts[0]
        ];
        let currentLeaderPool = await matrixInstance.getLeaderPool();
        // for (let i = 0; i < 10; i++) {
        //     currentLeaderPool[i] = await tronWeb.address.fromHex(currentLeaderPool[i]);
            
        // }
        
        // await assert.equal(arraysEqual(zeroArray, currentLeaderPool), true, "Check currentLeaderPool");

        // // set & check new leader pool
        // const leaderArray = await [
        //     "TNFM1tmwVDBXMzayGVDnE9UzoSwYWsuNXY",
        //     "TNFM1tmwVDBXMzayGVDnE9UzoSwYWsuNXY",
        //     "TNFM1tmwVDBXMzayGVDnE9UzoSwYWsuNXY",
        //     "TNFM1tmwVDBXMzayGVDnE9UzoSwYWsuNXY",
        //     "TNFM1tmwVDBXMzayGVDnE9UzoSwYWsuNXY",
        //     "TNFM1tmwVDBXMzayGVDnE9UzoSwYWsuNXY",
        //     "TNFM1tmwVDBXMzayGVDnE9UzoSwYWsuNXY",
        //     "TNFM1tmwVDBXMzayGVDnE9UzoSwYWsuNXY",
        //     "TNFM1tmwVDBXMzayGVDnE9UzoSwYWsuNXY",
        //     "TNFM1tmwVDBXMzayGVDnE9UzoSwYWsuNXY",
        // ];
    });

    it('_rewardLeaders()', async () => {
        // prepare price
        await priceController.updateUsdRate(20);
        await matrixInstance.changeEntryCost(50, {from: accounts[0]});

        let currentLeaderPool = await matrixInstance.getLeaderPool();
        // await wait(0.5);

        //check payment
        const usrBalance = (await tronWeb.trx.getAccount(accounts[0])).assetV2[0].value;
        
        const rootBalance = (await tronWeb.trx.getAccount(accounts[6])).assetV2[0].value;

        await matrixInstance.register(accounts[6], {
            from: accounts[8],
            tokenId: "1000001",
            tokenValue: 1000,
            shouldPollResponse: true,
        });
        
        // await console.log((await tronWeb.trx.getAccount(matrixInstance.address)).assetV2[0].value);
        await console.log(tronWeb.address.fromHex(matrixInstance.address))


    });

    it('negative register(...)', async () => {
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


    it('overflow 1', async () => {
        await console.log(tronWeb.address.fromHex(matrixInstance.address));

        const root = await accounts[8];
        await priceController.updateUsdRate(100);
        await matrixInstance.changeEntryCost(50, {from: accounts[0]});

        const rootBalance = (await tronWeb.trx.getAccount(root)).assetV2[0].value

        var contractBalance;
        if ((await tronWeb.trx.getAccount(matrixInstance.address)).assetV2) {
            contractBalance = (await tronWeb.trx.getAccount(matrixInstance.address)).assetV2[0].value
        }

        for (let i = 10; i < 48; i++) {
            await matrixInstance.register(root, {
                from: accounts[i],
                tokenId: "1000001",
                tokenValue: 5000,
                shouldPollResponse: true,
            })

            if (i % 3 == 0) {
                wait(0.5);
            }
        }

        const rootUser = await matrixInstance.getUser(root);
        await assert.equal(tronWeb.address.fromHex(rootUser.referrerAddress), accounts[6], "Check rootUser properties (referrerAddress)");
        await assert.equal(rootUser.referralsCount.toNumber(), 38, "Check rootUser properties (referralsCount)");
        await assert.equal(rootUser.matrixIds.length, 1, "Check rootUser properties (matrixIds)");

        const matrixByRoot = await matrixInstance.getMatrix(rootUser.matrixIds[0].toNumber());
        await assert.equal(tronWeb.address.fromHex(matrixByRoot.userAddress), root, "Check matrix properties (userAddress)");
        await assert.equal(matrixByRoot.closed, false, "Check matrix properties (closed)");
        await assert.equal(matrixByRoot.subtreeMatrixCount.toNumber(), 38, "Check matrix properties (subtreeMatrixCount)");
        await assert.equal(matrixByRoot.childMatrixIds.length, 3, "Check matrix properties (childMatrixIds)");

        await assert.equal(
            rootBalance + 77500,
            (await tronWeb.trx.getAccount(root)).assetV2[0].value,
            "Check user balance"
        );
        
        await assert.equal(
            contractBalance + 2500,
            (await tronWeb.trx.getAccount(matrixInstance.address)).assetV2[0].value,
            "Check contract balance"
        );
    
    });

    it('overflow 2', async () => {
        await matrixInstance.register(accounts[47], {
            from: accounts[48],
            tokenId: "1000001",
            tokenValue: 5000,
            shouldPollResponse: true,
        })
        const root = await accounts[48];
        const rootBalance = (await tronWeb.trx.getAccount(root)).assetV2[0].value

        var contractBalance;
        if ((await tronWeb.trx.getAccount(matrixInstance.address)).assetV2) {
            contractBalance = (await tronWeb.trx.getAccount(matrixInstance.address)).assetV2[0].value
        }

        for (let i = 49; i < 88; i++) {
            await matrixInstance.register(root, {
                from: accounts[i],
                tokenId: "1000001",
                tokenValue: 5000,
                shouldPollResponse: true,
            })

            if (i % 3 == 0) {
                wait(0.5);
            }
        }

        const rootUser = await matrixInstance.getUser(root);
        await assert.equal(tronWeb.address.fromHex(rootUser.referrerAddress), accounts[47], "Check rootUser properties (referrerAddress)");
        await assert.equal(rootUser.referralsCount.toNumber(), 39, "Check rootUser properties (referralsCount)");
        await assert.equal(rootUser.matrixIds.length, 2, "Check rootUser properties (matrixIds)");

        const matrixByRoot1 = await matrixInstance.getMatrix(rootUser.matrixIds[0].toNumber());
        await assert.equal(tronWeb.address.fromHex(matrixByRoot1.userAddress), root, "Check matrix properties (userAddress)");
        await assert.equal(matrixByRoot1.closed, true, "Check matrix properties (closed)");
        await assert.equal(matrixByRoot1.subtreeMatrixCount.toNumber(), 39, "Check matrix properties (subtreeMatrixCount)");
        await assert.equal(matrixByRoot1.childMatrixIds.length, 3, "Check matrix properties (childMatrixIds)");

        const matrixByRoot2 = await matrixInstance.getMatrix(rootUser.matrixIds[1].toNumber());
        await assert.equal(tronWeb.address.fromHex(matrixByRoot2.userAddress), root, "Check matrix properties (userAddress)");
        await assert.equal(matrixByRoot2.closed, false, "Check matrix properties (closed)");
        await assert.equal(matrixByRoot2.subtreeMatrixCount.toNumber(), 0, "Check matrix properties (subtreeMatrixCount)");
        await assert.equal(matrixByRoot2.childMatrixIds.length, 0, "Check matrix properties (childMatrixIds)");

        await assert.equal(
            rootBalance + 77500,
            (await tronWeb.trx.getAccount(root)).assetV2[0].value,
            "Check user balance"
        );
        
        await assert.equal(
            contractBalance + 0,
            (await tronWeb.trx.getAccount(matrixInstance.address)).assetV2[0].value,
            "Check contract balance"
        );
    });

})