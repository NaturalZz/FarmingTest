import { expect, use } from 'chai';
import { BigNumber, ethers } from "ethers";
import { AcalaJsonRpcProvider } from "@acala-network/eth-providers";
import {solidity} from 'ethereum-waffle';
import { ACCOUNT, ProxyAddress, STABLE_ASSET, ALICE_ETH, TEST_ACCOUNT, LIQUID_CROWDLOAN, BLACK_HOLE, MAX_UINT_AMOUNT, WTDOT, AVERAGE_BLOCK_TIME, CURRENT_RPC, ASSET_ADDRESS } from "../utils/config";
import { Amount, ContractAddress, ConvertType, Operation, UserAddress, getConversion } from '../utils/type';
import { IERC20Call } from '../call/IERC20Call';
import { AlreadyConverted, AlreadyPaused, BalanceLow, CannotStake0, CannotUnstakeZero, InsufficientAllowance, InvalidAmount, NotPaused, OperationPaused, PoolIsEmpty, PoolMustExist, PoolNotExist, RewardDurationZero, RewardTokenZero, ShareNotEnough, ShareTokenMustDOT, ShareTokenMustLcDOT, TooManyRewardType, WrongRate, notOwner } from '../utils/error';
import { expectRevert } from '../utils/expectRevert';
import { IStakingLstV2Call } from '../call/iStakingLSTV2Call';

use(solidity);

