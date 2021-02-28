const { constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

const { expect } = require('chai');

const MatrixOne = artifacts.require('MatrixOne');
const ZERO_ADDRESS = "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb";

contract('MatrixPoolOracle', function (accounts) {
  
  const [owner, other1, other2] = accounts;

  beforeEach(async function () {
    this.ownable = await MatrixOne.deployed();
  });

  it('has an pool oracle', async function () {
    expect(tronWeb.address.fromHex(await this.ownable.poolOracle())).to.equal(owner);
  });


  it('changes pool oracle', async function () {
    const receipt = await this.ownable.transferOracleRole(other1, { from: owner, shouldPollResponse: true });

    expect(tronWeb.address.fromHex(await this.ownable.poolOracle())).to.equal(other1);

    // only owner can do it
    try {
      await this.ownable.transferOracleRole(owner, { from: other1, shouldPollResponse: true })
    } catch {
      return;
    }
    throw "an exception should have been thrown";
  });

  it('prevents non-oracles from transferring', async function () {
    try {
      await this.ownable.transferOracleRole(other1, { from: other2, shouldPollResponse: true })
    } catch {
      return;
    }
    throw "an exception should have been thrown";
  });

  it('guards ownership against stuck state', async function () {
    try {
      await this.ownable.transferOracleRole(ZERO_ADDRESS, { from: owner, shouldPollResponse: true })
    } catch {
      return;
    }
    throw "an exception should have been thrown";
  });

  it('from non-oracle owner transferring (reverse)', async function () {
    await this.ownable.transferOracleRole(owner, { from: owner, shouldPollResponse: true })
    
    expect(tronWeb.address.fromHex(await this.ownable.poolOracle())).to.equal(owner);

  });



});