import { ethers } from "ethers";
import { AcalaJsonRpcProvider } from '@acala-network/eth-providers';
import UpgradeableStakingLSTV2ABI from '../contracts/UpgradeableStakingLSTV2ABI.json'
import { ASSET_ADDRESS, BLACK_HOLE, PER_DAY_SEC, ProxyAddress, TokenSymbol } from "../utils/config";
import { Operation, UserAddress, ContractAddress, Amount, BlockNumber, ConvertType } from "../utils/type";
import { IERC20Call, erc20ABI } from "./IERC20Call";
import { getEvmEvents, parseEvmEvents } from "../utils/ethHelper";
import { getTokenInfo, getTokenName, ASSET, ASSET_METADATAS } from "../utils/assets";
import BigNumber from "bignumber.js";
import { formatDecimal } from "../utils/decimal";
import { IWrappedTDOTCall } from "./IWrappedTDOT";

const stakingLstV2Iface = new ethers.utils.Interface(UpgradeableStakingLSTV2ABI);

export class IStakingLstV2Call {
    provider: ethers.providers.JsonRpcProvider | AcalaJsonRpcProvider | ethers.Wallet
    contract: ethers.Contract
    iface = stakingLstV2Iface
    iWrappedTDOTCall
    constructor(provider: ethers.providers.JsonRpcProvider | AcalaJsonRpcProvider | ethers.Wallet) {
        this.provider = provider
        this.contract = new ethers.Contract(
            ProxyAddress,
            UpgradeableStakingLSTV2ABI,
            provider
        );
        this.iWrappedTDOTCall = new IWrappedTDOTCall(this.provider as any)
    }
    async DOT() {
        return await this.contract.DOT();
    }

    async HOMA() {
        return await this.contract.HOMA();
    }

    async HOMA_MINT_THRESHOLD(blockTag: BlockNumber = "latest") {
        return await this.contract.HOMA_MINT_THRESHOLD({ blockTag });
    }

    async LCDOT() {
        return await this.contract.LCDOT();
    }

    async LDOT() {
        return await this.contract.LDOT();
    }

    async LIQUID_CROWDLOAN() {
        return await this.contract.LIQUID_CROWDLOAN();
    }

    async MAX_REWARD_TYPES() {
        return await this.contract.MAX_REWARD_TYPES();
    }

    async STABLE_ASSET() {
        return await this.contract.STABLE_ASSET();
    }

    async TDOT() {
        return await this.contract.TDOT();
    }

    async WTDOT() {
        return await this.contract.WTDOT()
    }

    /**
     * 获取下一个池的索引。它等于当前池的数量。
     * @returns BigNumber
     */
    async PoolIndex(blockTag: BlockNumber = "latest") {
        return await this.contract.poolIndex({ blockTag });
    }

    /**
     * 查看用户在池子中的份额
     * @param poolId 池子的index
     * @param who 用户钱包地址
     * @returns BigNumber
     */
    async shares(poolId: number, who: UserAddress, blockTag: BlockNumber = "latest") {
        return await this.contract.shares(poolId, who, { blockTag });
    }

    /**
     * 查看池子的总份额
     * @param poolId 池子的index
     * @returns BigNumber
     */
    async totalShares(poolId: number, blockTag: BlockNumber = "latest") {
        return await this.contract.totalShares(poolId, { blockTag });
    }

    /**
     * 查看池子的共享类型 也就是查看是哪个erc20的池子
     * @param poolId 
     * @param blockTag 
     * @returns 
     */
    async shareTypes(poolId: number, blockTag: BlockNumber = "latest") {
        return await this.contract.shareTypes(poolId, { blockTag });
    }

    /**
     * 查看用户未提取奖励
     * @param poolId 池子的index
     * @param who 用户钱包地址
     * @param rewardType 奖励币种的合约地址
     * @returns BigNumber
     */
    async earned(poolId: number, who: UserAddress, rewardType: ContractAddress, blockTag: BlockNumber = "latest") {
        return await this.contract.earned(poolId, who, rewardType, { blockTag });
    }

