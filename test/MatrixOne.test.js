const { BN, constants, expectRevert } = require("@openzeppelin/test-helpers");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");

const MatrixOne = artifacts.require('MatrixOne');
const MatrixTwo = artifacts.require('MatrixTwo');
const MatrixThree = artifacts.require('MatrixThree');
const MatrixFour = artifacts.require('MatrixFour');
const PriceController = artifacts.require('PriceController');

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

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

contract('MatrixOne', (accounts) => {
    const OWNER_ADDRESS = accounts[0];
    const ROOT_ADDRESS = accounts[1];

    var priceController;
    var instance;

    describe('positive', function () {

        beforeEach(async () => {
            priceController = await PriceController.new();
            await priceController.updateUsdRate(1);
            instance = await MatrixOne.new(ROOT_ADDRESS, priceController.address);
        });

        it('register-fallback', async () => {
            //
            // create new user1
            //
            await instance.send(50, {from: accounts[2]});

            // check user1
            const user1 = await instance.getUser(accounts[2]);
            await assert.equal(user1.id, 1, "Check user1 properties (id)");
            await assert.equal(user1.referrerAddress, ROOT_ADDRESS, "Check user1 properties (referrerAddress)");
            await assert.equal(user1.referralsCount, 0, "Check user1 properties (referralsCount)");
            await assert.equal(user1.matrixIds.length, 1, "Check user1 properties (matrixIds)");

            // check user1 matrix
            const matrixUser1 = await instance.getMatrix(user1.matrixIds[0]);
            await assert.equal(matrixUser1.parentMatrixId, 1, "Check matrix properties (parentMatrixId)");
            await assert.equal(matrixUser1.userAddress, accounts[2], "Check matrix properties (userAddress)");
            await assert.equal(matrixUser1.closed, false, "Check matrix properties (closed)");
            await assert.equal(matrixUser1.subtreeMatrixCount, 0, "Check matrix properties (subtreeMatrixCount)");
            await assert.equal(matrixUser1.childMatrixIds.length, 0, "Check matrix properties (childMatrixIds)");
            
            //
            // create new user2
            //
            await instance.send(50, {from: accounts[3]});

            // check user2
            const user2 = await instance.getUser(accounts[3]);
            await assert.equal(user2.id, 2, "Check user2 properties (id)");
            await assert.equal(user2.referrerAddress, ROOT_ADDRESS, "Check user2 properties (referrerAddress)");
            await assert.equal(user2.referralsCount, 0, "Check user2 properties (referralsCount)");
            await assert.equal(user2.matrixIds.length, 1, "Check user2 properties (matrixIds)");

            // check user2 matrix
            const matrixUser2 = await instance.getMatrix(user2.matrixIds[0]);
            await assert.equal(matrixUser2.parentMatrixId, 1, "Check matrix properties (parentMatrixId)");
            await assert.equal(matrixUser2.userAddress, accounts[3], "Check matrix properties (userAddress)");
            await assert.equal(matrixUser2.closed, false, "Check matrix properties (closed)");
            await assert.equal(matrixUser2.subtreeMatrixCount, 0, "Check matrix properties (subtreeMatrixCount)");
            await assert.equal(matrixUser2.childMatrixIds.length, 0, "Check matrix properties (childMatrixIds)");
            
            //
            // check root user & matrix
            //
            const parent = await instance.getUser(ROOT_ADDRESS);
            await assert.equal(parent.id, 0, "Check parent properties (id)");
            await assert.equal(parent.referrerAddress, ZERO_ADDRESS, "Check parent properties (referrerAddress)");
            await assert.equal(parent.referralsCount, 2, "Check parent properties (referralsCount)");
            await assert.equal(parent.matrixIds.length, 1, "Check parent properties (matrixIds)");

            const matrixParent = await instance.getMatrix(parent.matrixIds[0]);
            await assert.equal(matrixParent.parentMatrixId, 0, "Check matrix properties (parentMatrixId)");
            await assert.equal(matrixParent.userAddress, ROOT_ADDRESS, "Check matrix properties (userAddress)");
            await assert.equal(matrixParent.closed, false, "Check matrix properties (closed)");
            await assert.equal(matrixParent.subtreeMatrixCount, 2, "Check matrix properties (subtreeMatrixCount)");
            await assert.equal(matrixParent.childMatrixIds.length, 2, "Check matrix properties (childMatrixIds)");

            await assert.equal(matrixParent.childMatrixIds[0], 2, "Check matrix properties (childMatrixIds)");
            await assert.equal(matrixParent.childMatrixIds[1], 3, "Check matrix properties (childMatrixIds)");
        });

        it('register(...)', async () => {
            //
            // create new user1
            //
            await instance.register(ROOT_ADDRESS, {from: accounts[2], value: 50});

            // check user1
            const user1 = await instance.getUser(accounts[2]);
            await assert.equal(user1.id, 1, "Check user1 properties (id)");
            await assert.equal(user1.referrerAddress, ROOT_ADDRESS, "Check user1 properties (referrerAddress)");
            await assert.equal(user1.referralsCount, 0, "Check user1 properties (referralsCount)");
            await assert.equal(user1.matrixIds.length, 1, "Check user1 properties (matrixIds)");

            // check user1 matrix
            const matrixUser1 = await instance.getMatrix(user1.matrixIds[0]);
            await assert.equal(matrixUser1.parentMatrixId, 1, "Check matrix properties (parentMatrixId)");
            await assert.equal(matrixUser1.userAddress, accounts[2], "Check matrix properties (userAddress)");
            await assert.equal(matrixUser1.closed, false, "Check matrix properties (closed)");
            await assert.equal(matrixUser1.subtreeMatrixCount, 0, "Check matrix properties (subtreeMatrixCount)");
            await assert.equal(matrixUser1.childMatrixIds.length, 0, "Check matrix properties (childMatrixIds)");
            
            //
            // create new user2
            //
            await instance.register(ROOT_ADDRESS, {from: accounts[3], value: 50});

            // check user2
            const user2 = await instance.getUser(accounts[3]);
            await assert.equal(user2.id, 2, "Check user2 properties (id)");
            await assert.equal(user2.referrerAddress, ROOT_ADDRESS, "Check user2 properties (referrerAddress)");
            await assert.equal(user2.referralsCount, 0, "Check user2 properties (referralsCount)");
            await assert.equal(user2.matrixIds.length, 1, "Check user2 properties (matrixIds)");

            // check user2 matrix
            const matrixUser2 = await instance.getMatrix(user2.matrixIds[0]);
            await assert.equal(matrixUser2.parentMatrixId, 1, "Check matrix properties (parentMatrixId)");
            await assert.equal(matrixUser2.userAddress, accounts[3], "Check matrix properties (userAddress)");
            await assert.equal(matrixUser2.closed, false, "Check matrix properties (closed)");
            await assert.equal(matrixUser2.subtreeMatrixCount, 0, "Check matrix properties (subtreeMatrixCount)");
            await assert.equal(matrixUser2.childMatrixIds.length, 0, "Check matrix properties (childMatrixIds)");
            
            //
            // check root user & matrix
            //
            const parent = await instance.getUser(ROOT_ADDRESS);
            await assert.equal(parent.id, 0, "Check parent properties (id)");
            await assert.equal(parent.referrerAddress, ZERO_ADDRESS, "Check parent properties (referrerAddress)");
            await assert.equal(parent.referralsCount, 2, "Check parent properties (referralsCount)");
            await assert.equal(parent.matrixIds.length, 1, "Check parent properties (matrixIds)");

            const matrixParent = await instance.getMatrix(parent.matrixIds[0]);
            await assert.equal(matrixParent.parentMatrixId, 0, "Check matrix properties (parentMatrixId)");
            await assert.equal(matrixParent.userAddress, ROOT_ADDRESS, "Check matrix properties (userAddress)");
            await assert.equal(matrixParent.closed, false, "Check matrix properties (closed)");
            await assert.equal(matrixParent.subtreeMatrixCount, 2, "Check matrix properties (subtreeMatrixCount)");
            await assert.equal(matrixParent.childMatrixIds.length, 2, "Check matrix properties (childMatrixIds)");

            await assert.equal(matrixParent.childMatrixIds[0], 2, "Check matrix properties (childMatrixIds)");
            await assert.equal(matrixParent.childMatrixIds[1], 3, "Check matrix properties (childMatrixIds)");
        });

        it('changeEntryCost(...)', async () => {
            // check cost
            let entryCost = await instance.matrixEntryCost();
            await assert.equal(entryCost, 50, "Check entryCost");
            
            // check no revert
            await instance.register(ROOT_ADDRESS, {from: accounts[2], value: 50});

            // check revert
            await expectRevert(
                instance.register(ROOT_ADDRESS, {from: accounts[3], value: 51}),
                "Matrix: invalid sending value"
            );

            await instance.changeEntryCost(100, {from: accounts[0]});
            
            // check cost
            entryCost = await instance.matrixEntryCost();
            await assert.equal(entryCost, 100, "Check entryCost");

            // check no revert
            await instance.register(ROOT_ADDRESS, {from: accounts[3], value: 100});
            
            // check revert
            await expectRevert(
                instance.register(ROOT_ADDRESS, {from: accounts[4], value: 50}),
                "Matrix: invalid sending value"
            );
        });

        it('setLeaderPool(...)', async () => {
            // check zeros leader pool
            const zeroArray = await [
                ZERO_ADDRESS,
                ZERO_ADDRESS,
                ZERO_ADDRESS,
                ZERO_ADDRESS,
                ZERO_ADDRESS,
                ZERO_ADDRESS,
                ZERO_ADDRESS,
                ZERO_ADDRESS,
                ZERO_ADDRESS,
                ZERO_ADDRESS
            ];
            let currentLeaderPool = await instance.getLeaderPool();
            await assert.equal(arraysEqual(zeroArray, currentLeaderPool), true, "Check currentLeaderPool");
            
            // set & check new leader pool
            const leaderArray = await [
                "0x0000000000000000000000000000000000000011",
                "0x0000000000000000000000000000000000000012",
                "0x0000000000000000000000000000000000000013",
                "0x0000000000000000000000000000000000000014",
                "0x0000000000000000000000000000000000000015",
                "0x0000000000000000000000000000000000000016",
                "0x0000000000000000000000000000000000000017",
                "0x0000000000000000000000000000000000000018",
                "0x0000000000000000000000000000000000000019",
                "0x0000000000000000000000000000000000000020",
            ];
            await instance.setLeaderPool(leaderArray);
            currentLeaderPool = await instance.getLeaderPool();
            await assert.equal(arraysEqual(leaderArray, currentLeaderPool), true, "Check currentLeaderPool");
        });

        it('_rewardLeaders()', async () => {
            const leaderArray = await [
                "0x0000000000000000000000000000000000000011",
                "0x0000000000000000000000000000000000000012",
                "0x0000000000000000000000000000000000000013",
                "0x0000000000000000000000000000000000000014",
                "0x0000000000000000000000000000000000000015",
                "0x0000000000000000000000000000000000000016",
                "0x0000000000000000000000000000000000000017",
                "0x0000000000000000000000000000000000000018",
                "0x0000000000000000000000000000000000000019",
                "0x0000000000000000000000000000000000000020",
            ];
            await instance.setLeaderPool(leaderArray);

            // prepare price
            await priceController.updateUsdRate(20);

            //check payment
            const usr1Balance = await web3.eth.getBalance("0x0000000000000000000000000000000000000011");
            const usr2Balance = await web3.eth.getBalance("0x0000000000000000000000000000000000000012");
            const usr3Balance = await web3.eth.getBalance("0x0000000000000000000000000000000000000013");
            const usr4Balance = await web3.eth.getBalance("0x0000000000000000000000000000000000000014");
            const usr5Balance = await web3.eth.getBalance("0x0000000000000000000000000000000000000015");
            const usr6Balance = await web3.eth.getBalance("0x0000000000000000000000000000000000000016");
            const usr7Balance = await web3.eth.getBalance("0x0000000000000000000000000000000000000017");
            const usr8Balance = await web3.eth.getBalance("0x0000000000000000000000000000000000000018");
            const usr9Balance = await web3.eth.getBalance("0x0000000000000000000000000000000000000019");
            const usr10Balance = await web3.eth.getBalance("0x0000000000000000000000000000000000000020");
            const rootBalance = await web3.eth.getBalance(ROOT_ADDRESS);

            await instance.register(ROOT_ADDRESS, {from: accounts[2], value: 1000});

            await assert.equal(await web3.eth.getBalance("0x0000000000000000000000000000000000000011"), +usr1Balance+30, "Check leader balance");
            await assert.equal(await web3.eth.getBalance("0x0000000000000000000000000000000000000012"), +usr2Balance+20, "Check leader balance");
            await assert.equal(await web3.eth.getBalance("0x0000000000000000000000000000000000000013"), +usr3Balance+10, "Check leader balance");
            await assert.equal(await web3.eth.getBalance("0x0000000000000000000000000000000000000014"), +usr4Balance+10, "Check leader balance");
            await assert.equal(await web3.eth.getBalance("0x0000000000000000000000000000000000000015"), +usr5Balance+5, "Check leader balance");
            await assert.equal(await web3.eth.getBalance("0x0000000000000000000000000000000000000016"), +usr6Balance+5, "Check leader balance");
            await assert.equal(await web3.eth.getBalance("0x0000000000000000000000000000000000000017"), +usr7Balance+5, "Check leader balance");
            await assert.equal(await web3.eth.getBalance("0x0000000000000000000000000000000000000018"), +usr8Balance+5, "Check leader balance");
            await assert.equal(await web3.eth.getBalance("0x0000000000000000000000000000000000000019"), +usr9Balance+5, "Check leader balance");
            await assert.equal(await web3.eth.getBalance("0x0000000000000000000000000000000000000020"), +usr10Balance+5, "Check leader balance");
            await assert.equal(await web3.eth.getBalance(ROOT_ADDRESS), +rootBalance+900, "Check ROOT_ADDRESS balance");
        });
    });

    describe('negative', function () {

        beforeEach(async () => {
            priceController = await PriceController.new();
            await priceController.updateUsdRate(1);
            instance = await MatrixOne.new(ROOT_ADDRESS, priceController.address);
        });

        it('register(...)', async () => {
            // add new user
            await instance.register(ROOT_ADDRESS, {from: accounts[2], value: 50});
            
            //
            // check reverts
            //

            // user restrictions

            await expectRevert(
                instance.register(ZERO_ADDRESS, {from: accounts[3], value: 50}),
                "Matrix: user must not be null"
            );

            await expectRevert(
                instance.register(accounts[3], {from: accounts[3], value: 50}),
                "Matrix: invalid _userAddress value"
            );
            
            await expectRevert(
                instance.register(ROOT_ADDRESS, {from: accounts[2], value: 50}),
                "Matrix: user exists"
            );

            await expectRevert(
                instance.register(accounts[4], {from: accounts[3], value: 50}),
                "Matrix: referrer not exists"
            );

            // funds restrictions

            await expectRevert(
                instance.register(ZERO_ADDRESS, {from: accounts[3], value: 51}),
                "Matrix: invalid sending value"
            );

            await expectRevert(
                instance.register(ZERO_ADDRESS, {from: accounts[3], value: 49}),
                "Matrix: invalid sending value"
            );

            await expectRevert(
                instance.register(ZERO_ADDRESS, {from: accounts[3], value: 0}),
                "Matrix: invalid sending value"
            );

            // contract restrictions

            // TODO


        });
    });

    describe('matrix overflows', function () {
        beforeEach(async () => {
            priceController = await PriceController.new();
            await priceController.updateUsdRate(1);
            instance = await MatrixOne.new(ROOT_ADDRESS, priceController.address);
        });

        it('overflow 1', async () => {
            await instance.register(ROOT_ADDRESS, {from: accounts[2], value: 50});
            await instance.register(ROOT_ADDRESS, {from: accounts[3], value: 50});
    
            const rootUser = await instance.getUser(ROOT_ADDRESS);
            await assert.equal(rootUser.id, 0, "Check rootUser properties (id)");
            await assert.equal(rootUser.referrerAddress, ZERO_ADDRESS, "Check rootUser properties (referrerAddress)");
            await assert.equal(rootUser.referralsCount, 2, "Check rootUser properties (referralsCount)");
            await assert.equal(rootUser.matrixIds.length, 1, "Check rootUser properties (matrixIds)");
            await assert.equal(arraysEqual(rootUser.matrixIds, [1]), true, "Check rootUser properties (matrixIds)");

            const matrixByRoot = await instance.getMatrix(rootUser.matrixIds[0]);
            await assert.equal(matrixByRoot.parentMatrixId, 0, "Check matrix properties (parentMatrixId)");
            await assert.equal(matrixByRoot.userAddress, ROOT_ADDRESS, "Check matrix properties (userAddress)");
            await assert.equal(matrixByRoot.closed, false, "Check matrix properties (closed)");
            await assert.equal(matrixByRoot.subtreeMatrixCount, 2, "Check matrix properties (subtreeMatrixCount)");
            await assert.equal(matrixByRoot.childMatrixIds.length, 2, "Check matrix properties (childMatrixIds)");
            await assert.equal(arraysEqual(matrixByRoot.childMatrixIds, [2,3]), true, "Check matrix properties (childMatrixIds)");

            await assert.equal(await instance.matrixCount(), 4, "Check matrix properties (matrixCount)");
            await assert.equal(await instance.userCount(), 3, "Check matrix properties (userCount)");
        });

        it('overflow 2', async () => {
            await instance.register(ROOT_ADDRESS, {from: accounts[2], value: 50});
            await instance.register(ROOT_ADDRESS, {from: accounts[3], value: 50});
            await instance.register(ROOT_ADDRESS, {from: accounts[4], value: 50});
    
            const rootUser = await instance.getUser(ROOT_ADDRESS);
            await assert.equal(rootUser.id, 0, "Check rootUser properties (id)");
            await assert.equal(rootUser.referrerAddress, ZERO_ADDRESS, "Check rootUser properties (referrerAddress)");
            await assert.equal(rootUser.referralsCount, 3, "Check rootUser properties (referralsCount)");
            await assert.equal(rootUser.matrixIds.length, 2, "Check rootUser properties (matrixIds)");
            await assert.equal(arraysEqual(rootUser.matrixIds, [1,5]), true, "Check rootUser properties (matrixIds)");

            const matrixByRoot1 = await instance.getMatrix(rootUser.matrixIds[0]);
            await assert.equal(matrixByRoot1.parentMatrixId, 0, "Check matrix properties (parentMatrixId)");
            await assert.equal(matrixByRoot1.userAddress, ROOT_ADDRESS, "Check matrix properties (userAddress)");
            await assert.equal(matrixByRoot1.closed, true, "Check matrix properties (closed)");
            await assert.equal(matrixByRoot1.subtreeMatrixCount, 3, "Check matrix properties (subtreeMatrixCount)");
            await assert.equal(matrixByRoot1.childMatrixIds.length, 3, "Check matrix properties (childMatrixIds)");
            await assert.equal(arraysEqual(matrixByRoot1.childMatrixIds, [2,3,4]), true, "Check matrix properties (childMatrixIds)");

            const matrixByRoot2 = await instance.getMatrix(rootUser.matrixIds[1]);
            await assert.equal(matrixByRoot2.parentMatrixId, 0, "Check matrix properties (parentMatrixId)");
            await assert.equal(matrixByRoot2.userAddress, ROOT_ADDRESS, "Check matrix properties (userAddress)");
            await assert.equal(matrixByRoot2.closed, false, "Check matrix properties (closed)");
            await assert.equal(matrixByRoot2.subtreeMatrixCount, 0, "Check matrix properties (subtreeMatrixCount)");
            await assert.equal(matrixByRoot2.childMatrixIds.length, 0, "Check matrix properties (childMatrixIds)");
            await assert.equal(arraysEqual(matrixByRoot2.childMatrixIds, []), true, "Check matrix properties (childMatrixIds)");

            await assert.equal(await instance.matrixCount(), 6, "Check matrix properties (matrixCount)");
            await assert.equal(await instance.userCount(), 4, "Check matrix properties (userCount)");
        });

        it('overflow 3', async () => {
            await instance.register(ROOT_ADDRESS, {from: accounts[2], value: 50});
            await instance.register(ROOT_ADDRESS, {from: accounts[3], value: 50});
            await instance.register(accounts[2], {from: accounts[4], value: 50});
            await instance.register(accounts[2], {from: accounts[5], value: 50});
            await instance.register(accounts[2], {from: accounts[6], value: 50});
    
            const rootUser = await instance.getUser(ROOT_ADDRESS);
            await assert.equal(rootUser.id, 0, "Check rootUser properties (id)");
            await assert.equal(rootUser.referrerAddress, ZERO_ADDRESS, "Check rootUser properties (referrerAddress)");
            await assert.equal(rootUser.referralsCount, 2, "Check rootUser properties (referralsCount)");
            await assert.equal(rootUser.matrixIds.length, 2, "Check rootUser properties (matrixIds)");
            await assert.equal(arraysEqual(rootUser.matrixIds, [1,8]), true, "Check rootUser properties (matrixIds)");

            const matrixByRoot1 = await instance.getMatrix(rootUser.matrixIds[0]);
            await assert.equal(matrixByRoot1.parentMatrixId, 0, "Check matrix properties (parentMatrixId)");
            await assert.equal(matrixByRoot1.userAddress, ROOT_ADDRESS, "Check matrix properties (userAddress)");
            await assert.equal(matrixByRoot1.closed, true, "Check matrix properties (closed)");
            await assert.equal(matrixByRoot1.subtreeMatrixCount, 3, "Check matrix properties (subtreeMatrixCount)");
            await assert.equal(matrixByRoot1.childMatrixIds.length, 3, "Check matrix properties (childMatrixIds)");
            await assert.equal(arraysEqual(matrixByRoot1.childMatrixIds, [2,3,7]), true, "Check matrix properties (childMatrixIds)");

            const matrixByRoot2 = await instance.getMatrix(rootUser.matrixIds[1]);
            await assert.equal(matrixByRoot2.parentMatrixId, 0, "Check matrix properties (parentMatrixId)");
            await assert.equal(matrixByRoot2.userAddress, ROOT_ADDRESS, "Check matrix properties (userAddress)");
            await assert.equal(matrixByRoot2.closed, false, "Check matrix properties (closed)");
            await assert.equal(matrixByRoot2.subtreeMatrixCount, 0, "Check matrix properties (subtreeMatrixCount)");
            await assert.equal(matrixByRoot2.childMatrixIds.length, 0, "Check matrix properties (childMatrixIds)");
            await assert.equal(arraysEqual(matrixByRoot2.childMatrixIds, []), true, "Check matrix properties (childMatrixIds)");

            const userAnotherRoot = await instance.getUser(accounts[2]);
            await assert.equal(userAnotherRoot.id, 1, "Check userAnotherRoot properties (id)");
            await assert.equal(userAnotherRoot.referrerAddress, ROOT_ADDRESS, "Check userAnotherRoot properties (referrerAddress)");
            await assert.equal(userAnotherRoot.referralsCount, 3, "Check userAnotherRoot properties (referralsCount)");
            await assert.equal(userAnotherRoot.matrixIds.length, 2, "Check userAnotherRoot properties (matrixIds)");
            await assert.equal(arraysEqual(userAnotherRoot.matrixIds, [2,7]), true, "Check userAnotherRoot properties (matrixIds)");

            const matrixByAnotherRoot1 = await instance.getMatrix(userAnotherRoot.matrixIds[0]);
            await assert.equal(matrixByAnotherRoot1.parentMatrixId, 1, "Check matrix properties (parentMatrixId)");
            await assert.equal(matrixByAnotherRoot1.userAddress, accounts[2], "Check matrix properties (userAddress)");
            await assert.equal(matrixByAnotherRoot1.closed, true, "Check matrix properties (closed)");
            await assert.equal(matrixByAnotherRoot1.subtreeMatrixCount, 3, "Check matrix properties (subtreeMatrixCount)");
            await assert.equal(matrixByAnotherRoot1.childMatrixIds.length, 3, "Check matrix properties (childMatrixIds)");
            await assert.equal(arraysEqual(matrixByAnotherRoot1.childMatrixIds, [4,5,6]), true, "Check matrix properties (childMatrixIds)");

            const matrixByAnotherRoot2 = await instance.getMatrix(userAnotherRoot.matrixIds[1]);
            await assert.equal(matrixByAnotherRoot2.parentMatrixId, 1, "Check matrix properties (parentMatrixId)");
            await assert.equal(matrixByAnotherRoot2.userAddress, accounts[2], "Check matrix properties (userAddress)");
            await assert.equal(matrixByAnotherRoot2.closed, false, "Check matrix properties (closed)");
            await assert.equal(matrixByAnotherRoot2.subtreeMatrixCount, 0, "Check matrix properties (subtreeMatrixCount)");
            await assert.equal(matrixByAnotherRoot2.childMatrixIds.length, 0, "Check matrix properties (childMatrixIds)");
            await assert.equal(arraysEqual(matrixByAnotherRoot2.childMatrixIds, []), true, "Check matrix properties (childMatrixIds)");

            await assert.equal(await instance.matrixCount(), 9, "Check matrix properties (matrixCount)");
            await assert.equal(await instance.userCount(), 6, "Check matrix properties (userCount)");
        });

        it('overflow 4', async () => {
            await instance.register(ROOT_ADDRESS, {from: accounts[2], value: 50});
            await instance.register(ROOT_ADDRESS, {from: accounts[3], value: 50});
            await instance.register(ROOT_ADDRESS, {from: accounts[4], value: 50});

            await instance.register(ROOT_ADDRESS, {from: accounts[5], value: 50});
            await instance.register(ROOT_ADDRESS, {from: accounts[6], value: 50});
            await instance.register(ROOT_ADDRESS, {from: accounts[7], value: 50});

            await instance.register(ROOT_ADDRESS, {from: accounts[8], value: 50});
            await instance.register(ROOT_ADDRESS, {from: accounts[9], value: 50});
    
            const rootUser = await instance.getUser(ROOT_ADDRESS);
            await assert.equal(rootUser.id, 0, "Check rootUser properties (id)");
            await assert.equal(rootUser.referrerAddress, ZERO_ADDRESS, "Check rootUser properties (referrerAddress)");
            await assert.equal(rootUser.referralsCount, 8, "Check rootUser properties (referralsCount)");
            await assert.equal(rootUser.matrixIds.length, 3, "Check rootUser properties (matrixIds)");
            await assert.equal(arraysEqual(rootUser.matrixIds, [1,5,9]), true, "Check rootUser properties (matrixIds)");

            const matrixByRoot1 = await instance.getMatrix(rootUser.matrixIds[0]);
            await assert.equal(matrixByRoot1.parentMatrixId, 0, "Check matrix properties (parentMatrixId)");
            await assert.equal(matrixByRoot1.userAddress, ROOT_ADDRESS, "Check matrix properties (userAddress)");
            await assert.equal(matrixByRoot1.closed, true, "Check matrix properties (closed)");
            await assert.equal(matrixByRoot1.subtreeMatrixCount, 3, "Check matrix properties (subtreeMatrixCount)");
            await assert.equal(matrixByRoot1.childMatrixIds.length, 3, "Check matrix properties (childMatrixIds)");
            await assert.equal(arraysEqual(matrixByRoot1.childMatrixIds, [2,3,4]), true, "Check matrix properties (childMatrixIds)");

            const matrixByRoot2 = await instance.getMatrix(rootUser.matrixIds[1]);
            await assert.equal(matrixByRoot2.parentMatrixId, 0, "Check matrix properties (parentMatrixId)");
            await assert.equal(matrixByRoot2.userAddress, ROOT_ADDRESS, "Check matrix properties (userAddress)");
            await assert.equal(matrixByRoot2.closed, true, "Check matrix properties (closed)");
            await assert.equal(matrixByRoot2.subtreeMatrixCount, 3, "Check matrix properties (subtreeMatrixCount)");
            await assert.equal(matrixByRoot2.childMatrixIds.length, 3, "Check matrix properties (childMatrixIds)");
            await assert.equal(arraysEqual(matrixByRoot2.childMatrixIds, [6,7,8]), true, "Check matrix properties (childMatrixIds)");

            const matrixByRoot3 = await instance.getMatrix(rootUser.matrixIds[2]);
            await assert.equal(matrixByRoot3.parentMatrixId, 0, "Check matrix properties (parentMatrixId)");
            await assert.equal(matrixByRoot3.userAddress, ROOT_ADDRESS, "Check matrix properties (userAddress)");
            await assert.equal(matrixByRoot3.closed, false, "Check matrix properties (closed)");
            await assert.equal(matrixByRoot3.subtreeMatrixCount, 2, "Check matrix properties (subtreeMatrixCount)");
            await assert.equal(matrixByRoot3.childMatrixIds.length, 2, "Check matrix properties (childMatrixIds)");
            await assert.equal(arraysEqual(matrixByRoot3.childMatrixIds, [10,11]), true, "Check matrix properties (childMatrixIds)");
        
        });

        // TODO overflow 5

    });
})