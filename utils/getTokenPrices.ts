import { WsProvider } from '@polkadot/rpc-provider';
import { TypeRegistry } from '@polkadot/types/create';
import { hexToU8a } from '@polkadot/util';
import { FixedNumber } from 'ethers';
import request, { gql } from 'graphql-request';
import axios from 'axios-https-proxy-fix'
import { ACALA_API_ENDPOINTS, KARURA_API_ENDPOINTS, CURRENT_CHAIN_NAME, TokenSymbol } from './config';
import BigNumber from 'bignumber.js';
import { formatDecimal } from './decimal';


const storageKeys = {
  aca: '0xe3dfbf9efd69b9cdcbe25aa8cbfc0755d25c5abc6a2b5d5f996684e54830eb5a01a12dfa1fa4ab9a0000',
  dot: '0xe3dfbf9efd69b9cdcbe25aa8cbfc0755d25c5abc6a2b5d5f996684e54830eb5ac483de2de1246ea70002',
  ksm: '0xe3dfbf9efd69b9cdcbe25aa8cbfc0755d25c5abc6a2b5d5f996684e54830eb5a7f9938b78bd5ff520082',
};

const registry = new TypeRegistry();

let acalaProvider: WsProvider;
let karuraProvider: WsProvider;

export const getKaruraProvider = async () => {
  if (!karuraProvider) {
    karuraProvider = new WsProvider(Object.values(KARURA_API_ENDPOINTS));
  }
  await karuraProvider.isReady;

  return karuraProvider;
};

export const getAcalaProvider = async () => {
  if (!acalaProvider) {
    acalaProvider = new WsProvider(Object.values(ACALA_API_ENDPOINTS[CURRENT_CHAIN_NAME]));
  }
  await acalaProvider.isReady;

  return acalaProvider;
};

export const getTimestamp = async (provider: WsProvider, blockHash: string) => {
  const now = await provider.send('state_getStorage', [
    '0xf0c365c3cf59d671eb72da0e7a4113c49f1f0515f462cdcf84e0f1d6045dfcbb',
    blockHash,
  ]);

  const result = registry.createType('u64', hexToU8a(now));

  return Number((result.toBigInt() / BigInt(1000)).toString());
};

export const getBlock = async (provider: WsProvider, blockNumber?: number) => {
  const blockHash = await provider.send<string>('chain_getBlockHash', []);
  if (!blockNumber) {
    const header = await provider.send('chain_getHeader', [blockHash]);
    blockNumber = Number(header.number);
  }

  const now = await getTimestamp(provider, blockHash);

  return {
    blockNumber,
    blockHash,
    timestamp: now,
  };
};

const getPrice = async (provider: WsProvider, token: 'aca' | 'dot' | 'ksm', blockHash: string) => {
  const storageKey = storageKeys[token];
  const oracleValue = await provider.send('state_getStorage', [storageKey, blockHash]);

  const result: any = registry.createTypeUnsafe('{"value": "u128", "timestamp": "u64"}', [hexToU8a(oracleValue)]);

  return new BigNumber(result.value.toString()).toString();
};

export const getTaiPrice = async (
  _blockNumber?: number
): Promise<{
  blockNumber: number;
  blockHash: string;
  timestamp: number;
  price: string;
  acala: {
    blockNumber: number;
    blockHash: string;
    timestamp: number;
  };
}> => {
  const karuraProvider = await getKaruraProvider();
  const acalaProvider = await getAcalaProvider();
  const {
    blockNumber: acalaBlockNumber,
    blockHash: acalaBlockHash,
    timestamp: acalaTimestamp,
  } = await getBlock(acalaProvider, _blockNumber);

  const result = await fetch('https://karura.api.subscan.io/api/scan/block', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': '1b22406f66574469ac7ae2522488c1c7',
    },
    body: JSON.stringify({
      block_timestamp: acalaTimestamp,
      only_head: true,
    }),
  }).then((r) => r.json());

  const blockNumber = result.data?.block_num;
  const timestamp = result.data?.block_timestamp;
  const blockHash = result.data?.hash;

  if (!blockHash || !timestamp || !blockNumber) {
    throw new Error(`Can't find the karura block.`);
  }

  const ksmPrice = await getPrice(karuraProvider, 'ksm', blockHash);

  const tKsmPrice = ksmPrice;

  const _liquidityPool = await karuraProvider.send('state_getStorage', [
    '0xf62adb4cbbb61c68b60fe8aabda1f8e364d90cadaa764fd8da11d8fb12a69a4870620a5a6409749a00840300000000',
    blockHash,
  ]);

  const liquidityPool: any = registry.createTypeUnsafe('(u128,u128)', [hexToU8a(_liquidityPool)]);

  const taiPrice = new BigNumber(liquidityPool[1].toString())
    .div(liquidityPool[0].toString())
    .times(tKsmPrice).toString();

  // await karuraProvider.disconnect()
  // await acalaProvider.disconnect()
  return {
    blockNumber,
    blockHash,
    timestamp,
    price: taiPrice,
    acala: {
      blockNumber: acalaBlockNumber,
      blockHash: acalaBlockHash,
      timestamp: acalaTimestamp,
    },
  };
};