    /**
     * 查看用户未领取奖励的情况
     * @param {number} poolId 池子的index
     * @param {string} who 用户钱包地址
     * @param {string} rewardType 奖励币种的合约地址
     * @returns 
     */
    async rewards(poolId: number, who: UserAddress, rewardType: ContractAddress, blockTag: BlockNumber = "latest") {
        return await this.contract.rewards(poolId, who, rewardType, { blockTag });
    }

    /**
     * 获取池子的灼烧利率
     * @param poolId 池子的index
     * @returns BigNumber
     */
    async rewardsDeductionRates(poolId: number, blockTag: BlockNumber = "latest") {
        return await this.contract.rewardsDeductionRates(poolId, { blockTag });
    }

    /**
     * 获取合约的归属人地址
     * @returns 用户地址
     */
    async owner(blockTag: BlockNumber = "latest") {
        return await this.contract.owner({ blockTag });
    }

    /**
     * 获取合同是否暂停
     * @returns Boolean
     */
    async paused(blockTag: BlockNumber = "latest") {
        return await this.contract.paused({ blockTag });
    }

    async rewardPerShare(poolId: number, rewardType: ContractAddress, blockTag: BlockNumber = "latest") {
        return await this.contract.rewardPerShare(poolId, rewardType, { blockTag });
    }

    /**
     * 
     * @param poolId 要查询的池子index
     * @param rewardType 奖励币种的合约地址
     * @param blockTag 指定区块高度查询
     * @returns {rewardRate: 每秒奖励数量=rewardAmountAdd / rewardDuration,
     * endTime: 奖励持续时间=notifyRewardRule事件发生的时间 + rewardDuration,
     * rewardRateAccumulated, lastAccumulatedTime}
     */
    async rewardRules(poolId: number, rewardType: ContractAddress, blockTag: BlockNumber = "latest") {
        return await this.contract.rewardRules(poolId, rewardType, { blockTag });
    }

    /**
     * 获取池子的reward奖励币种
     * @param poolId 要查询的池子index
     * @returns 币种地址Array[address]
     */
    async rewardTypes(poolId: number, blockTag: BlockNumber = "latest") {
        return await this.contract.rewardTypes(poolId, { blockTag });
    }

    async lastTimeRewardApplicable(poolId: number, rewardType: ContractAddress, blockTag: BlockNumber = "latest") {
        return await this.contract.lastTimeRewardApplicable(poolId, rewardType, { blockTag });
    }

    /**
     * 获取池子转化情况
     * @param {number} poolId 
     * @returns ConvertInfo {convertedShareType: address 币种地址, convertedExchangeRate: BigNumber}
     */
    async convertInfos(poolId: number, blockTag: BlockNumber = "latest") {
        return await this.contract.convertInfos(poolId, { blockTag });
    }

    async poolConvertors(poolId: number, blockTag: BlockNumber = "latest") {
        return await this.contract.poolConvertors(poolId, { blockTag });
    }

    /**
     * 
     * @param poolId 池子index
     * @param who 用户钱包地址
     * @param rewardType 奖励币种的合约地址
     * @returns 
     */
    async paidAccumulatedRates(poolId: number, who: UserAddress, rewardType: ContractAddress, blockTag: BlockNumber = "latest") {
        return await this.contract.paidAccumulatedRates(poolId, who, rewardType, { blockTag });
    }
    /**
     * 获取池子某个功能是否被禁用
     * @param {number} poolId 池子index
     * @param {number} operation 0: Stake, 1: Unstake, 2: ClaimRewards
     * @returns {Boolean}
     */
    async pausedPoolOperations(poolId: number, operation: Operation, blockTag: BlockNumber = "latest") {
        return await this.contract.pausedPoolOperations(poolId, operation, { blockTag });
    }

