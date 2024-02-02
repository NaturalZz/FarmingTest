import { ethers } from "ethers";
import { AcalaJsonRpcProvider } from '@acala-network/eth-providers';
import UpgradeableStakingLSTV2ABI from '../contracts/UpgradeableStakingLSTV2ABI.json'
import { ProxyAddress, TokenSymbol } from "../utils/config";
import { Operation, UserAddress, ContractAddress, Amount, BlockNumber, ConvertType } from "../utils/type";
import { erc20ABI } from "./IERC20Call";
import { getEvents, parseEvents } from "../utils/ethHelper";
import { getTokenInfo, getTokenName, ASSET } from "../utils/assets";
import BigNumber from "bignumber.js";
import { formatDecimal } from "../utils/decimal";

const stakingLstV2Iface = new ethers.utils.Interface(UpgradeableStakingLSTV2ABI);

export class IStakingLstV2Call {
    contract: ethers.Contract
    iface = stakingLstV2Iface
    constructor(provider: ethers.providers.JsonRpcProvider | ethers.Wallet | AcalaJsonRpcProvider) {
        this.contract = new ethers.Contract(
            ProxyAddress,
            UpgradeableStakingLSTV2ABI,
            provider
        );
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

    async stakeTo(poolId: number, amount: Amount, receiver: UserAddress) {
        const tx = await this.contract.stakeTo(poolId, amount, receiver)
        await tx.wait()

        return tx
    }

    stakeToEncode(poolId: number, amount: Amount, receiver: UserAddress) {
        return stakingLstV2Iface.encodeFunctionData("stakeTo", [poolId, amount, receiver]);
    }

    async getStakes(startBlock: BlockNumber, endBlock: BlockNumber, filterPool?: number[]) {
        const filters = this.contract.filters.Stake()
        const events = await getEvents(filters, startBlock, endBlock)
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
                    sender: sender as string,
                    poolId: poolId.toString() as string,
                    amount: amount.toString() as string,
                })
            }
        })
        return result
    }

    async getAccounts(startBlock: BlockNumber, endBlock: BlockNumber, filterPool: number[]) {
        const stakes = await this.getStakes(startBlock, endBlock, filterPool)
        const accounts: string[] = []

        stakes.forEach((stake: any) => {
            if (accounts.indexOf(stake.sender) == -1) {
                accounts.push(stake.sender)
            }
        });

        return accounts
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

    async getClaimRewards(startBlock: BlockNumber, endBlock: BlockNumber, filterPools: number[]) {
        const filters = this.contract.filters.ClaimReward()
        const events = await getEvents(filters, startBlock, endBlock)
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

    async getTotalRewardPaid(startBlock: BlockNumber, endBlock: BlockNumber, prices: any, filterPools: number[]) {
        const accounts = await this.getAccounts(startBlock, endBlock, filterPools)
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

    async filterRewardRule(startBlock: BlockNumber, endBlock: BlockNumber, nowTime: number, filterPool: number[]) {
        const filters = this.contract.filters.RewardRuleUpdate()
        const events = await getEvents(filters, startBlock, endBlock)
        const classRule = filterPool.reduce((obj, item) => {
            obj[item] = []
            return obj
        }, {} as {[key: number]: any[]})

        events.forEach((log: any) => {
            const parsed = this.iface.parseLog({
                data: log.data,
                topics: log.topics.filter((x: any) => x) as string[],
            });

            const [poolId, rewardType, rewardRate, endTime] = parsed.args;
            const rewardTokenName = getTokenName(rewardType)
            if(filterPool.indexOf(poolId.toNumber()) != -1) {
                // let rewardTime = endTime.sub(log.timeStamp).toString()
                // if (endTime.gt(nowTime)) {
                //     rewardTime = nowTime - log.timeStamp
                // }
                classRule[poolId].push({
                    ...log,
                    poolId: poolId.toNumber(),
                    rewardType: rewardTokenName,
                    rewardRate: rewardRate.toString(),
                    endTime: endTime.toString(),
                })
            }
        })
        
        return classRule
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
}
