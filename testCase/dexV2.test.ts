import { expect, use } from 'chai';
import { BigNumber, ethers } from "ethers";
import { AcalaJsonRpcProvider } from "@acala-network/eth-providers";
import {solidity} from 'ethereum-waffle';
import { ProxyAddress, TEST_ACCOUNT, BLACK_HOLE, MAX_UINT_AMOUNT, CURRENT_RPC, ASSET_ADDRESS, DexStakeUtil } from "../utils/config";
import { Amount, ContractAddress } from '../utils/type';
import { IERC20Call } from '../call/IERC20Call';
import { TokenBIsZeroAddress, TokenAIsZeroAddress, DexInvalidContributionAmount, InvalidContributionIncrement, DexProvisionPoolNotExist } from '../utils/error';
import { expectRevert } from '../utils/expectRevert';
import { IStakingLstV2Call } from '../call/iStakingLSTV2Call';
import { IDexV2Call } from '../call/IDexV2';

use(solidity);

describe('dexV2 合约测试', () => {
    const provider = new AcalaJsonRpcProvider(CURRENT_RPC);
    const TestSigner = new ethers.Wallet(TEST_ACCOUNT as string, provider)
    const iStakingLstV2Call = new IStakingLstV2Call(TestSigner)
    const { ACA, LDOT, JitoSOL } = ASSET_ADDRESS
    const LDOTCall = new IERC20Call(LDOT, TestSigner)
    const JitoSOLCall = new IERC20Call(JitoSOL, TestSigner)
    const iDexV2Call = new IDexV2Call(TestSigner)
    const poolId = 7
    const receiver = "0x905c015e38c24ed973fd6075541a124c621fa743"
    const minJitoSOL = "30000000"
    const minLDOT = "75000000000"
    // before(async () => {
    //     await LDOTCall.approve(DexStakeUtil, MAX_UINT_AMOUNT)
    //     await JitoSOLCall.approve(DexStakeUtil, MAX_UINT_AMOUNT)
    // })

    const checkProvision = async (txHash: string, tokenA: ContractAddress, tokenB: ContractAddress, tokenAmountA: Amount, tokenAmountB: Amount) => {
        const { blockNumber: provisionBlockNumber } = await provider.getTransaction(txHash) as { blockNumber : number }
        const tokenACall = new IERC20Call(tokenA, TestSigner)
        const tokenBCall = new IERC20Call(tokenB, TestSigner)
        const [tokenABalanceBefore, tokenBBalanceBefore, receiverTokenABalanceBefore, receiverTokenBBalanceBefore, userProvisionPoolBefore, provisionPoolBefore] = await Promise.all([
            tokenACall.balanceOf(TestSigner.address, provisionBlockNumber - 1),
            tokenBCall.balanceOf(TestSigner.address, provisionBlockNumber - 1),
            tokenACall.balanceOf(receiver, provisionBlockNumber - 1),
            tokenBCall.balanceOf(receiver, provisionBlockNumber - 1),
            iDexV2Call.getProvisionPoolOf(TestSigner.address, tokenA, tokenB, provisionBlockNumber - 1),
            iDexV2Call.getProvisionPool(tokenA, tokenB, provisionBlockNumber - 1)
        ])
        const [tokenABalanceAfter, tokenBBalanceAfter, receiverTokenABalanceAfter, receiverTokenBBalanceAfter, userProvisionPoolAfter, provisionPoolAfter] = await Promise.all([
            tokenACall.balanceOf(TestSigner.address, provisionBlockNumber),
            tokenBCall.balanceOf(TestSigner.address, provisionBlockNumber),
            tokenACall.balanceOf(receiver, provisionBlockNumber),
            tokenBCall.balanceOf(receiver, provisionBlockNumber),
            iDexV2Call.getProvisionPoolOf(TestSigner.address, tokenA, tokenB, provisionBlockNumber),
            iDexV2Call.getProvisionPool(tokenA, tokenB, provisionBlockNumber)
        ])
        expect(tokenABalanceBefore.eq(tokenABalanceAfter.add(tokenAmountA))).true
        expect(tokenBBalanceBefore.eq(tokenBBalanceAfter.add(tokenAmountB))).true
        expect(receiverTokenABalanceBefore.eq(receiverTokenABalanceAfter.sub(tokenAmountA))).true
        expect(receiverTokenBBalanceBefore.eq(receiverTokenBBalanceAfter.sub(tokenAmountB))).true
        expect(userProvisionPoolBefore[0].eq(userProvisionPoolAfter[0].sub(tokenAmountA))).true
        expect(userProvisionPoolBefore[1].eq(userProvisionPoolAfter[1].sub(tokenAmountB))).true
        expect(provisionPoolBefore[0].eq(provisionPoolAfter[0].sub(tokenAmountA))).true
        expect(provisionPoolBefore[1].eq(provisionPoolAfter[1].sub(tokenAmountB))).true
    }

    describe("addProvision cases", () => {
        it(("provision pool is not exist => should fail"), async () => {
            await expectRevert(iDexV2Call.addProvision(ACA, JitoSOL, '1000000000000', '1000000000'), DexProvisionPoolNotExist)
        })
        // it(("tokenA is black hole => should fail"), async () => {
        //     await expectRevert(iDexV2Call.addProvision(BLACK_HOLE, LDOT, '1000000000', 0), TokenAIsZeroAddress)
        // })

        // it(("tokenB is black hole => should fail"), async () => {
        //     await expectRevert(iDexV2Call.addProvision(JitoSOL, BLACK_HOLE, '1000000000', 0), TokenBIsZeroAddress)
        // })

        // it(("all contribution is zero => should fail"), async () => {
        //     await expectRevert(iDexV2Call.addProvision(JitoSOL, LDOT, 0, 0), DexInvalidContributionAmount)
        // })

        // it("tokenA amount is zero, tokenB amount less than min => should fail", async () => {
        //     await expectRevert(iDexV2Call.addProvision(JitoSOL, LDOT, 0, new BigNumber(minLDOT).sub(1).toString()), InvalidContributionIncrement)
        // })

        // it("tokenA amount is zero, tokenB amount equal to min => should fail", async () => {
        //     const tx = await iDexV2Call.addProvision(JitoSOL, LDOT, 0, minLDOT)
        //     await checkProvision(tx.hash, JitoSOL, LDOT, 0, minLDOT)
        // })

        // it("tokenB amount is zero, tokenA amount less than min => should fail", async () => {
        //     await expectRevert(iDexV2Call.addProvision(JitoSOL, LDOT, BigNumber.from(minJitoSOL).sub(1).toString(), 0), InvalidContributionIncrement)
        // })

        // it("tokenB amount is zero, tokenA is equal to min => should fail", async () => {
        //     const tx = await iDexV2Call.addProvision(JitoSOL, LDOT, minJitoSOL, 0)
        //     await checkProvision(tx.hash, JitoSOL, LDOT, minJitoSOL, 0)
        // })

        // it("tokenA and tokenB amount is min => should success", async () => {
        //     const tx = await iDexV2Call.addProvision(JitoSOL, LDOT, minJitoSOL, minLDOT)
        //     await checkProvision(tx.hash, JitoSOL, LDOT, minJitoSOL, minLDOT)
        // })
    })

})