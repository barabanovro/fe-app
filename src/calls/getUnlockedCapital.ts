import { uint256 } from "starknet";
import { AMM_METHODS } from "../constants/amm";
import { getMainContract } from "../utils/blockchain";
import { debug } from "../utils/debugger";
import BN from "bn.js";

const method = AMM_METHODS.GET_UNLOCKED_CAPITAL;

export const getUnlockedCapital = async (lpoolAddress: string): Promise<BN> => {
  const contract = getMainContract();

  const res = await contract.call(method, [lpoolAddress]).catch((e: Error) => {
    debug(`Failed while calling ${method}`, e.message);
    throw Error(e.message);
  });

  return uint256.uint256ToBN(res[0]);
};
