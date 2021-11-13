let {networkConfig, getNetworkIdFromName} = require("../helper-hardhat-config");

module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId
}) => {
    const {deploy, get, log} = deployments;
    const {deployer} = await getNamedAccounts();
    const chainId = await getChainId();
    let linkTokenAddress;
    let vrfCoordinatorAddress;

    /* Hardhat local Network */
    if (chainId === 31337) {
        /* On a local Network like Hardhat there is none Link Token / Address so it is deploying a fake one */
        let linkToken = await get("LinkToken");
        let VRFCoordinatorMock = await get("VRFCoordinatorMock");
        linkTokenAddress = linkToken.address;
        vrfCoordinatorAddress = VRFCoordinatorMock.address;
    } else {
        /* For a real Network there exists a Link Token / Address */
        linkTokenAddress = networkConfig[chainId]["linkToken"];
        vrfCoordinatorAddress = networkConfig[chainId]["vrfCoordinator"];
    }
    const keyHash = networkConfig[chainId]["keyHash"];
    const fee = networkConfig[chainId]["fee"];
    let args = [vrfCoordinatorAddress, linkTokenAddress, keyHash, fee];
    const RandomSVG = await deploy("RandomSVG", {
        from: deployer,
        args: args,
        log: true
    })
    log(`NFT deployed to ${RandomSVG.address}`);
    const networkName = networkConfig[chainId]['name'];
    log(`Verify with:\n npx hardhat verify --network ${networkName} ${RandomSVG.address} ${args.toString().replace(/,/g, " ")}`);
    const RandomSVGContract = await ethers.getContractFactory("RandomSVG");
    /* Using the hre: Hardhat Runtime Environment */
    const accounts = await hre.ethers.getSigners();
    const signer = accounts[0];
    const randomSVG = new ethers.Contract(RandomSVG.address, RandomSVGContract.interface, signer);
    /* Creating JavaScript Representation of Link Token to interact with it */
    let networkId = await getNetworkIdFromName(network.name);
    const fundAmount = networkConfig[networkId]["fundAmount"];
    const linkTokenContract = await ethers.getContractFactory("LinkToken");
    const linkToken = new ethers.Contract(linkTokenAddress, linkTokenContract.interface, signer);
    /* Funding with LINK */
    let transactionResponse = await linkToken.transfer(RandomSVG.address, fundAmount);
    /* Waiting until one Block Confirmation */
    await transactionResponse.wait(1);
    /* Creating random SVG NFT */
    transactionResponse = await randomSVG.create({gasLimit: 300000});
    let receipt = await transactionResponse.wait(1);
    let tokenId = receipt.events[3].topics[2];
    log(`Number of NFT: ${tokenId}`);
    log("Waiting three Minutes for the Chainlink VRF Node to respond");
    /* Local Development Network - Hardhat */
    if (chainId !== 31337) {
        /* Waiting three Minutes */
        await new Promise(r => setTimeout(r, 180000));
        transactionResponse = await randomSVG.finishMint(tokenId, {gasLimit: 2000000});
        /* Waiting until one Block Confirmation */
        await transactionResponse.wait(1);
        log(`Token URI: ${await randomSVG.tokenURI(0)}`);
    } else {
        const VRFCoordinatorMock = await deployments.get("VRFCoordinatorMock");
        let vrfCoordinator = await ethers.getContractAt("VRFCoordinatorMock", VRFCoordinatorMock.address, signer);
        let transactionResponse = await vrfCoordinator.callBackWithRandomness(
            receipt.logs[3].topics[1],
            77777,
            randomSVG.address
        );
        await transactionResponse.wait(1);
        transactionResponse = await randomSVG.finishMint(tokenId, {gasLimit: 2000000});
        await transactionResponse.wait(1);
        log(`Token URI: ${await randomSVG.tokenURI(0)}`);
    }
}
/* Using Tags for Deploying the right Scripts that contains the corresponding Tag */
module.exports.tags = ["all", "rsvg"];
