import { expect, use } from 'chai';
import { BigNumber, ethers } from "ethers";
import { AcalaJsonRpcProvider } from "@acala-network/eth-providers";
import {solidity} from 'ethereum-waffle';
import { ACCOUNT, ProxyAddress, STABLE_ASSET, ALICE_ETH, TEST_ACCOUNT, LIQUID_CROWDLOAN, BLACK_HOLE, MAX_UINT_AMOUNT, WTDOT, AVERAGE_BLOCK_TIME, CURRENT_RPC, ASSET_ADDRESS } from "../utils/config";
import { Amount, ContractAddress, ConvertType, Operation, UserAddress, getConversion } from '../utils/type';
import { IERC20Call } from '../call/IERC20Call';
import { AlreadyConverted, AlreadyPaused, BalanceLow, CannotStake0, CannotUnstakeZero, InsufficientAllowance, InvalidAmount, NotPaused, OperationPaused, PoolIsEmpty, PoolMustExist, PoolNotExist, RewardDurationZero, RewardTokenZero, ShareNotEnough, ShareTokenMustDOT, ShareTokenMustLcDOT, TooManyRewardType, WrongRate, notOwner } from '../utils/error';
import { expectRevert } from '../utils/expectRevert';
import { ILiquidCrowdloanCall } from '../call/ILiquidCrowdloanCall';
import { IWrappedTDOTCall } from '../call/IWrappedTDOT';
import { IStakingLstV2Call } from '../call/iStakingLSTV2Call';
import { IWrappedTUSDCall } from '../call/IWrappedTUSD';
import { IStableAssetStakeUtilCall } from '../call/iStableAssetStakeUtilCall';

use(solidity);

