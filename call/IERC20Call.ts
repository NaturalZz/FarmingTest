import { ethers } from "ethers";
import { UserAddress, ContractAddress, Amount, BlockNumber } from "../utils/type";

// ERC-20代币合约ABI的字符串表示
export const erc20ABI = [
    // symbol() 方法的ABI
    'function symbol() view returns (string)',

    'function decimals() view returns (uint8)',

    // name() 方法的ABI
    'function name() view returns (string)',

    'function balanceOf(address) view returns (uint256)',

    'function totalSupply() view returns (uint256)',

    'function allowance(address owner, address spender) view returns (uint256)',

    'function transfer(address, uint256) returns (bool)',

    'function approve(address spender, uint256 amount) returns (bool)',

    'function mint(address account, uint256 amount) returns (bool)'
];

const erc20Iface = new ethers.utils.Interface(erc20ABI);

export class IERC20Call {
    contract: ethers.Contract
    contractAddress: ContractAddress
    constructor(contractAddress: ContractAddress, provider: ethers.providers.JsonRpcProvider | ethers.Wallet, abi: string[]=erc20ABI) {
        this.contractAddress = contractAddress
        this.contract = new ethers.Contract(
            contractAddress,
            abi,
            provider
        );
    }

    async symbol() {
        return await this.contract.symbol()
    }

    async decimals() {
        return await this.contract.decimals()
    }

    async name() {
        return await this.contract.name()
    }

    async totalSupply(blockTag: BlockNumber = "latest") {
        return await this.contract.totalSupply({ blockTag })
    }

    async balanceOf(who: UserAddress, blockTag: BlockNumber = "latest") {
        return await this.contract.balanceOf(who, { blockTag })
    }

    async allowance(owner: UserAddress, spender: ContractAddress, blockTag: BlockNumber = "latest") {
        return await this.contract.allowance(owner, spender, { blockTag })
    }

    async transfer(to: UserAddress, amount: Amount) {
        const tx = await this.contract.transfer(to, amount)
        await tx.wait()

        return tx
    }

    transferEncode(to: UserAddress, amount: Amount) {
        return erc20Iface.encodeFunctionData("transfer", [to, amount]);
    }

    async approve(spender: ContractAddress, amount: Amount) {
        const tx = await this.contract.approve(spender, amount)
        await tx.wait()

        return tx
    }

    approveEncode(spender: ContractAddress, amount: Amount) {
        return erc20Iface.encodeFunctionData("approve", [spender, amount]);
    }

    async mint(who: UserAddress, amount: Amount) {
        const tx = await this.contract.mint(who, amount)
        await tx.wait()

        return tx
    }

    mintEncode(who: UserAddress, amount: Amount) {
        return erc20Iface.encodeFunctionData("mint", [who, amount]);
    }
}