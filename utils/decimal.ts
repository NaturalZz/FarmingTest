import BigNumber from "bignumber.js";
import { BigNumberish } from "ethers";

export function truncationDecimal(value: string|number|BigNumber|BigNumberish, trunc: number) {
    value = new BigNumber(value.toString());
    return value.decimalPlaces(2).toString();
}

export function formatDecimal(value: string|number|BigNumber|BigNumberish, format: number) {
    value = new BigNumber(value.toString());
    return value.shiftedBy(format).toString()
}