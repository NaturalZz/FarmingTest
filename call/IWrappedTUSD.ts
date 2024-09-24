import { ethers } from "ethers";
import { WTUSD } from "../utils/config"
import WrappedTUSDABI from "../contracts/WrappedTUSDABI.json"
import { IWrappedCall } from "./IWrappedContracts";

const wrappedTUSDIface = new ethers.utils.Interface(WrappedTUSDABI);

export class IWrappedTUSDCall extends IWrappedCall {
    constructor(provider: ethers.providers.JsonRpcProvider | ethers.Wallet) {
        super(provider, WTUSD, WrappedTUSDABI as unknown as string[], wrappedTUSDIface);
    }
}