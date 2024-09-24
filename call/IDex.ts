import { ethers } from "ethers";
import IDexABI from '../contracts/IDEX.json'
import { Dex } from "../utils/config";
import { Amount, BlockNumber, ContractAddress } from "../utils/type";

const IDex = new ethers.utils.Interface(IDexABI);

export class IDexCall {
    contract: ethers.Contract
    constructor(provider: ethers.providers.JsonRpcProvider | ethers.Wallet) {
        this.contract = new ethers.Contract(
            Dex,
            IDexABI,
            provider
        );
    }

    async getLiquidityPool(tokenA: ContractAddress, tokenB: ContractAddress, blockTag: BlockNumber = "latest") {
        return await this.contract.getLiquidityPool(tokenA, tokenB, { blockTag });
    }

    async getLiquidityTokenAddress(tokenA: ContractAddress, tokenB: ContractAddress, blockTag: BlockNumber = "latest") {
        return await this.contract.getLiquidityTokenAddress(tokenA, tokenB, { blockTag });
    }

    async getSwapTargetAmount(path: ContractAddress[], supplyAmount: Amount, blockTag: BlockNumber = "latest") {
        return await this.contract.getSwapTargetAmount(path, supplyAmount, { blockTag });
    }

    async getSwapSupplyAmount(path: ContractAddress[], targetAmount: Amount, blockTag: BlockNumber = "latest") {
        return await this.contract.getSwapSupplyAmount(path, targetAmount, { blockTag });
    }

    async swapWithExactSupply(path: ContractAddress[], supplyAmount: Amount, minShareAmount: Amount) {
        const tx = await this.contract.swapWithExactSupply(path, supplyAmount, minShareAmount)
        await tx.wait()

        return tx
    }

    async swapWithExactSupplyEncode(path: ContractAddress[], supplyAmount: Amount, minShareAmount: Amount) {
        return IDex.encodeFunctionData("swapWithExactSupply", [path, supplyAmount, minShareAmount]);
    }

    async swapWithExactTarget(path: ContractAddress[], targetAmount: Amount, maxSupplyAmount: Amount) {
        const tx = await this.contract.swapWithExactTarget(path, targetAmount, maxSupplyAmount)
        await tx.wait()

        return tx
    }

    async swapWithExactTargetEncode(path: ContractAddress[], targetAmount: Amount, maxSupplyAmount: Amount) {
        return IDex.encodeFunctionData("swapWithExactTarget", [path, targetAmount, maxSupplyAmount]);
    }

    async addLiquidity(tokenA: ContractAddress, tokenB: ContractAddress, maxAmountA: Amount, maxAmountB: Amount, minShareAmount: Amount) {
        const tx = await this.contract.addLiquidity(tokenA, tokenB, maxAmountA, maxAmountB, minShareAmount)
        await tx.wait()

        return tx
    }

    async addLiquidityEncode(tokenA: ContractAddress, tokenB: ContractAddress, maxAmountA: Amount, maxAmountB: Amount, minShareAmount: Amount) {
        return IDex.encodeFunctionData("addLiquidity", [tokenA, tokenB, maxAmountA, maxAmountB, minShareAmount]);
    }

    async removeLiquidity(tokenA: ContractAddress, tokenB: ContractAddress, removeShare: Amount, minWithdrawnA: Amount, minWithdrawnB: Amount) {
        const tx = await this.contract.removeLiquidity(tokenA, tokenB, removeShare, minWithdrawnA, minWithdrawnB)
        await tx.wait()

        return tx
    }

    removeLiquidityEncode(tokenA: ContractAddress, tokenB: ContractAddress, removeShare: Amount, minWithdrawnA: Amount, minWithdrawnB: Amount) {
        return IDex.encodeFunctionData("removeLiquidity", [tokenA, tokenB, removeShare, minWithdrawnA, minWithdrawnB]);
    }
}
