import { ethers } from "ethers";
import { AcalaJsonRpcProvider } from '@acala-network/eth-providers';
import { Amount, BlockNumber } from "../utils/type";
import LotteryABI from '../contracts/Lottery.json'
import { Lottery } from "../utils/config";

const lotteryIface = new ethers.utils.Interface(LotteryABI);

export class ILotteryCall {
    provider: ethers.providers.JsonRpcProvider | AcalaJsonRpcProvider | ethers.Wallet
    contract: ethers.Contract
    iface = lotteryIface
    constructor(provider: ethers.providers.JsonRpcProvider | AcalaJsonRpcProvider | ethers.Wallet) {
        this.provider = provider
        this.contract = new ethers.Contract(
            Lottery,
            LotteryABI,
            provider
        );
    }

    /**
     * 获取合约的归属人地址
     * @returns 用户地址
     */
    async owner(blockTag: BlockNumber = "latest") {
        return await this.contract.owner({ blockTag });
    }

    async startLottery() {
        const tx = await this.contract.startLottery()
        await tx.wait()

        return tx
    }

    async isOpen(blockTag: BlockNumber = "latest") {
        return await this.contract.isOpen({ blockTag })
    }

    async endTime(blockTag: BlockNumber = "latest") {
        return await this.contract.endTime({ blockTag })
    }

    async duration(blockTag: BlockNumber = "latest") {
        return await this.contract.duration({ blockTag })
    }

    async entryFee(blockTag: BlockNumber = "latest") {
        return await this.contract.entryFee({ blockTag })
    }

    async maxTicketsCount(blockTag: BlockNumber = "latest") {
        return await this.contract.maxTicketsCount({ blockTag })
    }

    async ticketsSold(blockTag: BlockNumber = "latest") {
        return await this.contract.ticketsSold({ blockTag })
    }

    async timeRemaining(blockTag: BlockNumber = "latest") {
        return await this.contract.timeRemaining({ blockTag })
    }

    async ticketRemaining(blockTag: BlockNumber = "latest") {
        return await this.contract.ticketRemaining({ blockTag })
    }

    async drawLottery(ticketCount: number) {
        const tx = await this.contract.drawLottery(ticketCount)
        await tx.wait()

        return tx
    }

    async setDuration(duration: string) {
        const tx = await this.contract.setDuration(duration)
        await tx.wait()

        return tx
    }

    async setEntryFee(entryFee: Amount) {
        const tx = await this.contract.setEntryFee(entryFee)
        await tx.wait()

        return tx
    }

    async setMaxTicketsCount(ticketCount: number) {
        const tx = await this.contract.setMaxTicketsCount(ticketCount)
        await tx.wait()

        return tx
    }

    async depositACA(amount: Amount) {
        const tx = await this.contract.depositACA(amount)
        await tx.wait()

        return tx
    }

    async withdrawACA(amount: Amount) {
        const tx = await this.contract.withdrawACA(amount)
        await tx.wait()

        return tx
    }
}