describe('JitoSOL stake 合约测试', () => {
    const provider = new AcalaJsonRpcProvider(CURRENT_RPC);
    const AliceSigner = new ethers.Wallet(ALICE_ETH as string, provider)
    const TestSigner = new ethers.Wallet(TEST_ACCOUNT as string, provider)
    const iStakingLstV2Call = new IStakingLstV2Call(TestSigner)
    const { ACA, DOT, LDOT, TDOT, LCDOT, WTUSD, TUSD, USDCet, USDT, JitoSOL } = ASSET_ADDRESS
    const ACACall = new IERC20Call(ACA, TestSigner)
    const DOTCall = new IERC20Call(DOT, TestSigner)
    const LDOTCall = new IERC20Call(LDOT, TestSigner)
    const TDOTCall = new IERC20Call(TDOT, TestSigner)
    const LCDOTCall = new IERC20Call(LCDOT, TestSigner)
    const WTDOTCall = new IERC20Call(WTDOT, TestSigner)
    const JitoSOLCall = new IERC20Call(JitoSOL, TestSigner)
    
    const iWTUSDCall = new IWrappedTUSDCall(TestSigner)
    const iTUSDCall = new IERC20Call(TUSD, TestSigner)
    const iUSDCet = new IERC20Call(USDCet, TestSigner)
    const iUSDT = new IERC20Call(USDT, TestSigner)

    const iWTDOTCall = new IWrappedTDOTCall(TestSigner)
    const iTDOTCall = new IERC20Call(TDOT, TestSigner)
    const iDOT = new IERC20Call(DOT, TestSigner)
    const iLDOT = new IERC20Call(LDOT, TestSigner)
    const iLiquidCrowdloanCall = new ILiquidCrowdloanCall(TestSigner)
    const amount = BigNumber.from("50000000000") // 5e10

    const WTDOTStablePool = 0
    const WTUSDStablePool = 1
    const WTDOTLstPool = 5
    const WTUSDLstPool = 6

    const iStableAssetStakeUtilCall = new IStableAssetStakeUtilCall(TestSigner)

    // before(async () => {
    //     // const [aca, dot, sadot, lcdot] = await Promise.all([
    //     //     ACACall.allowance(ProxyAddress as string, TestSigner.address),
    //     //     DOTCall.allowance(ProxyAddress as string, TestSigner.address),
    //     //     TDOTCall.allowance(ProxyAddress as string, TestSigner.address),
    //     //     LCDOTCall.allowance(ProxyAddress as string, TestSigner.address),
    //     // ])

    //     await ACACall.approve(ProxyAddress as string, MAX_UINT_AMOUNT)
    //     // await DOTCall.approve(ProxyAddress as string, MAX_UINT_AMOUNT)
    //     await TDOTCall.approve(ProxyAddress as string, MAX_UINT_AMOUNT)
    //     await LCDOTCall.approve(ProxyAddress as string, MAX_UINT_AMOUNT)
    // })

    describe("合约方法测试", () => {
        let poolId = 2
        let shareToken = DOT as string
        const nonShareTOken = LDOT as string
        const rewardToken = DOT as string
        const _rewardRate = "10000000000"
        const passedEndTime = "1692590400"  // 2023-08-21 12:00:00

        // 检查stake后的资产变化
        const checkStake = async (txHash: string, poolIndex: number, shareType: ContractAddress, stakeAmount: Amount) => {
            const { blockNumber: stakeBlockNumber } = await provider.getTransaction(txHash) as { blockNumber : number }
            const { timestamp: stakeTime } = await provider.getBlock(stakeBlockNumber)
            // shareType的Call
            const fromErc20Call = new IERC20Call(shareType, TestSigner)
            const { convertedShareType, convertedExchangeRate } = await iStakingLstV2Call.convertInfos(poolIndex, stakeBlockNumber - 1)
            // 如果 convertedShareType不为黑洞地址，证明池子已经被转化过了            
            if (convertedShareType != BLACK_HOLE) {
                const toErc20Call = new IERC20Call(convertedShareType, TestSigner)

                let expectConvertedAmount = convertedExchangeRate.mul(stakeAmount).div("1000000000000000000")
                const [stakerBalanceBefore, stakingToBalanceBefore, sharesBefore, totalSharesBefore] = await Promise.all([
                    fromErc20Call.balanceOf(TestSigner.address, stakeBlockNumber - 1),
                    toErc20Call.balanceOf(ProxyAddress as string, stakeBlockNumber - 1),
                    iStakingLstV2Call.shares(poolIndex, TestSigner.address, stakeBlockNumber - 1),
                    iStakingLstV2Call.totalShares(poolIndex, stakeBlockNumber - 1),
                ]);
                const [stakerBalanceAfter, stakingToBalanceAfter, sharesAfter, totalSharesAfter] = await Promise.all([
                    fromErc20Call.balanceOf(TestSigner.address, stakeBlockNumber),
                    toErc20Call.balanceOf(ProxyAddress as string, stakeBlockNumber),
                    iStakingLstV2Call.shares(poolIndex, TestSigner.address, stakeBlockNumber),
                    iStakingLstV2Call.totalShares(poolIndex, stakeBlockNumber),
                ]);
                // 判断转化之后是不是WTDOT
                const isWTDOT = ethers.utils.getAddress(convertedShareType) == ethers.utils.getAddress(WTDOT as string)
                const isTDOT = ethers.utils.getAddress(convertedShareType) == ethers.utils.getAddress(TDOT as string)
                const isLDOT = ethers.utils.getAddress(convertedShareType) == ethers.utils.getAddress(LDOT as string)
                const isDOT = ethers.utils.getAddress(shareType) == ethers.utils.getAddress(DOT as string)
                const isLCDOT = ethers.utils.getAddress(shareType) == ethers.utils.getAddress(LCDOT as string)
                // 如果shareToken是DOT 并且 转化为了WTDOT，需要将DOT先转成TDOT再转成WTDOT
                if ((isDOT || isLCDOT) && (isWTDOT || isTDOT)) {
                    // 查询tDOT mint了多少
                    const [tDOTTotalSupllyBefore, tDOTTotalSupllyAfter] = await Promise.all([
                        TDOTCall.totalSupply(stakeBlockNumber - 1),
                        TDOTCall.totalSupply(stakeBlockNumber)
                    ])
                    const tDOTDiff = tDOTTotalSupllyAfter.sub(tDOTTotalSupllyBefore)
                    console.log("tDOT mint: ", tDOTDiff.toString());

                    const depositRate = await iWTDOTCall.depositRate(stakeBlockNumber - 1)
                    expectConvertedAmount = tDOTDiff.mul(depositRate).div("1000000000000000000")
                    // const redeemCurrency = iLiquidCrowdloanCall.getRedeemCurrency(stakeBlockNumber - 1)
                } else if (isLDOT) {
                    // 查询LDOT mint了多少
                    const [lDOTTotalSupllyBefore, lDOTTotalSupllyAfter] = await Promise.all([
                        LDOTCall.totalSupply(stakeBlockNumber - 1),
                        LDOTCall.totalSupply(stakeBlockNumber)
                    ])
                    expectConvertedAmount = lDOTTotalSupllyAfter.sub(lDOTTotalSupllyBefore)
                    
                }
                let expectSharesAdd = expectConvertedAmount.mul("1000000000000000000").div(convertedExchangeRate);
                console.log("expectSharesAdd", expectSharesAdd.toString());
                
                // test的shareType balance 应该减少 stakeAmount
                console.log(stakerBalanceBefore.toString(), stakerBalanceAfter.toString(), stakeAmount.toString());
                
                expect(stakerBalanceBefore.eq(stakerBalanceAfter.add(stakeAmount))).true
                // 合约的convertedShareType balance 应该增加 convertedAmount
                console.log(stakingToBalanceBefore.toString(), stakingToBalanceAfter.toString(), expectConvertedAmount.toString(), stakingToBalanceAfter.sub(stakingToBalanceBefore).toString());
                expect(stakingToBalanceBefore.eq(stakingToBalanceAfter.sub(expectConvertedAmount))).true
                // 用户的shares应该增加expectSharesAdd的
                console.log(sharesBefore.toString(), sharesAfter.toString());
                
                expect(sharesBefore.eq(sharesAfter.sub(expectSharesAdd))).true
                // 池子的totalShares应该增加expectSharesAdd的
                expect(totalSharesBefore.eq(totalSharesAfter.sub(expectSharesAdd))).true
            } else {
                const [
                    stakingBalanceBefore,
                    testBalanceBefore,
                    sharesBefore,
                    totalShareBefore
                ] = await Promise.all([
                    fromErc20Call.balanceOf(ProxyAddress as string, stakeBlockNumber - 1),
                    fromErc20Call.balanceOf(TestSigner.address, stakeBlockNumber - 1),
                    iStakingLstV2Call.shares(poolIndex, TestSigner.address, stakeBlockNumber - 1),
                    iStakingLstV2Call.totalShares(poolIndex, stakeBlockNumber - 1)
                ])

                const [
                    stakingBalanceAfter,
                    testBalanceAfter,
                    sharesAfter,
                    totalShareAfter
                ] = await Promise.all([
                    fromErc20Call.balanceOf(ProxyAddress as string, stakeBlockNumber),
                    fromErc20Call.balanceOf(TestSigner.address, stakeBlockNumber),
                    iStakingLstV2Call.shares(poolIndex, TestSigner.address, stakeBlockNumber),
                    iStakingLstV2Call.totalShares(poolIndex, stakeBlockNumber)
                ])
    
                expect(stakingBalanceBefore.eq(stakingBalanceAfter.sub(stakeAmount))).true
                expect(testBalanceBefore.eq(testBalanceAfter.add(stakeAmount))).true
                console.log(sharesBefore.toString(), sharesAfter.toString());
                
                expect(sharesBefore.eq(sharesAfter.sub(stakeAmount))).true
                expect(totalShareBefore.eq(totalShareAfter.sub(stakeAmount))).true
            }
        }

        const checkStakeTo = async (txHash: string, poolIndex: number, shareType: ContractAddress, stakeAmount: Amount, staker: string, receiver: string) => {
            const { blockNumber: stakeBlockNumber } = await provider.getTransaction(txHash) as { blockNumber : number }
            const { timestamp: stakeTime } = await provider.getBlock(stakeBlockNumber)
            // shareType的Call
            const fromErc20Call = new IERC20Call(shareType, TestSigner)
            const { convertedShareType, convertedExchangeRate } = await iStakingLstV2Call.convertInfos(poolIndex, stakeBlockNumber - 1)
            // 如果 convertedShareType不为黑洞地址，证明池子已经被转化过了
            console.log(convertedShareType);
            
            if (convertedShareType != BLACK_HOLE) {
                const toErc20Call = new IERC20Call(convertedShareType, TestSigner)

                let expectConvertedAmount = convertedExchangeRate.mul(stakeAmount).div("1000000000000000000")
                const [stakerBalanceBefore, receiverBalanceBefore, stakingToBalanceBefore, stakerSharesBefore, receiverSharesBefore, totalSharesBefore] = await Promise.all([
                    fromErc20Call.balanceOf(staker, stakeBlockNumber - 1),
                    fromErc20Call.balanceOf(receiver, stakeBlockNumber - 1),
                    toErc20Call.balanceOf(ProxyAddress, stakeBlockNumber - 1),
                    iStakingLstV2Call.shares(poolIndex, staker, stakeBlockNumber - 1),
                    iStakingLstV2Call.shares(poolIndex, receiver, stakeBlockNumber - 1),
                    iStakingLstV2Call.totalShares(poolIndex, stakeBlockNumber - 1),
                ]);
                const [stakerBalanceAfter, receiverBalanceAfter, stakingToBalanceAfter, stakerSharesAfter, receiverSharesAfter, totalSharesAfter] = await Promise.all([
                    fromErc20Call.balanceOf(staker, stakeBlockNumber),
                    fromErc20Call.balanceOf(receiver, stakeBlockNumber),
                    toErc20Call.balanceOf(ProxyAddress, stakeBlockNumber),
                    iStakingLstV2Call.shares(poolIndex, staker, stakeBlockNumber),
                    iStakingLstV2Call.shares(poolIndex, receiver, stakeBlockNumber),
                    iStakingLstV2Call.totalShares(poolIndex, stakeBlockNumber),
                ]);
                // 判断转化之后是不是WTDOT
                const isWTDOT = ethers.utils.getAddress(convertedShareType) == ethers.utils.getAddress(WTDOT as string)
                const isTDOT = ethers.utils.getAddress(convertedShareType) == ethers.utils.getAddress(TDOT as string)
                const isLDOT = ethers.utils.getAddress(convertedShareType) == ethers.utils.getAddress(LDOT as string)
                const isDOT = ethers.utils.getAddress(shareType) == ethers.utils.getAddress(DOT as string)
                const isLCDOT = ethers.utils.getAddress(shareType) == ethers.utils.getAddress(LCDOT as string)
                // 如果shareToken是DOT 并且 转化为了WTDOT，需要将DOT先转成TDOT再转成WTDOT
                if ((isDOT || isLCDOT) && (isWTDOT || isTDOT)) {
                    // 查询tDOT mint了多少
                    const [tDOTTotalSupllyBefore, tDOTTotalSupllyAfter] = await Promise.all([
                        TDOTCall.totalSupply(stakeBlockNumber - 1),
                        TDOTCall.totalSupply(stakeBlockNumber)
                    ])
                    const tDOTDiff = tDOTTotalSupllyAfter.sub(tDOTTotalSupllyBefore)
                    const depositRate = await iWTDOTCall.depositRate(stakeBlockNumber - 1)
                    expectConvertedAmount = tDOTDiff.mul(depositRate).div("1000000000000000000")
                    // const redeemCurrency = iLiquidCrowdloanCall.getRedeemCurrency(stakeBlockNumber - 1)
                } else if (isLDOT) {
                    // 查询LDOT mint了多少
                    const [lDOTTotalSupllyBefore, lDOTTotalSupllyAfter] = await Promise.all([
                        LDOTCall.totalSupply(stakeBlockNumber - 1),
                        LDOTCall.totalSupply(stakeBlockNumber)
                    ])
                    expectConvertedAmount = lDOTTotalSupllyAfter.sub(lDOTTotalSupllyBefore)
                }
                let expectSharesAdd = expectConvertedAmount.mul("1000000000000000000").div(convertedExchangeRate);
                console.log("expectSharesAdd", expectSharesAdd.toString());
                
                // staker的shareType balance 应该减少 stakeAmount
                console.log(stakerBalanceBefore.toString(), stakerBalanceAfter.toString());
                // receiver的shareType资产数量应该不变
                expect(receiverBalanceBefore.eq(receiverBalanceAfter)).true
                // LST合约的shareType资产应该增加 stakeAmount
                expect(stakerBalanceBefore.eq(stakerBalanceAfter.add(stakeAmount))).true
                // 合约的convertedShareType balance 应该增加 convertedAmount
                expect(stakingToBalanceBefore.eq(stakingToBalanceAfter.sub(expectConvertedAmount))).true
                // receiver的shares应该不变
                expect(stakerSharesBefore.eq(stakerSharesAfter)).true
                // receiver的shares应该增加expectSharesAdd
                expect(receiverSharesBefore.eq(receiverSharesAfter.sub(expectSharesAdd))).true
                // 池子的totalShares应该增加expectSharesAdd的
                expect(totalSharesBefore.eq(totalSharesAfter.sub(expectSharesAdd))).true
            } else {
                const [
                    stakingBalanceBefore,
                    stakerBalanceBefore,
                    receiverBalanceBefore,
                    stakerSharesBefore,
                    receiverSharesBefore,
                    totalShareBefore
                ] = await Promise.all([
                    fromErc20Call.balanceOf(ProxyAddress, stakeBlockNumber - 1),
                    fromErc20Call.balanceOf(staker, stakeBlockNumber - 1),
                    fromErc20Call.balanceOf(receiver, stakeBlockNumber - 1),
                    iStakingLstV2Call.shares(poolIndex, staker, stakeBlockNumber - 1),
                    iStakingLstV2Call.shares(poolIndex, receiver, stakeBlockNumber - 1),
                    iStakingLstV2Call.totalShares(poolIndex, stakeBlockNumber - 1)
                ])

                const [
                    stakingBalanceAfter,
                    stakerBalanceAfter,
                    receiverBalanceAfter,
                    stakerSharesAfter,
                    receiverSharesAfter,
                    totalShareAfter
                ] = await Promise.all([
                    fromErc20Call.balanceOf(ProxyAddress as string, stakeBlockNumber),
                    fromErc20Call.balanceOf(staker, stakeBlockNumber),
                    fromErc20Call.balanceOf(receiver, stakeBlockNumber),
                    iStakingLstV2Call.shares(poolIndex, staker, stakeBlockNumber),
                    iStakingLstV2Call.shares(poolIndex, receiver, stakeBlockNumber),
                    iStakingLstV2Call.totalShares(poolIndex, stakeBlockNumber)
                ])
    
                // LST合约的shareType资产应该增加 stakeAmount
                expect(stakingBalanceBefore.eq(stakingBalanceAfter.sub(stakeAmount))).true
                // staker的shareType资产数量应该减少stakeAmount
                expect(stakerBalanceBefore.eq(stakerBalanceAfter.add(stakeAmount))).true
                // receiver的shareType资产数量应该不变
                expect(receiverBalanceBefore.eq(receiverBalanceAfter)).true
                // staker的pool shares应该不变
                expect(stakerSharesBefore.eq(stakerSharesAfter)).true
                // receiver的pool shares应该增加stakeAmount
                expect(receiverSharesBefore.eq(receiverSharesAfter.sub(stakeAmount))).true
                // 池子的totalShares应该增加stakeAmount
                expect(totalShareBefore.eq(totalShareAfter.sub(stakeAmount))).true
                
            }
        }

        const checkUnstake = async (txHash: string, poolIndex: number, shareType: ContractAddress, unstakeAmount: Amount) => {
            const { blockNumber: unstakeBlockNumber } = await provider.getTransaction(txHash) as { blockNumber : number }
            const { timestamp: unstakeTime } = await provider.getBlock(unstakeBlockNumber)

            const { convertedShareType, convertedExchangeRate } = await iStakingLstV2Call.convertInfos(poolIndex)
            const isConvertedWTDOT = ethers.utils.getAddress(convertedShareType) == ethers.utils.getAddress(WTDOT)

            // shareType的Call 如果shareType=WTDOT或者convertedShareType=WTDOT || TDOT 那么赎回的应该是TDOT
            let fromErc20Call: IERC20Call
            if (isConvertedWTDOT) {
                fromErc20Call = new IERC20Call(TDOT as string, TestSigner)
            } else {
                fromErc20Call = new IERC20Call(shareType, TestSigner)
            }
            // 如果 convertedShareType不为黑洞地址，证明池子已经被转化过了
            console.log(convertedShareType);
            
            if (convertedShareType != BLACK_HOLE) {
                const toErc20Call = new IERC20Call(convertedShareType, TestSigner)
                const expectConvertedAmount = convertedExchangeRate.mul(unstakeAmount).div("1000000000000000000")
                let expectWithdrawAmount = expectConvertedAmount

                // 如果池子转化成了WTDOT 那么赎回的应该是TDOT 所以需要先转成TDOT
                if (isConvertedWTDOT) {
                    const withdrawRate = await iWTDOTCall.withdrawRate(unstakeBlockNumber - 1)
                    expectWithdrawAmount = withdrawRate.mul(expectConvertedAmount).div("1000000000000000000")
                }

                const [stakerBalanceBefore, stakingToBalanceBefore, sharesBefore, totalSharesBefore] = await Promise.all([
                    fromErc20Call.balanceOf(TestSigner.address, unstakeBlockNumber - 1),
                    toErc20Call.balanceOf(ProxyAddress as string, unstakeBlockNumber - 1),
                    iStakingLstV2Call.shares(poolIndex, TestSigner.address, unstakeBlockNumber - 1),
                    iStakingLstV2Call.totalShares(poolIndex, unstakeBlockNumber - 1),
                ]);

                const [stakerBalanceAfter, stakingToBalanceAfter, sharesAfter, totalSharesAfter] = await Promise.all([
                    fromErc20Call.balanceOf(TestSigner.address, unstakeBlockNumber),
                    toErc20Call.balanceOf(ProxyAddress as string, unstakeBlockNumber),
                    iStakingLstV2Call.shares(poolIndex, TestSigner.address, unstakeBlockNumber),
                    iStakingLstV2Call.totalShares(poolIndex, unstakeBlockNumber),
                ]);
                console.log("expectConvertedAmount", expectConvertedAmount.toString());
                
                console.log(stakerBalanceBefore.toString(), stakerBalanceAfter.toString());
                // test的shareType balance 应该增加 expectConvertedAmount
                expect(stakerBalanceBefore.eq(stakerBalanceAfter.sub(expectWithdrawAmount))).true
                // 合约的convertedShareType balance 应该减少 expectConvertedAmount
                expect(stakingToBalanceBefore.eq(stakingToBalanceAfter.add(expectConvertedAmount))).true
                // 用户的shares应该减少 unstakeAmount
                console.log(sharesBefore.toString(), sharesAfter.toString());
                expect(sharesBefore.eq(sharesAfter.add(unstakeAmount))).true
                // 池子的totalShares应该增加stakeAmount的
                expect(totalSharesBefore.eq(totalSharesAfter.add(unstakeAmount))).true
            } else {
                const [
                    stakingBalanceBefore,
                    testBalanceBefore,
                    sharesBefore,
                    totalShareBefore
                ] = await Promise.all([
                    fromErc20Call.balanceOf(ProxyAddress as string, unstakeBlockNumber - 1),
                    fromErc20Call.balanceOf(TestSigner.address, unstakeBlockNumber - 1),
                    iStakingLstV2Call.shares(poolIndex, TestSigner.address, unstakeBlockNumber - 1),
                    iStakingLstV2Call.totalShares(poolIndex, unstakeBlockNumber - 1)
                ])

                const [
                    stakingBalanceAfter,
                    testBalanceAfter,
                    sharesAfter,
                    totalShareAfter
                ] = await Promise.all([
                    fromErc20Call.balanceOf(ProxyAddress as string, unstakeBlockNumber),
                    fromErc20Call.balanceOf(TestSigner.address, unstakeBlockNumber),
                    iStakingLstV2Call.shares(poolIndex, TestSigner.address, unstakeBlockNumber),
                    iStakingLstV2Call.totalShares(poolIndex, unstakeBlockNumber)
                ])
                console.log(stakingBalanceBefore.toString(), stakingBalanceAfter.toString());
                
                expect(stakingBalanceBefore.eq(stakingBalanceAfter.add(unstakeAmount))).true
                expect(testBalanceBefore.eq(testBalanceAfter.sub(unstakeAmount))).true
                expect(sharesBefore.eq(sharesAfter.add(unstakeAmount))).true
                expect(totalShareBefore.eq(totalShareAfter.add(unstakeAmount))).true
            }
        }

        const checkWrappedWithdraw = async (txHash: string, erc20Call: IERC20Call, wrappedContract: IWrappedTDOTCall|IWrappedTUSDCall, withdrawAmount: Amount) => {
            const { blockNumber } = await provider.getTransaction(txHash) as { blockNumber : number }
            const [withdrawRate, userErc20Before, userWrapBalanceBefore, wrappedErc20BalanceBefore, wrappedTotalSupplyBefore] = await Promise.all([
                wrappedContract.withdrawRate(blockNumber - 1),
                erc20Call.balanceOf(TestSigner.address, blockNumber - 1),
                wrappedContract.balanceOf(TestSigner.address, blockNumber - 1),
                erc20Call.balanceOf(wrappedContract.contractAddress, blockNumber - 1),
                wrappedContract.totalSupply(blockNumber - 1)
            ])
            withdrawAmount = BigNumber.from(withdrawAmount.toString())
            const expectWithdraw = withdrawAmount.mul(withdrawRate).div("1000000000000000000");

            const [userErc20After, userWrapBalanceAfter, wrappedErc20BalanceAfter, wrappedTotalSupplyAfter] = await Promise.all([
                erc20Call.balanceOf(TestSigner.address, blockNumber),
                wrappedContract.balanceOf(TestSigner.address, blockNumber),
                erc20Call.balanceOf(wrappedContract.contractAddress, blockNumber),
                wrappedContract.totalSupply(blockNumber)
            ])
            // test的TUSD应该 = balance + expectTUSD
            expect(userErc20Before.eq(userErc20After.sub(expectWithdraw))).true
            // test的WTUSD应该 = balance - withdrawAmount
            expect(userWrapBalanceBefore.eq(userWrapBalanceAfter.add(withdrawAmount))).true
            // // WrappedTUSD合约的TUSD应该 = balance - amount
            expect(wrappedErc20BalanceBefore.eq(wrappedErc20BalanceAfter.add(expectWithdraw))).true
            // WTUSD的供应量应该 = totalSupply - expectTUSD
            expect(wrappedTotalSupplyBefore.eq(wrappedTotalSupplyAfter.add(withdrawAmount))).true
        }
        
        // done
        describe("质押资产 stake", () => {
            // before(async () => {
            //     await JitoSOLCall.approve(ProxyAddress, MAX_UINT_AMOUNT)
            // })
            it.skip("stake minBalance to JitoSOL Pool", async () => {
                const tx = await iStakingLstV2Call.stake(7, "10000")
                await checkStake(tx.hash, 7, JitoSOL, "10000")
            })

            it.skip("stake less then minBalance to JitoSOL Pool", async () => {
                const tx = await iStakingLstV2Call.stake(7, "9999")
                await checkStake(tx.hash, 7, JitoSOL, "9999")
            })

            it.skip("stake 0 JitoSOL to JitoSOL Pool", async () => {
                await expectRevert(iStakingLstV2Call.stake(7, 0), CannotStake0)
            })

            it.skip("stake 0.000000001 JitoSOL to JitoSOL Pool", async () => {
                const tx = await iStakingLstV2Call.stake(7, "1")
                await checkStake(tx.hash, 7, JitoSOL, "1")
            })

            it.skip("stake MAX JitoSOL to JitoSOL Pool", async () => {
                const balance = (await JitoSOLCall.balanceOf(TestSigner.address)).toString()
                const tx = await iStakingLstV2Call.stake(7, balance)
                await checkStake(tx.hash, 7, JitoSOL, balance)
                await iStakingLstV2Call.unstake(7, balance)
            })

            it.skip("stake MAX JitoSOL - minBalance to JitoSOL Pool keep alive", async () => {
                const balance = (await JitoSOLCall.balanceOf(TestSigner.address)).sub("10000").toString()
                const tx = await iStakingLstV2Call.stake(7, balance)
                await checkStake(tx.hash, 7, JitoSOL, balance)
                await iStakingLstV2Call.unstake(7, balance)
            })

            it("stake MAX JitoSOL - minBalance - 0.000000001 to JitoSOL Pool, no keep alive", async () => {
                const balance = (await JitoSOLCall.balanceOf(TestSigner.address)).sub("9999").toString()
                console.log(balance);
                const tx = await iStakingLstV2Call.stake(7, balance)
                console.log((await JitoSOLCall.balanceOf(TestSigner.address)).toString());
                
                await checkStake(tx.hash, 7, JitoSOL, balance)
                // await iStakingLstV2Call.unstake(7, balance)
            })
        })

        describe.skip("取消质押资产 unstake", () => {
            let staked: ethers.BigNumber
            before(async () => {
                staked = await iStakingLstV2Call.shares(7, TestSigner.address)
                console.log("share", staked.toString());
                if (staked.eq(0)) {
                    await iStakingLstV2Call.stake(7, "1000000000")
                }
            })

            it.skip("用户unstake 0 => should reject", async () => {
                await expectRevert(iStakingLstV2Call.unstake(7, 0), CannotUnstakeZero)
            })

            it.skip("unstake minBalance", async () => {
                const tx = await iStakingLstV2Call.unstake(7, "10000")
                await checkUnstake(tx.hash, 7, JitoSOL, "10000")
                staked = staked.sub("10000")
            })

            it.skip("unstake 0.000000001", async () => {
                const tx = await iStakingLstV2Call.unstake(7, "1")
                await checkUnstake(tx.hash, 7, JitoSOL, "1")
                staked = staked.sub("1")
            })

            it.skip("unstake 大于 stake的资产", async () => {
                console.log(staked.add(1).toString());
                await expectRevert(iStakingLstV2Call.unstake(7, staked.add(1)), ShareNotEnough)
            })

            it.skip("unstake 小与 stake的资产", async () => {
                const stakeAmount = staked.div(2)
                const tx = await iStakingLstV2Call.unstake(7, stakeAmount)
                await checkUnstake(tx.hash, 7, JitoSOL, stakeAmount)
                staked = stakeAmount
            })

            it.skip("unstake all", async () => {
                const tx = await iStakingLstV2Call.unstake(7, staked)
                await checkUnstake(tx.hash, 7, JitoSOL, staked)
                const shareAfter = await iStakingLstV2Call.shares(7, TestSigner.address)
                staked = shareAfter
            })

            it.skip("未抵押资产发起unstake", async () => {
                if (!staked.isZero()) {
                    await iStakingLstV2Call.unstake(7, staked)
                }

                await expectRevert(iStakingLstV2Call.unstake(7, 1), ShareNotEnough)
            })
        })
    })
})