// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import {IERC20Extended} from "./interfaces/IERC20Extended.sol";
import {SafeTransferLib} from "./dependencies/utils/SafeTransferLib.sol";


import {CompoundInterestLib} from "./dependencies/lib/CompoundInterestLib.sol"; //library

/// @notice Permissionless staking contract for a single rewards program.
/// From the start of the program, to the end of the program, a dinamic amount of rewards tokens will be distributed among stakers.
/// The rate at which rewards are distributed is dinamic over time, but proportional to the amount of tokens staked by each staker.
/// The contract no longer needs the rewardsToken to distribute, instead it mints the new tokens. The rewards tokens can only be recovered by claiming stakers.
/// This is a fork of Alberto Cuesta Cañada's staking contract: https://github.com/alcueca/staking/blob/main/src/SimpleRewards.sol
/// Careful if using non-standard ERC20 tokens, as they might break things.

contract CompoundSimpleRewards {
    using SafeTransferLib for IERC20Extended;
    using Cast for uint256;

    event Staked(address user, uint256 amount);
    event Unstaked(address user, uint256 amount);
    event Claimed(address user, uint256 amount);
    event RewardsPerTokenUpdated(uint256 accumulated);
    event UserRewardsUpdated(address user, uint256 rewards, uint256 checkpoint);

    struct RewardsPerToken {
        uint128 accumulated; // Accumulated rewards per token for the interval, scaled up by 1e18
        uint128 lastUpdated; // Last time the rewards per token accumulator was updated
    }

    struct UserRewards {
        uint128 accumulated; // Accumulated rewards for the user until the checkpoint
        uint128 checkpoint; // RewardsPerToken the last time the user rewards were updated
    }

    address public immutable stakingToken; // Token to be staked
    address public immutable rewardsToken; // Token used as rewards
    uint256 public totalStaked; // Total amount staked
    mapping(address => uint256) public userStake; // Amount staked per user


    uint256 public immutable rewardsStart; // Start of the rewards program
    uint256 public immutable rewardsEnd; // End of the rewards program
    RewardsPerToken public rewardsPerToken; // Accumulator to track rewards per token
    mapping(address => UserRewards) public accumulatedRewards; // Rewards accumulated per user

    //Custom

    uint256 public immutable rateOfInterestRay;
    uint256 public immutable startingSupply;

    constructor(
        address stakingToken_,
        address rewardsToken_,
        uint256 rewardsStart_,
        uint256 rewardsEnd_,
        // Custom
        uint256 _rateOfInterestRay
    ) {
        stakingToken = stakingToken_;
        rewardsToken = rewardsToken_;
        require(
            IERC20Extended(rewardsToken_).totalSupply() > 0,
            "Supply not found in rewardsToken ERC20"
        );

        rewardsStart = rewardsStart_;
        // Pass rewardsEnd == 0 if you want a never ending
        rewardsEnd = rewardsEnd_;
        rewardsPerToken.lastUpdated = rewardsStart_.u128();

        // Custom

        rateOfInterestRay = _rateOfInterestRay;
        startingSupply =  IERC20Extended(rewardsToken_).totalSupply();
    }

    // Custom
    function _customRewardsPerSecond() public view returns (uint256) {
        uint256 compoundSupplyNow = CompoundInterestLib.principalPlusInterest(
            startingSupply,
            rateOfInterestRay,
            block.timestamp - rewardsStart
        );

        return
            (compoundSupplyNow - startingSupply) /
            (block.timestamp - rewardsStart);
    }

    /// @notice Update the rewards per token accumulator according to the rate, the time elapsed since the last update, and the current total staked amount.
    function _calculateRewardsPerToken(
        RewardsPerToken memory rewardsPerTokenIn
    ) internal view returns (RewardsPerToken memory) {
        RewardsPerToken memory rewardsPerTokenOut = RewardsPerToken(
            rewardsPerTokenIn.accumulated,
            rewardsPerTokenIn.lastUpdated
        );
        uint256 totalStaked_ = totalStaked;

        // No changes if the program hasn't started
        if (block.timestamp < rewardsStart) return rewardsPerTokenOut;

        uint256 updateTime;
        // Stop accumulating at the end of the rewards interval

        if (rewardsEnd != 0) {
            updateTime = block.timestamp < rewardsEnd
                ? block.timestamp
                : rewardsEnd;
        } else {
            //never ending reward
            updateTime = block.timestamp;
        }

        uint256 elapsed = updateTime - rewardsPerTokenIn.lastUpdated;

        // No changes if no time has passed
        if (elapsed == 0) return rewardsPerTokenOut;
        rewardsPerTokenOut.lastUpdated = updateTime.u128();

        // If there are no stakers we just change the last update time, the rewards for intervals without stakers are not accumulated
        if (totalStaked == 0) return rewardsPerTokenOut;

        // Calculate and update the new value of the accumulator.
        rewardsPerTokenOut.accumulated = (rewardsPerTokenIn.accumulated +
            (1e18 * elapsed * _customRewardsPerSecond()) /
            totalStaked_).u128(); // The rewards per token are scaled up for precision
        return rewardsPerTokenOut;
    }

    /// @notice Calculate the rewards accumulated by a stake between two checkpoints.
    function _calculateUserRewards(
        uint256 stake_,
        uint256 earlierCheckpoint,
        uint256 latterCheckpoint
    ) internal pure returns (uint256) {
        return (stake_ * (latterCheckpoint - earlierCheckpoint)) / 1e18; // We must scale down the rewards by the precision factor
    }

    /// @notice Update and return the rewards per token accumulator according to the rate, the time elapsed since the last update, and the current total staked amount.
    function _updateRewardsPerToken()
        internal
        returns (RewardsPerToken memory)
    {
        RewardsPerToken memory rewardsPerTokenIn = rewardsPerToken;
        RewardsPerToken memory rewardsPerTokenOut = _calculateRewardsPerToken(
            rewardsPerTokenIn
        );

        // We skip the storage changes if already updated in the same block, or if the program has ended and was updated at the end
        if (rewardsPerTokenIn.lastUpdated == rewardsPerTokenOut.lastUpdated)
            return rewardsPerTokenOut;

        rewardsPerToken = rewardsPerTokenOut;
        emit RewardsPerTokenUpdated(rewardsPerTokenOut.accumulated);

        return rewardsPerTokenOut;
    }

    /// @notice Calculate and store current rewards for an user. Checkpoint the rewardsPerToken value with the user.
    function _updateUserRewards(
        address user
    ) internal returns (UserRewards memory) {
        RewardsPerToken memory rewardsPerToken_ = _updateRewardsPerToken();
        UserRewards memory userRewards_ = accumulatedRewards[user];

        // We skip the storage changes if already updated in the same block
        if (userRewards_.checkpoint == rewardsPerToken_.lastUpdated)
            return userRewards_;

        // Calculate and update the new value user reserves.
        userRewards_.accumulated += _calculateUserRewards(
            userStake[user],
            userRewards_.checkpoint,
            rewardsPerToken_.accumulated
        ).u128();
        userRewards_.checkpoint = rewardsPerToken_.accumulated;

        accumulatedRewards[user] = userRewards_;
        emit UserRewardsUpdated(
            user,
            userRewards_.accumulated,
            userRewards_.checkpoint
        );

        return userRewards_;
    }

    /// @notice Stake tokens.
    function _stake(address user, uint256 amount) internal {
        _updateUserRewards(user);
        totalStaked += amount;
        userStake[user] += amount;
        IERC20Extended(stakingToken).safeTransferFrom(user, address(this), amount);
        emit Staked(user, amount);
    }

    /// @notice Unstake tokens.
    function _unstake(address user, uint256 amount) internal {
        _updateUserRewards(user);
        totalStaked -= amount;
        userStake[user] -= amount;
        IERC20Extended(stakingToken).safeTransfer(user, amount);
        emit Unstaked(user, amount);
    }

    /// @notice Claim rewards.
    function _claim(address user, uint256 amount) internal {
        uint256 rewardsAvailable = _updateUserRewards(msg.sender).accumulated;

        // This line would panic if the user doesn't have enough rewards accumulated
        accumulatedRewards[user].accumulated = (rewardsAvailable - amount)
            .u128();

        //VERY IMOPORTANT!
        //You need to implement a function mint in rewardsToken to allow this contract to mint!
        //In this repo I already did with a very simple version of an ERC20 whith a mint function.
         IERC20Extended(rewardsToken).mint(user, amount);

        emit Claimed(user, amount);
    }

    /// @notice Stake tokens.
    function stake(uint256 amount) public virtual {
        _stake(msg.sender, amount);
    }

    /// @notice Unstake tokens.
    function unstake(uint256 amount) public virtual {
        _unstake(msg.sender, amount);
    }

    /// @notice Claim all rewards for the caller.
    function claim() public virtual returns (uint256) {
        uint256 claimed = _updateUserRewards(msg.sender).accumulated;
        _claim(msg.sender, claimed);
        return claimed;
    }

    /// @notice Calculate and return current rewards per token.
    function currentRewardsPerToken() public view returns (uint256) {
        return _calculateRewardsPerToken(rewardsPerToken).accumulated;
    }

    /// @notice Calculate and return current rewards for a user.
    /// @dev This repeats the logic used on transactions, but doesn't update the storage.
    function currentUserRewards(address user) public view returns (uint256) {
        UserRewards memory accumulatedRewards_ = accumulatedRewards[user];
        RewardsPerToken memory rewardsPerToken_ = _calculateRewardsPerToken(
            rewardsPerToken
        );
        return
            accumulatedRewards_.accumulated +
            _calculateUserRewards(
                userStake[user],
                accumulatedRewards_.checkpoint,
                rewardsPerToken_.accumulated
            );
    }
}

library Cast {
    function u128(uint256 x) internal pure returns (uint128 y) {
        require(x <= type(uint128).max, "Cast overflow");
        y = uint128(x);
    }
}