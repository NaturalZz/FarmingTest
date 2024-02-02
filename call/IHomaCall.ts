import { ethers } from "ethers";
import { HOMA } from "../utils/config";
import { Amount, BlockNumber } from "../utils/type";

const homaABI = [
    "function getCommissionRate() view returns (uint256)",

    "function getEstimatedRewardRate() view returns (uint256)",

    "function getExchangeRate() view returns (uint256)",

    "function getFastMatchFee() view returns (uint256)",

    "function mint(uint256 mintAmount) returns (bool)",

    "function requestRedeem(uint256 redeemAmount, bool fastMatch) returns (bool)",
]

const homaIface = new ethers.utils.Interface(homaABI);

export class IHomaCall {
    contract: ethers.Contract
    constructor(provider: ethers.providers.JsonRpcProvider | ethers.Wallet) {
        this.contract = new ethers.Contract(
            HOMA,
            homaABI,
            provider
        );
    }

    /**
     * 
     * @param blockTag 
     * @returns BigNumber
     */
    async getCommissionRate(blockTag: BlockNumber = "latest") {
        return await this.contract.getCommissionRate({ blockTag })
    }

    /**
     * 
     * @param blockTag 
     * @returns BigNumber
     */
    async getEstimatedRewardRate(blockTag: BlockNumber = "latest") {
        return await this.contract.getEstimatedRewardRate({ blockTag })
    }

    /**
     * 获取汇率
     * @param blockTag 
     * @returns BigNumber
     */
    async getExchangeRate(blockTag: BlockNumber = "latest") {
        return await this.contract.getExchangeRate({ blockTag })
    }

    /**
     * 
     * @param blockTag 
     * @returns BigNumber
     */
    async getFastMatchFee(blockTag: BlockNumber = "latest") {
        return await this.contract.getFastMatchFee({ blockTag })
    }

    async mint(mintAmount: Amount) {
        const tx = await this.contract.mint(mintAmount)
        await tx.wait()
        return tx
    }

    async requestRedeem(redeemAmount: Amount, fastMatch: Boolean) {
        const tx = await this.contract.requestRedeem(redeemAmount, fastMatch)
        await tx.wait()
        return tx
    }

    mintEncode(mintAmount: Amount) {
        return homaIface.encodeFunctionData("mint", [mintAmount]);
    }

    requestRedeemEncode(redeemAmount: Amount, fastMatch: Boolean) {
        return homaIface.encodeFunctionData("requestRedeem", [redeemAmount, fastMatch]);
    }
}