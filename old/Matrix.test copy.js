const { BN, constants, expectRevert } = require("@openzeppelin/test-helpers");

const MatrixOne = artifacts.require('MatrixOne');
const MatrixTwo = artifacts.require('MatrixTwo');
const MatrixThree = artifacts.require('MatrixThree');
const MatrixFour = artifacts.require('MatrixFour');

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

contract('MatrixOne', (accounts) => {
    describe('positive', function () {
        it('RaffleSystem positive constructor', async () => {
            const testInstance = await RaffleSystem.new(thresholds);

            const instanceFields = await testInstance.raffles(0);
            await assert.equal(instanceFields.isOpen, true, "Check raffle fields");
            await assert.equal(instanceFields.currentIteration, 0, "Check raffle fields");
            await assert.equal((await testInstance.getAllPlayers(0, 0)).length, 0, "Check raffle fields");

            await assert.equal((await testInstance.rafflesThresholds(0)), thresholds[0], "Check raffle fields");
            await assert.equal((await testInstance.rafflesThresholds(1)), thresholds[1], "Check raffle fields");
            await assert.equal((await testInstance.rafflesThresholds(2)), thresholds[2], "Check raffle fields");
            await assert.equal((await testInstance.rafflesThresholds(3)), thresholds[3], "Check raffle fields");
        });

        it('RaffleSystem positive enterPlayer', async () => {
            const testInstance = await RaffleSystem.new(thresholds);
        
            await testInstance.enterPlayer(accounts[0], 200000, buyTime);
            await testInstance.enterPlayer(accounts[1], 400000, buyTime);
            await testInstance.enterPlayer(accounts[2], 600000, buyTime);
            
            let players = await [accounts[0], accounts[1], accounts[1], accounts[2], accounts[2], accounts[2]];
            let pool_players = await testInstance.getAllPlayers(0, 0);

            // check storage
            await assert.equal(
                players.length,
                pool_players.length,
                'check tickets count'
            );
            const forLoop = async _ => { 
                // console.log('Start')
                for (let i = 0; i < players.length; i++) {
                    await assert.equal(
                        players[i],
                        pool_players[i],
                        'check created tickets'
                    )
                }
                // console.log('End')
            }
                
            // check events of last players
            
            // first player
            const event1 = (await testInstance.getPastEvents('PlayerEntered', {fromBlock: 0}))[0]
            await assert.equal(
                '0',
                event1.returnValues['raffleId'],
                'The event should display correctly'
            );
            await assert.equal(
                '0',
                event1.returnValues['raffleIteration'],
                'The event should display correctly'
            );
            await assert.equal(
                accounts[0],
                event1.returnValues['enteringPlayer'],
                'The event should display correctly'
            );
            await assert.equal(
                '0',
                event1.returnValues['oldAmount'],
                'The event should display correctly'
            );
            await assert.equal(
                '200000',
                event1.returnValues['addedAmount'],
                'The event should display correctly'
            );
            await assert.equal(
                '1',
                event1.returnValues['newTicketCount'],
                'The event should display correctly'
            );
            await assert.equal(
                buyTime,
                event1.returnValues['buyTime'],
                'The event should display correctly'
            );

            // second player
            const event2 = (await testInstance.getPastEvents('PlayerEntered', {fromBlock: 0}))[1]
            await assert.equal(
                '0',
                event2.returnValues['raffleId'],
                'The event should display correctly'
            );
            await assert.equal(
                '0',
                event2.returnValues['raffleIteration'],
                'The event should display correctly'
            );
            await assert.equal(
                accounts[1],
                event2.returnValues['enteringPlayer'],
                'The event should display correctly'
            );
            await assert.equal(
                '0',
                event2.returnValues['oldAmount'],
                'The event should display correctly'
            );
            await assert.equal(
                '400000',
                event2.returnValues['addedAmount'],
                'The event should display correctly'
            );
            await assert.equal(
                '2',
                event2.returnValues['newTicketCount'],
                'The event should display correctly'
            );
            await assert.equal(
                buyTime,
                event2.returnValues['buyTime'],
                'The event should display correctly'
            );


            // third player
            const event3 = (await testInstance.getPastEvents('PlayerEntered', {fromBlock: 0}))[2];
            await assert.equal(
                '0',
                event3.returnValues['raffleId'],
                'The event should display correctly'
            );
            await assert.equal(
                '0',
                event3.returnValues['raffleIteration'],
                'The event should display correctly'
            );
            await assert.equal(
                accounts[2],
                event3.returnValues['enteringPlayer'],
                'The event should display correctly'
            );
            await assert.equal(
                '0',
                event3.returnValues['oldAmount'],
                'The event should display correctly'
            );
            await assert.equal(
                '600000',
                event3.returnValues['addedAmount'],
                'The event should display correctly'
            );
            await assert.equal(
                '3',
                event3.returnValues['newTicketCount'],
                'The event should display correctly'
            );
            await assert.equal(
                buyTime,
                event3.returnValues['buyTime'],
                'The event should display correctly'
            );
        });

        it('RaffleSystem positive pickWinner', async () => {
            const testInstance = await RaffleSystem.new(thresholds);
        
            await testInstance.enterPlayer(accounts[2], 600000, buyTime);
            
            const block_data = await web3.eth.getBlock(await web3.eth.getBlockNumber());

            await testInstance.pickWinner(0);

            await assert.equal((await testInstance.raffles(0)).isOpen, true, "Check raffle fields after pickWinner(...)");
            await assert.equal((await testInstance.raffles(0)).currentIteration, 1, "Check raffle fields pickWinner(...)");

            // check storage values reset (length 0 -> 3)
            let pool_players = await testInstance.getAllPlayers(0, 0);
            await assert.equal(
                3,
                pool_players.length,
                'The storage should be correctly'
            );
            pool_players = await testInstance.getAllPlayers(0, 1);
            await assert.equal(
                0,
                pool_players.length,
                'The storage should be correctly'
            );
            
            // check events
            const event_params = (await testInstance.getPastEvents('WinnerAnnouncement', {fromBlock: 0}))[0].returnValues;
            await assert.equal(
                '0',
                event_params['raffleId'],
                'The event should display correctly'
            );
            await assert.equal(
                '0',
                event_params['raffleIteration'],
                'The event should display correctly'
            );
            await assert.equal(
                '3',
                event_params['playerArrayLength'],
                'The event should display correctly'
            );
            await assert.equal(
                accounts[2],
                event_params['winner'],
                'The event should display correctly'
            );
        });

        it('RaffleSystem positive closeRaffle', async () => {
            const testInstance = await RaffleSystem.new(thresholds);
        
            // test before closing
            await testInstance.enterPlayer(accounts[2], 600000, buyTime);
            let addedAmount = await testInstance.getSpecificAmount(0, 0, accounts[2])
            await assert.equal(addedAmount, '600000', "Check raffle fields before closeRaffle(...)");
            
            // close a some raffle
            await testInstance.closeRaffle(0);

            // test after closing
            await testInstance.enterPlayer(accounts[2], 100000, buyTime);
            addedAmount = await testInstance.getSpecificAmount(0, 0, accounts[2]);
            await assert.equal(addedAmount, '600000', "Check raffle fields after closeRaffle(...)");
        });

        it('RaffleSystem positive openRaffle', async () => {
            const testInstance = await RaffleSystem.new(thresholds);
        
            // close a some raffle
            await testInstance.closeRaffle(0);

            // test after closing
            await testInstance.enterPlayer(accounts[2], 100000, buyTime);
            let addedAmount = await testInstance.getSpecificAmount(0, 0, accounts[2]);
            await assert.equal(addedAmount, '0', "Check raffle fields after closeRaffle(...), before openRaffle(...)");

            // open a raffle
            await testInstance.openRaffle(0);

            // test after opening
            await testInstance.enterPlayer(accounts[2], 600000, buyTime);
            addedAmount = await testInstance.getSpecificAmount(0, 0, accounts[2]);
            await assert.equal(addedAmount, '600000', "Check raffle fields after openRaffle(...)");
        });

        it('RaffleSystem positive getRaffleStatuses', async () => {
            const testInstance = await RaffleSystem.new(thresholds);
        
            // close raffles
            await testInstance.closeRaffle(0);
            await testInstance.closeRaffle(1);
            await testInstance.closeRaffle(2);
            await testInstance.closeRaffle(3);

            // test after closing
            const raffleStatuses1 = await testInstance.getRaffleStatuses();
            await assert.equal(raffleStatuses1[0], false, "Check statuses after closing");
            await assert.equal(raffleStatuses1[1], false, "Check statuses after closing");
            await assert.equal(raffleStatuses1[2], false, "Check statuses after closing");
            await assert.equal(raffleStatuses1[3], false, "Check statuses after closing");

            // open few raffles
            await testInstance.openRaffle(0);
            await testInstance.openRaffle(2);

            // test after opening
            const raffleStatuses2 = await testInstance.getRaffleStatuses();
            await assert.equal(raffleStatuses2[0], true, "Check statuses after closing");
            await assert.equal(raffleStatuses2[1], false, "Check statuses after closing");
            await assert.equal(raffleStatuses2[2], true, "Check statuses after closing");
            await assert.equal(raffleStatuses2[3], false, "Check statuses after closing");
        });

        it('RaffleSystem positive getSpecificAmount', async () => {
            const testInstance = await RaffleSystem.new(thresholds);
            
            // enter money
            await testInstance.enterPlayer(accounts[1], 100000, buyTime);
            await testInstance.enterPlayer(accounts[2], 200000, buyTime);
            await testInstance.enterPlayer(accounts[3], 300000, buyTime);
            await testInstance.enterPlayer(accounts[4], 400000, buyTime);

            // test added money
            await assert.equal(await testInstance.getSpecificAmount(0, 0, accounts[0]), '0', "Check added money");
            await assert.equal(await testInstance.getSpecificAmount(0, 0, accounts[1]), '100000', "Check added money");
            await assert.equal(await testInstance.getSpecificAmount(0, 0, accounts[2]), '200000', "Check added money");
            await assert.equal(await testInstance.getSpecificAmount(0, 0, accounts[3]), '300000', "Check added money");
            await assert.equal(await testInstance.getSpecificAmount(0, 0, accounts[4]), '400000', "Check added money");

            // pickWinner and add new money
            await testInstance.pickWinner(0);
            await testInstance.enterPlayer(accounts[1], 400000, buyTime);
            await testInstance.enterPlayer(accounts[2], 300000, buyTime);
            await testInstance.enterPlayer(accounts[3], 200000, buyTime);
            await testInstance.enterPlayer(accounts[4], 100000, buyTime);

            await assert.equal(await testInstance.getSpecificAmount(0, 0, accounts[0]), '0', "Check added money");
            await assert.equal(await testInstance.getSpecificAmount(0, 0, accounts[1]), '100000', "Check added money");
            await assert.equal(await testInstance.getSpecificAmount(0, 0, accounts[2]), '200000', "Check added money");
            await assert.equal(await testInstance.getSpecificAmount(0, 0, accounts[3]), '300000', "Check added money");
            await assert.equal(await testInstance.getSpecificAmount(0, 0, accounts[4]), '400000', "Check added money");

            await assert.equal(await testInstance.getSpecificAmount(0, 1, accounts[0]), '0', "Check added money after pickWinner");
            await assert.equal(await testInstance.getSpecificAmount(0, 1, accounts[1]), '400000', "Check added money after pickWinner");
            await assert.equal(await testInstance.getSpecificAmount(0, 1, accounts[2]), '300000', "Check added money after pickWinner");
            await assert.equal(await testInstance.getSpecificAmount(0, 1, accounts[3]), '200000', "Check added money after pickWinner");
            await assert.equal(await testInstance.getSpecificAmount(0, 1, accounts[4]), '100000', "Check added money after pickWinner");

            await assert.equal(await testInstance.getSpecificAmount(1, 0, accounts[0]), '0', "Check money in not picked raffles");
            await assert.equal(await testInstance.getSpecificAmount(1, 0, accounts[1]), '500000', "Check money in not picked raffles");
            await assert.equal(await testInstance.getSpecificAmount(1, 0, accounts[2]), '500000', "Check money in not picked raffles");
            await assert.equal(await testInstance.getSpecificAmount(1, 0, accounts[3]), '500000', "Check money in not picked raffles");
            await assert.equal(await testInstance.getSpecificAmount(1, 0, accounts[4]), '500000', "Check money in not picked raffles");
        });
    });
    describe('negative', function () {
        it('RaffleSystem negative enterPlayer', async () => {
            const testInstance = await RaffleSystem.new(thresholds);
        
            await expectRevert(
                testInstance.enterPlayer(accounts[2], 600000, buyTime, {from: accounts[1]}),
                "Ownable: caller is not the owner"
            );
            await expectRevert(
                testInstance.enterPlayer(ZERO_ADDRESS, 600000, buyTime),
                "Player address must be non-zero"
            );
            await expectRevert(
                testInstance.enterPlayer(accounts[1], 0, buyTime),
                "The amount must be > 0"
            );
        });

        it('RaffleSystem negative pickWinner', async () => {
            const testInstance = await RaffleSystem.new(thresholds);
        
            await expectRevert(
                testInstance.pickWinner(0, {from: accounts[1]}),
                "Ownable: caller is not the owner"
            );
            await expectRevert(
                testInstance.pickWinner(5),
                "Raffle not found, invalid id"
            );
            await expectRevert(
                testInstance.pickWinner(0),
                "Players must be greater than 0"
            );
        });

        it('RaffleSystem negative closeRaffle', async () => {
            const testInstance = await RaffleSystem.new(thresholds);
        
            await expectRevert(
                testInstance.closeRaffle(0, {from: accounts[1]}),
                "Ownable: caller is not the owner"
            );
            await expectRevert(
                testInstance.closeRaffle(5),
                "Raffle not found, invalid id"
            );

            await testInstance.closeRaffle(0);
            await expectRevert(
                testInstance.closeRaffle(0),
                "Raffle must be opened"
            );
        });

        it('RaffleSystem negative openRaffle', async () => {
            const testInstance = await RaffleSystem.new(thresholds);
        
            await expectRevert(
                testInstance.openRaffle(0, {from: accounts[1]}),
                "Ownable: caller is not the owner"
            );
            await expectRevert(
                testInstance.openRaffle(5),
                "Raffle not found, invalid id"
            );
            await expectRevert(
                testInstance.openRaffle(0),
                "Raffle must be closed"
            );
        });

        it('RaffleSystem negative getSpecificAmount', async () => {
            const testInstance = await RaffleSystem.new(thresholds);
        
            await expectRevert(
                testInstance.getSpecificAmount(5, 0, accounts[0]),
                "Raffle not found, invalid id"
            );
            await expectRevert(
                testInstance.getSpecificAmount(0, 1, accounts[0]),
                "Iteration not found"
            );
        });

        it('RaffleSystem negative getAllPlayers', async () => {
            const testInstance = await RaffleSystem.new(thresholds);
        
            await expectRevert(
                testInstance.getAllPlayers(5, 0),
                "Raffle not found, invalid id"
            );
            await expectRevert(
                testInstance.getAllPlayers(0, 1),
                "Iteration not found"
            );
        });
    });
})