describe('Lending Pool staking 合约测试', () => {
    const provider = new AcalaJsonRpcProvider(CURRENT_RPC);
    const AliceSigner = new ethers.Wallet(ALICE_ETH as string, provider)
    const TestSigner = new ethers.Wallet(TEST_ACCOUNT as string, provider)
    const stakingV2Call = new IStakingLstV2Call(TestSigner)
    const { DOT, LDOT, DOT_L, LDOT_L } = ASSET_ADDRESS
    const DOTCall = new IERC20Call(DOT, TestSigner)
    const LDOTCall = new IERC20Call(LDOT, TestSigner)
    const DOT_LCall = new IERC20Call(DOT_L, TestSigner)
    const LDOT_LCall = new IERC20Call(LDOT_L, TestSigner)

    const amount = BigNumber.from("50000000000") // 5e10

    const DOTLstPool = 4
    const LDOTLstPool = 5

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
        // 检查stake后的资产变化
        const checkStake = async (txHash: string, poolIndex: number, shareType: ContractAddress, stakeAmount: Amount) => {
            const { blockNumber: stakeBlockNumber } = await provider.getTransaction(txHash) as { blockNumber : number }
            const { timestamp: stakeTime } = await provider.getBlock(stakeBlockNumber)
            // shareType的Call
            const fromErc20Call = new IERC20Call(shareType, TestSigner)
            const { convertedShareType, convertedExchangeRate } = await stakingV2Call.convertInfos(poolIndex, stakeBlockNumber - 1)
            // 如果 convertedShareType不为黑洞地址，证明池子已经被转化过了            
            if (convertedShareType != BLACK_HOLE) {
                const toErc20Call = new IERC20Call(convertedShareType, TestSigner)

                let expectConvertedAmount = convertedExchangeRate.mul(stakeAmount).div("1000000000000000000")
                const [stakerBalanceBefore, lstToBalanceBefore, sharesBefore, totalSharesBefore] = await Promise.all([
                    fromErc20Call.balanceOf(TestSigner.address, stakeBlockNumber - 1),
                    toErc20Call.balanceOf(ProxyAddress as string, stakeBlockNumber - 1),
                    stakingV2Call.shares(poolIndex, TestSigner.address, stakeBlockNumber - 1),
                    stakingV2Call.totalShares(poolIndex, stakeBlockNumber - 1),
                ]);
                const [stakerBalanceAfter, lstToBalanceAfter, sharesAfter, totalSharesAfter] = await Promise.all([
                    fromErc20Call.balanceOf(TestSigner.address, stakeBlockNumber),
                    toErc20Call.balanceOf(ProxyAddress as string, stakeBlockNumber),
                    stakingV2Call.shares(poolIndex, TestSigner.address, stakeBlockNumber),
                    stakingV2Call.totalShares(poolIndex, stakeBlockNumber),
                ]);

                let expectSharesAdd = expectConvertedAmount.mul("1000000000000000000").div(convertedExchangeRate);
                console.log("expectSharesAdd", expectSharesAdd.toString());
                
                // test的shareType balance 应该减少 stakeAmount
                console.log(stakerBalanceBefore.toString(), stakerBalanceAfter.toString(), stakeAmount.toString());
                
                expect(stakerBalanceBefore.eq(stakerBalanceAfter.add(stakeAmount))).true
                // 合约的convertedShareType balance 应该增加 convertedAmount
                console.log(lstToBalanceBefore.toString(), lstToBalanceAfter.toString(), expectConvertedAmount.toString(), lstToBalanceAfter.sub(lstToBalanceBefore).toString());
                expect(lstToBalanceBefore.eq(lstToBalanceAfter.sub(expectConvertedAmount))).true
                // 用户的shares应该增加expectSharesAdd的
                console.log(sharesBefore.toString(), sharesAfter.toString());
                
                expect(sharesBefore.eq(sharesAfter.sub(expectSharesAdd))).true
                // 池子的totalShares应该增加expectSharesAdd的
                expect(totalSharesBefore.eq(totalSharesAfter.sub(expectSharesAdd))).true
            } else {
                const [
                    lstBalanceBefore,
                    testBalanceBefore,
                    sharesBefore,
                    totalShareBefore
                ] = await Promise.all([
                    fromErc20Call.balanceOf(ProxyAddress as string, stakeBlockNumber - 1),
                    fromErc20Call.balanceOf(TestSigner.address, stakeBlockNumber - 1),
                    stakingV2Call.shares(poolIndex, TestSigner.address, stakeBlockNumber - 1),
                    stakingV2Call.totalShares(poolIndex, stakeBlockNumber - 1)
                ])

                const [
                    lstBalanceAfter,
                    testBalanceAfter,
                    sharesAfter,
                    totalShareAfter
                ] = await Promise.all([
                    fromErc20Call.balanceOf(ProxyAddress as string, stakeBlockNumber),
                    fromErc20Call.balanceOf(TestSigner.address, stakeBlockNumber),
                    stakingV2Call.shares(poolIndex, TestSigner.address, stakeBlockNumber),
                    stakingV2Call.totalShares(poolIndex, stakeBlockNumber)
                ])
    
                expect(lstBalanceBefore.eq(lstBalanceAfter.sub(stakeAmount))).true
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
            const { convertedShareType, convertedExchangeRate } = await stakingV2Call.convertInfos(poolIndex, stakeBlockNumber - 1)
            // 如果 convertedShareType不为黑洞地址，证明池子已经被转化过了
            console.log(convertedShareType);
            
            if (convertedShareType != BLACK_HOLE) {
                const toErc20Call = new IERC20Call(convertedShareType, TestSigner)

                let expectConvertedAmount = convertedExchangeRate.mul(stakeAmount).div("1000000000000000000")
                const [stakerBalanceBefore, receiverBalanceBefore, stakingToBalanceBefore, stakerSharesBefore, receiverSharesBefore, totalSharesBefore] = await Promise.all([
                    fromErc20Call.balanceOf(staker, stakeBlockNumber - 1),
                    fromErc20Call.balanceOf(receiver, stakeBlockNumber - 1),
                    toErc20Call.balanceOf(ProxyAddress, stakeBlockNumber - 1),
                    stakingV2Call.shares(poolIndex, staker, stakeBlockNumber - 1),
                    stakingV2Call.shares(poolIndex, receiver, stakeBlockNumber - 1),
                    stakingV2Call.totalShares(poolIndex, stakeBlockNumber - 1),
                ]);
                const [stakerBalanceAfter, receiverBalanceAfter, stakingToBalanceAfter, stakerSharesAfter, receiverSharesAfter, totalSharesAfter] = await Promise.all([
                    fromErc20Call.balanceOf(staker, stakeBlockNumber),
                    fromErc20Call.balanceOf(receiver, stakeBlockNumber),
                    toErc20Call.balanceOf(ProxyAddress, stakeBlockNumber),
                    stakingV2Call.shares(poolIndex, staker, stakeBlockNumber),
                    stakingV2Call.shares(poolIndex, receiver, stakeBlockNumber),
                    stakingV2Call.totalShares(poolIndex, stakeBlockNumber),
                ]);
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
                    stakingV2Call.shares(poolIndex, staker, stakeBlockNumber - 1),
                    stakingV2Call.shares(poolIndex, receiver, stakeBlockNumber - 1),
                    stakingV2Call.totalShares(poolIndex, stakeBlockNumber - 1)
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
                    stakingV2Call.shares(poolIndex, staker, stakeBlockNumber),
                    stakingV2Call.shares(poolIndex, receiver, stakeBlockNumber),
                    stakingV2Call.totalShares(poolIndex, stakeBlockNumber)
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

            const { convertedShareType, convertedExchangeRate } = await stakingV2Call.convertInfos(poolIndex)
            let fromErc20Call = new IERC20Call(shareType, TestSigner)

            // 如果 convertedShareType不为黑洞地址，证明池子已经被转化过了
            console.log(convertedShareType);
            
            if (convertedShareType != BLACK_HOLE) {
                const toErc20Call = new IERC20Call(convertedShareType, TestSigner)
                const expectConvertedAmount = convertedExchangeRate.mul(unstakeAmount).div("1000000000000000000")

                const [stakerBalanceBefore, stakerToBalanceBefore, lstToBalanceBefore, sharesBefore, totalSharesBefore] = await Promise.all([
                    fromErc20Call.balanceOf(TestSigner.address, unstakeBlockNumber - 1),
                    toErc20Call.balanceOf(TestSigner.address, unstakeBlockNumber - 1),
                    toErc20Call.balanceOf(ProxyAddress, unstakeBlockNumber - 1),
                    stakingV2Call.shares(poolIndex, TestSigner.address, unstakeBlockNumber - 1),
                    stakingV2Call.totalShares(poolIndex, unstakeBlockNumber - 1),
                ]);

                const [stakerBalanceAfter, stakerToBalanceAfter, lstToBalanceAfter, sharesAfter, totalSharesAfter] = await Promise.all([
                    fromErc20Call.balanceOf(TestSigner.address, unstakeBlockNumber),
                    toErc20Call.balanceOf(TestSigner.address, unstakeBlockNumber),
                    toErc20Call.balanceOf(ProxyAddress, unstakeBlockNumber),
                    stakingV2Call.shares(poolIndex, TestSigner.address, unstakeBlockNumber),
                    stakingV2Call.totalShares(poolIndex, unstakeBlockNumber),
                ]);
                console.log("expectConvertedAmount", expectConvertedAmount.toString());
                
                // 用户的shareType balance 应该不变
                expect(stakerBalanceBefore.eq(stakerBalanceAfter)).true
                // 用户的convertedShareType balance 应该增加 expectConvertedAmount
                expect(stakerToBalanceBefore.eq(stakerToBalanceAfter.sub(expectConvertedAmount))).true
                // 池子的convertedShareType balance 应该减少 expectConvertedAmount
                expect(lstToBalanceBefore.eq(lstToBalanceAfter.add(expectConvertedAmount))).true
                // 用户的shares应该减少 unstakeAmount
                expect(sharesBefore.eq(sharesAfter.add(unstakeAmount))).true
                // 池子的totalShares应该减少 unstakeAmount的
                expect(totalSharesBefore.eq(totalSharesAfter.add(unstakeAmount))).true
            } else {
                const [
                    lstBalanceBefore,
                    testBalanceBefore,
                    sharesBefore,
                    totalShareBefore
                ] = await Promise.all([
                    fromErc20Call.balanceOf(ProxyAddress as string, unstakeBlockNumber - 1),
                    fromErc20Call.balanceOf(TestSigner.address, unstakeBlockNumber - 1),
                    stakingV2Call.shares(poolIndex, TestSigner.address, unstakeBlockNumber - 1),
                    stakingV2Call.totalShares(poolIndex, unstakeBlockNumber - 1)
                ])

                const [
                    lstBalanceAfter,
                    testBalanceAfter,
                    sharesAfter,
                    totalShareAfter
                ] = await Promise.all([
                    fromErc20Call.balanceOf(ProxyAddress as string, unstakeBlockNumber),
                    fromErc20Call.balanceOf(TestSigner.address, unstakeBlockNumber),
                    stakingV2Call.shares(poolIndex, TestSigner.address, unstakeBlockNumber),
                    stakingV2Call.totalShares(poolIndex, unstakeBlockNumber)
                ])
                console.log(lstBalanceBefore.toString(), lstBalanceAfter.toString());
                
                // 池子的shareType balance 应该减少unstakeAmount
                expect(lstBalanceBefore.eq(lstBalanceAfter.add(unstakeAmount))).true
                // 用户的shareType balance 应该增加unstakeAmount
                expect(testBalanceBefore.eq(testBalanceAfter.sub(unstakeAmount))).true
                // 用户的shares 应该减少unstakeAmount
                expect(sharesBefore.eq(sharesAfter.add(unstakeAmount))).true
                // 池子的shares 应该减少unstakeAmount
                expect(totalShareBefore.eq(totalShareAfter.add(unstakeAmount))).true
            }
        }
        
        // done
        describe.skip("质押资产 stake", () => {
            // pass
            it.skip("DOT池子stake min(ed=100000000, 0.01) => should success", async () => {
                const tx = await stakingV2Call.stake(DOTLstPool, "100000000")
                await checkStake(tx.hash, DOTLstPool, DOT, "100000000")
            })

            it.skip("LDOT池子stake min(ed=500000000, 0.05) => should success", async () => {
                const tx = await stakingV2Call.stake(LDOTLstPool, "500000000")
                await checkStake(tx.hash, LDOTLstPool, LDOT, "500000000")
            })
        })

        // done
        describe.skip("分享质押 stakeTo", () => {
            // pass
            it.skip("DOT池子stakeTo min(ed=100000000, 0.01) => should success", async () => {
                const tx = await stakingV2Call.stakeTo(DOTLstPool, "100000000", AliceSigner.address)
                await checkStakeTo(tx.hash, DOTLstPool, DOT, "100000000", TestSigner.address, AliceSigner.address)
            })

            it.skip("LDOT池子stakeTo min(ed=500000000, 0.05) => should success", async () => {
                const tx = await stakingV2Call.stakeTo(LDOTLstPool, "500000000", AliceSigner.address)
                await checkStakeTo(tx.hash, LDOTLstPool, LDOT, "500000000", TestSigner.address, AliceSigner.address)
            })
        })

        describe.skip("取消质押资产 unstake", () => {
            // it.skip("DOT池子用户unstake 0 => should reject", async () => {
            //     await expectRevert(stakingV2Call.unstake(DOTLstPool, 0), CannotUnstakeZero)
            // })

            // it.skip("LDOT池子用户unstake 0 => should reject", async () => {
            //     await expectRevert(stakingV2Call.unstake(LDOTLstPool, 0), CannotUnstakeZero)
            // })

            // pass
            it.skip("DOT池子 unstake min => should success", async () => {
                const tx = await stakingV2Call.unstake(DOTLstPool, 1)
                await checkUnstake(tx.hash, DOTLstPool, DOT, 1)
                
            })

            // pass
            it.skip("DOT池子 unstake all => should success", async () => {
                const shares = (await stakingV2Call.shares(DOTLstPool, TestSigner.address)).toString()
                const tx = await stakingV2Call.unstake(DOTLstPool, shares)
                await checkUnstake(tx.hash, DOTLstPool, DOT, shares)
            })


            // pass
            it("LDOT池子 unstake min => should success", async () => {
                const tx = await stakingV2Call.unstake(LDOTLstPool, 1)
                await checkUnstake(tx.hash, LDOTLstPool, LDOT, 1)
            })

            // pass
            it("LDOT池子 unstake all => should success", async () => {
                const shares = (await stakingV2Call.shares(LDOTLstPool, TestSigner.address)).toString()
                const tx = await stakingV2Call.unstake(LDOTLstPool, shares)
                await checkUnstake(tx.hash, LDOTLstPool, LDOT, shares)
            })
        })
    })
})