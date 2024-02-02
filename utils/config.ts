import dotenv from "dotenv";
import { SupportedChainName } from "./type";
dotenv.config()

export const CURRENT_CHAIN_NAME = process.env.CURRENT_CHAIN_NAME as unknown as SupportedChainName
export const ACCOUNT = process.env.ACCOUNT
export const ALICE_ETH = process.env.ALICE_ETH
export const TEST_ACCOUNT = process.env.TEST_ACCOUNT

export const LIQUID_CROWDLOAN = '0x000000000000000000000000000000000000080a'
export const STABLE_ASSET = '0x0000000000000000000000000000000000000804'
export const HOMA = '0x0000000000000000000000000000000000000805'

export const RPC_URL: { [key in SupportedChainName]: string } = {
  [SupportedChainName.MAINNET]: 'https://eth-rpc-acala.aca-api.network/',
  [SupportedChainName.CHOPSTICKS]: 'https://crosschain-dev.polkawallet.io/forkAcala/',
  [SupportedChainName.MANDALA]: 'https://eth-rpc-tc9.aca-staging.network',
};
export const BLOCKSCOUT_API = {
  [SupportedChainName.MAINNET]: 'https://blockscout.acala.network',
  [SupportedChainName.CHOPSTICKS]: 'https://blockscout.acala.network',
  [SupportedChainName.MANDALA]: 'https://blockscout.mandala.aca-staging.network',
};
export const ProxyAddress = {
  [SupportedChainName.MAINNET]: '0x7fe92ec600f15cd25253b421bc151c51b0276b7d',
  [SupportedChainName.CHOPSTICKS]: '0x7fe92ec600f15cd25253b421bc151c51b0276b7d',
  [SupportedChainName.MANDALA]: '0x6dd151013dfce4a6bd3353c89373227ae90d9aa1'
}[CURRENT_CHAIN_NAME];
export const TAI = {
  [SupportedChainName.MAINNET]: '0x892ddd9387DBDeCEDaEF878bd7AcF8603109227F',
  [SupportedChainName.CHOPSTICKS]: '0x892ddd9387DBDeCEDaEF878bd7AcF8603109227F',
  [SupportedChainName.MANDALA]: '0x892ddd9387DBDeCEDaEF878bd7AcF8603109227F',
}[CURRENT_CHAIN_NAME];
export const WTDOT = {
  [SupportedChainName.MAINNET]: '0xe1bD4306A178f86a9214c39ABCD53D021bEDb0f9',
  [SupportedChainName.CHOPSTICKS]: '0xe1bD4306A178f86a9214c39ABCD53D021bEDb0f9',
  [SupportedChainName.MANDALA]: '0x0a4ba1E120287CD8585226ce7eF57b1E773e1640',
}[CURRENT_CHAIN_NAME];
export const WTUSD = {
  [SupportedChainName.MAINNET]: '0xe381a3d153293a81dd26c3e6ead18c74979e5eb5',
  [SupportedChainName.CHOPSTICKS]: '0xe381a3d153293a81dd26c3e6ead18c74979e5eb5',
  [SupportedChainName.MANDALA]: '0xe381a3d153293a81dd26c3e6ead18c74979e5eb5',
}[CURRENT_CHAIN_NAME];
export const StableAssetStakeUtil = {
  [SupportedChainName.MAINNET]: '0x2f5abfe6621f629258460e636528da87c115a4b9',
  [SupportedChainName.CHOPSTICKS]: '0x2f5abfe6621f629258460e636528da87c115a4b9',
  [SupportedChainName.MANDALA]: '0x2f5abfe6621f629258460e636528da87c115a4b9',
}[CURRENT_CHAIN_NAME];

export const ACALA_API_ENDPOINTS = {
  [SupportedChainName.MAINNET]: {
    'Host By Acala': 'wss://acala-rpc.aca-api.network',
    'Host By Acala Foundation 0': 'wss://acala-rpc-0.aca-api.network',
    'Host By Acala Foundation 1': 'wss://acala-rpc-1.aca-api.network',
    'Host By Acala Foundation 2': 'wss://acala-rpc-2.aca-api.network/ws',
    'Host By Acala Foundation 3': 'wss://acala-rpc-3.aca-api.network/ws',
    'Host By Polkawallet': 'wss://acala.polkawallet.io',
  },
  [SupportedChainName.CHOPSTICKS]: {
    'Host By Polkawallet': 'wss://crosschain-dev.polkawallet.io:9915',
  },
  [SupportedChainName.MANDALA]: {
    'Host By Polkawallet': 'wss://mandala-tc9-rpc.aca-staging.network/',
  },
};

