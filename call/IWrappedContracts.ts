import { ethers } from "ethers";
import { Amount, BlockNumber, ContractAddress } from "../utils/type";
import { IERC20Call } from "./IERC20Call";


export class IWrappedCall extends IERC20Call {
    interface: ethers.utils.Interface;
    constructor(
        provider: ethers.providers.JsonRpcProvider | ethers.Wallet,
        wrappedContracts: ContractAddress,
        wrappedContractsABI: string[],
        wrappedContractsInterface: ethers.utils.Interface
    ) {
        super(wrappedContracts, provider, wrappedContractsABI as unknown as string[]);
        this.interface = wrappedContractsInterface
    }

    async DOMAIN_SEPARATOR(blockTag: BlockNumber = "latest") {
        return await this.contract.DOMAIN_SEPARATOR({ blockTag })
    }

    async nonces(address: string, blockTag: BlockNumber = "latest") {
        return await this.contract.nonces(address, { blockTag })
    }

    async depositRate(blockTag: BlockNumber = "latest") {
        return await this.contract.depositRate({ blockTag })
    }

    async withdrawRate(blockTag: BlockNumber = "latest") {
        return await this.contract.withdrawRate({ blockTag })
    }

    async deposit(amount: Amount) {
        const tx = await this.contract.deposit(amount)
        await tx.wait()

        return tx
    }

    depositEncode(amount: Amount) {
        return this.interface.encodeFunctionData("deposit", [amount]);
    }

    async withdraw(amount: Amount) {
        const tx = await this.contract.withdraw(amount)
        await tx.wait()

        return tx
    }

    withdrawEncode(amount: Amount) {
        return this.interface.encodeFunctionData("withdraw", [amount]);
    }
}