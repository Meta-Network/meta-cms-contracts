import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "@openzeppelin/hardhat-upgrades";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

import "./tasks/accounts";
import "./tasks/deploy";

import { resolve } from "path";

import { config as dotenvConfig } from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import { NetworkUserConfig } from "hardhat/types";

dotenvConfig({ path: resolve(__dirname, "./.env") });

// Ensure that we have all the environment variables we need.
const mnemonic: string | undefined = process.env.MNEMONIC;
if (!mnemonic) {
  throw new Error("Please set your MNEMONIC in a .env file");
}

const infuraApiKey: string | undefined = process.env.INFURA_API_KEY;
if (!infuraApiKey) {
  throw new Error("Please set your INFURA_API_KEY in a .env file");
}

const chainIds = {
  arbitrumOne: 42161,
  avalanche: 43114,
  bsc: 56,
  bsctest: 97,
  goerli: 5,
  hardhat: 31337,
  kovan: 42,
  mainnet: 1,
  optimism: 10,
  polygon: 137,
  rinkeby: 4,
  ropsten: 3,
};

function getInfuraUrl(network: keyof typeof chainIds): string {
  return `https://${network}.infura.io/v3/${infuraApiKey}`;
}

const networkUrls: { [key in keyof typeof chainIds]: string } = {
  arbitrumOne: getInfuraUrl("arbitrumOne"),
  avalanche: getInfuraUrl("avalanche"),
  bsc: "https://bsc-dataseed.binance.org/",
  bsctest: "https://data-seed-prebsc-1-s1.binance.org:8545/",
  goerli: getInfuraUrl("goerli"),
  hardhat: "http://127.0.0.1:8545/",
  kovan: getInfuraUrl("kovan"),
  mainnet: getInfuraUrl("mainnet"),
  optimism: getInfuraUrl("optimism"),
  polygon: getInfuraUrl("polygon"),
  rinkeby: getInfuraUrl("rinkeby"),
  ropsten: getInfuraUrl("ropsten"),
};

function getChainConfig(network: keyof typeof chainIds): NetworkUserConfig {
  return {
    accounts: {
      count: 1,
      mnemonic,
      path: "m/44'/60'/0'/0",
    },
    chainId: chainIds[network],
    url: networkUrls[network],
  };
}

const networks: Omit<{ [key in keyof typeof chainIds]: NetworkUserConfig }, "hardhat"> = {
  arbitrumOne: getChainConfig("arbitrumOne"),
  avalanche: getChainConfig("avalanche"),
  bsc: getChainConfig("bsc"),
  bsctest: getChainConfig("bsctest"),
  goerli: getChainConfig("goerli"),
  kovan: getChainConfig("kovan"),
  mainnet: getChainConfig("mainnet"),
  optimism: getChainConfig("optimism"),
  polygon: getChainConfig("polygon"),
  rinkeby: getChainConfig("rinkeby"),
  ropsten: getChainConfig("ropsten"),
};

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  etherscan: {
    apiKey: {
      arbitrumOne: process.env.ARBSCAN_API_KEY,
      avalanche: process.env.SNOWTRACE_API_KEY,
      bsc: process.env.BSCSCAN_API_KEY,
      bscTestnet: process.env.BSCSCAN_API_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
      kovan: process.env.ETHERSCAN_API_KEY,
      mainnet: process.env.ETHERSCAN_API_KEY,
      optimisticEthereum: process.env.OPTIMISM_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY,
      rinkeby: process.env.ETHERSCAN_API_KEY,
      ropsten: process.env.ETHERSCAN_API_KEY,
    },
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
    src: "./contracts",
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic,
      },
      chainId: chainIds.hardhat,
    },
    ...networks,
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.9",
    settings: {
      metadata: {
        // Not including the metadata hash
        // https://github.com/paulrberg/solidity-template/issues/31
        bytecodeHash: "none",
      },
      // Disable the optimizer when debugging
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 800,
      },
    },
  },
  typechain: {
    outDir: "types",
    target: "ethers-v5",
  },
};

export default config;