export const getLdotPrice = async (dotPrice: string, blockNumber: number): Promise<string> => {
  const ldot: any = await request(
    'https://api.polkawallet.io/acala-dex-subql',
    gql`
      query StableAssetPoolHourlyData($filter: StableAssetPoolHourlyDatumFilter) {
        stableAssetPoolHourlyData(orderBy: TIMESTAMP_DESC, first: 1, filter: $filter) {
          nodes {
            timestamp
            id
            poolId
            hourlyToken0TradeVolume
            hourlyToken1TradeVolume
          }
        }
      }
    `,
    {
      variables: {
        filter: {
          updateAtBlockId: {
            lessThanOrEqualTo: blockNumber,
          },
          poolId: {
            equalTo: 0,
          },
        },
      },
    }
  );

  return new BigNumber(ldot?.stableAssetPoolHourlyData?.nodes[0]?.hourlyToken0TradeVolume)
    .div(ldot?.stableAssetPoolHourlyData?.nodes[0]?.hourlyToken1TradeVolume)
    .times(dotPrice).toString();
};

export const getLcdotPrice = async (
  dotPrice: string,
  provider: WsProvider,
  blockHash: string
): Promise<string> => {
  const _liquidityPool = await provider.send('state_getStorage', [
    '0xf62adb4cbbb61c68b60fe8aabda1f8e364d90cadaa764fd8da11d8fb12a69a48b37ee6e2248d3b730002040d000000',
    blockHash,
  ]);

  const liquidityPool: any = registry.createTypeUnsafe('(u128,u128)', [hexToU8a(_liquidityPool)]);

  return new BigNumber(liquidityPool[0].toString())
    .div(liquidityPool[1].toString())
    .times(dotPrice).toString();
};

// export const getTokenPrices = async () => {
//   const rsp = await axios.get("https://farm.acala.network/api/token_prices")
//   return rsp.data.result
// }

export const getTokenPrices = async (
  _blockNumber?: number
): Promise<{
  blockHash: string;
  blockNumber: number;
  timestamp: number;
  tai: {
    blockNumber: number;
    blockHash: string;
    timestamp: number;
    price: string;
  };
  data: Record<Exclude<TokenSymbol, TokenSymbol.KSM>, string>;
}> => {
  const provider = await getAcalaProvider();
  const { blockHash, blockNumber, timestamp } = await getBlock(provider, _blockNumber);

  const [acaPrice, dotPrice, tai] = await Promise.all([
    getPrice(provider, 'aca', blockHash),
    getPrice(provider, 'dot', blockHash),
    getTaiPrice(blockNumber),
  ]);

  const [lcDotPrice, ldotPrice] = await Promise.all([
    getLcdotPrice(dotPrice, provider, blockHash),
    getLdotPrice(dotPrice, blockNumber),
  ]);

  // await acalaProvider.disconnect()

  return {
    blockHash,
    blockNumber,
    timestamp,
    tai: {
      blockNumber: tai.blockNumber,
      blockHash: tai.blockHash,
      timestamp: tai.timestamp,
      price: formatDecimal(tai.price, -18),
    },
    data: {
      [TokenSymbol.ACA]: formatDecimal(acaPrice, -18),
      [TokenSymbol.DOT]: formatDecimal(dotPrice, -18),
      [TokenSymbol.TDOT]: formatDecimal(dotPrice, -18),
      [TokenSymbol.WTDOT]: formatDecimal(dotPrice, -18),
      [TokenSymbol.LDOT]: formatDecimal(ldotPrice, -18),
      [TokenSymbol.LCDOT]: formatDecimal(lcDotPrice, -18),
      [TokenSymbol.TAI]: formatDecimal(tai.price, -18),
      [TokenSymbol.USDCet]: '0',
      [TokenSymbol.USDT]: '0',
      [TokenSymbol.TUSD]: '0',
      [TokenSymbol.WTUSD]: '0',
      [TokenSymbol.DOT_L]: formatDecimal(dotPrice, -18),
      [TokenSymbol.LDOT_L]: formatDecimal(ldotPrice, -18),
    },
  };
};
