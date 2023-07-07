import { AMM_METHODS, getTokenAddresses } from "../constants/amm";
import { debug } from "../utils/debugger";
import { AccountInterface } from "starknet";
import LpAbi from "../abi/lptoken_abi.json";
import AmmAbi from "../abi/amm_abi.json";
import { afterTransaction } from "../utils/blockchain";
import { addTx, markTxAsDone, markTxAsFailed } from "../redux/actions";
import { TransactionAction } from "../redux/reducers/transactions";
import { Pool } from "../classes/Pool";

export const depositLiquidity = async (
  account: AccountInterface,
  size: string,
  pool: Pool,
  ok: () => void,
  nok: () => void
): Promise<void> => {
  const { USD_ADDRESS, ETH_ADDRESS, MAIN_CONTRACT_ADDRESS } =
    getTokenAddresses();

  const approveCalldata = {
    contractAddress: pool.tokenAddress,
    entrypoint: AMM_METHODS.APPROVE,
    calldata: [MAIN_CONTRACT_ADDRESS, size, "0"],
  };

  const depositLiquidityCalldata = {
    contractAddress: MAIN_CONTRACT_ADDRESS,
    entrypoint: AMM_METHODS.DEPOSIT_LIQUIDITY,
    calldata: [
      pool.tokenAddress,
      USD_ADDRESS,
      ETH_ADDRESS,
      pool.parsed.optionType,
      size,
      "0",
    ],
  };

  debug("Depositing liquidity with calldata:", [
    approveCalldata,
    depositLiquidityCalldata,
  ]);

  const res = await account
    .execute([approveCalldata, depositLiquidityCalldata], [LpAbi, AmmAbi])
    .catch((e: Error) => {
      debug('"Stake capital" user rejected or failed');
      debug("error", e.message);
    });

  if (res?.transaction_hash) {
    const hash = res.transaction_hash;
    addTx(hash, pool.id, TransactionAction.Stake);
    afterTransaction(
      res.transaction_hash,
      () => {
        // everything done - OK callback
        ok();
        markTxAsDone(hash);
      },
      () => {
        debug("Tx failed");
        nok();
        markTxAsFailed(hash);
      }
    );
  } else {
    // transaction was not successfully created (no txhash)
    // NotOK callback
    nok();
  }
};
