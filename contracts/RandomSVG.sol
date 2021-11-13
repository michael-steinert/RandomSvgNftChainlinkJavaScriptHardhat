// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "base64-sol/base64.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract RandomSVG is ERC721URIStorage, VRFConsumerBase, Ownable {
    uint256 public tokenCounter;
    bytes32 internal keyHash;
    uint256 internal fee;
    uint256 public maxNumberOfPaths;
    uint256 public maxNumberOfPathCommands;
    uint256 public size;
    string[] public pathCommands;
    string[] public colors;
    mapping(bytes32 => address) public requestIdToSender;
    mapping(uint256 => uint256) public tokenIdToRandomNumber;
    mapping(bytes32 => uint256) public requestIdToTokenId;

    // Indexing a Parameter in an Event means it is going to be a Topic - but it can increase the Gas
    // It allows to search for these Events using the indexed Parameters as Filters
    event CreatedRandomSVG(uint256 indexed tokenId, string tokenURI);
    event CreatedUnfinishedRandomSVG(uint256 indexed tokenId, uint256 randomNumber);
    event RequestedRandomSVG(bytes32 indexed requestId, uint256 indexed tokenId);

    constructor(address _VRFCoordinator, address _LinkToken, bytes32 _keyHash, uint256 _fee)
    VRFConsumerBase(_VRFCoordinator, _LinkToken)
    ERC721("RandomSVG", "rsNFT") {
        tokenCounter = 0;
        keyHash = _keyHash;
        fee = _fee;
        maxNumberOfPaths = 10;
        maxNumberOfPathCommands = 5;
        size = 500;
        pathCommands = ["M", "L"];
        colors = ["red", "blue", "green", "yellow", "black", "white"];
    }

    function withdraw() public payable onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function create() public returns (bytes32 requestId) {
        // The returns-Statement initialize the Variable requestId
        // Getting Random Number from VRFConsumerBase
        requestId = requestRandomness(keyHash, fee);
        // Mapping the Sender for Request ID and add the Sender later to the NFT
        requestIdToSender[requestId] = msg.sender;
        // Create unique Token ID
        uint256 tokenId = tokenCounter;
        // Mapping the Token ID for Request ID
        requestIdToTokenId[requestId] = tokenId;
        // Incrementing Token Counter so it will be unique for each NFT
        tokenCounter = tokenCounter + 1;
        emit RequestedRandomSVG(requestId, tokenId);
    }

    function finishMint(uint256 tokenId) public {
        require(bytes(tokenURI(tokenId)).length <= 0, "Token URI is already set");
        require(tokenCounter > tokenId, "Token ID has not been minted yet");
        require(tokenIdToRandomNumber[tokenId] > 0, "Need to wait for the Chainlink Node to respond");
        uint256 randomNumber = tokenIdToRandomNumber[tokenId];
        // Generating random SVG
        string memory svg = generateSVG(randomNumber);
        // Creating Image URI of SVG
        string memory imageURI = svgToImageURI(svg);
        // Setting Token URI with Image URI to existing NFT
        _setTokenURI(tokenId, formatTokenURI(imageURI));
        emit CreatedRandomSVG(tokenId, svg);
    }

    // Function get called by the VRFCoordinator in a responding (second) Transaction with are mapped with the Request ID
    // A Chainlink VRF has a maximum Gas of 200.000 Gas (Computation Units) so it will only return the random Number
    function fulfillRandomness(bytes32 requestId, uint256 randomNumber) internal override {
        address nftOwner = requestIdToSender[requestId];
        uint256 tokenId = requestIdToTokenId[requestId];
        // Creating NFT
        _safeMint(nftOwner, tokenId);
        // Saving the random Number and use it later in finishing Minting for saving the Gas (Computation Units) from Chainlink Node
        tokenIdToRandomNumber[tokenId] = randomNumber;
        emit CreatedUnfinishedRandomSVG(tokenId, randomNumber);
    }

    // Using the Path Element with Stroke and d-Elements to generate random SVGs
    function generateSVG(uint256 _randomness) public view returns (string memory finalSvg) {
        uint256 numberOfPaths = (_randomness % maxNumberOfPaths) + 1;
        finalSvg = string(
            abi.encodePacked(
                "<svg xmlns='http://www.w3.org/2000/svg' height='",
                uintToString(size),
                "' width='",
                uintToString(size),
                "'>"
            )
        );
        // Using a new random Number for each Path
        for (uint i = 0; i < numberOfPaths; i++) {
            string memory pathSvg = generatePath(uint256(keccak256(abi.encode(_randomness, i))));
            finalSvg = string(
                abi.encodePacked(
                    finalSvg,
                    pathSvg
                )
            );
        }
        finalSvg = string(
            abi.encodePacked(
                finalSvg,
                "</svg>"
            )
        );
    }

    function generatePath(uint256 _randomness) public view returns (string memory pathSvg) {
        uint256 numberOfPathCommands = (_randomness % maxNumberOfPathCommands) + 1;
        pathSvg = "<path d='";
        for (uint i = 0; i < numberOfPathCommands; i++) {
            string memory pathCommand = generatePathCommand(
                uint256(
                    keccak256(
                        abi.encode(
                            _randomness,
                            size + i
                        )
                    )
                )
            );
            pathSvg = string(
                abi.encodePacked(
                    pathSvg,
                    pathCommand
                )
            );
        }
        string memory color = colors[_randomness % colors.length];
        pathSvg = string(
            abi.encodePacked(
                pathSvg,
                "' fill='transparent' stroke='",
                color,
                "'/>"
            )
        );
    }

    function generatePathCommand(uint256 _randomness) public view returns (string memory pathCommand) {
        pathCommand = pathCommands[_randomness % pathCommands.length];
        uint256 parameterOne = uint256(
            keccak256(
                abi.encode(
                    _randomness,
                    size * 2
                )
            )
        ) % size;
        uint256 parameterTwo = uint256(
            keccak256(
                abi.encode(
                    _randomness,
                    size * 2 + 1
                )
            )
        ) % size;
        pathCommand = string(
            abi.encodePacked(
                pathCommand,
                " ",
                uintToString(parameterOne),
                " ",
                uintToString(parameterTwo
                )
            )
        );
    }

    // Math-safe Converting from Uint to String
    function uintToString(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bytesString = new bytes(length);
        uint k = length;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            // Using bytes1 instead of bytes so Math Operations work like from SafeMath
            bytes1 b1 = bytes1(temp);
            bytesString[k] = b1;
            _i /= 10;
        }
        return string(bytesString);
    }

    function svgToImageURI(string memory svg) public pure returns (string memory) {
        // data:image/svg+xml;base64,<Bas64-Encoding of SVG>
        string memory baseURL = "data:image/svg+xml;base64,";
        string memory svgBase64Encoded = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(svg)
                )
            )
        );
        return string(
            abi.encodePacked(
                baseURL,
                svgBase64Encoded
            ))
        ;
    }

    function formatTokenURI(string memory imageURI) public pure returns (string memory) {
        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(
                    bytes(
                        abi.encodePacked(
                            '{"name":"',
                            "SVG NFT", // You can add whatever name here
                            '", "description":"An NFT based on SVG!", "attributes":"", "image":"', imageURI, '"}'
                        )
                    )
                )
            )
        );
    }
}
