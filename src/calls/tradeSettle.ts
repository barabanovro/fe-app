import { AMM_METHODS, getTokenAddresses } from "../constants/amm";
import AmmAbi from "../abi/amm_abi.json";
import { AccountInterface } from "starknet";
import { OptionWithPosition } from "../classes/Option";
import { debug, LogTypes } from "../utils/debugger";
import { invalidatePositions } from "../queries/client";
import { afterTransaction } from "../utils/blockchain";
import { addTx, markTxAsDone, markTxAsFailed } from "../redux/actions";
import { TransactionAction } from "../redux/reducers/transactions";

export const tradeSettle = async (
  account: AccountInterface,
  option: OptionWithPosition
) => {
  try {
    const call = {
      contractAddress: getTokenAddresses().MAIN_CONTRACT_ADDRESS,
      entrypoint: AMM_METHODS.TRADE_SETTLE,
      calldata: option.tradeCalldata(option.fullSize),
    };
    debug("Executing following call:", call);
    const res = await account.execute(call, [AmmAbi]);
    if (res?.transaction_hash) {
      const hash = res.transaction_hash;
      addTx(hash, option.id, TransactionAction.Settle);
      afterTransaction(
        res.transaction_hash,
        () => {
          markTxAsDone(hash);
          invalidatePositions();
        },
        () => {
          markTxAsFailed(hash);
        }
      );
    }
    return res;
  } catch (e) {
    debug(LogTypes.ERROR, e);
    return null;
  }
};
