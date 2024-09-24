import _ from "lodash";
import { getSubScanEvents } from "./ethHelper";
import { loadCsvFile, loadJsonFile, saveJsonToFile } from "./fileUtils";
import { ethers } from "ethers";


(async () => {
    // let events: any[] = []
    // let afterId = 0
    function sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    // const add = loadJsonFile("./data/sub_addliquidity.json")
    // const remove = loadJsonFile("./data/sub_removeliquidity.json")
    // const liquidity = add.concat(remove)
    // console.log(liquidity.length);
    
    const subscan = loadJsonFile("./data/unstake.json")
    const format_unstake = subscan.map((event: any) => {
        return {
            tx_hash: event.transactionHash,
            user_addr: ethers.utils.getAddress(event.sender),
            pool_id: event.poolId,
            amount: event.amount
        }
    })
    // console.log(format_unstake, format_unstake.length);
    
    const data1 = loadCsvFile("./data/dune_unstake.csv")
    const format_dune = data1.filter((event: any) => {
        if(event.action == "unstake") {
            return true
        }
    }).map((event: any) => {
        return {
            tx_hash: event.tx_hash.toString(),
            user_addr: ethers.utils.getAddress(event.user_addr.toString()),
            pool_id: event.pool_id.toString(),
            amount: event.raw_amount.toString()
        }
    })
    // console.log(format_dune, format_dune.length);
        // 自定义比较函数
    const customComparator = (a: any, b: any) => _.isEqual(a, b);

    // 查找两个数组中不重合的元素
    const diffArray1 = _.differenceWith(format_unstake, format_dune, customComparator);
    console.log(diffArray1, diffArray1.length);
    

    // const data = loadJsonFile("./data/events1.json")
    // console.log(data);
    
    let events: any[] = []
    let afterId = 0//103767000021
    // const dump = async () => {
    //     while(true) {
    //         const rsp = await getSubScanEvents("dex", "swap", 0, 100, afterId)
    //         if (!rsp || !rsp.events) {
    //             break;
    //         }
    //         events = events.concat(rsp.events)
    //         afterId = events[events.length-1].id
    //         console.log(afterId);
            
    //         await sleep(300)
    //     }
    // }
    // try{ 
    //     while(true) {
    //         // const rsp = await getSubScanEvents("homa", "minted", i, 100, afterId)
    //         // const rsp = await getSubScanEvents("dex", "swap", 0, 100, afterId)
    //         // const rsp = await getSubScanEvents("dex", "addliquidity", 0, 100, afterId)
    //         const rsp = await getSubScanEvents("dex", "addprovision", 0, 100, afterId)
    //         if (!rsp || !rsp.events) {
    //             break;
    //         }
    //         events = events.concat(rsp.events)
    //         afterId = events[events.length-1].id
    //         console.log(afterId);
            
    //         await sleep(300)
    //     }
    // } finally {
    //     console.log(events.length);
    //     saveJsonToFile(events, "./data/sub_provision.json")
    // }
})()