import { ethers } from "ethers";
import { UserAddress, Amount, BlockNumber } from "../utils/type";
import AcalaPointABI from '../contracts/AcalaPoint.json'
import { AcalaPoint } from "../utils/config";
import { IERC20Call } from "./IERC20Call";

const AcalaPointIface = new ethers.utils.Interface(AcalaPointABI);

export class IAcalaPointCall extends IERC20Call {
    constructor(provider: ethers.providers.JsonRpcProvider | ethers.Wallet) {
        super(AcalaPoint, provider, AcalaPointABI as unknown as string[]);
    }

    /**
     * 获取合约的归属人地址
     * @returns 用户地址
     */
    async owner(blockTag: BlockNumber = "latest") {
        return await this.contract.owner({ blockTag });
    }

    async whitelistMinter(minter: UserAddress) {
        const tx = await this.contract.whitelistMinter(minter)
        await tx.wait()

        return tx
    }

    async removeWhitelistMinter(minter: UserAddress) {
        const tx = await this.contract.removeWhitelistMinter(minter)
        await tx.wait()

        return tx
    }

    async mint(to: UserAddress, amount: Amount) {
        const tx = await this.contract.mint(to, amount)
        await tx.wait()

        return tx
    }

    async mintBatch(addresses: UserAddress[], amounts: Amount[]) {
        const tx = await this.contract.mintBatch(addresses, amounts)
        await tx.wait()

        return tx
    }

    async whitelistedMinters(sender: UserAddress, blockTag: BlockNumber = "latest") {
        return await this.contract.whitelistedMinters(sender, { blockTag })
    }
}