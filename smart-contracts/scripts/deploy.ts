const hre = require("hardhat");

async function main() {
  try {
    const ownerAddress = "0x604B123b56B5c7CB3ef2793bCDA7C17c9674A4C0";
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", ownerAddress);
    console.log(deployer.address);
    const GeoLogixRefund = await hre.ethers.getContractFactory("GeoLogixRefund");
    const geoLogixRefund = await GeoLogixRefund.deploy(deployer.address);
    console.log("GeoLogixRefund deployed to: ", await geoLogixRefund.getAddress());
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
