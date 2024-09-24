import { AcalaJsonRpcProvider } from "@acala-network/eth-providers";
import { ethers, utils } from "ethers";
import axios from 'axios-https-proxy-fix'
import { BlockNumber } from "./type";
import { BLOCKSCOUT_API, CURRENT_CHAIN_NAME, PROXY } from "./config";

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

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getEvmEvents = async (filter: ethers.EventFilter, startBlock: number, endBlock: number) => {
    const batchSize = 1000;
    const numRequests = Math.ceil((endBlock - startBlock) / batchSize);
    const maxConcurrentRequests = 5; // 最大同时请求数量

    const events: any[] = [];

    // 分批次发起请求
    for (let i = 0; i < numRequests; i += maxConcurrentRequests) {
        const chunk = Array.from({ length: maxConcurrentRequests }, (_, index) => {
            const fromBlock = startBlock + (i + index) * batchSize;
            const toBlock = Math.min(startBlock + (i + index + 1) * batchSize, endBlock);
            console.log(`index ${fromBlock} to ${toBlock}`);
            return axios.get(`${BLOCKSCOUT_API[CURRENT_CHAIN_NAME]}/api?module=logs&action=getLogs&fromBlock=${fromBlock}&toBlock=${toBlock}&address=${filter.address}&topic0=${filter.topics}`);
        });

        // 等待当前批次的请求完成
        const responses = await Promise.all(chunk.map(async (request) => {
            await delay(1000); // 添加延迟，防止请求速率过快
            try {
                return await request;
            } catch (error) {
                // 处理请求错误
                console.error('Error fetching logs:', error);
                return null; // 返回null，避免影响后续逻辑
            }
        }));

        // 处理响应
        responses.forEach((rsp) => {
            if (rsp && rsp.data.result) {
                events.push(...rsp.data.result.map((log: any) => ({
                    ...log,
                    id: `${Number(log.blockNumber)}-${Number(log.transactionIndex)}-${Number(log.logIndex)}`,
                    blockNumber: Number(log.blockNumber),
                    transactionIndex: Number(log.transactionIndex),
                    logIndex: Number(log.logIndex),
                    timeStamp: Number(log.timeStamp),
                    gasPrice: BigInt(log.gasPrice),
                    gasUsed: BigInt(log.gasUsed),
                })));
            }
        });
    }

    return events;
};

export const parseEvmEvents = (iface: utils.Interface, events: any) => {
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

export const getSubScanEvents = async (module: string, eventId: string, page=0, row=100, afterId=0, order="desc") => {
    const url = "https://acala.api.subscan.io/api/v2/scan/events"
    const params = {
        "event_id": eventId,
        "module": module,
        "order": order,
        "page": page,
        "row": row,
        "after_id": afterId
    }

    const rsp = await axios.post(url, params)
    if(rsp.data.code == 10012) return 10012

    if(rsp.data.code != 0) return null
    return rsp.data.data
}