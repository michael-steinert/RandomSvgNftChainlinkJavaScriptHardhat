let {networkConfig} = require("../helper-hardhat-config");
const fs = require("fs");

module.exports = async ({
    /* Hardhat built-in Functions */
    getNamedAccounts,
    deployments,
    getChainId
}) => {
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts();
    const chainId = await getChainId();
    /* Deploying Smart Contract SVGNFT (Contract Name) */
    const SVGNFT = await deploy("SVGNFT", {
        from: deployer,
        log: true
    });
    /* Logging in Hardhat Console */
    log(`NFT contract deployed to ${SVGNFT.address}`);
    /* Getting the ABI from the Smart Contract */
    const svgNFTContract = await ethers.getContractFactory("SVGNFT");
    /* Using the hre: Hardhat Runtime Environment */
    const accounts = await hre.ethers.getSigners();
    const signer = accounts[0];
    /* Getting a JavaScript Representation about the Smart Contract */
    const svgNFT = new ethers.Contract(SVGNFT.address, svgNFTContract.interface, signer);
    const networkName = networkConfig[chainId]["name"];
    /* Logging in Hardhat Console */
    log(`Verify with:\n npx hardhat verify --network ${networkName} ${svgNFT.address}`);
    /* Getting the SVG */
    let filepath = "./images/small_enough.svg"
    let svg = fs.readFileSync(filepath, {encoding: "utf8"});
    /* Calling Methods from Smart Contract */
    let transactionResponse = await svgNFT.create(svg);
    /* Waiting for one Block Confirmation */
    await transactionResponse.wait(1);
    /* Getting Token URI from first created NFT */
    log(`TokenURI: ${await svgNFT.tokenURI(0)}`);
}
/* Using Tags for Deploying the right Scripts that contains the corresponding Tag */
module.exports.tags = ["all", "svg"];