    // --------------交易--------------
    // 初始化
    initializeEncode(
        dot: ContractAddress,
        lcdot: ContractAddress,
        ldot: ContractAddress,
        tdot: ContractAddress,
        homa: ContractAddress,
        stableAsset: ContractAddress,
        liquidCrowdloan: ContractAddress,
        wtdot: ContractAddress
    ) {
        return stakingLstV2Iface.encodeFunctionData("initialize", [
            dot,
            lcdot,
            ldot,
            tdot,
            homa,
            stableAsset,
            liquidCrowdloan,
            wtdot
        ]);
    }

    async addPool(shareType: ContractAddress) {
        const tx = await this.contract.addPool(shareType)
        await tx.wait()

        return tx
    }

    addPoolEncode(shareType: ContractAddress) {
        // 构造一个调用 addPool 的 callData， 发起调用时， target 为 proxy 合约地址
        return stakingLstV2Iface.encodeFunctionData("addPool", [shareType]);
    }

    approveEncode(amount: Amount) {
        // erc20 授权 proxy 合约
        const erc20Iface = new ethers.utils.Interface(erc20ABI);
        return erc20Iface.encodeFunctionData("approve", [ProxyAddress, amount]);
    }

    async stake(poolId: number, amount: Amount) {
        const tx = await this.contract.stake(poolId, amount)
        await tx.wait()

        return tx
    }

    stakeEncode(poolId: number, amount: Amount) {
        return stakingLstV2Iface.encodeFunctionData("stake", [poolId, amount]);
    }

    async convertedStakeShare(txHash: string, poolIndex: number) {
        const { blockNumber: stakeBlockNumber } = await this.contract.getTransaction(txHash) as { blockNumber : number }
        const shareTypes = await this.shareTypes(poolIndex)
        const { convertedShareType, convertedExchangeRate } = await this.convertInfos(poolIndex, stakeBlockNumber - 1)     

        // 判断转化之后是不是WTDOT
        const isWTDOT = ethers.utils.getAddress(convertedShareType) == ethers.utils.getAddress(ASSET_ADDRESS.WTDOT)
        const isTDOT = ethers.utils.getAddress(convertedShareType) == ethers.utils.getAddress(ASSET_ADDRESS.TDOT)
        const isLDOT = ethers.utils.getAddress(convertedShareType) == ethers.utils.getAddress(ASSET_ADDRESS.LDOT)
        const isDOT = ethers.utils.getAddress(shareTypes) == ethers.utils.getAddress(ASSET_ADDRESS.DOT)
        const isLCDOT = ethers.utils.getAddress(shareTypes) == ethers.utils.getAddress(ASSET_ADDRESS.LCDOT)
        let expectConvertedAmount = ethers.BigNumber.from(0)
        // 如果shareToken是DOT 并且 转化为了WTDOT，需要将DOT先转成TDOT再转成WTDOT
        if ((isDOT || isLCDOT) && (isWTDOT || isTDOT)) {
            const iTDOTCall = new IERC20Call(ASSET_ADDRESS.TDOT, this.provider as ethers.providers.JsonRpcProvider | ethers.Wallet)
            const iWTDOTCall = new IWrappedTDOTCall(this.provider as ethers.providers.JsonRpcProvider | ethers.Wallet)
            // 查询tDOT mint了多少
            const [tDOTTotalSupllyBefore, tDOTTotalSupllyAfter] = await Promise.all([
                iTDOTCall.totalSupply(stakeBlockNumber - 1),
                iTDOTCall.totalSupply(stakeBlockNumber)
            ])
            const tDOTDiff = tDOTTotalSupllyAfter.sub(tDOTTotalSupllyBefore)
            console.log("tDOT mint: ", tDOTDiff.toString());

            const depositRate = await iWTDOTCall.depositRate(stakeBlockNumber - 1)
            expectConvertedAmount = tDOTDiff.mul(depositRate).div("1000000000000000000")
            // const redeemCurrency = iLiquidCrowdloanCall.getRedeemCurrency(stakeBlockNumber - 1)
        } else if (isLDOT) {
            const iLDOTCall = new IERC20Call(ASSET_ADDRESS.LDOT, this.provider as ethers.providers.JsonRpcProvider | ethers.Wallet)
            // 查询LDOT mint了多少
            const [lDOTTotalSupllyBefore, lDOTTotalSupllyAfter] = await Promise.all([
                iLDOTCall.totalSupply(stakeBlockNumber - 1),
                iLDOTCall.totalSupply(stakeBlockNumber)
            ])
            expectConvertedAmount = lDOTTotalSupllyAfter.sub(lDOTTotalSupllyBefore)
            
        }
        console.log(expectConvertedAmount.toString());
        
        const expectSharesAdd = expectConvertedAmount.mul("1000000000000000000").div(convertedExchangeRate);
        console.log("expectSharesAdd", expectSharesAdd.toString());
        return expectSharesAdd
    }

