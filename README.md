# Random NFT with Chainlink

## Hardhat Commands
|Command|Description|
|---|---|
|npx hardhat deploy --tags svg|Deploy SVG NFT to a local Hardhat network.|
|npx hardhat deploy --tags rsvg|Deploy Random SVG NFT to a local hardhat network.|
|npx hardhat deploy --network rinkeby --tags svg|Deploy SVG NFT to Testnet|
|npx hardhat deploy --network rinkeby --tags rsvg|Deploy Random SVG NFT to Testnet|
|npx hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>|Verify a Smart Contract on Etherscan therefore the ETHERSCAN_API_KEY Environment Variable must be set|
|npx harhat test|Run all Unit Tests|