export const KARURA_API_ENDPOINTS = {
  'Host By Acala': 'wss://karura-rpc.aca-api.network',
  'Host By Acala Foundation 1': 'wss://karura-rpc-1.aca-api.network/',
  'Host By Acala Foundation 2': 'wss://karura-rpc-2.aca-api.network/',
  'Host By Acala Foundation 3': 'wss://karura-rpc-3.aca-api.network/',
  'Host By Onfinality': 'wss://karura.api.onfinality.io/public-ws',
};

export enum TokenSymbol {
  ACA = 'ACA',
  TDOT = 'TDOT',
  WTDOT = 'WTDOT',
  LCDOT = 'LCDOT',
  LDOT = 'LDOT',
  DOT = 'DOT',
  KSM = 'KSM',
  TAI = 'TAI',
  USDCet = 'USDCet',
  USDT = 'USDT',
  TUSD = 'TUSD',
  WTUSD = 'WTUSD',
  DOT_L = 'DOT_L',
  LDOT_L = 'LDOT_L'
}

export const ASSET_ADDRESS = {
  [TokenSymbol.ACA]: '0x0000000000000000000100000000000000000000',
  [TokenSymbol.TDOT]: '0x0000000000000000000300000000000000000000',
  [TokenSymbol.LCDOT]: '0x000000000000000000040000000000000000000d',
  [TokenSymbol.LDOT]: '0x0000000000000000000100000000000000000003',
  [TokenSymbol.DOT]: '0x0000000000000000000100000000000000000002',
  [TokenSymbol.USDCet]: '0x07df96d1341a7d16ba1ad431e2c847d978bc2bce',
  [TokenSymbol.USDT]: '0x000000000000000000050000000000000000000c',
  [TokenSymbol.TUSD]: '0x0000000000000000000300000000000000000001',
  [TokenSymbol.WTUSD]: WTUSD,
  [TokenSymbol.TAI]: TAI,
  [TokenSymbol.WTDOT]: WTDOT,
  [TokenSymbol.DOT_L]: '0x2a43c0d689fDBde50a78C36Ab8067cc890c9fb5e',
  [TokenSymbol.LDOT_L]: '0xB58CB2e345E9FF3484aEAcE7595ff2334328C6b1'
}

// export const Convertors = {
//   [TokenSymbol.DOT]: {
//     [TokenSymbol.DOT_L]: '0xba05012265db9b3a5b516b635a5ffb0d27e9384f',
//     [TokenSymbol.WTDOT]: '0x308b5fe2f06cc03916fe3a969caf7174ba32ad90',
//     [TokenSymbol.LDOT]: '0x7f850ed2de2d4919050bdeda492a41432c42a39c'
//   },
//   [TokenSymbol.LDOT]: {
//     [TokenSymbol.LDOT_L]: '0xf31a85a7e2d784fdf2122b13dfee47911a6de4d1'
//   },
//   [TokenSymbol.LCDOT]: {
//     [TokenSymbol.LDOT]: '0xf2d1c488b2b5131d820984f190fc0866dea2bd78',
//     [TokenSymbol.WTDOT]: '0x687b4240581b1baddd1cb317831a6846cf028272',
//   }
// }

export const Convertors: {[contractAddress: string]: {
  shareType: TokenSymbol; 
  convertedShareType: TokenSymbol;
}} = {
  "0xba05012265db9b3a5b516b635a5ffb0d27e9384f": {
    shareType: TokenSymbol.DOT,
    convertedShareType: TokenSymbol.DOT_L
  },
  "0x308b5fe2f06cc03916fe3a969caf7174ba32ad90": {
    shareType: TokenSymbol.DOT,
    convertedShareType: TokenSymbol.WTDOT
  },
  "0x7f850ed2de2d4919050bdeda492a41432c42a39c": {
    shareType: TokenSymbol.DOT,
    convertedShareType: TokenSymbol.LDOT
  },
  "0xf31a85a7e2d784fdf2122b13dfee47911a6de4d1": {
    shareType: TokenSymbol.LDOT,
    convertedShareType: TokenSymbol.LDOT_L
  },
  "0xf2d1c488b2b5131d820984f190fc0866dea2bd78": {
    shareType: TokenSymbol.LCDOT,
    convertedShareType: TokenSymbol.LDOT
  },
  "0x687b4240581b1baddd1cb317831a6846cf028272": {
    shareType: TokenSymbol.LCDOT,
    convertedShareType: TokenSymbol.WTDOT
  },
}

export const getConvertor = (contractAddress: string) => {
  return Convertors[contractAddress.toLowerCase()]
}

export const PROXY = {
  host: "127.0.0.1",
  port: 7890,
};

export const BLACK_HOLE = "0x0000000000000000000000000000000000000000"
export const MAX_UINT_AMOUNT =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";
export const MAX_REWARD_TYPES = 3;
export const AVERAGE_BLOCK_TIME = 12
export const PER_DAY_SEC = 86400

export const CURRENT_RPC = RPC_URL[CURRENT_CHAIN_NAME]