    async stakeTo(poolId: number, amount: Amount, receiver: UserAddress) {
        const tx = await this.contract.stakeTo(poolId, amount, receiver)
        await tx.wait()

        return tx
    }

    stakeToEncode(poolId: number, amount: Amount, receiver: UserAddress) {
        return stakingLstV2Iface.encodeFunctionData("stakeTo", [poolId, amount, receiver]);
    }

    // async calculateStakeAmount(poolId: number, stakeAmount: Amount, blockTag: BlockNumber = "latest") {
    //     const convertInfos = await this.convertInfos(poolId, blockTag)
    //     const formatConvertedExchangeRate = formatDecimal(convertInfos.convertedExchangeRate, -18)
    // }

    async filterNewPool(startBlock: number, endBlock: number) {
        const filters = this.contract.filters.NewPool()
        const events = await getEvmEvents(filters, startBlock, endBlock)
        const result: any[] = []
        events.forEach((log: any) => {
            const parsed = this.iface.parseLog({
                data: log.data,
                topics: log.topics.filter((x: any) => x) as string[],
            });

            const [poolId, shareType] = parsed.args;
            result.push({
                ...log,
                poolId: poolId.toString() as string,
                shareType: shareType.toString() as string,
            })
        })
        return result
    }

    async filterRewardRuleUpdate(startBlock: number, endBlock: number) {
        const filters = this.contract.filters.RewardRuleUpdate()
        const events = await getEvmEvents(filters, startBlock, endBlock)
        const result: any[] = []
        events.forEach((log: any) => {
            const parsed = this.iface.parseLog({
                data: log.data,
                topics: log.topics.filter((x: any) => x) as string[],
            });

            const [poolId, rewardType, rewardRate, endTimeStamp] = parsed.args;
            const endTime = new Date(Number(endTimeStamp) * 1000)
            endTime.setTime(endTime.getTime() + endTime.getTimezoneOffset()*60*1000 + 8*60*60*1000);
            // 格式化为本地时间
            const formatted = endTime.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',  
                minute: '2-digit',
                second: '2-digit'
            }); 
            result.push({
                ...log,
                poolId: poolId.toString() as string,
                rewardType: rewardType.toString() as string,
                rewardToken: getTokenName(rewardType.toString()),
                rewardRate: rewardRate.toString() as string,
                endTimeStamp: endTimeStamp.toString() as string,
                endTime: formatted.replace("/", "-").replace("/", "-")
            })
        })
        return result
    }

    async filterStakes(startBlock: number, endBlock: number, filterPool?: number[]) {
        const filters = this.contract.filters.Stake()
        const events = await getEvmEvents(filters, startBlock, endBlock)
        const result: any[] = []
        events.forEach((log: any) => {
            const parsed = this.iface.parseLog({
                data: log.data,
                topics: log.topics.filter((x: any) => x) as string[],
            });
            const [sender, poolId, amount] = parsed.args;
            if (!filterPool || filterPool.indexOf(poolId.toNumber()) != -1) {
                result.push({
                    ...log,
                    transactionHash: log.transactionHash,
                    timeStamp: log.timeStamp,
                    sender: sender as string,
                    poolId: poolId.toString() as string,
                    amount: amount.toString() as string,
                })
            }
        })
        return result
    }

    async filterAccounts(startBlock: number, endBlock: number, filterPool?: number[]) {
        const stakes = await this.filterStakes(startBlock, endBlock, filterPool)
        const accounts: string[] = []

        stakes.forEach((stake: any) => {
            if (accounts.indexOf(stake.sender) == -1) {
                accounts.push(stake.sender)
            }
        });

        console.log(accounts);
        
        return accounts
    }

    async getConvertLSTPool(startBlock: number, endBlock: number) {
        const filters = this.contract.filters.LSTPoolConverted()
        const events = await getEvmEvents(filters, startBlock, endBlock)
        const result: any[] = []
        events.forEach((log: any) => {
            const parsed = this.iface.parseLog({
                data: log.data,
                topics: log.topics.filter((x: any) => x) as string[],
            });

            const [poolId, beforeShareType, afterShareType, beforeShareTokenAmount, afterShareTokenAmount] = parsed.args;
            result.push({
                ...log,
                poolId: poolId.toString(),
                shareType: getTokenName(beforeShareType),
                convertedShareType: getTokenName(afterShareType),
                beforeShareTokenAmount: beforeShareTokenAmount.toString(),
                afterShareTokenAmount: afterShareTokenAmount.toString()
            })
        })
        return result
    }

    async exit(poolId: number) {
        const tx = await this.contract.exit(poolId)
        await tx.wait()

        return tx
    }

    async unstake(poolId: number, amount: Amount) {
        const tx = await this.contract.unstake(poolId, amount)
        await tx.wait()

        return tx
    }

    unstakeEncode(poolId: number, amount: Amount) {
        return stakingLstV2Iface.encodeFunctionData("unstake", [poolId, amount]);
    }

    async filterUnStakes(startBlock: number, endBlock: number, filterPool?: number[]) {
        const filters = this.contract.filters.Unstake()
        const events = await getEvmEvents(filters, startBlock, endBlock)
        const result: any[] = []
        events.forEach((log: any) => {
            const parsed = this.iface.parseLog({
                data: log.data,
                topics: log.topics.filter((x: any) => x) as string[],
            });
            const [sender, poolId, amount] = parsed.args;
            if (!filterPool || filterPool.indexOf(poolId.toNumber()) != -1) {
                result.push({
                    ...log,
                    transactionHash: log.transactionHash,
                    timeStamp: log.timeStamp,
                    sender: sender as string,
                    poolId: poolId.toString() as string,
                    amount: amount.toString() as string,
                })
            }
        })
        return result
    }

    async convertLSTPool(poolId: number, convertor: string) {
        const tx = await this.contract.convertLSTPool(poolId, convertor)
        await tx.wait()

        return tx
    }

    convertLSTPoolEncode(poolId: number, convertor: string) {
        return stakingLstV2Iface.encodeFunctionData("convertLSTPool", [poolId, convertor]);
    }

    async resetPoolConvertor(poolId: number, convertor: string) {
        const tx = await this.contract.resetPoolConvertor(poolId, convertor)
        await tx.wait()

        return tx
    }

    resetPoolConvertorEncode(poolId: number, convertor: string) {
        return stakingLstV2Iface.encodeFunctionData("resetPoolConvertor", [poolId, convertor]);
    }

    async claimRewards(poolId: number) {
        const tx = await this.contract.claimRewards(poolId)
        await tx.wait()

        return tx
    }

    /**
     * 用于用户提取池子中的奖励，提取后会直接进入到奖励币种合约的用户钱包中
     * @param poolId 池子Index
     * @returns Boolean
     */
    claimRewardsEncode(poolId: number) {
        return stakingLstV2Iface.encodeFunctionData("claimRewards", [poolId]);
    }

    async getClaimRewards(startBlock: number, endBlock: number, filterPools: number[]) {
        const filters = this.contract.filters.ClaimReward()
        const events = await getEvmEvents(filters, startBlock, endBlock)
        const result: any[] = []
        events.forEach((log: any) => {
            const parsed = this.iface.parseLog({
                data: log.data,
                topics: log.topics.filter((x: any) => x) as string[],
            });
            const [sender, poolId, rewardType, amount] = parsed.args;

            if (filterPools.indexOf(poolId.toNumber()) != -1) {
                result.push({
                    ...log,
                    sender: sender as string,
                    rewardType: getTokenInfo(rewardType)?.symbol as string,
                    poolId: poolId.toString() as string,
                    amount: amount.toBigInt() as bigint,
                })
            }
        })
        return result
    }

    async getTotalRewardPaid(startBlock: number, endBlock: number, prices: any, filterPools: number[]) {
        const accounts = await this.filterAccounts(startBlock, endBlock, filterPools)
        const claimedRewards = await this.getClaimRewards(startBlock, endBlock, filterPools)
        console.log(accounts.length, claimedRewards.length);
        console.log(accounts);
        
        console.log(claimedRewards);
        
        let earned = new BigNumber(0)

        for (let poolId of filterPools) {
            const rewardTypes = await this.rewardTypes(poolId, endBlock)
            for (const rewardType of rewardTypes) {
                const token = getTokenInfo(rewardType) as ASSET
                const price = prices[token?.symbol]
                
                for(let account of accounts) {
                    const accountEarned = formatDecimal(await this.earned(poolId, account, rewardType, endBlock), -token.decimals)
                    const accountEarnedPrice = new BigNumber(accountEarned).times(price)
                    earned = earned.plus(accountEarnedPrice)
                }
            }
        }
        let claimed = new BigNumber(0)
        for (let rewards of claimedRewards) {
            const token = getTokenInfo(rewards.rewardType) as ASSET
            const price = prices[rewards?.rewardType]
            const rewardClaimed = formatDecimal(rewards.amount, -token.decimals)
            claimed = claimed.plus(new BigNumber(rewardClaimed).times(price))
        }
        
        return { claimed: claimed.toString(), earned: earned.toString(), totalRewardPaid: claimed.plus(earned).toString() }
    }

    /**
     * 取消所有股份，并从股份池中索取所有未认领的奖励。
     * @param poolId 池子Index
     * @returns Boolean
     */
    exitEncode(poolId: number) {
        return stakingLstV2Iface.encodeFunctionData("exit", [poolId]);
    }

    async updateRewardRule(
        poolId: number,
        rewardType: ContractAddress,
        rewardRate: Amount,
        endTime: number|string
    ) {
        const tx = await this.contract.updateRewardRule(
            poolId,
            rewardType,
            rewardRate,
            endTime,
        )
        await tx.wait()

        return tx
    }

    /**
     * 开启或调整池子的奖励规则，可通过rewardRules查询设置的奖励规则，
     * 用户所得奖励可以通过rewards查询
     * @param poolId 池子Index
     * @param rewardType 奖励币种的地址
     * @param rewardRate 每秒奖励
     * @param endTime 奖励结束时间 秒戳
     * @returns 
     */
    updateRewardRuleEncode(
        poolId: number,
        rewardType: ContractAddress,
        rewardRate: Amount,
        endTime: number|string
    ) {
        return stakingLstV2Iface.encodeFunctionData("updateRewardRule", [
            poolId,
            rewardType,
            rewardRate,
            endTime,
        ]);
    }

    async pause() {
        const tx = await this.contract.pause()
        await tx.wait()

        return tx
    }

    /**
     * 暂停整个合同的交易
     * @returns 
     */
    pauseEncode() {
        return stakingLstV2Iface.encodeFunctionData("pause", []);
    }

    async unpause() {
        const tx = await this.contract.unpause()
        await tx.wait()

        return tx
    }

    /**
     * 取消暂停整个合同的交易
     * @returns 
     */
    unpauseEncode() {
        return stakingLstV2Iface.encodeFunctionData("unpause", []);
    }

    async setPoolOperationPause(poolId: number, operation: Operation, paused: Boolean) {
        const tx = await this.contract.setPoolOperationPause(poolId, operation, paused)
        await tx.wait()

        return tx
    }

    /**
     * 单独设置某个池子的某个功能是否暂停
     * @param poolId 池子Index
     * @param operation 功能：Stake = 0, Unstake = 1, ClaimRewards = 2
     * @param paused 是否暂停 true暂停，false开启
     * @returns 
     */
    setPoolOperationPauseEncode(poolId: number, operation: Operation, paused: Boolean) {
        return stakingLstV2Iface.encodeFunctionData("setPoolOperationPause", [poolId, operation, paused]);
    }

    async setRewardsDeductionRate(poolId: number, rate: Amount) {
        const tx = await this.contract.setRewardsDeductionRate(poolId, rate)
        await tx.wait()

        return tx
    }

    /**
     * 设置池子的灼烧利率，用户提取奖励claimRewards时会扣除 当前设置的比例 rewardsAmount * (RewardsDeductionRate / 1e18)
     * @param poolId 池子Index
     * @param rate 100% * 1e18
     * @returns 
     */
    setRewardsDeductionRateEncode(poolId: number, rate: Amount) {
        return stakingLstV2Iface.encodeFunctionData("setRewardsDeductionRate", [poolId, rate]);
    }

    async filterRewardsDeductionRateSet(startBlock: number, endBlock: number) {
        const filters = this.contract.filters.RewardsDeductionRateSet()
        const events = await getEvmEvents(filters, startBlock, endBlock)
        const result: any[] = []
        events.forEach((log: any) => {
            const parsed = this.iface.parseLog({
                data: log.data,
                topics: log.topics.filter((x: any) => x) as string[],
            });

            const [poolId, rate] = parsed.args;
            result.push({
                ...log,
                poolId: poolId.toString() as string,
                rate: rate.toString() as string,
            })
        })
        return result
    }

    async transferOwnership(newOwner: UserAddress) {
        const tx = await this.contract.transferOwnership(newOwner)
        await tx.wait()

        return tx
    }

    /**
     * 转让合约所有权
     * @param newOwner 合约接受人地址
     * @returns 
     */
    transferOwnershipEncode(newOwner: UserAddress) {
        return stakingLstV2Iface.encodeFunctionData("transferOwnership", [newOwner]);
    }

    async getAllBalanceInfo (who: UserAddress, blockTag: BlockNumber = "latest") {
        const result = []
        // let userValue = new BigNumber(0)
        for (let token of ASSET_METADATAS) {            
            // if(token.symbol == "USDT" || token.symbol == "TAI" || token.symbol == "USDCet" || token.symbol == "TUSD" || token.symbol == "WTUSD") continue;
            const iERC20Call = new IERC20Call(token.contract, this.provider as any)
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

    async getAllRewardsInfo (poolIndex: number, blockTag: BlockNumber = "latest") {
        console.log("------------start getAllRewardsInfo------------");
        const rewardTypes = await this.rewardTypes(poolIndex, blockTag)
        let result = []
        for (const type of rewardTypes) {
            const tokenInfo = getTokenInfo(type)
            const name = tokenInfo?.symbol as Exclude<TokenSymbol, TokenSymbol.KSM>
            const { rewardRate, endTime, rewardRateAccumulated, lastAccumulatedTime } = await this.rewardRules(poolIndex, type, blockTag)
            const rewardPerShare = await this.rewardPerShare(poolIndex, type, blockTag)
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

    async getPoolInfo (poolIndex: number, prices: any, blockTag: BlockNumber = "latest") {
        console.log("------------start getPoolInfo------------");
        const shareTypes = await this.shareTypes(poolIndex, blockTag)
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
            this.convertInfos(poolIndex, blockTag),
            this.rewardsDeductionRates(poolIndex, blockTag),
            this.lastTimeRewardApplicable(poolIndex, shareTypes, blockTag),
            this.totalShares(poolIndex, blockTag),
            this.pausedPoolOperations(poolIndex, Operation.Stake, blockTag),
            this.pausedPoolOperations(poolIndex, Operation.Unstake, blockTag),
            this.pausedPoolOperations(poolIndex, Operation.ClaimRewards, blockTag),
            this.poolConvertors(poolIndex, blockTag)
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
                const withdrawRate = (await this.iWrappedTDOTCall.withdrawRate(blockTag)).toString()
                console.log("withdrawRate", withdrawRate);
                convertedTotalShares = convertedTotalShares.times(withdrawRate).div("1000000000000000000")
            }
            tvl = convertedTotalShares.times(prices.data[convertedTokenName]).toString()
        }

        const rewardsInfo = await this.getAllRewardsInfo(poolIndex, blockTag)
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

    async getUserPoolInfo (poolIndex: number, who: UserAddress, blockTag: BlockNumber = "latest") {
        console.log("------------start getUserPoolInfo------------");
        const shares = await this.shares(poolIndex, who, blockTag)
        const shareTypes = await this.shareTypes(poolIndex, blockTag)
        const { decimals } = getTokenInfo(shareTypes) as { decimals: number}
        const { convertedShareType, convertedExchangeRate }  = await this.convertInfos(poolIndex, blockTag)
        let convertedShares = ethers.BigNumber.from(0)
        let formatConvertedShares
        if (convertedShareType != BLACK_HOLE) {
            const { decimals: convertedDecimal } = getTokenInfo(shareTypes) as { decimals: number}
            convertedShares = shares.mul(convertedExchangeRate).div("1000000000000000000")
            if (getTokenName(convertedShareType) == "WTDOT") {
                const withdrawRate = (await this.iWrappedTDOTCall.withdrawRate(blockTag)).toString()
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
        const rewardTypes = await this.rewardTypes(poolIndex, blockTag)
        for (const type of rewardTypes) {
            const [
                paidAccumulatedRates,
                earned,
                rewards
            ] = await Promise.all([
                this.paidAccumulatedRates(poolIndex, who, type, blockTag),
                this.earned(poolIndex, who, type, blockTag),
                this.rewards(poolIndex, who, type, blockTag)
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

    async getLSTConfig (blockTag: BlockNumber = "latest") {
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
            this.owner(blockTag),
            this.HOMA(),
            this.DOT(),
            this.LDOT(),
            this.LCDOT(),
            this.TDOT(),
            this.LIQUID_CROWDLOAN(),
            this.STABLE_ASSET(),
            this.MAX_REWARD_TYPES(),
            this.paused(blockTag),
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

    async getApr() {
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

    async getLstTVL (blockTag: BlockNumber = "latest", startPoolId = 0, endPoolId = 5, price: any) {
        let lstTvl = new BigNumber(0)
        let totalShares = new BigNumber(0)
        for(let i=startPoolId; i <= endPoolId; i++) {
            const { tvl, formatTotalShares } = await this.getPoolInfo(i, blockTag, price)
            lstTvl = lstTvl.plus(tvl)
            totalShares = totalShares.plus(formatTotalShares)
        }
        console.log("LST TVL: ", lstTvl.toString());
        console.log("TotalShares: ", totalShares.toString());
        
        return {lstTvl, totalShares}
    }
}
