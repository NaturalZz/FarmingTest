import { ethers, utils } from "ethers";
import {} from '@acala-network/types';
import { AcalaJsonRpcProvider, decodeRevertMsg } from "@acala-network/eth-providers";
import { ASSET_ADDRESS, ACCOUNT, ProxyAddress, HOMA, STABLE_ASSET, WTDOT, ALICE_ETH, TEST_ACCOUNT, LIQUID_CROWDLOAN, MAX_UINT_AMOUNT, BLACK_HOLE, PER_DAY_SEC, RPC_URL, CURRENT_RPC, ACALA_API_ENDPOINTS, CURRENT_CHAIN_NAME, TAI, TokenSymbol, StableAssetStakeUtil, getConvertor, CURRENT_CHAIN_ID, Lottery, DexStakeUtil } from "../utils/config";
import UpgradeableStakingLSTABI from '../contracts/UpgradeableStakingLST.json'
import { expect, use } from 'chai'
import { IStakingCall } from '../call/IStakingCall'
import { ILiquidCrowdloanCall } from '../call/ILiquidCrowdloanCall'
import { IHomaCall } from "../call/IHomaCall";
import { IWrappedTDOTCall } from "../call/IWrappedTDOT";
import { BlockNumber, ConvertType, GENESIS_HASH, Operation, UserAddress } from "../utils/type";
import { IERC20Call, erc20ABI } from "../call/IERC20Call";
import { solidity } from "ethereum-waffle";
import { formatUnits } from "ethers/lib/utils";
import BigNumber from "bignumber.js";
import { ASSET_METADATAS, getTokenInfo, getTokenName } from "../utils/assets"
import { formatDecimal, truncationDecimal } from "../utils/decimal";
import { addressCompare, getBlockByTXHash, getBlockTime, getEvmEvents } from "../utils/ethHelper";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { type ApiDecoration } from '@polkadot/api/types';
import { getTokenPrices } from "../utils/getTokenPrices";
import { Homa, Wallet } from '@acala-network/sdk';
import { FixedPointNumber } from "@acala-network/sdk-core";
import { convertJsonToExcel, saveJsonToFile } from "../utils/fileUtils";
import { IStableAssetStakeUtilCall } from '../call/iStableAssetStakeUtilCall';
import { IWrappedTUSDCall } from "../call/IWrappedTUSD";
import { IStakingLstV2Call } from "../call/iStakingLSTV2Call";
import { decodeAddress } from '@polkadot/util-crypto';
import { ILotteryCall } from "../call/iLottery";
import { IAcalaPointCall } from "../call/IAcalaPoint";
import { IDexStakeUtilCall } from "../call/iDexStakeUtil"
import { IDexCall } from "../call/IDex";
import { LiquidityPoolHelper } from '@acala-network/sdk-swap';
import { IDexV2Call } from "../call/IDexV2";

use(solidity);

