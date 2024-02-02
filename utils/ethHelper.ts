import { AcalaJsonRpcProvider } from "@acala-network/eth-providers";
import { ethers, utils } from "ethers";
import axios from 'axios-https-proxy-fix'
import { BlockNumber } from "./type";
import { PROXY } from "./config";

export const getBlockTime = async (provider: ethers.providers.JsonRpcProvider | AcalaJsonRpcProvider, block?: BlockNumber) => {
    block = block ?? await provider.getBlockNumber()
    const { timestamp } = await provider.getBlock(block)

    return timestamp
}

export const getBlockByTXHash = async (provider: ethers.providers.JsonRpcProvider | AcalaJsonRpcProvider, txHash: string) => {
    const { blockNumber } = await provider.getTransaction(txHash) as { blockNumber : number }
    
    return await provider.getBlock(blockNumber)
}

export const addressCompare = (address1: string, address2: string) => {
    return utils.getAddress(address1) == utils.getAddress(address2)
}


export const getEvents = async (filter: ethers.EventFilter, startBlock: BlockNumber, endBlock: BlockNumber) => {
    // const rsp = await axios.get(`https://blockscout.mandala.aca-staging.network/api?module=logs&action=getLogs&fromBlock=${startBlock}&toBlock=${endBlock}&address=${filter.address}&topic0=${filter.topics}`,)
    const rsp = await axios.get(`https://blockscout.acala.network/api?module=logs&action=getLogs&fromBlock=${startBlock}&toBlock=${endBlock}&address=${filter.address}&topic0=${filter.topics}`)//, {proxy: PROXY})

    return rsp.data.result.map((log: any) => {
        return {
          ...log,
          id: `${Number(log.blockNumber)}-${Number(log.transactionIndex)}-${Number(log.logIndex)}`,
          blockNumber: Number(log.blockNumber),
          transactionIndex: Number(log.transactionIndex),
          logIndex: Number(log.logIndex),
          timeStamp: Number(log.timeStamp),
          gasPrice: BigInt(log.gasPrice),
          gasUsed: BigInt(log.gasUsed),
        };
    });
}

export const parseEvents = (iface: utils.Interface, events: any) => {
    return events.map((log: any) => {
        const parsed = iface.parseLog({
            data: log.data,
            topics: log.topics.filter((x: any) => x) as string[],
        });

        return {
            ...log,
            ...parsed.args
        };
    })
}