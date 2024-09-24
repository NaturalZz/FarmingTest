import { ethers } from "ethers";
import DexStakeUtilABI from '../contracts/DEXStakeUtilABI.json'
import { DexStakeUtil } from "../utils/config";
import { Amount, BlockNumber, ContractAddress } from "../utils/type";

const IDexStakeUtil = new ethers.utils.Interface(DexStakeUtilABI);

export class IDexStakeUtilCall {
    contract: ethers.Contract
    constructor(provider: ethers.providers.JsonRpcProvider | ethers.Wallet) {
        this.contract = new ethers.Contract(
            DexStakeUtil,
            DexStakeUtilABI,
            provider
        );
    }

    async addLiquidityAndStake(tokenA: ContractAddress, amountA: Amount, tokenB: ContractAddress, amountB: Amount, minShareAmount: Amount, poolId: number) {
        const tx = await this.contract.addLiquidityAndStake(tokenA, amountA, tokenB, amountB, minShareAmount, poolId)
        await tx.wait()

        return tx
    }

    addLiquidityAndStakeEncode(tokenA: ContractAddress, amountA: Amount, tokenB: ContractAddress, amountB: Amount, minShareAmount: Amount, poolId: number) {
        return IDexStakeUtil.encodeFunctionData("addLiquidityAndStake", [tokenA, amountA, tokenB, amountB, minShareAmount, poolId]);
    }

    async swapAndAddLiquidityAndStake(tokenA: ContractAddress, amountA: Amount, tokenB: ContractAddress, amountB: Amount, swapPath: ContractAddress[], swapAmount: Amount, minShareAmount: Amount, poolId: number) {
        const tx = await this.contract.swapAndAddLiquidityAndStake(tokenA, amountA, tokenB, amountB, swapPath, swapAmount, minShareAmount, poolId)
        await tx.wait()

        return tx
    }

    swapAndAddLiquidityAndStakeEncode(tokenA: ContractAddress, amountA: Amount, tokenB: ContractAddress, amountB: Amount, swapPath: ContractAddress[], swapAmount: Amount, minShareAmount: Amount, poolId: number) {
        return IDexStakeUtil.encodeFunctionData("swapAndAddLiquidityAndStake", [tokenA, amountA, tokenB, amountB, swapPath, swapAmount, minShareAmount, poolId]);
    }
}
