import {expect, use} from 'chai';
import { ethers } from "ethers";
import { AcalaJsonRpcProvider } from "@acala-network/eth-providers";
import { solidity } from 'ethereum-waffle';
import { TEST_ACCOUNT, MAX_UINT_AMOUNT, ASSET_ADDRESS, CURRENT_RPC, BLACK_HOLE, ProxyAddress, StableAssetStakeUtil } from "../utils/config";
import { IERC20Call } from '../call/IERC20Call';
import { IWrappedTDOTCall } from "../call/IWrappedTDOT";
import { BalanceLow, ExistentialDeposit, InsufficientAllowance, InvalidStableAssetPool, InvalidTDOT, InvalidWTDOT, PoolNotExist, StableAssetMintFailed, TransferAmountExceeds, WTDOTNotEnough, ZeroMinted, ZeroShare } from '../utils/error';
import { expectRevert } from '../utils/expectRevert';
import { IWrappedTUSDCall } from '../call/IWrappedTUSD';
import { IStableAssetStakeUtilCall } from '../call/iStableAssetStakeUtilCall';
import { IStakingLstV2Call } from '../call/iStakingLSTV2Call';
import { Amount, ContractAddress } from '../utils/type';

use(solidity);

describe('StableAssetStakeUtil 合约测试', () => {
    const provider = new AcalaJsonRpcProvider(CURRENT_RPC);
    const TestSinger = new ethers.Wallet(TEST_ACCOUNT as string, provider)
    const { USDCet, USDT, TUSD, WTUSD, DOT, LDOT, TDOT, WTDOT } = ASSET_ADDRESS

    const iWrappedTUSDCall = new IWrappedTUSDCall(TestSinger)
    const iWTUSDCall = new IERC20Call(WTUSD, TestSinger)
    const iTUSDCall = new IERC20Call(TUSD, TestSinger)
    const iUSDCet = new IERC20Call(USDCet, TestSinger)
    const iUSDT = new IERC20Call(USDT, TestSinger)

    const iWrappedTDOTCall = new IWrappedTDOTCall(TestSinger)
    const iWTDOTCall = new IERC20Call(WTDOT, TestSinger)
    const iTDOTCall = new IERC20Call(TDOT, TestSinger)
    const iDOT = new IERC20Call(DOT, TestSinger)
    const iLDOT = new IERC20Call(LDOT, TestSinger)

    const iStableAssetStakeUtilCall = new IStableAssetStakeUtilCall(TestSinger)
    const iStakingLstV2Call = new IStakingLstV2Call(TestSinger)

    const WTDOTStablePool = 0
    const WTUSDStablePool = 1
    const WTDOTLstPool = 5
    const WTUSDLstPool = 4

    // before(async () => {
    //     await iDOT.approve(StableAssetStakeUtil, MAX_UINT_AMOUNT)
    //     await iLDOT.approve(StableAssetStakeUtil, MAX_UINT_AMOUNT)
    //     // await iTDOTCall.approve(StableAssetStakeUtil, MAX_UINT_AMOUNT)
    // })

    // 检查stake后的资产变化
    const checkStake = async (txHash: string, wrapedContract: IERC20Call, assetsAmount: Array<string|number>, erc20Contracts: Array<IERC20Call>, LstPoolId: number) => {
        const { blockNumber: stakeBlockNumber } = await provider.getTransaction(txHash) as { blockNumber : number }
        const { timestamp: stakeTime } = await provider.getBlock(stakeBlockNumber)

        for(let i=0; i<erc20Contracts.length; i++) {
            const [balanceBefore, balanceAfter] = await Promise.all([
                erc20Contracts[i].balanceOf(TestSinger.address, stakeBlockNumber - 1),
                erc20Contracts[i].balanceOf(TestSinger.address, stakeBlockNumber)
            ])
            console.log(balanceBefore.toString(), balanceAfter.toString());
            expect(balanceBefore.sub(balanceAfter).eq(assetsAmount[i])).true
        }

        // 检查用户LST shares的变化和资产变化
        const [wrapedTotalSupllyBefore, wrapedTotalSupllyAfter, sharesBefore, sharesAfter] = await Promise.all([
            wrapedContract.totalSupply(stakeBlockNumber - 1),
            wrapedContract.totalSupply(stakeBlockNumber),
            iStakingLstV2Call.shares(LstPoolId, TestSinger.address, stakeBlockNumber - 1),
            iStakingLstV2Call.shares(LstPoolId, TestSinger.address, stakeBlockNumber)
        ])

        const stakeAmount = wrapedTotalSupllyAfter.sub(wrapedTotalSupllyBefore)
        expect(!stakeAmount.isZero()).true
        console.log(wrapedTotalSupllyBefore.toString(), wrapedTotalSupllyAfter.toString(), sharesBefore.toString(), sharesAfter.toString());
        
        expect(sharesAfter.sub(sharesBefore).eq(stakeAmount)).true
    }

    describe("mintAndStake case", async () => {
        it.skip("mintAndStake WTUSD池子 => should success", async () => {
            const assetsAmount = [1000000, 1000000]
            const stakeTx = await iStableAssetStakeUtilCall.mintAndStake(WTUSDStablePool, assetsAmount, TUSD, WTUSD, WTUSDLstPool) // "0x41b20ed68d8fd6fd5827eb8466ea906dfc336970cf8e1bd22949494f278ca4ce" 
            await checkStake(stakeTx.hash, iWTUSDCall, assetsAmount, [iUSDCet, iUSDT], WTUSDLstPool)
        })

        it.skip("mintAndStake WTDOT池子 => should success", async () => {
            const assetsAmount = ["10000000000", "10000000000"]
            const stakeTx = await iStableAssetStakeUtilCall.mintAndStake(WTDOTStablePool, assetsAmount, TDOT, WTDOT, WTDOTLstPool) // "0x41b20ed68d8fd6fd5827eb8466ea906dfc336970cf8e1bd22949494f278ca4ce" 
            await checkStake(stakeTx.hash, iWTDOTCall, assetsAmount, [iDOT, iLDOT], WTDOTLstPool)
        })
    
        it.skip("mintAndStake WTUSD池子 assetsAmount<ED时 => should revert", async () => {
            const assetsAmount = [9999, 9999]
            await expectRevert(iStableAssetStakeUtilCall.mintAndStake(WTUSDStablePool, assetsAmount, TUSD, WTUSD, WTUSDLstPool), ExistentialDeposit)
        })
    
        it.skip("mintAndStake WTUSD池子 assetsAmount>=ED时=> should success", async () => {
            const assetsAmount = [10000, 10000]
            const stakeTx = await iStableAssetStakeUtilCall.mintAndStake(WTUSDStablePool, assetsAmount, TUSD, WTUSD, WTUSDLstPool)
            await checkStake(stakeTx.hash, iWTUSDCall, assetsAmount, [iUSDCet, iUSDT], WTUSDLstPool)
        })
    
        it.skip("mintAndStake stableAssetPoolId错误时 => should revert", async () => {
            await expectRevert(iStableAssetStakeUtilCall.mintAndStake(3, [1000000, 1000000], TUSD, WTUSD, WTUSDLstPool), InvalidStableAssetPool)
        })

        it.skip("mintAndStake assetsAmount 第一个资产未approve时 => should revert", async () => {
            const assetsAmount = [1000000, 1000000]
            // await iUSDCet.approve(StableAssetStakeUtil, 0)
            // await iUSDT.approve(StableAssetStakeUtil, MAX_UINT_AMOUNT)
            await expectRevert(iStableAssetStakeUtilCall.mintAndStake(WTUSDStablePool, assetsAmount, TUSD, WTUSD, WTUSDLstPool), TransferAmountExceeds)
        })

        it.skip("mintAndStake assetsAmount 第一个资产为0且未approve时 => should success", async () => {
            const assetsAmount = [0, 1000000]
            // await iUSDCet.approve(StableAssetStakeUtil, 0)
            // await iUSDT.approve(StableAssetStakeUtil, MAX_UINT_AMOUNT)
            const stakeTx = await iStableAssetStakeUtilCall.mintAndStake(WTUSDStablePool, assetsAmount, TUSD, WTUSD, WTUSDLstPool) // "0x88c5d63f27d9f9940f5a27c98a4f05220c79c13dbd4f99e26257fc625f559d83"
            await checkStake(stakeTx.hash, iWTUSDCall, assetsAmount, [iUSDCet, iUSDT], WTUSDLstPool)
            // await iUSDCet.approve(StableAssetStakeUtil, MAX_UINT_AMOUNT)
        })
    
        it.skip("mintAndStake assetsAmount 第一个值为0时 => should success", async () => {
            const assetsAmount = [0, 1000000]
            const stakeTx = await iStableAssetStakeUtilCall.mintAndStake(WTUSDStablePool, assetsAmount, TUSD, WTUSD, WTUSDLstPool) // "0x88c5d63f27d9f9940f5a27c98a4f05220c79c13dbd4f99e26257fc625f559d83"
            await checkStake(stakeTx.hash, iWTUSDCall, assetsAmount, [iUSDCet, iUSDT], WTUSDLstPool)
        })
    
        it.skip("mintAndStake assetsAmount 第二个值为时 => should success", async () => {
            const assetsAmount = [1000000, 0]
            const stakeTx = await iStableAssetStakeUtilCall.mintAndStake(WTUSDStablePool, assetsAmount, TUSD, WTUSD, WTUSDLstPool) // "0xd724e889047923aea8d635665d811f95f49e9b9afc67fe9765010757f665ff20"// 
            await checkStake(stakeTx.hash, iWTUSDCall, assetsAmount, [iUSDCet, iUSDT], WTUSDLstPool)
        })
    
        it.skip("mintAndStake assetsAmount 传入两个值都为0时 => should reverted", async () => {
            const assetsAmount = [0, 0]
            await expectRevert(iStableAssetStakeUtilCall.mintAndStake(WTUSDStablePool, assetsAmount, TUSD, WTUSD, WTUSDLstPool), ZeroMinted)
        })
    
        it.skip("mintAndStake assetsAmount 传入三个值时 => should reverted", async () => {
            const assetsAmount = [1000000, 1000000, 1000000]
            await expectRevert(iStableAssetStakeUtilCall.mintAndStake(WTUSDStablePool, assetsAmount, TUSD, WTUSD, WTUSDLstPool), InvalidStableAssetPool)
        })
    
        it.skip("mintAndStake stableAssetShareToken 错误时 => should reverted", async () => {
            const assetsAmount = [1000000, 1000000]
            await expectRevert(iStableAssetStakeUtilCall.mintAndStake(WTUSDStablePool, assetsAmount, TDOT, WTUSD, WTUSDLstPool), ZeroMinted)
        })
    
        // FIXME 错误很奇怪
        it.skip("mintAndStake wrappedShareToken 错误时 => should reverted", async () => {
            const assetsAmount = [1000000, 1000000]
            await expectRevert(iStableAssetStakeUtilCall.mintAndStake(WTUSDStablePool, assetsAmount, TUSD, WTDOT, WTUSDLstPool), InsufficientAllowance)
        })
    
        // FIXME 错误很奇怪
        it.skip("mintAndStake WTUSD池子 传入的PoolId不存在时 => should reverted", async () => {
            const assetsAmount = [1000000, 1000000]
            await expectRevert(iStableAssetStakeUtilCall.mintAndStake(WTUSDStablePool, assetsAmount, TUSD, WTDOT, 999), InsufficientAllowance)
        })
    
        // FIXME 错误很奇怪
        it.skip("mintAndStake WTUSD池子 传入的PoolId非WTUSD池子时 => should reverted", async () => {
            const assetsAmount = [1000000, 1000000]
            await expectRevert(iStableAssetStakeUtilCall.mintAndStake(WTUSDStablePool, assetsAmount, TUSD, WTUSD, WTDOTLstPool), InsufficientAllowance)
        })

        it.skip("mintAndStake WTDOT池子 传入的PoolId非WTUSD池子时 => should reverted", async () => {
            const assetsAmount = [10000000000, 10000000000]
            await expectRevert(iStableAssetStakeUtilCall.mintAndStake(WTDOTStablePool, assetsAmount, TDOT, WTDOT, WTUSDLstPool), InsufficientAllowance)
        })
    })

    describe.skip("wrapAndStake case", async () => {
        it.skip("wrapAndStake WTUSD池子 => should success", async () => {
            const amount = "1000000"
            const stakeTx = await iStableAssetStakeUtilCall.wrapAndStake(TUSD, amount, WTUSD, WTUSDLstPool) // "0x41b20ed68d8fd6fd5827eb8466ea906dfc336970cf8e1bd22949494f278ca4ce" 
            await checkStake(stakeTx.hash, iWTUSDCall, [amount], [iTUSDCall], WTUSDLstPool)
        })

        it("wrapAndStake WTDOT池子 => should success", async () => {
            const amount = "1000000"
            const stakeTx = await iStableAssetStakeUtilCall.wrapAndStake(TDOT, amount, WTDOT, WTDOTLstPool) 
            await checkStake(stakeTx.hash, iWTDOTCall, [amount], [iTDOTCall], WTDOTLstPool)
        })

        it.skip("wrapAndStake stableAssetShareToken 错误时 => should reverted", async () => {
            const amount = "1000000"
            await expectRevert(iStableAssetStakeUtilCall.wrapAndStake(TDOT, amount, WTUSD, WTUSDLstPool), InsufficientAllowance) 
        })

        it.skip("wrapAndStake WTUSD amount=0时 => should revert", async () => {
            const amount = "0"
            await expectRevert(iStableAssetStakeUtilCall.wrapAndStake(TUSD, amount, WTUSD, WTUSDLstPool), ZeroShare) 
        })

        it.skip("wrapAndStake WTUSD 0<amount<ED时 => should revert", async () => {
            const amount = "9999"
            await expectRevert(iStableAssetStakeUtilCall.wrapAndStake(TUSD, amount, WTUSD, WTUSDLstPool), ExistentialDeposit) 
        })

        it.skip("wrapAndStake WTUSD amount>=ED时 => should success", async () => {
            const amount = "10000"
            const stakeTx = await iStableAssetStakeUtilCall.wrapAndStake(TUSD, amount, WTUSD, WTUSDLstPool)
            await checkStake(stakeTx.hash, iWTUSDCall, [amount], [iTUSDCall], WTUSDLstPool)
        })

        // FIXME 错误很奇怪
        it.skip("wrapAndStake WTUSD wrappedShareToke 错误时 => should revert", async () => {
            const amount = "1000000"
            await expectRevert(iStableAssetStakeUtilCall.wrapAndStake(TUSD, amount, WTDOT, WTUSDLstPool), InsufficientAllowance) 
        })

        it.skip("wrapAndStake WTUSD 传入的PoolId 不存在时 => should revert", async () => {
            const amount = "1000000"
            await expectRevert(iStableAssetStakeUtilCall.wrapAndStake(TUSD, amount, WTUSD, 999), PoolNotExist) 
        })

        // FIXME 错误很奇怪
        it.skip("wrapAndStake WTUSD 传入的PoolId非WTUSD池子时 => should revert", async () => {
            const amount = "1000000"
            await expectRevert(iStableAssetStakeUtilCall.wrapAndStake(TUSD, amount, WTUSD, 0), InsufficientAllowance) 
        })
    })
})