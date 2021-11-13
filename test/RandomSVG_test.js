const {expect} = require("chai");
const chai = require("chai");
const BN = require("bn.js");
chai.use(require("chai-bn")(BN));
const fs = require("fs");
const {deployments} = require("hardhat");
const {developmentChains} = require("../helper-hardhat-config");

skip.if(!developmentChains.includes(network.name)).describe("RandomSVG Unit Tests", async function () {
    let randomSVGNFT;
    beforeEach(async () => {
        await deployments.fixture(["mocks", "rsvg"]);
        const RandomSVG = await deployments.get("RandomSVG");
        randomSVGNFT = await ethers.getContractAt("RandomSVG", RandomSVG.address);
    });

    it("should return the correct URI", async () => {
        let expectedURI = fs.readFileSync("./test/data/randomSVG.txt", "utf8");
        let uri = await randomSVGNFT.tokenURI(0);
        expect(uri == expectedURI).to.be.true;
    });
})
