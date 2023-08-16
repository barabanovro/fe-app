import {
  AMM_METHODS,
  ETH_DIGITS,
  USD_DIGITS,
  getTokenAddresses,
} from "../constants/amm";
import { getMainContract } from "../utils/blockchain";
import { shortInteger } from "../utils/computations";
import { debug } from "../utils/debugger";
import BN from "bn.js";
import { uint256 } from "starknet";

export const lpoolBalance = async (lpoolAddress: string): Promise<BN> => {
  const contract = getMainContract();

  const balanceRes = await contract
    .call(AMM_METHODS.GET_LOOP_BALANCE, [lpoolAddress])
    .catch((e: Error) => {
      debug(`Failed while calling ${AMM_METHODS.GET_LOOP_BALANCE}`, e.message);
      throw Error(e.message);
    });

  const converted = uint256.uint256ToBN(balanceRes[0]);
  return converted;
};

export const lpoolLimit = async (tokenAddress: string): Promise<BN> => {
  const contract = getMainContract();

  const limitRes = await contract
    .call(AMM_METHODS.GET_MAX_LPOOL_BALANCE, [tokenAddress])
    .catch((e: Error) => {
      debug(
        `Failed while calling ${AMM_METHODS.GET_MAX_LPOOL_BALANCE}`,
        e.message
      );
      throw Error(e.message);
    });

  const converted = uint256.uint256ToBN(limitRes[0]);
  return converted;
};

type PoolLimit = {
  base: BN;
  converted: number;
  symbol: string;
};

export const poolLimit = async (lpoolAddress: string): Promise<PoolLimit> => {
  const addresses = getTokenAddresses();
  if (
    lpoolAddress !== addresses.LPTOKEN_CONTRACT_ADDRESS &&
    lpoolAddress !== addresses.LPTOKEN_CONTRACT_ADDRESS_PUT
  ) {
    // weird to address
    debug("wrong to address", lpoolAddress);
  }
  const [tokenAddress, decimals, symbol] =
    lpoolAddress === addresses.LPTOKEN_CONTRACT_ADDRESS
      ? [addresses.ETH_ADDRESS, ETH_DIGITS, "ETH"]
      : [addresses.USD_ADDRESS, USD_DIGITS, "USDC"];

  const [balance, limit] = await Promise.all([
    lpoolBalance(lpoolAddress),
    lpoolLimit(tokenAddress),
  ]).catch((e) => {
    debug("Failed getting poolLimit", e);
    throw Error(e);
  });

  const _stakable = limit.sub(balance);
  const zero = new BN(0);
  const stakable = _stakable.gt(zero) ? _stakable : zero;
  const converted = shortInteger(stakable.toString(10), decimals);

  debug(
    `balance: ${balance.toString(10)}\nlimit:  ${limit.toString(
      10
    )}\nstakable: ${stakable}`
  );

  return {
    base: stakable,
    converted,
    symbol,
  };
};
