// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {ERC20Token} from "../src/ERC20Token.sol";

/**
 * @title ERC20TokenTest
 * @author Portfolio App
 * @notice Comprehensive test suite for the ERC20Token contract
 * @dev Tests all ERC20 functionality including edge cases and reverts
 */
contract ERC20TokenTest is Test {
    ERC20Token public token;

    // Test actors
    address public owner = makeAddr("owner");
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public charlie = makeAddr("charlie");

    // Token parameters
    string public constant TOKEN_NAME = "Test Token";
    string public constant TOKEN_SYMBOL = "TEST";
    uint8 public constant TOKEN_DECIMALS = 18;
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 1e18;

    // Events to test
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function setUp() public {
        vm.prank(owner);
        token = new ERC20Token(TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, INITIAL_SUPPLY, owner);
    }

    // ============================================
    // Constructor Tests
    // ============================================

    function test_Constructor_SetsCorrectMetadata() public {
        assertEq(token.name(), TOKEN_NAME);
        assertEq(token.symbol(), TOKEN_SYMBOL);
        assertEq(token.decimals(), 18);
        assertEq(token.totalSupply(), INITIAL_SUPPLY);
    }

    function test_Constructor_MintsToInitialHolder() public {
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY);
    }

    function test_Constructor_EmitsTransferEvent() public {
        vm.expectEmit(true, true, false, true);
        emit Transfer(address(0), alice, INITIAL_SUPPLY);

        new ERC20Token(TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, INITIAL_SUPPLY, alice);
    }

    function test_RevertWhen_Constructor_ZeroAddress() public {
        vm.expectRevert(abi.encodeWithSelector(ERC20Token.InvalidAddress.selector, address(0)));
        new ERC20Token(TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, INITIAL_SUPPLY, address(0));
    }

    function test_RevertWhen_Constructor_ZeroSupply() public {
        vm.expectRevert(ERC20Token.InvalidAmount.selector);
        new ERC20Token(TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, 0, owner);
    }

    function test_RevertWhen_Constructor_InvalidDecimals() public {
        vm.expectRevert(ERC20Token.InvalidDecimals.selector);
        new ERC20Token(TOKEN_NAME, TOKEN_SYMBOL, 19, INITIAL_SUPPLY, owner);
    }

    // ============================================
    // Transfer Tests
    // ============================================

    function test_Transfer_Success() public {
        uint256 amount = 100 * 1e18;

        vm.prank(owner);
        bool success = token.transfer(alice, amount);

        assertTrue(success);
        assertEq(token.balanceOf(alice), amount);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - amount);
    }

    function test_Transfer_EmitsEvent() public {
        uint256 amount = 100 * 1e18;

        vm.expectEmit(true, true, false, true);
        emit Transfer(owner, alice, amount);

        vm.prank(owner);
        token.transfer(alice, amount);
    }

    function test_Transfer_ZeroAmount() public {
        vm.prank(owner);
        bool success = token.transfer(alice, 0);

        assertTrue(success);
        assertEq(token.balanceOf(alice), 0);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY);
    }

    function test_RevertWhen_Transfer_InsufficientBalance() public {
        uint256 amount = INITIAL_SUPPLY + 1;

        vm.prank(owner);
        // OpenZeppelin's ERC20 uses ERC20InsufficientBalance error
        vm.expectRevert();
        token.transfer(alice, amount);
    }

    function test_RevertWhen_Transfer_ToZeroAddress() public {
        vm.prank(owner);
        // OpenZeppelin's ERC20 uses ERC20InvalidReceiver error for zero address
        vm.expectRevert();
        token.transfer(address(0), 100 * 1e18);
    }

    // ============================================
    // Approval Tests
    // ============================================

    function test_Approve_Success() public {
        uint256 amount = 100 * 1e18;

        vm.prank(owner);
        bool success = token.approve(alice, amount);

        assertTrue(success);
        assertEq(token.allowance(owner, alice), amount);
    }

    function test_Approve_EmitsEvent() public {
        uint256 amount = 100 * 1e18;

        vm.expectEmit(true, true, false, true);
        emit Approval(owner, alice, amount);

        vm.prank(owner);
        token.approve(alice, amount);
    }

    function test_Approve_UpdatesAllowance() public {
        uint256 firstAmount = 100 * 1e18;
        uint256 secondAmount = 200 * 1e18;

        vm.startPrank(owner);
        token.approve(alice, firstAmount);
        assertEq(token.allowance(owner, alice), firstAmount);

        token.approve(alice, secondAmount);
        assertEq(token.allowance(owner, alice), secondAmount);
        vm.stopPrank();
    }

    function test_RevertWhen_Approve_ZeroAddressSpender() public {
        vm.prank(owner);
        // OpenZeppelin's ERC20 uses ERC20InvalidSpender error for zero address
        vm.expectRevert();
        token.approve(address(0), 100 * 1e18);
    }

    // ============================================
    // TransferFrom Tests
    // ============================================

    function test_TransferFrom_Success() public {
        uint256 approvalAmount = 200 * 1e18;
        uint256 transferAmount = 100 * 1e18;

        vm.prank(owner);
        token.approve(alice, approvalAmount);

        vm.prank(alice);
        bool success = token.transferFrom(owner, bob, transferAmount);

        assertTrue(success);
        assertEq(token.balanceOf(bob), transferAmount);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - transferAmount);
        assertEq(token.allowance(owner, alice), approvalAmount - transferAmount);
    }

    function test_TransferFrom_MaxAllowance() public {
        uint256 transferAmount = 100 * 1e18;

        vm.prank(owner);
        token.approve(alice, type(uint256).max);

        vm.prank(alice);
        token.transferFrom(owner, bob, transferAmount);

        // Allowance should remain at max
        assertEq(token.allowance(owner, alice), type(uint256).max);
    }

    function test_RevertWhen_TransferFrom_InsufficientAllowance() public {
        uint256 approvalAmount = 50 * 1e18;
        uint256 transferAmount = 100 * 1e18;

        vm.prank(owner);
        token.approve(alice, approvalAmount);

        vm.prank(alice);
        // OpenZeppelin's ERC20 uses ERC20InsufficientAllowance error
        vm.expectRevert();
        token.transferFrom(owner, bob, transferAmount);
    }

    function test_RevertWhen_TransferFrom_InsufficientBalance() public {
        // First give alice some tokens
        vm.prank(owner);
        token.transfer(alice, 100 * 1e18);

        // Alice approves bob to spend more than she has
        vm.prank(alice);
        token.approve(bob, 200 * 1e18);

        // Bob tries to transfer more than alice has
        vm.prank(bob);
        // OpenZeppelin's ERC20 uses ERC20InsufficientBalance error
        vm.expectRevert();
        token.transferFrom(alice, charlie, 200 * 1e18);
    }
}