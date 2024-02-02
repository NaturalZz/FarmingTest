import { ethers } from "ethers";
import { UserAddress, ContractAddress, Amount, BlockNumber } from "../utils/type";
import { WTUSD } from "../utils/config"
import { IERC20Call } from "./IERC20Call";
import WrappedTUSDABI from "../contracts/WrappedTUSDABI.json"

const wrappedTUSDIface = new ethers.utils.Interface(WrappedTUSDABI);

export class IWrappedTUSDCall extends IERC20Call {
    constructor(provider: ethers.providers.JsonRpcProvider | ethers.Wallet) {
        super(WTUSD, provider, WrappedTUSDABI as unknown as string[]);
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
        return wrappedTUSDIface.encodeFunctionData("deposit", [amount]);
    }

    async withdraw(amount: Amount) {
        const tx = await this.contract.withdraw(amount)
        await tx.wait()

        return tx
    }

    withdrawEncode(amount: Amount) {
        return wrappedTUSDIface.encodeFunctionData("withdraw", [amount]);
    }
}