import { AMM_METHODS, BASE_DIGITS, ETH_BASE_VALUE } from "../constants/amm";
import { getMainContract } from "../utils/blockchain";
import { shortInteger } from "../utils/computations";
import { debug } from "../utils/debugger";
import BN from "bn.js";
import { uint256 } from "starknet";

const method = AMM_METHODS.GET_UNDERLYING_FOR_LPTOKENS;

type LptokenValue = {
  base: BN;
  converted: number;
};

export const getLptokenValue = async (
  lpoolAddress: string
): Promise<LptokenValue> => {
  const contract = getMainContract();

  const res = await contract
    .call(method, [lpoolAddress, uint256.bnToUint256(ETH_BASE_VALUE)])
    .catch((e: Error) => {
      debug(`Failed while calling ${method}`, e.message);
      throw Error(e.message);
    });

  const base = uint256.uint256ToBN(res[0]);
  const converted = shortInteger(base.toString(10), BASE_DIGITS);

  return { base, converted };
};
