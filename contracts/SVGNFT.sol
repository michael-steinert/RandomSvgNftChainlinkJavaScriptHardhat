// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "base64-sol/base64.sol";

contract SVGNFT is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;

    event CreatedSVGNFT(uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("SVG NFT", "svgNFT") {
        tokenCounter = 0;
    }

    function create(string memory svg) public {
        // Create a NFT with an unique Token ID
        _safeMint(msg.sender, tokenCounter);
        // Encoding SVG as Base64
        string memory imageURI = svgToImageURI(svg);
        // Setting Token URI with encoded Metadata and Image URI
        _setTokenURI(tokenCounter, formatTokenURI(imageURI));
        tokenCounter = tokenCounter + 1;
        emit CreatedSVGNFT(tokenCounter, svg);
    }

    // Pure Functions ensure that they not read or modify the State of the Blockchain
    function svgToImageURI(string memory svg) public pure returns (string memory) {
        // Example of Image URI: data:image/svg+xml;base64,<Base64-Encoding of SVG>
        string memory baseURL = "data:image/svg+xml;base64,";
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        // Contacting Strings and casting it to String
        return string(abi.encodePacked(baseURL, svgBase64Encoded));
    }

    // Pure Functions ensure that they not read or modify the State of the Blockchain
    function formatTokenURI(string memory imageURI) public pure returns (string memory) {
        string memory baseURL = "data:application/json;base64,";
        // Creating Metadata as JSON and encoding it to Base64
        return string(
            abi.encodePacked(
                baseURL,
                Base64.encode(
                    bytes(
                        abi.encodePacked(
                            '{"name":"SVG NFT", "description":"NFT based on SVG", "attributes":"", "image":"', imageURI, '"}'
                        )
                    )
                )
            )
        );
    }
}
