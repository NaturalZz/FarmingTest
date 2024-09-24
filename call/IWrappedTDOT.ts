import { ethers } from "ethers";
import { WTDOT } from "../utils/config"
import WrappedTDOTABI from "../contracts/WrappedTDOTABI.json"
import { IWrappedCall } from "./IWrappedContracts";

const wrappedTDOTIface = new ethers.utils.Interface(WrappedTDOTABI);

export class IWrappedTDOTCall extends IWrappedCall {
    constructor(provider: ethers.providers.JsonRpcProvider | ethers.Wallet) {
        super(provider, WTDOT, WrappedTDOTABI as unknown as string[], wrappedTDOTIface);
    }
}