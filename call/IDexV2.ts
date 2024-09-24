import { ethers } from "ethers";
import IDexV2ABI from '../contracts/IDEXV2.json'
import { Dex } from "../utils/config";
import { Amount, BlockNumber, ContractAddress, UserAddress } from "../utils/type";

const IDexV2 = new ethers.utils.Interface(IDexV2ABI);

export class IDexV2Call {
    contract: ethers.Contract
    constructor(provider: ethers.providers.JsonRpcProvider | ethers.Wallet) {
        this.contract = new ethers.Contract(
            Dex,
            IDexV2ABI,
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
        return IDexV2.encodeFunctionData("swapWithExactSupply", [path, supplyAmount, minShareAmount]);
    }

    async swapWithExactTarget(path: ContractAddress[], targetAmount: Amount, maxSupplyAmount: Amount) {
        const tx = await this.contract.swapWithExactTarget(path, targetAmount, maxSupplyAmount)
        await tx.wait()

        return tx
    }

    async swapWithExactTargetEncode(path: ContractAddress[], targetAmount: Amount, maxSupplyAmount: Amount) {
        return IDexV2.encodeFunctionData("swapWithExactTarget", [path, targetAmount, maxSupplyAmount]);
    }

    async addLiquidity(tokenA: ContractAddress, tokenB: ContractAddress, maxAmountA: Amount, maxAmountB: Amount, minShareAmount: Amount) {
        const tx = await this.contract.addLiquidity(tokenA, tokenB, maxAmountA, maxAmountB, minShareAmount)
        await tx.wait()

        return tx
    }

    async addLiquidityEncode(tokenA: ContractAddress, tokenB: ContractAddress, maxAmountA: Amount, maxAmountB: Amount, minShareAmount: Amount) {
        return IDexV2.encodeFunctionData("addLiquidity", [tokenA, tokenB, maxAmountA, maxAmountB, minShareAmount]);
    }

    async removeLiquidity(tokenA: ContractAddress, tokenB: ContractAddress, removeShare: Amount, minWithdrawnA: Amount, minWithdrawnB: Amount) {
        const tx = await this.contract.removeLiquidity(tokenA, tokenB, removeShare, minWithdrawnA, minWithdrawnB)
        await tx.wait()

        return tx
    }

    removeLiquidityEncode(tokenA: ContractAddress, tokenB: ContractAddress, removeShare: Amount, minWithdrawnA: Amount, minWithdrawnB: Amount) {
        return IDexV2.encodeFunctionData("removeLiquidity", [tokenA, tokenB, removeShare, minWithdrawnA, minWithdrawnB]);
    }

    async getProvisionPool(tokenA: ContractAddress, tokenB: ContractAddress, blockTag: BlockNumber = "latest") {
        return await this.contract.getProvisionPool(tokenA, tokenB, { blockTag });
    }

    async getProvisionPoolOf(who: UserAddress, tokenA: ContractAddress, tokenB: ContractAddress, blockTag: BlockNumber = "latest") {
        return await this.contract.getProvisionPoolOf(who, tokenA, tokenB, { blockTag });
    }

    async getInitialShareExchangeRate(tokenA: ContractAddress, tokenB: ContractAddress, blockTag: BlockNumber = "latest") {
        return await this.contract.getInitialShareExchangeRate(tokenA, tokenB, { blockTag });
    }

    async addProvision(tokenA: ContractAddress, tokenB: ContractAddress, amountA: Amount, amountB: Amount) {
        const tx = await this.contract.addProvision(tokenA, tokenB, amountA, amountB)
        await tx.wait()

        return tx
    }

    async addProvisionEncode(tokenA: ContractAddress, tokenB: ContractAddress, amountA: Amount, amountB: Amount) {
        return IDexV2.encodeFunctionData("addProvision", [tokenA, tokenB, amountA, amountB]);
    }

    async claimDexShare(who: UserAddress, tokenA: ContractAddress, tokenB: ContractAddress) {
        const tx = await this.contract.claimDexShare(who, tokenA, tokenB)
        await tx.wait()

        return tx
    }

    async claimDexShareEncode(who: UserAddress, tokenA: ContractAddress, tokenB: ContractAddress) {
        return IDexV2.encodeFunctionData("claimDexShare", [who, tokenA, tokenB]);
    }
    
    async refundProvision(who: UserAddress, tokenA: ContractAddress, tokenB: ContractAddress) {
        const tx = await this.contract.refundProvision(who, tokenA, tokenB)
        await tx.wait()

        return tx
    }

    async refundProvisionEncode(who: UserAddress, tokenA: ContractAddress, tokenB: ContractAddress) {
        return IDexV2.encodeFunctionData("refundProvision", [who, tokenA, tokenB]);
    }
}