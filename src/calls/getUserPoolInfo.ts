import { debug } from "./../utils/debugger";
import { AMM_METHODS } from "../constants/amm";
import { ResponseUserPoolInfo, UserPoolInfo } from "../types/pool";
import { getMainContract } from "../utils/blockchain";
import { isInstanceOfUserPoolInfo } from "../utils/poolParser/isInstanceOfPool";
import { parseUserPoolInfo } from "../utils/poolParser/parsePool";
import { isNonEmptyArray } from "../utils/utils";

const method = AMM_METHODS.GET_USER_POOL_INFOS;

export const getUserPoolInfo = async (
  address: string
): Promise<UserPoolInfo[]> => {
  const contract = getMainContract();
  const res: unknown[] = await contract
    .call(method, [address])
    .catch((e: string) => {
      debug(`Failed while calling ${method}\n`, e);
      throw Error(`Failed while calling ${method}`);
    });

  if (!isNonEmptyArray(res) || !isNonEmptyArray(res[0])) {
    return [];
  }

  const validated: ResponseUserPoolInfo[] = res[0].filter(
    (v: unknown): v is ResponseUserPoolInfo => isInstanceOfUserPoolInfo(v)
  );

  const parsed = validated.map((v) => parseUserPoolInfo(v));

  return parsed;
};
