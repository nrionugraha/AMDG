const { ethers } = require("hardhat");

async function main() {
    const AMDG = await ethers.getContractFactory("AMDG"); // Load contract
    const amdg = await AMDG.deploy(); // Deploy contract
    await amdg.waitForDeployment();

    console.log("AMDG deployed to:", await amdg.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });