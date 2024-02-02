import { ethers, utils } from "ethers";
import {} from '@acala-network/types';
import { AcalaJsonRpcProvider } from "@acala-network/eth-providers";
import { ASSET_ADDRESS, ACCOUNT, ProxyAddress, HOMA, STABLE_ASSET, WTDOT, ALICE_ETH, TEST_ACCOUNT, LIQUID_CROWDLOAN, MAX_UINT_AMOUNT, BLACK_HOLE, PER_DAY_SEC, RPC_URL, CURRENT_RPC, ACALA_API_ENDPOINTS, CURRENT_CHAIN_NAME, TAI, TokenSymbol, StableAssetStakeUtil, getConvertor } from "../utils/config";
import UpgradeableStakingLSTABI from '../contracts/UpgradeableStakingLST.json'
import { expect, use } from 'chai'
import { IStakingCall } from '../call/IStakingCall'
import { ILiquidCrowdloanCall } from '../call/ILiquidCrowdloanCall'
import { IHomaCall } from "../call/IHomaCall";
import { IWrappedTDOTCall } from "../call/IWrappedTDOT";
import { BlockNumber, ConvertType, Operation, UserAddress } from "../utils/type";
import { IERC20Call, erc20ABI } from "../call/IERC20Call";
import { solidity } from "ethereum-waffle";
import { formatUnits } from "ethers/lib/utils";
import axios from "axios-https-proxy-fix";
import BigNumber from "bignumber.js";
import { ASSET_METADATAS, getTokenInfo, getTokenName } from "../utils/assets"
import { formatDecimal, truncationDecimal } from "../utils/decimal";
import { addressCompare, getBlockByTXHash, getBlockTime, getEvents, parseEvents } from "../utils/ethHelper";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { type ApiDecoration } from '@polkadot/api/types';
import { getTokenPrices } from "../utils/getTokenPrices";
import { Homa, Wallet } from '@acala-network/sdk';
import { FixedPointNumber } from "@acala-network/sdk-core";
import { convertJsonToExcel } from "../utils/fileUtils";
import { IStableAssetStakeUtilCall } from '../call/iStableAssetStakeUtilCall';
import { IWrappedTUSDCall } from "../call/IWrappedTUSD";
import { IStakingLstV2Call } from "../call/iStakingLSTV2Call";
import { IUiPoolDataProvider } from "../call/UiPoolDataProvider";


use(solidity);

