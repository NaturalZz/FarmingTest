import { ASSET_ADDRESS, TokenSymbol } from "./config"

export type ASSET = {
    name: string;
    symbol: TokenSymbol;
    decimals: number;
    minimalBalance: string;
    contract: string;
};

export const ASSET_METADATAS: ASSET[] = [
  {
    name: 'Acala',
    symbol: TokenSymbol.ACA,
    decimals: 12,
    minimalBalance: '100000000000',
    contract: ASSET_ADDRESS[TokenSymbol.ACA],
  },
  {
    name: 'Taiga DOT',
    symbol: TokenSymbol.TDOT,
    decimals: 10,
    minimalBalance: '100000000',
    contract: ASSET_ADDRESS[TokenSymbol.TDOT],
  },
  {
    name: 'WTDOT',
    symbol: TokenSymbol.WTDOT,
    decimals: 10,
    minimalBalance: '100000000',
    contract: ASSET_ADDRESS[TokenSymbol.WTDOT],
  },
  {
    name: 'Liquid Crowdloan DOT',
    symbol: TokenSymbol.LCDOT,
    decimals: 10,
    minimalBalance: '100000000',
    contract: ASSET_ADDRESS[TokenSymbol.LCDOT],
  },
  {
    name: 'Liquid DOT',
    symbol: TokenSymbol.LDOT,
    decimals: 10,
    minimalBalance: '500000000',
    contract: ASSET_ADDRESS[TokenSymbol.LDOT],
  },
  {
    name: 'Polkadot',
    symbol: TokenSymbol.DOT,
    decimals: 10,
    minimalBalance: '100000000',
    contract: ASSET_ADDRESS[TokenSymbol.DOT],
  },
  {
    name: 'Taiga (Portal from Karura)',
    symbol: TokenSymbol.TAI,
    decimals: 12,
    minimalBalance: '10000000000',
    contract: ASSET_ADDRESS[TokenSymbol.TAI],
  },
  {
    name: 'USDCet',
    symbol: TokenSymbol.USDCet,
    decimals: 6,
    minimalBalance: '10000000000',
    contract: ASSET_ADDRESS[TokenSymbol.USDCet]
  },
  {
    name: 'USDT',
    symbol: TokenSymbol.USDT,
    decimals: 6,
    minimalBalance: '10000',
    contract: ASSET_ADDRESS[TokenSymbol.USDT]
  },
  {
    name: 'TUSD',
    symbol: TokenSymbol.TUSD,
    decimals: 6,
    minimalBalance: '10000',
    contract: ASSET_ADDRESS[TokenSymbol.TUSD]
  },
  {
    name: 'WTUSD',
    symbol: TokenSymbol.WTUSD,
    decimals: 6,
    minimalBalance: '10000',
    contract: ASSET_ADDRESS[TokenSymbol.WTUSD]
  },
  {
    name: 'DOT_L',
    symbol: TokenSymbol.DOT_L,
    decimals: 10,
    minimalBalance: '10000',
    contract: ASSET_ADDRESS[TokenSymbol.DOT_L]
  },
  {
    name: 'LDOT_L',
    symbol: TokenSymbol.LDOT_L,
    decimals: 10,
    minimalBalance: '10000',
    contract: ASSET_ADDRESS[TokenSymbol.LDOT_L]
  },
  {
    name: 'Jito Staked SOL',
    symbol: TokenSymbol.JitoSOL,
    decimals: 9,
    minimalBalance: '10000',
    contract: ASSET_ADDRESS[TokenSymbol.JitoSOL]
  },
  {
    name: 'JTO',
    symbol: TokenSymbol.JTO,
    decimals: 9,
    minimalBalance: '10000',
    contract: ASSET_ADDRESS[TokenSymbol.JTO]
  },
  {
    name: 'LDOT_JitoSOL_LP',
    symbol: TokenSymbol.LDOT_JitoSOL_LP,
    decimals: 10,
    minimalBalance: '10000',
    contract: ASSET_ADDRESS[TokenSymbol.LDOT_JitoSOL_LP]
  },
];
  
export const NATIVE_TOKEN = ASSET_METADATAS.find((asset) => asset.symbol === TokenSymbol.ACA)!;
  
export const getTokenInfo = (symbolOrAddress?: string): ASSET | null => {
    if (!symbolOrAddress) {
      return null;
    }

    return (
      ASSET_METADATAS.find(
        (asset) =>
          asset.contract.toLowerCase() === symbolOrAddress.toLowerCase() ||
          asset.symbol.toLowerCase() === symbolOrAddress.toLowerCase()
      ) || null
    );
};
  
export const getTokenName = (value: string | undefined, convertTdot = true): TokenSymbol | undefined => {
    const token = getTokenInfo(value);
    return token?.symbol;
};
  