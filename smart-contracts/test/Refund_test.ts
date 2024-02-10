import { ethers } from "hardhat";
import chai from "chai";
import { solidity } from "ethereum-waffle";
import { GeoLogixRefund } from "../typechain/GeoLogixRefund";

chai.use(solidity);
const { expect } = chai;

describe("GeoLogixRefund", function () {
  let contract: GeoLogixRefund;

  beforeEach(async function () {
    const signers = await ethers.getSigners();

    const contractFactory = await ethers.getContractFactory("GeoLogixRefund", signers[0]);
    contract = (await contractFactory.deploy()) as GeoLogixRefund;
    await contract.deployed();
  });

  it("should register a driver", async function () {
    const signers = await ethers.getSigners();
    const driverAddress = signers[1].address;

    await contract.registerDriver(driverAddress, "John Doe", 1, 1, 100, 60, 10, 1);

    const driver = await contract.getDriver(driverAddress);
    expect(driver.name).to.equal("John Doe");
  });

  it("should update a driver's info", async function () {
    const signers = await ethers.getSigners();
    const driverAddress = signers[1].address;

    await contract.registerDriver(driverAddress, "John Doe", 1, 1, 100, 60, 10, 1);
    await contract.updateDriverInfo(driverAddress, 2, 2, 200, 120, 20, 2);

    const driver = await contract.getDriver(driverAddress);
    expect(driver.lat).to.equal(2);
    expect(driver.lon).to.equal(2);
    expect(driver.allowedDistance).to.equal(200);
    expect(driver.requiredTime).to.equal(120);
    expect(driver.timeTolerance).to.equal(20);
    expect(driver.refundAmount).to.equal(2);
  });

  it("should ingest a coordinate", async function () {
    const signers = await ethers.getSigners();
    const driverAddress = signers[1].address;
  
    await contract.registerDriver(driverAddress, "John Doe", 1, 1, 100, 60, 10, 1);
    await contract.connect(signers[1]).ingestCoordinate(1, 1, 60);
  
    const driver = await contract.getDriver(driverAddress);
    expect(driver.isInCompliance).to.equal(true);
  });
  
  it("should get a driver's info", async function () {
    const signers = await ethers.getSigners();
    const driverAddress = signers[1].address;
  
    await contract.registerDriver(driverAddress, "John Doe", 1, 1, 100, 60, 10, 1);
  
    const driver = await contract.getDriver(driverAddress);
    expect(driver.name).to.equal("John Doe");
  });
  
  it("should remove a driver", async function () {
    const signers = await ethers.getSigners();
    const driverAddress = signers[1].address;
  
    await contract.registerDriver(driverAddress, "John Doe", 1, 1, 100, 60, 10, 1);
    await contract.removeDriver(driverAddress);
  
    const driver = await contract.getDriver(driverAddress);
    expect(driver.isRegistered).to.equal(false);
  });
  
  it("should refund a compliant driver", async function () {
    const signers = await ethers.getSigners();
    const driverAddress = signers[1].address;
  
    await contract.registerDriver(driverAddress, "John Doe", 1, 1, 100, 60, 10, 1);
    await contract.connect(signers[1]).ingestCoordinate(1, 1, 60);
  
    const initialBalance = await ethers.provider.getBalance(driverAddress);
    await contract.refund(driverAddress);
    const finalBalance = await ethers.provider.getBalance(driverAddress);
  
    expect(finalBalance.sub(initialBalance)).to.equal(1);
  });
  
  it("should reward a compliant driver", async function () {
    const signers = await ethers.getSigners();
    const driverAddress = signers[1].address;
  
    await contract.registerDriver(driverAddress, "John Doe", 1, 1, 100, 60, 10, 1);
    await contract.connect(signers[1]).ingestCoordinate(1, 1, 60);
  
    const initialBalance = await token.balanceOf(driverAddress);
    await contract.reward(driverAddress);
    const finalBalance = await token.balanceOf(driverAddress);
  
    expect(finalBalance.sub(initialBalance)).to.equal(2);
  });
  
});