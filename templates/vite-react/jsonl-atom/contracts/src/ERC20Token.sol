// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title ERC20Token
 * @author Portfolio Dapp
 * @notice A custom ERC20 token implementation extending OpenZeppelin's audited ERC20 contract
 * @dev Inherits from OpenZeppelin's ERC20 for secure and gas-efficient implementation
 */
contract ERC20Token is ERC20 {
    // Custom errors for additional validation
    error InvalidAddress(address addr);
    error InvalidAmount();
    error InvalidDecimals();

    // Storage for custom decimals
    uint8 private immutable _decimals;

    /**
     * @notice Constructor to initialize the token with OpenZeppelin's ERC20
     * @param _name The name of the token
     * @param _symbol The symbol of the token
     * @param _tokenDecimals The number of decimals for the token
     * @param _initialSupply The total supply of tokens to mint (in smallest unit)
     * @param _initialOwner The address to receive the initial token supply
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _tokenDecimals,
        uint256 _initialSupply,
        address _initialOwner
    ) ERC20(_name, _symbol) {
        // Validate inputs
        if (_initialOwner == address(0)) {
            revert InvalidAddress(_initialOwner);
        }
        if (_initialSupply == 0) {
            revert InvalidAmount();
        }
        if (_tokenDecimals > 18) {
            revert InvalidDecimals();
        }

        // Set custom decimals
        _decimals = _tokenDecimals;

        // Mint all tokens to the initial owner
        _mint(_initialOwner, _initialSupply);
    }

    /**
     * @notice Returns the number of decimals for the token
     * @dev Overrides OpenZeppelin's default of 18 decimals
     * @return uint8 The number of decimals
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}