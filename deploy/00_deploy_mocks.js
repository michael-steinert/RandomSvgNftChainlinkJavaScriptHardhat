module.exports = async ({
    getNamedAccounts,
    deployments,
    getChainId
}) => {
    const DECIMALS = "18";
    const INITIAL_PRICE = "200000000000000000000";
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts();
    const chainId = await getChainId();
    /* If on a local Development Network then deploy Mocks */
    if (chainId === 31337) {
        log("Local network detected - Deploying Mocks");
        const linkToken = await deploy("LinkToken", {
            from: deployer,
            log: true}
        );
        await deploy("EthUsdAggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE]
        });
        await deploy("VRFCoordinatorMock", {
            from: deployer,
            log: true,
            args: [linkToken.address]
        });
        log("Mocks deployed");
    }
}
/* Using Tags for Deploying the right Scripts that contains the corresponding Tag */
/* Example: npx hardhat deploy --tags rsvg */
module.exports.tags = ["all", "mocks", "rsvg", "svg", "main"];
