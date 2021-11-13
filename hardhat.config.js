require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("dotenv").config();

const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || process.env.ALCHEMY_MAINNET_RPC_URL || "";
const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL;
const KOVAN_RPC_URL = process.env.KOVAN_RPC_URL || "";
const MNEMONIC = process.env.MNEMONIC;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
// optional
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {},
        localhost: {},
        kovan: {
            url: KOVAN_RPC_URL,
            accounts: [PRIVATE_KEY],
            //accounts: {mnemonic: MNEMONIC},
            saveDeployments: true,
        },
        rinkeby: {
            url: RINKEBY_RPC_URL,
            accounts: [PRIVATE_KEY],
            //accounts: {mnemonic: MNEMONIC,},
            saveDeployments: true,
        },
        ganache: {
            url: 'http://localhost:8545',
            //accounts: {mnemonic: MNEMONIC}
        },
        mainnet: {
            url: MAINNET_RPC_URL,
            accounts: [PRIVATE_KEY],
            //accounts: {mnemonic: MNEMONIC},
            saveDeployments: true,
        },
        polygon: {
            url: "https://rpc-mainnet.maticvigil.com/",
            accounts: [PRIVATE_KEY],
            //accounts: { mnemonic: MNEMONIC},
            saveDeployments: true,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY
    },
    namedAccounts: {
        deployer: {
            /* By default take the first Account (from the Wallet - Mnemonic) as Deployer */
            default: 0,
            /* Similarly on Mainnet it will take the first Account as Deployer */
            1: 0
        },
        feeCollector: {
            default: 1
        }
    },
    solidity: {
        compilers: [
            {
                version: "0.8.0"
            },
            {
                version: "0.7.0"
            },
            {
                version: "0.6.6"
            },
            {
                version: "0.4.24"
            }
        ]
    },
    mocha: {
        timeout: 100000
    }
}
