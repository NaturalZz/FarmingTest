import { ethers } from "ethers";
import { UserAddress, ContractAddress, Amount, BlockNumber } from "../utils/type";
import { WTDOT } from "../utils/config"
import { IERC20Call } from "./IERC20Call";
import WrappedTDOTABI from "../contracts/WrappedTDOTABI.json"

const wrappedTDOTIface = new ethers.utils.Interface(WrappedTDOTABI);

export class IWrappedTDOTCall extends IERC20Call {
    constructor(provider: ethers.providers.JsonRpcProvider | ethers.Wallet) {
        super(WTDOT, provider, WrappedTDOTABI as unknown as string[]);
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
        return wrappedTDOTIface.encodeFunctionData("deposit", [amount]);
    }

    async withdraw(amount: Amount) {
        const tx = await this.contract.withdraw(amount)
        await tx.wait()

        return tx
    }

    withdrawEncode(amount: Amount) {
        return wrappedTDOTIface.encodeFunctionData("withdraw", [amount]);
    }
}