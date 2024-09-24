import { IStakingCall } from '../call/IStakingCall'
import { Keyring } from '@polkadot/api';
import { Suite } from "../suite";
import { ACCOUNT, ProxyAddress, HOMA, STABLE_ASSET, LIQUID_CROWDLOAN, ACALA_API_ENDPOINTS, CURRENT_CHAIN_NAME, CURRENT_RPC } from "../utils/config";
import { ASSET_ADDRESS } from '../utils/config';
import { AcalaJsonRpcProvider } from '@acala-network/eth-providers';

(async () => {
    const suite = new Suite();
    let mandalaWSS = Object.values(ACALA_API_ENDPOINTS[CURRENT_CHAIN_NAME])
    await suite.connect(mandalaWSS);
    const provider = new AcalaJsonRpcProvider(CURRENT_RPC);
    const iStakingCall = new IStakingCall(provider)
    let testAccount = (new Keyring({ type: 'sr25519' })).addFromMnemonic(ACCOUNT as any)
    let testAddress = testAccount.address

    function callEVM(contractAddress: string, callData: string) {
        return suite.api.tx.evm.call(
            contractAddress,
            callData,
            0,
            1100004,
            111500,
            []
        )
    }

    async function callApprove(token: string, amount: string, account: any) {
        const callData = iStakingCall.approveEncode(amount)
        await suite.send(account, callEVM(token, callData))
    }

    async function callStake(poolId: number, amount: string, account: any) {
        const callData = iStakingCall.stakeEncode(poolId, amount)
        await suite.send(account, callEVM(ProxyAddress as any, callData))

    }

    async function callAddPool(token: string, account: any) {
        const callData = iStakingCall.addPoolEncode(token)
        await suite.send(account, callEVM(ProxyAddress as any, callData))
    }

    // console.log(await iStakingCall.owner())
    // const amount = '1000000000000'
    // await callApprove(ASSET_ADDRESS.LCDOT as any, amount, testAccount)
    // console.log('=== approve completed ===')
    // // await callAddPool(DOT)
    console.log(iStakingCall.stakeEncode(7, "1000000000"))
    // console.log('=== stake completed ===')

    // const liquidToken = suite.api.consts.homa.liquidCurrencyId;
    // const [rawBonded, rawTotalVoidLiquid, rawToBondPool, rawLiquidIssuance] = await Promise.all([
    //     suite.api.query.homa.totalStakingBonded(),
    //     suite.api.query.homa.totalVoidLiquid(),
    //     suite.api.query.homa.toBondPool(),
    //     suite.api.query.tokens.totalIssuance(liquidToken),
    // ]);

    // const bonded = rawBonded.toBigInt();
    // const toBondPool = rawToBondPool.toBigInt();
    // const liquidIssuance = rawLiquidIssuance.toBigInt();
    // const totalVoidLiquid = rawTotalVoidLiquid.toBigInt();

    // const totalBonded = toBondPool + bonded;
    // const exchangeRate = totalBonded * BigInt(10 ** 10) / (liquidIssuance + totalVoidLiquid);

    // console.log(exchangeRate, (liquidIssuance + totalVoidLiquid), (totalBonded * BigInt(10 ** 10)));
    
    console.log('completed')
    await suite.disconnect()
    //     process.exit(0)
})()