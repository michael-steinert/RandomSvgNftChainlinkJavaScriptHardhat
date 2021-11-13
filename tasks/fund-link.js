let {networkConfig, getNetworkIdFromName} = require("../helper-hardhat-config");

task("fund-link", "Funds a Contract with LINK")
    .addParam("contract", "The Address of the Contract that requires LINK")
    .addOptionalParam("linkAddress", "Set the LINK Token Address")
    .setAction(async (taskArgs) => {
        const contractAddress = taskArgs.contract;
        let networkId = await getNetworkIdFromName(network.name);

        /* Funding with LINK based on network config */
        const fundAmount = networkConfig[networkId]["fundAmount"];

        console.log(`Funding Smart Contract ${contractAddress} on Network ${network.name}`);
        let linkTokenAddress = networkConfig[networkId]["linkToken"] || taskArgs.linkAddress;
        const LinkToken = await ethers.getContractFactory("LinkToken");

        /* Getting Signer Information */
        const accounts = await ethers.getSigners();
        const signer = accounts[0];

        /* Creating Connection to LINK Token Contract and initiate the Transfer */
        const linkTokenContract = new ethers.Contract(linkTokenAddress, LinkToken.interface, signer);
        var transferTransaction = await linkTokenContract.transfer(contractAddress, fundAmount);
        /* Waiting until one Block Confirmation */
        transferTransaction.wait(1);
        console.log(`Contract ${contractAddress} funded with ${fundAmount / Math.pow(10, 18)} LINK`);
        console.log(`Transaction Hash: ' ${transferTransaction.hash}`);
    }
);

module.exports = {};
