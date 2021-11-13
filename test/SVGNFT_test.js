const {expect} = require("chai");
const chai = require("chai");
const BN = require("bn.js");
chai.use(require("chai-bn")(BN));
const fs = require("fs");
const {deployments} = require("hardhat");
const {developmentChains} = require("../helper-hardhat-config");

skip.if(!developmentChains.includes(network.name)).describe("SVGNFT Unit Tests", async function () {
    let svgNFT;
    beforeEach(async () => {
        await deployments.fixture(["mocks", "svg"]);
        const SVGNFT = await deployments.get("SVGNFT");
        svgNFT = await ethers.getContractAt("SVGNFT", SVGNFT.address);
    });
    it("should return the correct URI", async () => {
        let expectedURI = fs.readFileSync("./test/data/metadataBlueCircle.txt", "utf8");
        let uri = await svgNFT.tokenURI(0);
        expect(uri == expectedURI).to.be.true;
    })
})
