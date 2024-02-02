import { ethers } from "ethers";
import StableAssetStakeUtilABI from '../contracts/StableAssetStakeUtil.json'
import { StableAssetStakeUtil } from "../utils/config";
import { Amount, BlockNumber, ContractAddress } from "../utils/type";

const IStableAssetStakeUtil = new ethers.utils.Interface(StableAssetStakeUtilABI);

export class IStableAssetStakeUtilCall {
    contract: ethers.Contract
    constructor(provider: ethers.providers.JsonRpcProvider | ethers.Wallet) {
        this.contract = new ethers.Contract(
            StableAssetStakeUtil,
            StableAssetStakeUtilABI,
            provider
        );
    }


    async euphrates(blockTag: BlockNumber = "latest") {
        return await this.contract.euphrates({ blockTag })
    }

    async homa(blockTag: BlockNumber = "latest") {
        return await this.contract.homa({ blockTag })
    }

    async ldot(blockTag: BlockNumber = "latest") {
        return await this.contract.ldot({ blockTag })
    }

    async stableAsset(blockTag: BlockNumber = "latest") {
        return await this.contract.stableAsset({ blockTag })
    }

    async mintAndStake(stableAssetPoolId: number, assetsAmount: number[]|string[], stableAssetShareToken: ContractAddress, wrappedShareToken: ContractAddress, poolId: number) {
        const tx = await this.contract.mintAndStake(stableAssetPoolId, assetsAmount, stableAssetShareToken, wrappedShareToken, poolId)
        await tx.wait()

        return tx
    }

    mintAndStakeEncode(stableAssetPoolId: number, assetsAmount: number[]|string[], stableAssetShareToken: ContractAddress, wrappedShareToken: ContractAddress, poolId: number) {
        return IStableAssetStakeUtil.encodeFunctionData("mintAndStake", [stableAssetPoolId, assetsAmount, stableAssetShareToken, wrappedShareToken, poolId]);
    }

    async wrapAndStake(stableAssetShareToken: ContractAddress, amount: number|string,  wrappedShareToken: ContractAddress, poolId: number) {
        const tx = await this.contract.wrapAndStake(stableAssetShareToken, amount, wrappedShareToken, poolId)
        await tx.wait()

        return tx
    }

    wrapAndStakeEncode(stableAssetShareToken: ContractAddress, amount: number|string, wrappedShareToken: ContractAddress, poolId: number) {
        return IStableAssetStakeUtil.encodeFunctionData("wrapAndStake", [stableAssetShareToken, amount, wrappedShareToken, poolId]);
    }
}
