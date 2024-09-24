import { BigNumber } from "ethers";
import { ASSET_ADDRESS } from "./config";
import { WTDOT } from "./config";

export type ContractAddress = string;
export type UserAddress = string;
export type Amount = number | string | BigNumber
export type BlockNumber = number | string

export enum SupportedChainName {
  MAINNET = 'MAINNET',
  CHOPSTICKS = 'CHOPSTICKS',
  MANDALA = 'MANDALA',
}

export enum SupportedChainId {
  MAINNET = 787,
  MANDALA = 595,
}

export const CHAIN_IDS = {
  [SupportedChainName.MAINNET]: SupportedChainId.MAINNET,
  [SupportedChainName.CHOPSTICKS]: SupportedChainId.MAINNET,
  [SupportedChainName.MANDALA]: SupportedChainId.MANDALA,
};

export const GENESIS_HASH = {
  [SupportedChainId.MAINNET]: '0xfc41b9bd8ef8fe53d58c7ea67c794c7ec9a73daf05e6d54b14ff6342c99ba64c',
  [SupportedChainId.MANDALA]: '0x3035b88c212be330a1a724c675d56d53a5016ec32af1790738832db0227ac54c',
};

export enum Operation {
    Stake = 0,
    Unstake = 1,
    ClaimRewards = 2
}

export enum ConvertType {
    LCDOT2LDOT = 0,
    LCDOT2TDOT = 1,
    DOT2LDOT = 2,
    DOT2TDOT = 3,
    LCDOT2WTDOT = 4,
    DOT2WTDOT = 5
}
interface Conversion {
    from: ContractAddress;
    to: ContractAddress;
}

export const getConversion = (type: ConvertType): Conversion => {
    switch (type) {
      case ConvertType.LCDOT2LDOT:
        return { from: ASSET_ADDRESS.LCDOT, to: ASSET_ADDRESS.LDOT };
      case ConvertType.LCDOT2TDOT:
        return { from: ASSET_ADDRESS.LCDOT, to: ASSET_ADDRESS.TDOT };
      case ConvertType.DOT2LDOT:
        return { from: ASSET_ADDRESS.DOT, to: ASSET_ADDRESS.LDOT };
      case ConvertType.DOT2TDOT:
        return { from: ASSET_ADDRESS.DOT, to: ASSET_ADDRESS.TDOT };
      case ConvertType.LCDOT2WTDOT:
        return { from: ASSET_ADDRESS.LCDOT, to: WTDOT };
      case ConvertType.DOT2WTDOT:
        return { from: ASSET_ADDRESS.DOT, to: WTDOT };
    }
}