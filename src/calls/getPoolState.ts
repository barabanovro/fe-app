import BN from "bn.js";
import { debug } from "../utils/debugger";
import { hexToBN } from "../utils/utils";

type RawPoolState = {
  unlocked_cap: string;
  locked_cap: string;
  lp_balance: string;
  pool_position: string;
  lp_token_value: string;
  block_number: number;
  lp_address: string;
  timestamp: number;
};

type PoolState = {
  unlocked_cap: BN;
  locked_cap: BN;
  lp_balance: BN;
  pool_position: BN;
  lp_token_value: BN;
  block_number: number;
  lp_address: string;
  timestamp: number;
};

const parsePoolState = (obj: RawPoolState): PoolState => {
  const parsed: PoolState = {
    unlocked_cap: hexToBN(obj.unlocked_cap),
    locked_cap: hexToBN(obj.locked_cap),
    lp_balance: hexToBN(obj.lp_balance),
    pool_position: hexToBN(obj.pool_position),
    lp_token_value: hexToBN(obj.lp_token_value),
    block_number: obj.block_number,
    lp_address: obj.lp_address,
    timestamp: obj.timestamp,
  };
  return parsed;
};

export const getPoolState = async (
  pool: "eth-usdc-call" | "eth-usdc-put"
): Promise<PoolState> => {
  const state = await fetch(
    `https://api.carmine.finance/api/v1/mainnet/${pool}/state`
  )
    .then((response) => response.json())
    .then((result) => {
      if (result && result.status === "success") {
        const state = result.data;
        debug(state);
        return parsePoolState(state);
      }
    })
    .catch((e) => {
      debug(e);
    });
  if (state) {
    return state;
  }
  throw Error("Failed fetching pool state");
};
