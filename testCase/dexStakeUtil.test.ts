import { expect, use } from 'chai';
import { ethers } from "ethers";
import { AcalaJsonRpcProvider } from "@acala-network/eth-providers";
import {solidity} from 'ethereum-waffle';
import { ProxyAddress, TEST_ACCOUNT, BLACK_HOLE, MAX_UINT_AMOUNT, CURRENT_RPC, ASSET_ADDRESS, DexStakeUtil } from "../utils/config";
import { Amount, ContractAddress } from '../utils/type';
import { IERC20Call } from '../call/IERC20Call';
import { InvalidTradingPair, InvalidPool, DexInvalidAmount, InvalidSwapPathLength, InvalidSwapPath, InvalidSwapAmount, BalanceLow, TransferAmountExceedsBalance, TokenBIsZeroAddress, TokenAIsZeroAddress } from '../utils/error';
import { expectRevert } from '../utils/expectRevert';
import { IStakingLstV2Call } from '../call/iStakingLSTV2Call';
import { IDexStakeUtilCall } from '../call/iDexStakeUtil';
import { IDexCall } from '../call/IDex';

use(solidity);

describe('JitoSOL stake 合约测试', () => {
    const provider = new AcalaJsonRpcProvider(CURRENT_RPC);
    const TestSigner = new ethers.Wallet(TEST_ACCOUNT as string, provider)
    const iStakingLstV2Call = new IStakingLstV2Call(TestSigner)
    const { ACA, DOT, LDOT, JitoSOL } = ASSET_ADDRESS
    const ACACall = new IERC20Call(ACA, TestSigner)
    const LDOTCall = new IERC20Call(LDOT, TestSigner)
    const JitoSOLCall = new IERC20Call(JitoSOL, TestSigner)
    const iDexCall = new IDexCall(TestSigner)
    const iDexStakeUtilCall = new IDexStakeUtilCall(TestSigner)
    const poolId = 7
    // before(async () => {
    //     await LDOTCall.approve(DexStakeUtil, MAX_UINT_AMOUNT)
    //     await JitoSOLCall.approve(DexStakeUtil, MAX_UINT_AMOUNT)
    // })

    describe("addLiquidityAndStake cases", () => {
        it("tokenA is black hole => should revert", async () => {
            await expectRevert(iDexStakeUtilCall.addLiquidityAndStake(BLACK_HOLE, "10000000000", JitoSOL, "1000000000", 0, poolId), TokenAIsZeroAddress)
        })

        it("tokenB is black hole => should revert", async () => {
            await expectRevert(iDexStakeUtilCall.addLiquidityAndStake(LDOT, "10000000000", BLACK_HOLE, "1000000000", 0, poolId), TokenBIsZeroAddress)
        })

        it("liquidity pool doesn't exist => should revert", async () => {
            await expectRevert(iDexStakeUtilCall.addLiquidityAndStake(DOT, "10000000000", JitoSOL, "1000000000", 0, poolId), InvalidTradingPair)
        })

        it("trading pair is inconsistent with share type => should revert", async () => {
            await expectRevert(iDexStakeUtilCall.addLiquidityAndStake(DOT, "10000000000", LDOT, "1000000000", 0, poolId), InvalidTradingPair)
        })


        it("pool share token is not LDOT&JitoSOL LP => should revert", async () => {
            await expectRevert(iDexStakeUtilCall.addLiquidityAndStake(LDOT, "10000000000", JitoSOL, "1000000000", 0, 6), InvalidPool)
        })

        it("tokenA amount is 0 => should revert", async () => {
            await expectRevert(iDexStakeUtilCall.addLiquidityAndStake(LDOT, "0", JitoSOL, "1000000000", 0, poolId), DexInvalidAmount)
        })

        it("tokenB amount is 0 => should revert", async () => {
            await expectRevert(iDexStakeUtilCall.addLiquidityAndStake(LDOT, "1000000000", JitoSOL, "0", 0, poolId), DexInvalidAmount)
        })

        it("tokenA amount not sufficient funds => should revert", async () => {
            const lDOTBalance = await LDOTCall.balanceOf(TestSigner.address)
            const invalidBalance = lDOTBalance.add(1)
            expectRevert(iDexStakeUtilCall.addLiquidityAndStake(LDOT, invalidBalance.toString(), JitoSOL, "100000000000", 0, poolId), BalanceLow)
        })

        it("tokenA amount not sufficient funds => should revert", async () => {
            const jitoSolBalance = await JitoSOLCall.balanceOf(TestSigner.address)
            const invalidBalance = jitoSolBalance.add(1)
            expectRevert(iDexStakeUtilCall.addLiquidityAndStake(LDOT, "10000000000", JitoSOL, invalidBalance, 0, poolId), TransferAmountExceedsBalance)
        })

        it("addLiquidityAndStake work => should success", async () => {

        })
    })

    describe.only("swapAndAddLiquidityAndStake cases", () => {
        // it("tokenA is black hold => should revert", async () => {
        //     await expectRevert(iDexStakeUtilCall.swapAndAddLiquidityAndStake(BLACK_HOLE, "10000000000", JitoSOL, "1000000000", [JitoSOL, LDOT], "10000000000", 0, poolId), TokenAIsZeroAddress)
        // })

        // it("tokenB is black hold => should revert", async () => {
        //     await expectRevert(iDexStakeUtilCall.swapAndAddLiquidityAndStake(LDOT, "10000000000", BLACK_HOLE, "1000000000", [JitoSOL, LDOT], "10000000000", 0, poolId), TokenBIsZeroAddress)
        // })

        // it("liquidity pool doesn't exist => should revert", async () => {
        //     await expectRevert(iDexStakeUtilCall.swapAndAddLiquidityAndStake(DOT, "10000000000", JitoSOL, "1000000000", [JitoSOL, LDOT], "10000000000", 0, poolId), InvalidTradingPair)
        // })

        // it("trading pair is inconsistent with share type => should revert", async () => {
        //     await expectRevert(iDexStakeUtilCall.swapAndAddLiquidityAndStake(DOT, "10000000000", LDOT, "1000000000", [JitoSOL, LDOT], "10000000000", 0, poolId), InvalidTradingPair)
        // })

        // it("pool share token is not LDOT&JitoSOL LP => should revert", async () => {
        //     await expectRevert(iDexStakeUtilCall.swapAndAddLiquidityAndStake(LDOT, "10000000000", JitoSOL, "1000000000", [JitoSOL, LDOT], "10000000000", 0, 6), InvalidPool)
        // })

        // it("swap path length less than 2", async () => {
        //     await expectRevert(iDexStakeUtilCall.swapAndAddLiquidityAndStake(LDOT, "10000000000", JitoSOL, "1000000000", [JitoSOL], "10000000000", 0, poolId), InvalidSwapPathLength)
        // })

        // it("swap path first token is tokenA but last token not tokenB", async () => {
        //     await expectRevert(iDexStakeUtilCall.swapAndAddLiquidityAndStake(LDOT, "10000000000", JitoSOL, "1000000000", [LDOT, DOT], "10000000000", 0, poolId), InvalidSwapPath)
        // })

        // it("swap path first token is tokenB but last token not tokenA", async () => {
        //     await expectRevert(iDexStakeUtilCall.swapAndAddLiquidityAndStake(LDOT, "10000000000", JitoSOL, "1000000000", [DOT, JitoSOL], "10000000000", 0, poolId), InvalidSwapPath)
        // })

        // it("invalid swap path => should revert", async () => {
        //     await expectRevert(iDexStakeUtilCall.swapAndAddLiquidityAndStake(LDOT, "10000000000", JitoSOL, "1000000000", [DOT, ACA], "10000000000", 0, poolId), InvalidSwapPath)
        // })

        // it("swap balance more than tokenA => should revert", async () => {
        //     await expectRevert(iDexStakeUtilCall.swapAndAddLiquidityAndStake(LDOT, "10000000000", JitoSOL, "1000000000", [LDOT, JitoSOL], "10000000001", 0, poolId), InvalidSwapAmount)
        // })

        // it("swap balance more than tokenB => should revert", async () => {
        //     await expectRevert(iDexStakeUtilCall.swapAndAddLiquidityAndStake(LDOT, "10000000000", JitoSOL, "1000000000", [JitoSOL, LDOT], "1000000001", 0, poolId), InvalidSwapAmount)
        // })

        // it("swap balance is zero => should revert", async () => {
        //     await expectRevert(iDexStakeUtilCall.swapAndAddLiquidityAndStake(LDOT, "10000000000", JitoSOL, "1000000000", [JitoSOL, LDOT], 0, 0, poolId), InvalidSwapAmount)
        //     await expectRevert(iDexStakeUtilCall.swapAndAddLiquidityAndStake(LDOT, "10000000000", JitoSOL, "1000000000", [LDOT, JitoSOL], 0, 0, poolId), InvalidSwapAmount)
        // })
    })
})