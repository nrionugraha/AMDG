require("@nomicfoundation/hardhat-toolbox");

const privateKey = "PRIVATE_KEY";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  defaultNetwork: "sepolia",
  networks: {
  hardhat: {
    },
  sepolia: {
    url: "https://sepolia.infura.io/v3/cdb76b86ed444a33891442a4ebb8ad7b",
    accounts: [privateKey]
    }
  }
};
