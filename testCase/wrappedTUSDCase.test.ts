import {expect, use} from 'chai';
import { BigNumber, ethers } from "ethers";
import { AcalaJsonRpcProvider } from "@acala-network/eth-providers";
import { solidity } from 'ethereum-waffle';
import { WTUSD, MAX_UINT_AMOUNT, ASSET_ADDRESS, CURRENT_RPC, TEST_ACCOUNT } from "../utils/config";
import { IERC20Call } from '../call/IERC20Call';
import { IWrappedTUSDCall } from "../call/IWrappedTUSD";
import { BalanceLow, InsufficientAllowance, InvalidTUSD, InvalidWTUSD, WTUSDNotEnough } from '../utils/error';
import { expectRevert } from '../utils/expectRevert';
import { Amount } from '../utils/type';

use(solidity);

describe('WrappedTUSD 合约测试', () => {
    const provider = new AcalaJsonRpcProvider(CURRENT_RPC);
    const TestSigner = new ethers.Wallet(TEST_ACCOUNT as string, provider)
    const iWrappedTUSDCall = new IWrappedTUSDCall(TestSigner)
    const iWTUSDCall = new IERC20Call(WTUSD, TestSigner)
    const iTUSDCall = new IERC20Call(ASSET_ADDRESS.TUSD, TestSigner)
    const amount = BigNumber.from("1000000") // 1e6

    before(async () => {
        await iTUSDCall.approve(WTUSD, MAX_UINT_AMOUNT)
        expect((await iTUSDCall.allowance(TestSigner.address, WTUSD as string)).eq(MAX_UINT_AMOUNT))
    })

    const checkDeposit = async (txHash: string, depositAmount: Amount) => {
        const { blockNumber } = await provider.getTransaction(txHash) as { blockNumber : number }
        const [depositRate, userTUSDBefore, userWTUSDBefore, WrappedTUSDBefore, WTUSDTotalSupplyBefore] = await Promise.all([
            iWrappedTUSDCall.depositRate(blockNumber - 1),
            iTUSDCall.balanceOf(TestSigner.address, blockNumber - 1),
            iWTUSDCall.balanceOf(TestSigner.address, blockNumber - 1),
            iTUSDCall.balanceOf(WTUSD, blockNumber - 1),
            iWTUSDCall.totalSupply(blockNumber - 1)
        ])

        depositAmount = BigNumber.from(depositAmount)
        const expectDeposit = amount.mul(depositRate).div("1000000000000000000");

        const [userTUSDAfter, userWTUSDAfter, WrappedTUSDAfter, WTUSDTotalSupplyAfter] = await Promise.all([
            iTUSDCall.balanceOf(TestSigner.address, blockNumber),
            iWTUSDCall.balanceOf(TestSigner.address, blockNumber),
            iTUSDCall.balanceOf(WTUSD, blockNumber),
            iWTUSDCall.totalSupply(blockNumber)
        ])

        // 用户的TUSD应该 = balance - amount
        expect(userTUSDBefore.eq(userTUSDAfter.add(depositAmount))).true
        // 用户的WTUSD应该 = balance + expectWTUSD
        expect(userWTUSDBefore.eq(userWTUSDAfter.sub(expectDeposit))).true
        // WrappedTUSD合约的TUSD应该 = balance + amount
        expect(WrappedTUSDBefore.eq(WrappedTUSDAfter.sub(depositAmount))).true
        // WTUSD的供应量应该 = totalSupply + expectWTUSD
        expect(WTUSDTotalSupplyBefore.eq(WTUSDTotalSupplyAfter.sub(expectDeposit))).true
    }

    const checkWithdraw = async (txHash: string, withdrawAmount: Amount) => {
        const { blockNumber } = await provider.getTransaction(txHash) as { blockNumber : number }
        const [withdrawRate, userErc20Before, userWrapBalanceBefore, wrappedErc20BalanceBefore, wrappedTotalSupplyBefore] = await Promise.all([
            iWrappedTUSDCall.withdrawRate(blockNumber - 1),
            iTUSDCall.balanceOf(TestSigner.address, blockNumber - 1),
            iWrappedTUSDCall.balanceOf(TestSigner.address, blockNumber - 1),
            iTUSDCall.balanceOf(iWrappedTUSDCall.contractAddress, blockNumber - 1),
            iWrappedTUSDCall.totalSupply(blockNumber - 1)
        ])
        withdrawAmount = BigNumber.from(withdrawAmount)
        const expectWithdraw = withdrawAmount.mul(withdrawRate).div("1000000000000000000");

        const [userErc20After, userWrapBalanceAfter, wrappedErc20BalanceAfter, wrappedTotalSupplyAfter] = await Promise.all([
            iTUSDCall.balanceOf(TestSigner.address, blockNumber),
            iWrappedTUSDCall.balanceOf(TestSigner.address, blockNumber),
            iTUSDCall.balanceOf(iWrappedTUSDCall.contractAddress, blockNumber),
            iWrappedTUSDCall.totalSupply(blockNumber)
        ])
        // test的TUSD应该 = balance + expectWithdraw
        expect(userErc20Before.eq(userErc20After.sub(expectWithdraw))).true
        // test的WTUSD应该 = balance - withdrawAmount
        expect(userWrapBalanceBefore.eq(userWrapBalanceAfter.add(withdrawAmount))).true
        // // WrappedTUSD合约的TUSD应该 = balance - expectWithdraw
        expect(wrappedErc20BalanceBefore.eq(wrappedErc20BalanceAfter.add(expectWithdraw))).true
        // WTUSD的供应量应该 = totalSupply - withdrawAmount
        expect(wrappedTotalSupplyBefore.eq(wrappedTotalSupplyAfter.add(withdrawAmount))).true
    }

    // pass
    it.skip("deposit 当用户TUSD未approve=0时 => should reject ", async () => {
        await iTUSDCall.approve(WTUSD as string, 0)
        expect((await iTUSDCall.allowance(TestSigner.address, WTUSD as string)).isZero())
        await expectRevert(iWrappedTUSDCall.deposit(amount), InsufficientAllowance)
    })

    // pass
    it.skip("deposit 当用户TUSD approval<deposit amount时 => should reject", async () => {
        await iTUSDCall.approve(WTUSD as string, amount.sub(1))
        expect((await iTUSDCall.allowance(TestSigner.address, WTUSD as string)).isZero())
        await expectRevert(iWrappedTUSDCall.deposit(amount), InsufficientAllowance)
    })

    // pass
    it.skip("deposit 当deposit amount > 用户balance时 => should reject", async () => {
        const userBalance = await iTUSDCall.balanceOf(TestSigner.address)
        await expectRevert(iWrappedTUSDCall.deposit(userBalance.add(1)), BalanceLow)
    })

    // pass
    it.skip("deposit 当deposit amount=0时 => should reject WTUSD: invalid WTUSD amount", async () => {
        await expectRevert(iWrappedTUSDCall.deposit(0), InvalidWTUSD)
    })

    // pass
    it.skip("deposit 功能测试", async () => {
        const tx = await iWrappedTUSDCall.deposit(amount)
        await checkDeposit(tx.hash, amount)
    })

    // pass
    it.skip("withdraw 当withdraw amount=0时 => should reject WTUSD: invalid TUSD amount", async () => {
        const wTUSDBalance = await iWTUSDCall.balanceOf(TestSigner.address)
        if (!wTUSDBalance.isZero()) {
            await iWrappedTUSDCall.withdraw(wTUSDBalance)
        }
        await expectRevert(iWrappedTUSDCall.withdraw(0), InvalidTUSD)
    })

    // pass
    it.skip("withdraw 当withdraw amount>deposit amount时 => should reject WTUSD: WTUSD not enough", async () => {
        const wTUSDBalance = await iWTUSDCall.balanceOf(TestSigner.address)
        await expectRevert(iWrappedTUSDCall.withdraw(wTUSDBalance.add(1)), WTUSDNotEnough)
    })

    // pass
    it.skip("withdraw 当withdraw amount<deposit amount时", async () => {
        await iWrappedTUSDCall.deposit(amount)
        const withdrawAmount = amount.sub(1)
        
        const tx = await iWrappedTUSDCall.withdraw(withdrawAmount)
        await checkWithdraw(tx.hash, withdrawAmount)
    })

    // pass
    it.skip("withdraw 当withdraw amount=deposit amount时", async () => {
        await iWrappedTUSDCall.deposit(amount)
        
        const tx = await iWrappedTUSDCall.withdraw(amount)
        await checkWithdraw(tx.hash, amount)
    })
})