(async () => {
    const provider = new AcalaJsonRpcProvider(CURRENT_RPC)
    console.log("Now network: ", CURRENT_CHAIN_NAME);
    console.log(await provider.getNetwork());
    
    const api = new ApiPromise({
        provider: new WsProvider(Object.values(ACALA_API_ENDPOINTS[CURRENT_CHAIN_NAME])),
    });
    await api.isReady

    const TestAccountSinger = new ethers.Wallet(TEST_ACCOUNT as string, provider)
    console.log("Test Account Address: ", TestAccountSinger.address);
    
    // console.log((await TestAccountSinger.getTransactionCount()).toString());
    
    const iJitoStakingCall = new IStakingLstV2Call(TestAccountSinger)
    const iStakingCall = new IStakingLstV2Call(TestAccountSinger)// new IStakingCall(TestAccountSinger)
    const iACACall = new IERC20Call(ASSET_ADDRESS.ACA, TestAccountSinger)
    // iACACall.contract.balanceOf(TestAccountSinger.address).then((res: string) => {
    //     console.log(res.toString());
    // })
    // await iACACall.transfer("0xcac350C6b72B7EBdd2f26621Fb4d224f578e3Aef", "1000000000000")
    // console.log((await iACACall.balanceOf("0xfCcF778F68564a88196E3713A0B7C23C42A4CCaE", 5678000)).toString());
    // console.log((await iACACall.balanceOf("0xfCcF778F68564a88196E3713A0B7C23C42A4CCaE", 5678032)).toString());
    // console.log((await provider.getBalance("0x46dbcbde55be6cc4ce0c72c8d48bf61eb19d6be0")).toString());
    
    // await iACACall.transfer("0x196a493c1f818F2491e9e1d71d54c8be3dFa41c8", "18000000000000")
    // await iACACall.transfer("0xc9C8F9ce39C3EB9C4c53a5Bf0c7751eB9b426F77", '1000000000000')
    const iDOTCall = new IERC20Call(ASSET_ADDRESS.DOT, TestAccountSinger)
    // console.log((await iDOTCall.balanceOf("0xcd7f239655EAEF9850eec8b07aC46F7a7Fde70C4")).toString());
    
    // await iDOTCall.transfer("0x56557F80158188Ada9f665C217BC6e5Bc97AC738", '200000000000')
    // await iDOTCall.approve(ProxyAddress, 0)
    const iLDOTCall = new IERC20Call(ASSET_ADDRESS.LDOT, TestAccountSinger)
    // await iLDOTCall.transfer("0x56557F80158188Ada9f665C217BC6e5Bc97AC738", '200000000000')
    // await iLDOTCall.approve(DexStakeUtil, MAX_UINT_AMOUNT)
    // console.log((await iLDOTCall.balanceOf(TestAccountSinger.address)).toString());

    // const iTDOTCall = new IERC20Call(TDOT, TestAccountSinger)
    // const balance = await iTDOTCall.balanceOf(TestAccountSinger.address) 
    // await iTDOTCall.transfer(AliceSigner.address, balance.toString())
    // const approveTx = await iTDOTCall.approve(ProxyAddress, MAX_UINT_AMOUNT)
    // console.log(approveTx);
    const iLCDOTCall = new IERC20Call(ASSET_ADDRESS.LCDOT, TestAccountSinger)
    // await iLCDOTCall.transfer("0xfCcF778F68564a88196E3713A0B7C23C42A4CCaE", "1000000000000")
    // console.log((await iLCDOTCall.balanceOf(AliceSigner.address)).toString());
    // console.log(await iLCDOTCall.approve(ProxyAddress, "0"))
    // console.log(await iLCDOTCall.allowance(AliceSigner.address, ProxyAddress));
    const iUSDCCall = new IERC20Call(ASSET_ADDRESS.USDC, TestAccountSinger)
    // console.log(await iUSDCCall.approve(StableAssetStakeUtil, "0"))
    const iUSDCetCall = new IERC20Call(ASSET_ADDRESS.USDCet, TestAccountSinger)
    // console.log(await iUSDCetCall.approve(StableAssetStakeUtil, "0"))

    const iUSDTCall = new IERC20Call(ASSET_ADDRESS.USDT, TestAccountSinger)
    // console.log(await iUSDTCall.approve(StableAssetStakeUtil, "0"))

    const iTUSDCall = new IERC20Call(ASSET_ADDRESS.TUSD, TestAccountSinger)
    // console.log(await iTUSDCall.approve(StableAssetStakeUtil, "0"))
    // const approveTx = await provider.getTransaction("0x7660eeda95390150623dea054585396986be2c97a63b63a88bfe3f5e75186bb3")
    // console.log(approveTx);
    // console.log(approveTx.gasLimit.toString(), approveTx.gasPrice?.toString());
    // console.log((await iTUSDCall.contract.estimateGas.approve(StableAssetStakeUtil, MAX_UINT_AMOUNT)).toString());
    

    
    // const iWTDOTCall = new IERC20Call(WTDOT, AliceSigner)
    // const iWTUSDCall = new IERC20Call(ASSET_ADDRESS.TUSD, AliceSigner)
    
    const iWrappedTDOTCall = new IWrappedTDOTCall(TestAccountSinger)
    // await iWrappedTDOTCall.withdraw("47852697321")
    // console.log((await iWrappedTDOTCall.balanceOf(TestAccountSinger.address)).toString())
    // console.log((await iWrappedTDOTCall.depositRate()).toString())
    // console.log((await iWrappedTDOTCall.withdrawRate()).toString())
    const iWrappedTUSDCall = new IWrappedTUSDCall(TestAccountSinger)
    const iJitoSOL = new IERC20Call(ASSET_ADDRESS.JitoSOL, TestAccountSinger)
    // await iJitoSOL.approve(DexStakeUtil, MAX_UINT_AMOUNT)
    // await iJitoSOL.transfer("0xBbBBa9Ebe50f9456E106e6ef2992179182889999", "500000000000")
    // await iJitoSOL.transfer("0x786Ca23eDB8BdB64e81F610C74888F8E350BD9dE", "100000000")
    // await iJitoSOL.transfer("0x0475Ba3899800e847aA4fF6e3D9B3B0720bd36aB", "1")

    console.log((await iJitoSOL.balanceOf(TestAccountSinger.address)).toString());
    // console.log((await iJitoSOL.balanceOf("0x0475Ba3899800e847aA4fF6e3D9B3B0720bd36aB")).toString());
    // console.log((await iJitoSOL.balanceOf("0x786Ca23eDB8BdB64e81F610C74888F8E350BD9dE")).toString());


    // await iJitoStakingCall.stake(7, "1000000000")
    const iJTO = new IERC20Call(ASSET_ADDRESS.JTO, TestAccountSinger)
    // console.log((await iJTO.balanceOf(TestAccountSinger.address)).toString());
    const iLDOT_JitoSOL_LP = new IERC20Call(ASSET_ADDRESS.LDOT_JitoSOL_LP, TestAccountSinger)
    // console.log(await iLDOT_JitoSOL_LP.decimals(), await iLDOT_JitoSOL_LP.symbol());

    const iDEX = new IDexCall(TestAccountSinger)
    // const liquidityPool = await iDEX.getLiquidityPool(ASSET_ADDRESS.LDOT, ASSET_ADDRESS.JitoSOL)
    // console.log(liquidityPool[0].toString(), liquidityPool[1].toString());
    // console.log(await iDEX.getLiquidityTokenAddress(ASSET_ADDRESS.LDOT, ASSET_ADDRESS.JitoSOL))
    // const iDEXV2 = new IDexV2Call(TestAccountSinger)
    // await iDEXV2.addProvision(ASSET_ADDRESS.JitoSOL, ASSET_ADDRESS.LDOT, '1000000000', '2430000000000')
    // const provisionPool = await iDEXV2.getProvisionPool(ASSET_ADDRESS.LDOT, ASSET_ADDRESS.JitoSOL)
    // console.log(provisionPool[0].toString(), provisionPool[1].toString());
    // console.log(await iDEXV2.getInitialShareExchangeRate(ASSET_ADDRESS.LDOT, ASSET_ADDRESS.JitoSOL));
    
    // console.log(await iDEXV2.addProvisionEncode(ASSET_ADDRESS.JitoSOL, ASSET_ADDRESS.LDOT, '1000000000000', '2430000000000000'))
    const iDexStakeUtil = new IDexStakeUtilCall(TestAccountSinger)
    // await iDexStakeUtil.addLiquidityAndStake(ASSET_ADDRESS.LDOT, "500000000", ASSET_ADDRESS.JitoSOL, "1", 1, 7)
    // await iDexStakeUtil.swapAndAddLiquidityAndStake(ASSET_ADDRESS.LDOT, '10000000000', ASSET_ADDRESS.JitoSOL, '500000000', [ASSET_ADDRESS.JitoSOL, ASSET_ADDRESS.LDOT], '', 0, 7)
    // console.log("owner", await iStakingCall.owner())
    // console.log("poolIndex", (await iStakingCall.PoolIndex()).toString())
    // console.log(iStakingCall.unstakeEncode(18, '1000000000001'));
    // console.log(await iStakingCall.pausedPoolOperations(18, Operation.Unstake))
    
    // await iDOTCall.approve(ProxyAddress as string, 0)
    // await iDOTCall.transfer("0xAad97A7cb9fF814518b8B878cc2F7fc68774A9DA", "100000000000")

    // const poolId = 70 //Number((await iStakingCall.PoolIndex()).toString()) - 1
    // const amount = '100000000000'
    // // const deployTx = iStakingCall.proxyContract.deployTransaction
    // // console.log(deployTx);
    // // await iUSDCetCall.approve(StableAssetStakeUtil, MAX_UINT_AMOUNT)
    // // console.log(await iUSDCetCall.allowance(TestAccountSinger.address, StableAssetStakeUtil));
    
    // // await iUSDTCall.approve(StableAssetStakeUtil, MAX_UINT_AMOUNT)
    // // console.log(await iUSDTCall.allowance(TestAccountSinger.address, StableAssetStakeUtil));

    // await iStakingCall.stake(0, '10000000000')
    // // await iTUSDCall.approve(StableAssetStakeUtil, MAX_UINT_AMOUNT)
    // // const iStableAssetStakeUtilCall = new IStableAssetStakeUtilCall(TestAccountSinger)
    // // console.log(await iStableAssetStakeUtilCall.stableAsset());
    // // await iStableAssetStakeUtilCall.mintAndStake(1, [1000000, 1000000], ASSET_ADDRESS.TUSD, ASSET_ADDRESS.WTUSD, 4)
    // // await iStableAssetStakeUtilCall.wrapAndStake(ASSET_ADDRESS.TUSD, 1000000, ASSET_ADDRESS.WTUSD, 4)

    const prices = await getTokenPrices()
    console.log(prices);
    // console.log(await iStakingCall.filterNewPool(6536775, 6537371));
    
    // await iStakingCall.convertedStakeShare("0xca790d3d0482d1bfaffa3e075322cd73d7b68d0ca4545ccc7ac56b790763b638", 3)

    // 4538300, 5627769
    // console.log(await iStakingCall.filterRewardRuleUpdate(4538300, 5364200));
    // const stakes = await iStakingCall.filterStakes(6536973, 6750615, [6])
    // console.log(stakes);
    // convertJsonToExcel(stakes, "./data/stake.csv")
    // const unstakes = await iStakingCall.filterUnStakes(6536973, 6750615, [6])
    // convertJsonToExcel(unstakes, "./data/unstake.csv")

    // const logs = await provider.getLogs({address: ProxyAddress, fromBlock: 6536973, toBlock: 6750615, topics: ['0x5af417134f72a9d41143ace85b0a26dce6f550f894f2cbc1eeee8810603d91b6']})
    // console.log(logs, logs.length);
    
    // console.log(await iWrappedTDOTCall.balanceOf(TestAccountSinger.address))
    // console.log((await iLCDOTCall.allowance("0x7eF3D3d72c3cDd897c6560677cC91f4237aE7443", ProxyAddress as string, 4627290)).toString());
    // await iStakingCall.getAllBalanceInfo("0xe3234f433914d4cfCF846491EC5a7831ab9f0bb3", 6625007)
    await iStakingCall.getAllBalanceInfo("0x905c015e38c24ed973fd6075541a124c621fa743")

    // await iStakingCall.getAllBalanceInfo(TestAccountSinger.address, 6625083)
    // await iStakingCall.getAllBalanceInfo(TestAccountSinger.address)
    // await iWrappedTUSDCall.approve(ProxyAddress, MAX_UINT_AMOUNT)

    // await iStakingCall.stake(7, '1000000000')
    // await iStakingCall.exit(7)

    // console.log(await iStakingCall.poolConvertors(0))

    // await iStakingCall.updateRewardRule(66, LDOT as string, '200000000000', '1695358000')
    // const tx = await provider.getTransactionReceipt("0x2e757cc3696c6df94eb90ee00755f4cc4f81c1526e07a045e3e906284881131c")
    // console.log(tx);
    // console.log(tx.gasUsed.toString(), tx.effectiveGasPrice.toString(), tx.cumulativeGasUsed.toString());
    // console.log(utils.toUtf8String("0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002c4d756c746963757272656e6379205472616e73666572206661696c65643a2042616c616e6365546f6f4c6f77"));
    
    // const stakeTx = await iStakingCall.stake(2, "50000000000")
    // console.log(stakeTx);
    // console.log(await iStakingCall.shareTypes(6))
    // console.log(await iStakingCall.paused())
    // await iStakingCall.getPoolInfo(0, prices, 6811163)
    // await iStakingCall.getPoolInfo(1, prices, 6811163)
    // await iStakingCall.getPoolInfo(2, prices, 6811163)
    // await iStakingCall.getPoolInfo(3, prices, 6811163)
    // await iStakingCall.getPoolInfo(4, prices, 6811163)
    // await iStakingCall.getPoolInfo(5, prices, 6811163)
    // await iStakingCall.getPoolInfo(6, prices)
    // await iStakingCall.getPoolInfo(7, prices)

    // await getLSTConfig()
    // await iStakingCall.getUserPoolInfo(2, "0x32c4E91Bf5942d06e5B0d44B58Bda28C2C7af517")

    // await iStakingCall.getUserPoolInfo(7, TestAccountSinger.address)
    // console.log((await iWrappedTDOTCall.withdrawRate()).toString())
    // await iStakingCall.stake(66, "50000000000")
    // 81
    // await iStakingCall.addPool(LCDOT_13 as string)
    // await iStakingCall.stake(81, "50000000000")
    // await iStakingCall.convertLSTPool(81, ConvertType.LCDOT2LDOT)
    // await getLstTVL()
    // console.log(claimRewardFilter)
    // const nowTime = await getBlockTime(provider)
    // console.log('当前区块时间为: ', nowTime);
    // console.log(await getHistoryPrice(572936))

    // console.log((await iStakingCall.convertInfos(0, 5725353)).convertedExchangeRate.toString());
    
    // const stakeEvents = await iStakingCall.filterStakes(6879189, 6897262, [6])
    // console.log(stakeEvents.length);
    
    // await iStakingCall.filterStakeShare(5698207)
    // const unstakeEvents = await iStakingCall.filterUnStakes(4538300, 6289507)
    // console.log(unstakeEvents.length);
    
    
    // convertJsonToExcel(stakeEvents, "../data/export/jitoStakes.xlsx")
    // convertJsonToExcel(unstakeEvents, "../data/export/unStakes.xlsx")
    // const filterRewardRule = await iStakingCall.filterRewardRule(320862, 602222, nowTime, [64, 65, 66, 67, 68, 69, 70, 71])
    // console.log(filterRewardRule)
    // console.log(await iStakingCall.getAccounts(320862, 602222));
    // const prices = await getHistoryPrice(608936)
    // console.log(prices);
    
    // console.log(await iStakingCall.getTotalRewardPaid(500936, 608936, prices, [64, 65, 66, 67, 68, 69, 70, 71]))
    // const claimRewardFilter = iStakingCall.proxyContract.filters.ClaimReward()

    // await iStakingCall.getApr()
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

    // const approveTx = await provider.getTransaction("0x8650e911946b468652897c086dc8a08bac9d9474fc54acc62b497349cb720d94")
    // console.log(approveTx);
    // console.log(approveTx.gasLimit.toString(), approveTx.gasPrice?.toString());
    // console.log((await iTDOTCall.erc20Contract.estimateGas.approve(ProxyAddress as string, MAX_UINT_AMOUNT)).toString())

    // const iLottery = new ILotteryCall(TestAccountSinger)
    // // console.log(await iLottery.owner());
    // console.log("endTime: ", (await iLottery.endTime()).toString());
    // console.log("duration: ", (await iLottery.duration()).toString());
    // console.log("entryFee: ", (await iLottery.entryFee()).toString());
    // console.log("maxTicketsCount: ", (await iLottery.maxTicketsCount()).toString());
    // console.log("ticketsSold: ", (await iLottery.ticketsSold()).toString());
    // console.log("isOpen: ", await iLottery.isOpen());
    // console.log("ticketRemaining: ", (await iLottery.ticketRemaining()).toString());
    // console.log("timeRemaining: ", (await iLottery.timeRemaining()).toString());

    // const iAP = new IAcalaPointCall(TestAccountSinger)
    // // await iAP.mint(TestAccountSinger.address, "20000000000000000000")
    // // await iAP.mint("0x82a258cb20e2adb4788153cd5eb5839615ece9a0", "9999999999999999999")
    // // console.log(await iAP.whitelistedMinters(TestAccountSinger.address));
    // // console.log((await iAP.decimals()).toString());
    // console.log((await iAP.balanceOf(Lottery)).toString());
    // console.log((await iAP.balanceOf(TestAccountSinger.address)).toString());
    // console.log(decodeRevertMsg("0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000264445582041646450726f766973696f6e206661696c65643a2042616c616e6365546f6f4c6f77"));
    
    process.exit()

})()