(async () => {
    const provider = new AcalaJsonRpcProvider(CURRENT_RPC)
    console.log("Now network: ", CURRENT_CHAIN_NAME);
    
    const api = new ApiPromise({
        provider: new WsProvider(Object.values(ACALA_API_ENDPOINTS[CURRENT_CHAIN_NAME])),
    });
    await api.isReady
    const AliceSigner = new ethers.Wallet(ALICE_ETH as string, provider)
    const TestAccountSinger = new ethers.Wallet(TEST_ACCOUNT as string, provider)
    // console.log((await TestAccountSinger.getTransactionCount()).toString());
    
    const iStakingCall = new IStakingLstV2Call(TestAccountSinger)// new IStakingCall(TestAccountSinger)
    // const iACACall = new IERC20Call(ASSET_ADDRESS.ACA, TestAccountSinger)
    // console.log((await iACACall.balanceOf(TestAccountSinger.address)).toString());
    
    // await iACACall.transfer("0x196a493c1f818F2491e9e1d71d54c8be3dFa41c8", "18000000000000")
    // await iACACall.transfer("0xc9C8F9ce39C3EB9C4c53a5Bf0c7751eB9b426F77", '1000000000000')
    // const iDOTCall = new IERC20Call(ASSET_ADDRESS.DOT, TestAccountSinger)
    // await iDOTCall.transfer("0x56557F80158188Ada9f665C217BC6e5Bc97AC738", '200000000000')
    // await iDOTCall.approve("0x5475fa29efA24d61D6BAF689191a5b1f7B3a4B2B", 0)
    const iLDOTCall = new IERC20Call(ASSET_ADDRESS.LDOT, TestAccountSinger)
    // await iLDOTCall.transfer("0x56557F80158188Ada9f665C217BC6e5Bc97AC738", '200000000000')
    await iLDOTCall.approve(ProxyAddress, 0)
    // const iTDOTCall = new IERC20Call(TDOT, TestAccountSinger)
    // const balance = await iTDOTCall.balanceOf(TestAccountSinger.address) 
    // await iTDOTCall.transfer(AliceSigner.address, balance.toString())
    // const approveTx = await iTDOTCall.approve(ProxyAddress, MAX_UINT_AMOUNT)
    // console.log(approveTx);
    const iLCDOTCall = new IERC20Call(ASSET_ADDRESS.LCDOT, TestAccountSinger)
    await iLCDOTCall.transfer("0xfCcF778F68564a88196E3713A0B7C23C42A4CCaE", "1000000000000")
    // console.log((await iLCDOTCall.balanceOf(AliceSigner.address)).toString());
    // console.log(await iLCDOTCall.approve(ProxyAddress, "0"))
    // console.log(await iLCDOTCall.allowance(AliceSigner.address, ProxyAddress));
    const iUSDCetCall = new IERC20Call(ASSET_ADDRESS.USDCet, TestAccountSinger)
    const iUSDTCall = new IERC20Call(ASSET_ADDRESS.USDT, TestAccountSinger)
    const iTUSDCall = new IERC20Call(ASSET_ADDRESS.TUSD, TestAccountSinger)

    
    // const iWTDOTCall = new IERC20Call(WTDOT, AliceSigner)
    // const iWTUSDCall = new IERC20Call(ASSET_ADDRESS.TUSD, AliceSigner)
    
    const iWrappedTDOTCall = new IWrappedTDOTCall(TestAccountSinger)
    // await iWrappedTDOTCall.withdraw("47852697321")
    // console.log((await iWrappedTDOTCall.balanceOf(TestAccountSinger.address)).toString())
    // console.log((await iWrappedTDOTCall.depositRate()).toString())
    // console.log((await iWrappedTDOTCall.withdrawRate()).toString())
    const iWrappedTUSDCall = new IWrappedTUSDCall(TestAccountSinger)
    
    // const iLiquidCrowdloanCall = new ILiquidCrowdloanCall(AliceSigner)

    // console.log("owner", await iStakingCall.owner())
    // console.log("poolIndex", (await iStakingCall.PoolIndex()).toString())
    // console.log(iStakingCall.unstakeEncode(18, '1000000000001'));
    // console.log(await iStakingCall.pausedPoolOperations(18, Operation.Unstake))
    
    // await iDOTCall.approve(ProxyAddress as string, 0)
    // await iDOTCall.transfer("0xAad97A7cb9fF814518b8B878cc2F7fc68774A9DA", "100000000000")

    const poolId = 70 //Number((await iStakingCall.PoolIndex()).toString()) - 1
    const amount = '100000000000'
    const startPoolId = 68
    const endPoolId = 71
    // const deployTx = iStakingCall.proxyContract.deployTransaction
    // console.log(deployTx);
    // await iUSDCetCall.approve(StableAssetStakeUtil, MAX_UINT_AMOUNT)
    // console.log(await iUSDCetCall.allowance(TestAccountSinger.address, StableAssetStakeUtil));
    
    // await iUSDTCall.approve(StableAssetStakeUtil, MAX_UINT_AMOUNT)
    // console.log(await iUSDTCall.allowance(TestAccountSinger.address, StableAssetStakeUtil));

    // await iStakingCall.stake(0, '50000000000')
    // await iTUSDCall.approve(StableAssetStakeUtil, MAX_UINT_AMOUNT)
    // const iStableAssetStakeUtilCall = new IStableAssetStakeUtilCall(TestAccountSinger)
    // console.log(await iStableAssetStakeUtilCall.stableAsset());
    // await iStableAssetStakeUtilCall.mintAndStake(1, [1000000, 1000000], ASSET_ADDRESS.TUSD, ASSET_ADDRESS.WTUSD, 4)
    // await iStableAssetStakeUtilCall.wrapAndStake(ASSET_ADDRESS.TUSD, 1000000, ASSET_ADDRESS.WTUSD, 4)

    // const iUiPoolDataProvider = new IUiPoolDataProvider(TestAccountSinger)
    // console.log(await iUiPoolDataProvider.getUserReservesData(TestAccountSinger.address))
    
    const prices = await getTokenPrices()
    console.log(prices);
    

    const getAllBalanceInfo = async (who: UserAddress, blockTag: BlockNumber = "latest") => {
        const result = []
        // let userValue = new BigNumber(0)
        for (let token of ASSET_METADATAS) {            
            if(token.symbol == "USDT" || token.symbol == "TAI" || token.symbol == "USDCet" || token.symbol == "TUSD" || token.symbol == "WTUSD") continue;
            const iERC20Call = new IERC20Call(token.contract, AliceSigner)
            const balance = (await iERC20Call.balanceOf(who, blockTag)).toString()
            const formatBalance = formatDecimal(balance, -token.decimals)
            // const price = prices["data"][token.symbol as Exclude<TokenSymbol, TokenSymbol.KSM>]
            // const balanceValue = new BigNumber(formatBalance).times(price).toString()
            result.push({
                symbol: token.symbol,
                balance: balance,
                formatBalance:formatBalance,
                // price: price,
                // balanceValue: balanceValue,
                decimals: token.decimals
            })
            // userValue = userValue.plus(balanceValue)
        }
        console.table(result);
        // console.log("userValue: ", userValue.toString());
        
        return result
    }

    const getAllRewardsInfo = async (poolIndex: number, blockTag: BlockNumber = "latest") => {
        console.log("------------start getAllRewardsInfo------------");
        const rewardTypes = await iStakingCall.rewardTypes(poolIndex, blockTag)
        let result = []
        for (const type of rewardTypes) {
            const tokenInfo = getTokenInfo(type)
            const name = tokenInfo?.symbol as Exclude<TokenSymbol, TokenSymbol.KSM>
            const { rewardRate, endTime, rewardRateAccumulated, lastAccumulatedTime } = await iStakingCall.rewardRules(poolIndex, type, blockTag)
            const rewardPerShare = await iStakingCall.rewardPerShare(poolIndex, type, blockTag)
            const rewardInfo = {
                poolIndex,
                rewardType: name,
                rewardTypeDecimal: tokenInfo?.decimals as number,
                rewardRate: rewardRate.toString(),
                rewardRateHash: rewardRate.toHexString(),
                endTime: endTime.toString(),
                rewardRateAccumulated: rewardRateAccumulated.toString(),
                lastAccumulatedTime: lastAccumulatedTime.toString(),
                rewardPerShare: rewardPerShare.toString()
            }
            result.push(rewardInfo)
            console.table(rewardInfo)
        }
        return result
    }

    const getPoolInfo = async (poolIndex: number, blockTag: BlockNumber = "latest") => {
        console.log("------------start getPoolInfo------------");
        const shareTypes = await iStakingCall.shareTypes(poolIndex)
        const tokenInfo = getTokenInfo(shareTypes)
        const name = tokenInfo?.symbol as Exclude<TokenSymbol, TokenSymbol.KSM>
        const [
            convertInfos, 
            rewardsDeductionRates, 
            lastTimeRewardApplicable, 
            totalShares, 
            pausedPoolStake, 
            pausedPoolUnstake, 
            pausedPoolClaimRewards,
            poolConvertors
        ] = await Promise.all([
            iStakingCall.convertInfos(poolIndex, blockTag),
            iStakingCall.rewardsDeductionRates(poolIndex, blockTag),
            iStakingCall.lastTimeRewardApplicable(poolIndex, shareTypes, blockTag),
            iStakingCall.totalShares(poolIndex, blockTag),
            iStakingCall.pausedPoolOperations(poolIndex, Operation.Stake, blockTag),
            iStakingCall.pausedPoolOperations(poolIndex, Operation.Unstake, blockTag),
            iStakingCall.pausedPoolOperations(poolIndex, Operation.ClaimRewards, blockTag),
            iStakingCall.poolConvertors(poolIndex, blockTag)
        ])

        const formatTotalShares = formatDecimal(totalShares, -(tokenInfo?.decimals as number))
        const formatConvertedExchangeRate = formatDecimal(convertInfos.convertedExchangeRate, -18)
        let tvl: string
        let convertedTotalShares = new BigNumber(0)
        if (poolConvertors == BLACK_HOLE) {
            tvl = new BigNumber(formatTotalShares).times(prices.data[name]).toString()
        } else {
            const convertedToken = getTokenInfo(convertInfos.convertedShareType)
            const convertedTokenName = convertedToken?.symbol as Exclude<TokenSymbol, TokenSymbol.KSM>
            convertedTotalShares = new BigNumber(formatTotalShares).times(formatConvertedExchangeRate)
            if (getTokenName(convertInfos.convertedShareType) == "WTDOT") {
                const withdrawRate = (await iWrappedTDOTCall.withdrawRate(blockTag)).toString()
                console.log("withdrawRate", withdrawRate);
                convertedTotalShares = convertedTotalShares.times(withdrawRate).div("1000000000000000000")
            }
            tvl = convertedTotalShares.times(prices.data[convertedTokenName]).toString()
        }

        const rewardsInfo = await getAllRewardsInfo(poolIndex, blockTag)
        for (let info of rewardsInfo) {
            
            const rewardApr = new BigNumber(formatDecimal(info.rewardRate, -info.rewardTypeDecimal)).times(PER_DAY_SEC).times(prices.data[info.rewardType]).times(365).div(tvl)
            console.log(`${info.rewardType} apr`, rewardApr.toString());
        }
        const result = {
            poolIndex,
            shareTypes: getTokenName(shareTypes),
            totalShares: totalShares.toString(),
            formatTotalShares,
            poolConvertors,
            convertedTotalShares: convertedTotalShares.toString(),
            convertedShareType: getTokenName(convertInfos.convertedShareType),
            convertedExchangeRate: convertInfos.convertedExchangeRate.toString(),
            formatConvertedExchangeRate,
            rewardsDeductionRates: rewardsDeductionRates.toString(),
            lastTimeRewardApplicable: lastTimeRewardApplicable.toString(),
            pausedPoolStake, 
            pausedPoolUnstake, 
            pausedPoolClaimRewards,
            tvl: tvl,
            rewardsInfo
        }
        console.table(result)
        return result
    }

    const getUserPoolInfo = async (poolIndex: number, who: UserAddress, blockTag: BlockNumber = "latest") => {
        console.log("------------start getUserPoolInfo------------");
        const shares = await iStakingCall.shares(poolIndex, who, blockTag)
        const shareTypes = await iStakingCall.shareTypes(poolIndex, blockTag)
        const { decimals } = getTokenInfo(shareTypes) as { decimals: number}
        const { convertedShareType, convertedExchangeRate }  = await iStakingCall.convertInfos(poolIndex, blockTag)
        let convertedShares = ethers.BigNumber.from(0)
        let formatConvertedShares
        if (convertedShareType != BLACK_HOLE) {
            const { decimals: convertedDecimal } = getTokenInfo(shareTypes) as { decimals: number}
            convertedShares = shares.mul(convertedExchangeRate).div("1000000000000000000")
            if (getTokenName(convertedShareType) == "WTDOT") {
                const withdrawRate = (await iWrappedTDOTCall.withdrawRate(blockTag)).toString()
                console.log("withdrawRate", withdrawRate);
                convertedShares = convertedShares.mul(withdrawRate).div("1000000000000000000")
            }
            formatConvertedShares = formatDecimal(convertedShares, -convertedDecimal)
        }
        let result = {
            user: who,
            poolIndex,
            shares: shares.toString(),
            formatShares: formatDecimal(shares, -decimals),
            convertedShareType: getTokenName(convertedShareType),
            convertedExchangeRate: convertedExchangeRate.toString(),
            formatConvertedExchangeRate: new BigNumber(convertedExchangeRate.toString()).div("1000000000000000000").toString(),
            convertedShares: convertedShares.toString(),
            formatConvertedShares,
            rewards: [] as any[]
        }
        const rewardTypes = await iStakingCall.rewardTypes(poolIndex, blockTag)
        for (const type of rewardTypes) {
            const [
                paidAccumulatedRates,
                earned,
                rewards
            ] = await Promise.all([
                iStakingCall.paidAccumulatedRates(poolIndex, who, type, blockTag),
                iStakingCall.earned(poolIndex, who, type, blockTag),
                iStakingCall.rewards(poolIndex, who, type, blockTag)
            ])
            const { decimals: rewardDecimal } = getTokenInfo(type) as { decimals: number}
            result.rewards.push({
                poolIndex,
                rewardType: type,
                paidAccumulatedRates: paidAccumulatedRates.toString(),
                earned: earned.toString(),
                formatEarned: formatDecimal(earned, -rewardDecimal),
                rewards: rewards.toString(),
                formatRewards: formatDecimal(rewards, -rewardDecimal)
            })
        }
        const { rewards, ...outputData } = result
        console.table(outputData)
        console.table(result.rewards)
        return result
    }

    const getLSTConfig = async (blockTag: BlockNumber = "latest") => {
        console.log("------------start getPoolConfig------------");
        const [
            owner,
            HOMA,
            DOT,
            LDOT,
            LCDOT,
            TDOT,
            LIQUID_CROWDLOAN,
            STABLE_ASSET,
            MAX_REWARD_TYPES,
            paused
        ] = await Promise.all([
            iStakingCall.owner(blockTag),
            iStakingCall.HOMA(),
            iStakingCall.DOT(),
            iStakingCall.LDOT(),
            iStakingCall.LCDOT(),
            iStakingCall.TDOT(),
            iStakingCall.LIQUID_CROWDLOAN(),
            iStakingCall.STABLE_ASSET(),
            iStakingCall.MAX_REWARD_TYPES(),
            iStakingCall.paused(blockTag),
        ])

        const result = {
            owner,
            HOMA,
            DOT,
            LDOT,
            LCDOT,
            TDOT,
            LIQUID_CROWDLOAN,
            STABLE_ASSET,
            MAX_REWARD_TYPES: MAX_REWARD_TYPES.toString(),
            paused
        }

        console.table(result)
        return result
    }

    const getApr = async () => {
        const params = {
            "operationName": null,
            "variables": {},
            "query": "{\n  query {\n    dailySummaries(first: 30, orderBy: TIMESTAMP_DESC) {\n      nodes {\n        exchangeRate\n        timestamp\n      }\n    }\n  }\n}\n"
        }
        const ldotRsp = await (await fetch("https://api.polkawallet.io/acala-liquid-staking-subql", {method: 'POST', headers: {
            'Content-Type': 'application/json'
        }, body: JSON.stringify(params)})).json()
        const exchangeRates = ldotRsp.data.query.dailySummaries.nodes;
        const first = exchangeRates[0];
        const last = exchangeRates[exchangeRates.length - 1];
        const len = exchangeRates.length;
        const ldotApr = (first.exchangeRate / last.exchangeRate - 1) * (365 / len);
        const ldotApy = ldotApr + (first.exchangeRate / last.exchangeRate - 1)

        const tdotRsp = await (await fetch('https://api.taigaprotocol.io/rewards/apr?network=acala&pool=0')).json()
        const tdotApy = tdotRsp['sa://0']
        const result = {ldotApr, ldotApy, tdotApy}

        console.table(result)
        return result
    }

    const getLstTVL = async (blockTag: BlockNumber = "latest") => {
        let lstTvl = new BigNumber(0)
        let totalShares = new BigNumber(0)
        for(let i=startPoolId; i <= endPoolId; i++) {
            const { tvl, formatTotalShares } = await getPoolInfo(i, blockTag)
            lstTvl = lstTvl.plus(tvl)
            totalShares = totalShares.plus(formatTotalShares)
        }
        console.log("LST TVL: ", lstTvl.toString());
        console.log("TotalShares: ", totalShares.toString());
        
        return {lstTvl, totalShares}
    }
    
    // console.log((await iStakingCall.contract.convertInfos(3)))

    // console.log(await iWrappedTDOTCall.balanceOf(TestAccountSinger.address))
    // console.log((await iLCDOTCall.allowance("0x7eF3D3d72c3cDd897c6560677cC91f4237aE7443", ProxyAddress as string, 4627290)).toString());
    // await getAllBalanceInfo(TestAccountSinger.address)
    // await getAllBalanceInfo(ProxyAddress)
    // await iWrappedTUSDCall.approve(ProxyAddress, MAX_UINT_AMOUNT)

    // await iStakingCall.stake(70, '50000000000')
    // await iStakingCall.unstake(3, '10000000000')

    // await getAllBalanceInfo(TestAccountSinger.address)
    // await getAllBalanceInfo("0x88b01565eA3d429d6931E2Befd40de6cc0d799B2")
    // await getAssetPrice()
    // await getAllRewardsInfo(poolId)
    // await getPoolInfo(0)
    // await getPoolInfo(1)
    // await getPoolInfo(2)
    // await getPoolInfo(3)
    await getPoolInfo(4)
    await getPoolInfo(5)
    // await getPoolInfo(64)
    // await getPoolInfo(65)
    // await getPoolInfo(66)
    // await getPoolInfo(67)
    // await getPoolInfo(68)
    // await getPoolInfo(69)
    // await getPoolInfo(70)
    // await getPoolInfo(71)
    // console.log(await iStakingCall.poolConvertors(0))
    // console.log(await iStakingCall.poolConvertors(1))
    // console.log(await iStakingCall.poolConvertors(2))
    // console.log(await iStakingCall.poolConvertors(3))
    // await iStakingCall.updateRewardRule(66, LDOT as string, '200000000000', '1695358000')
    // const tx = await provider.getTransactionReceipt("0x2e757cc3696c6df94eb90ee00755f4cc4f81c1526e07a045e3e906284881131c")
    // console.log(tx);
    // console.log(tx.gasUsed.toString(), tx.effectiveGasPrice.toString(), tx.cumulativeGasUsed.toString());
    // console.log(utils.toUtf8String("0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002c4d756c746963757272656e6379205472616e73666572206661696c65643a2042616c616e6365546f6f4c6f77"));
    
    // const stakeTx = await iStakingCall.stake(2, "50000000000")
    // console.log(stakeTx);
    // await getPoolInfo(3)

    // await getLSTConfig()
    // await getUserPoolInfo(3, "0x88b01565eA3d429d6931E2Befd40de6cc0d799B2")
    // await getUserPoolInfo(4, TestAccountSinger.address)
    // await getUserPoolInfo(71, AliceSigner.address)
    // console.log((await iWrappedTDOTCall.withdrawRate()).toString())
    // await iStakingCall.stake(66, "50000000000")
    // 81
    // await iStakingCall.addPool(LCDOT_13 as string)
    // await iStakingCall.stake(81, "50000000000")
    // await iStakingCall.convertLSTPool(81, ConvertType.LCDOT2LDOT)
    // await getPoolInfo(66, 691507)
    // await getUserPoolInfo(66, AliceSigner.address)
    // await getUserPoolInfo(67, AliceSigner.address)
    // await getUserPoolInfo(0, "0xF31228A08867EA0680a4D8793e709AB335c151Aa")
    // await getUserPoolInfo(3, "0xe4c5e7eA3d8Da7607A50D74C11B0d318A2ac9AF8", 4746837)
    // await getLstTVL()
    // console.log(claimRewardFilter)
    // const nowTime = await getBlockTime(provider)
    // console.log('当前区块时间为: ', nowTime);
    // console.log(await getHistoryPrice(572936))
    // const stakeEvents = await iStakingCall.getStakes(865313, 865315)
    // console.log(stakeEvents);
    
    // convertJsonToExcel(stakeEvents, "../data/export/stakes.xlsx")
    // const filterRewardRule = await iStakingCall.filterRewardRule(320862, 602222, nowTime, [64, 65, 66, 67, 68, 69, 70, 71])
    // console.log(filterRewardRule)
    // console.log(await iStakingCall.getAccounts(320862, 602222));
    // const prices = await getHistoryPrice(608936)
    // console.log(prices);
    
    // console.log(await iStakingCall.getTotalRewardPaid(500936, 608936, prices, [64, 65, 66, 67, 68, 69, 70, 71]))
    // const claimRewardFilter = iStakingCall.proxyContract.filters.ClaimReward()

    // await getApr()
    // await getBlockByTxHash("0x16bb3be3b89f7eb4e7607fda8d24135fe494aa5b7f150c1bb4956601c900e943")
    // const shareType = await iStakingCall.shareTypes(poolId);
    // const iLiquidCrowdloan = new ILiquidCrowdloanCall(AliceSigner)
    // console.log("getRedeemCurrency", getTokenName(await iLiquidCrowdloan.getRedeemCurrency()))
    // // const rewards = await iStakingCall.rewards(poolId, AliceSigner.address, DOT as string, block)

    // console.log("PoolIndex", (await iStakingCall.PoolIndex()).toString())
    // await iStakingCall.setPoolOperationPause(66, Operation.Unstake, false)
    // await iStakingCall.setPoolOperationPause(66, Operation.ClaimRewards, false)
    // const iHomaCall = new IHomaCall(AliceSigner)
    // const block = "latest"//567064
    // console.log("CommissionRate", (await iHomaCall.getCommissionRate(block)).toString())
    // console.log("EstimatedRewardRate", (await iHomaCall.getEstimatedRewardRate(block)).toString())
    // console.log("ExchangeRate", (await iHomaCall.getExchangeRate(block)).toString())
    // console.log("MatchFee", (await iHomaCall.getFastMatchFee(block)).toString())
    // const wallet = new Wallet(api);
    // await wallet.isReady
    // const homa = new Homa(api, wallet);
    // await homa.isReady
    // const env = await homa.getEnv();
    // // total staking token in homa
    // console.log("totalStaking", env.totalStaking.toString())
    // // total liquid token in homa
    // console.log("totalLiquidity", env.totalLiquidity.toString())
    // // homa apy
    // console.log("apy", env.apy.toString())
    // // homa exchange apy
    // console.log("exchangeRate", env.exchangeRate.toString())
    // // min mint threshold
    // console.log("mintThreshold", env.mintThreshold.toString())
    // // min redeem threshold
    // console.log("redeemThreshold", env.redeemThreshold.toString())
    // // staking soft cap
    // console.log("stakingSoftCap", env.stakingSoftCap.toString())
    // const mintAmount = new FixedPointNumber("47.4697868494", 10);
    // const result = await homa.getEstimateMintResult(mintAmount)
    // console.log(result.receive.toString());
    // console.log(result.pay.toString());

    // const stableAsset = new StableAssetRx(api as any);


    // const approveTx = await provider.getTransaction("0x8650e911946b468652897c086dc8a08bac9d9474fc54acc62b497349cb720d94")
    // console.log(approveTx);
    // console.log(approveTx.gasLimit.toString(), approveTx.gasPrice?.toString());
    // console.log((await iTDOTCall.erc20Contract.estimateGas.approve(ProxyAddress as string, MAX_UINT_AMOUNT)).toString())

    // const stakeTx = await provider.getTransaction("0xdd31e6b9ab56343df7af0a23c4cb51a023322d5ed2736499ff8ba51036eef066")
    // console.log(stakeTx);
    // console.log(stakeTx.gasLimit.toString(), approveTx.gasPrice?.toString());
    // console.log((await iStakingCall.proxyContract.estimateGas.stake(2, "50000000000")).toString())
    // console.log('completed')
    process.exit()

})()