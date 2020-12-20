const { BN, constants, expectRevert } = require("@openzeppelin/test-helpers");

const Partner = artifacts.require('Partner');

contract('Partner', (accounts) => {

  // addPartner

  it('Partner positive addPartner #1', async () => {
    const testInstance = await Partner.new();

    await testInstance.addPartner(accounts[0], constants.ZERO_ADDRESS); 
    
    // Check fields
    await assert.equal((await testInstance.partners(accounts[0]))[0], true, "Check PartnerStruct.isCreated");
    await assert.equal((await testInstance.partners(accounts[0]))[1], 1, "Check PartnerStruct.status");
    await assert.equal((await testInstance.partners(accounts[0]))[2], constants.ZERO_ADDRESS, "Check PartnerStruct.parent");
    await assert.equal((await testInstance.partners(accounts[0]))[3], 0, "Check PartnerStruct.childrenCount");
    await assert.equal((await testInstance.partners(accounts[0]))[4], '', "Check PartnerStruct.tsc");

    // Check events
    await assert.equal(
      await accounts[0],
      (await testInstance.getPastEvents('PartnerAdded', {fromBlock: 0}))[0].returnValues['0'],
      'The event should display correctly.'
    );

    await assert.equal(
      await constants.ZERO_ADDRESS,
      (await testInstance.getPastEvents('PartnerAdded', {fromBlock: 0}))[0].returnValues['1'],
      'The event should display correctly.'
    );
      
  });

  it('Partner positive addPartner #2', async () => {
    const testInstance = await Partner.new();

    await testInstance.addPartner(accounts[0], constants.ZERO_ADDRESS); 
    await testInstance.addPartner(accounts[1], accounts[0]); 
    
    // Check fields
    await assert.equal((await testInstance.partners(accounts[0]))[0], true, "Check PartnerStruct.isCreated");
    await assert.equal((await testInstance.partners(accounts[0]))[1], 1, "Check PartnerStruct.status");
    await assert.equal((await testInstance.partners(accounts[0]))[2], constants.ZERO_ADDRESS, "Check PartnerStruct.parent");
    await assert.equal((await testInstance.partners(accounts[0]))[3], 1, "Check PartnerStruct.childrenCount");
    await assert.equal((await testInstance.partners(accounts[0]))[4], '', "Check PartnerStruct.tsc");

    await assert.equal((await testInstance.partners(accounts[1]))[0], true, "Check PartnerStruct.isCreated");
    await assert.equal((await testInstance.partners(accounts[1]))[1], 1, "Check PartnerStruct.status");
    await assert.equal((await testInstance.partners(accounts[1]))[2], accounts[0], "Check PartnerStruct.parent");
    await assert.equal((await testInstance.partners(accounts[1]))[3], 0, "Check PartnerStruct.childrenCount");
    await assert.equal((await testInstance.partners(accounts[1]))[4], '', "Check PartnerStruct.tsc");
  
    // Check events
    await assert.equal(
      await accounts[0],
      (await testInstance.getPastEvents('PartnerAdded', {fromBlock: 0}))[0].returnValues['0'],
      'The event should display correctly'
    );

    await assert.equal(
      await constants.ZERO_ADDRESS,
      (await testInstance.getPastEvents('PartnerAdded', {fromBlock: 0}))[0].returnValues['1'],
      'The event should display correctly'
    );

    await assert.equal(
      await accounts[1],
      (await testInstance.getPastEvents('PartnerAdded', {fromBlock: 0}))[1].returnValues['0'],
      'The event should display correctly'
    );

    await assert.equal(
      await accounts[0],
      (await testInstance.getPastEvents('PartnerAdded', {fromBlock: 0}))[1].returnValues['1'],
      'The event should display correctly'
    );
  });

  it('Partner negative addPartner', async () => {
    const testInstance = await Partner.new();

    await testInstance.addPartner(accounts[0], constants.ZERO_ADDRESS); 

    await expectRevert(
      testInstance.addPartner(accounts[1], constants.ZERO_ADDRESS, {from: accounts[2]}),
      "Ownable: caller is not the owner."
    );

    await expectRevert(
      testInstance.addPartner(constants.ZERO_ADDRESS, accounts[1]),
      "Partner: partner address cannot be a zero address."
    );

    await expectRevert(
      testInstance.addPartner(accounts[1], accounts[1]),
      "Partner: partner can't be a parent of oneself."
    );
    
    await expectRevert(
      testInstance.addPartner(accounts[0], constants.ZERO_ADDRESS),
      "Partner: partner already created."
    );

    await expectRevert(
      testInstance.addPartner(accounts[1], accounts[2]),
      "Partner: parent of the new partner must be created."
    );

    testInstance.deactivatePartner(accounts[0]);
    await expectRevert(
      testInstance.addPartner(accounts[1], accounts[0]),
      "Partner: parent of new partner must not be deactivated."
    );
  });

  // deactivatePartner
  
  it('Partner positive deactivatePartner #1', async () => {
    const testInstance = await Partner.new();

    await testInstance.addPartner(accounts[0], constants.ZERO_ADDRESS);

    await assert.equal((await testInstance.partners(accounts[0]))[0], true, "Check PartnerStruct.isCreated");
    await assert.equal((await testInstance.partners(accounts[0]))[1], 1, "Check PartnerStruct.status");

    await testInstance.deactivatePartner(accounts[0]); 

    await assert.equal((await testInstance.partners(accounts[0]))[0], true, "Check PartnerStruct.isCreated");
    await assert.equal((await testInstance.partners(accounts[0]))[1], 4, "Check PartnerStruct.status");

    await assert.equal(
      await accounts[0],
      (await testInstance.getPastEvents('PartnerDeactivated', {fromBlock: 0}))[0].returnValues[0],
      'The event should display correctly'
    );
  });

  it('Partner positive deactivatePartner #2', async () => {
    const testInstance = await Partner.new();

    await testInstance.addPartner(accounts[0], constants.ZERO_ADDRESS);
    await testInstance.addPartner(accounts[1], accounts[0]);
    await testInstance.addPartner(accounts[2], accounts[1]);

    await assert.equal((await testInstance.partners(accounts[0]))[0], true, "Check PartnerStruct.isCreated");
    await assert.equal((await testInstance.partners(accounts[1]))[0], true, "Check PartnerStruct.isCreated");
    await assert.equal((await testInstance.partners(accounts[2]))[0], true, "Check PartnerStruct.isCreated");
    await assert.equal((await testInstance.partners(accounts[0]))[1], 1, "Check PartnerStruct.status");
    await assert.equal((await testInstance.partners(accounts[1]))[1], 1, "Check PartnerStruct.status");
    await assert.equal((await testInstance.partners(accounts[2]))[1], 1, "Check PartnerStruct.status");

    await testInstance.deactivatePartner(accounts[1]);

    await assert.equal((await testInstance.partners(accounts[0]))[0], true, "Check PartnerStruct.isCreated");
    await assert.equal((await testInstance.partners(accounts[1]))[0], true, "Check PartnerStruct.isCreated");
    await assert.equal((await testInstance.partners(accounts[2]))[0], true, "Check PartnerStruct.isCreated");
    await assert.equal((await testInstance.partners(accounts[0]))[1], 1, "Check PartnerStruct.status");
    await assert.equal((await testInstance.partners(accounts[1]))[1], 4, "Check PartnerStruct.status");
    await assert.equal((await testInstance.partners(accounts[2]))[1], 1, "Check PartnerStruct.status");

    await assert.equal(
      await accounts[1],
      (await testInstance.getPastEvents('PartnerDeactivated', {fromBlock: 0}))[0].returnValues[0],
      'The event should display correctly'
    );
  });

  it('Partner negative deactivatePartner', async () => {
    const testInstance = await Partner.new();

    await testInstance.addPartner(accounts[0], constants.ZERO_ADDRESS); 

    await expectRevert(
      testInstance.deactivatePartner(accounts[1], {from: accounts[2]}),
      "Ownable: caller is not the owner."
    );

    await expectRevert(
      testInstance.deactivatePartner(constants.ZERO_ADDRESS),
      "Partner: partner address cannot be a zero address."
    );

    await expectRevert(
      testInstance.deactivatePartner(accounts[1]),
      "Partner: partner must be created."
    );

    testInstance.deactivatePartner(accounts[0]);
    await expectRevert(
      testInstance.deactivatePartner(accounts[0]),
      "Partner: partner must not be deactivated."
    );
  });

  // changePartnerStatus
  
  it('Partner positive changePartnerStatus #1', async () => {
    const testInstance = await Partner.new();

    await testInstance.addPartner(accounts[0], constants.ZERO_ADDRESS);

    await assert.equal((await testInstance.partners(accounts[0]))[1], 1, "Check PartnerStruct.status");

    await testInstance.changePartnerStatus(accounts[0], 1);
    await assert.equal((await testInstance.partners(accounts[0]))[1], 1, "Check PartnerStruct.status");
    await assert.equal(
      await accounts[0],
      (await testInstance.getPastEvents('PartnerStatusChanged', {fromBlock: 0}))[0].returnValues[0],
      'The event should display correctly'
    );
    await assert.equal(
      1,
      (await testInstance.getPastEvents('PartnerStatusChanged', {fromBlock: 0}))[0].returnValues[1],
      'The event should display correctly'
    );
    await assert.equal(
      1,
      (await testInstance.getPastEvents('PartnerStatusChanged', {fromBlock: 0}))[0].returnValues[2],
      'The event should display correctly'
    );

    await testInstance.changePartnerStatus(accounts[0], 2);
    await assert.equal((await testInstance.partners(accounts[0]))[1], 2, "Check PartnerStruct.status");
    await assert.equal(
      await accounts[0],
      (await testInstance.getPastEvents('PartnerStatusChanged', {fromBlock: 0}))[1].returnValues[0],
      'The event should display correctly'
    );
    await assert.equal(
      1,
      (await testInstance.getPastEvents('PartnerStatusChanged', {fromBlock: 0}))[1].returnValues[1],
      'The event should display correctly'
    );
    await assert.equal(
      2,
      (await testInstance.getPastEvents('PartnerStatusChanged', {fromBlock: 0}))[1].returnValues[2],
      'The event should display correctly'
    );

  });

  it('Partner negative changePartnerStatus', async () => {
    const testInstance = await Partner.new();

    await testInstance.addPartner(accounts[0], constants.ZERO_ADDRESS);

    await expectRevert(
      testInstance.changePartnerStatus(accounts[1], 2, {from: accounts[2]}),
      "Ownable: caller is not the owner."
    );

    await expectRevert(
      testInstance.changePartnerStatus(constants.ZERO_ADDRESS, 1),
      "Partner: partner address cannot be a zero address."
    );

    await expectRevert(
      testInstance.changePartnerStatus(accounts[1], 1),
      "Partner: partner must be created."
    );

    testInstance.deactivatePartner(accounts[0]);
    testInstance.changePartnerStatus(accounts[0], 0);
    
    await expectRevert(
      testInstance.changePartnerStatus(accounts[0], 4),
      "Partner: status cannot be 'Deactivated'"
    );

    await expectRevert(
      testInstance.changePartnerStatus(accounts[0], 5),
      "Partner: invalid status"
    );
  });

  // getPartner

  it('Partner getPartner', async () => {
    const testInstance = await Partner.new();

    await testInstance.addPartner(accounts[0], constants.ZERO_ADDRESS);
    await assert.equal((await testInstance.getPartner(accounts[0]))[0], true, "Check PartnerStruct.isCreated");
    await assert.equal((await testInstance.getPartner(accounts[0]))[1], 1, "Check PartnerStruct.status");
    await assert.equal((await testInstance.getPartner(accounts[0]))[2], constants.ZERO_ADDRESS, "Check PartnerStruct.parent");
    await assert.equal((await testInstance.getPartner(accounts[0]))[3], 0, "Check PartnerStruct.childrenCount");
    await assert.equal((await testInstance.getPartner(accounts[0]))[4], '', "Check PartnerStruct.tsc");

    await testInstance.changePartnerStatus(accounts[0], 1);
    await assert.equal((await testInstance.getPartner(accounts[0]))[1], 1, "Check PartnerStruct.status");

    await testInstance.deactivatePartner(accounts[0]);
    await assert.equal((await testInstance.getPartner(accounts[0]))[1], 4, "Check PartnerStruct.status");

    await testInstance.changePartnerStatus(accounts[0], 2);
    await assert.equal((await testInstance.getPartner(accounts[0]))[1], 2, "Check PartnerStruct.status");

    await testInstance.addPartner(accounts[1], accounts[0]);
    await assert.equal((await testInstance.getPartner(accounts[1]))[0], true, "Check PartnerStruct.isCreated");
    await assert.equal((await testInstance.getPartner(accounts[1]))[1], 1, "Check PartnerStruct.status");
    await assert.equal((await testInstance.getPartner(accounts[1]))[2], accounts[0], "Check PartnerStruct.parent");
    await assert.equal((await testInstance.getPartner(accounts[1]))[3], 0, "Check PartnerStruct.childrenCount");
    await assert.equal((await testInstance.getPartner(accounts[1]))[4], '', "Check PartnerStruct.tsc");

    await assert.equal((await testInstance.getPartner(accounts[0]))[3], 1, "Check PartnerStruct.childrenCount");

  });

  // getChild

  it('Partner getChild', async () => {
    const testInstance = await Partner.new();

    await testInstance.addPartner(accounts[0], constants.ZERO_ADDRESS);
    await testInstance.addPartner(accounts[1], accounts[0]);
    await testInstance.addPartner(accounts[2], accounts[0]);
    await testInstance.addPartner(accounts[3], accounts[0]);
    await testInstance.addPartner(accounts[4], accounts[0]);
    await testInstance.addPartner(accounts[5], accounts[0]);
  
    await assert.equal((await testInstance.getChild(accounts[0], 0)), accounts[1], "Check child");
    await assert.equal((await testInstance.getChild(accounts[0], 1)), accounts[2], "Check child");
    await assert.equal((await testInstance.getChild(accounts[0], 2)), accounts[3], "Check child");
    await assert.equal((await testInstance.getChild(accounts[0], 3)), accounts[4], "Check child");
    await assert.equal((await testInstance.getChild(accounts[0], 4)), accounts[5], "Check child");

  });

  // getParentList

  it('Partner getParentList', async () => {

    const testInstance1 = await Partner.new();
    await testInstance1.addPartner(accounts[0], constants.ZERO_ADDRESS);
    await testInstance1.addPartner(accounts[1], accounts[0]);
    await testInstance1.addPartner(accounts[2], accounts[1]);
    await testInstance1.addPartner(accounts[3], accounts[2]);
    await testInstance1.addPartner(accounts[4], accounts[3]);
    await assert.deepEqual(
      [accounts[2], accounts[1], accounts[0]],
      await testInstance1.getParentList(accounts[3]),
      "Check getParentList()"
    )

    const testInstance2 = await Partner.new();

    await testInstance2.addPartner("0xFB4f1CEea1c537D9a7571D2022215F7AB021E815", constants.ZERO_ADDRESS);
    await testInstance2.addPartner("0xB12646688C6F7A7967a78fE2F9A9d3e45E7F1324", "0xFB4f1CEea1c537D9a7571D2022215F7AB021E815");
    await testInstance2.addPartner("0x55099D29Cf1726E31a7802151469BB4dCA427c7d", "0xB12646688C6F7A7967a78fE2F9A9d3e45E7F1324");
    await testInstance2.addPartner("0x66c9Add198e8c5c5c09814065AA8A9cAe06ab1D6", "0x55099D29Cf1726E31a7802151469BB4dCA427c7d");
    await testInstance2.addPartner("0x2ba2Bb7a8041F7153C0f4BcdE6a827efd359d4Fa", "0x66c9Add198e8c5c5c09814065AA8A9cAe06ab1D6");
    await testInstance2.addPartner("0x2909CeaC5AeD783e2Ec113e618e675975888609b", "0x2ba2Bb7a8041F7153C0f4BcdE6a827efd359d4Fa");
    await testInstance2.addPartner("0x497818633bf0E22760081075Ca27BcB20760dE58", "0x2909CeaC5AeD783e2Ec113e618e675975888609b");
    await testInstance2.addPartner("0x2dDCdd6Eeb7524F8e6933d19A79b7Ed5Db059511", "0x497818633bf0E22760081075Ca27BcB20760dE58");
    await testInstance2.addPartner("0xF9227F5ef518d0637da2de1D04De2FDFC8291842", "0x2dDCdd6Eeb7524F8e6933d19A79b7Ed5Db059511");
    await testInstance2.addPartner("0x63BB44bbdE5DE1C3440bD1F06fF81ef41A40Fb18", "0xF9227F5ef518d0637da2de1D04De2FDFC8291842");
    await testInstance2.addPartner("0x5756726aD6578e6E26CCAe29680C7ae5939B9636", "0x63BB44bbdE5DE1C3440bD1F06fF81ef41A40Fb18");
    await testInstance2.addPartner("0x3B320DaC39E9c24333E0A0D72E66f42d4E2f78f3", "0x5756726aD6578e6E26CCAe29680C7ae5939B9636");
    await testInstance2.addPartner("0x044f50f031602Bb518a9267BCc9a7f6736247d0c", "0x3B320DaC39E9c24333E0A0D72E66f42d4E2f78f3");
    await assert.deepEqual([
      '0x3B320DaC39E9c24333E0A0D72E66f42d4E2f78f3',
      '0x5756726aD6578e6E26CCAe29680C7ae5939B9636',
      '0x63BB44bbdE5DE1C3440bD1F06fF81ef41A40Fb18',
      '0xF9227F5ef518d0637da2de1D04De2FDFC8291842',
      '0x2dDCdd6Eeb7524F8e6933d19A79b7Ed5Db059511',
      '0x497818633bf0E22760081075Ca27BcB20760dE58',
      '0x2909CeaC5AeD783e2Ec113e618e675975888609b',
      '0x2ba2Bb7a8041F7153C0f4BcdE6a827efd359d4Fa',
      '0x66c9Add198e8c5c5c09814065AA8A9cAe06ab1D6',
      '0x55099D29Cf1726E31a7802151469BB4dCA427c7d',
      '0xB12646688C6F7A7967a78fE2F9A9d3e45E7F1324'
    ],
    await testInstance2.getParentList("0x044f50f031602Bb518a9267BCc9a7f6736247d0c"),
    "Check getParentList()");

    const testInstance3 = await Partner.new();
    await testInstance3.addPartner(accounts[0], constants.ZERO_ADDRESS);
    await testInstance3.addPartner(accounts[1], accounts[0]);
    await testInstance3.addPartner(accounts[2], accounts[1]);
    await testInstance3.addPartner(accounts[3], accounts[2]);
    await testInstance3.addPartner(accounts[4], accounts[3]);
    await testInstance3.deactivatePartner(accounts[3]);
    await assert.deepEqual(
      [accounts[3], accounts[2], accounts[1], accounts[0]],
      await testInstance3.getParentList(accounts[4]),
      "Check getParentList()"
    )
  });

  // getChildList
  it('Partner getChildList', async () => {

    const testInstance1 = await Partner.new();
    await testInstance1.addPartner(accounts[0], constants.ZERO_ADDRESS);
    await testInstance1.addPartner(accounts[1], accounts[0]);
    await testInstance1.addPartner(accounts[2], accounts[1]);
    await testInstance1.addPartner(accounts[3], accounts[2]);
    await testInstance1.addPartner(accounts[4], accounts[3]);
    await assert.deepEqual(
      [accounts[3]],
      await testInstance1.getChildList(accounts[2]),
      "Check getChildList()"
    )

    const testInstance2 = await Partner.new();
    await testInstance2.addPartner(accounts[0], constants.ZERO_ADDRESS);
    await testInstance2.addPartner(accounts[1], accounts[0]);
    await testInstance2.addPartner(accounts[2], accounts[1]);
    await testInstance2.addPartner(accounts[3], accounts[1]);
    await testInstance2.addPartner(accounts[4], accounts[1]);
    await testInstance2.addPartner(accounts[5], accounts[1]);
    await testInstance2.addPartner(accounts[6], accounts[1]);
    await assert.deepEqual(
      [accounts[2],accounts[3],accounts[4],accounts[5],accounts[6]],
      await testInstance2.getChildList(accounts[1]),
      "Check getChildList()"
    )


    const testInstance3 = await Partner.new();
    await testInstance3.addPartner(accounts[0], constants.ZERO_ADDRESS);
    await testInstance3.addPartner(accounts[1], accounts[0]);
    await testInstance3.addPartner(accounts[2], accounts[1]);
    await testInstance3.addPartner(accounts[3], accounts[1]);
    await testInstance3.deactivatePartner(accounts[2]);
    await assert.deepEqual(
      [accounts[2],accounts[3]],
      await testInstance3.getChildList(accounts[1]),
      "Check getChildList()"
    )
  })  
})
