const { constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

const { expect } = require('chai');

const MatrixOne = artifacts.require('MatrixOne');
const ZERO_ADDRESS = "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb";

contract('MatrixOwnable', function (accounts) {
  
  const [owner, other] = accounts;

  beforeEach(async function () {
    this.ownable = await MatrixOne.deployed();
  });

  it('has an owner', async function () {
    expect(tronWeb.address.fromHex(await this.ownable.owner())).to.equal(owner);
  });


  it('changes owner after transfer', async function () {
    const receipt = await this.ownable.transferOwnership(other, { from: owner, shouldPollResponse: true });

    expect(tronWeb.address.fromHex(await this.ownable.owner())).to.equal(other);
  });

  it('prevents non-owners from transferring', async function () {
    try {
      await this.ownable.transferOwnership(other, { from: owner, shouldPollResponse: true })
    } catch {
      return;
    }
    throw "an exception should have been thrown";
  });

  it('guards ownership against stuck state', async function () {
    try {
      await this.ownable.transferOwnership(ZERO_ADDRESS, { from: other, shouldPollResponse: true })
    } catch {
      return;
    }
    throw "an exception should have been thrown";
  });

  it('prevents non-owners from transferring (reverse)', async function () {
    await this.ownable.transferOwnership(owner, { from: other, shouldPollResponse: true })
    try {
      await this.ownable.transferOwnership(owner, { from: other, shouldPollResponse: true })
    } catch {
      return;
    }
    throw "an exception should have been thrown";
  });



});