import { AccountInterface } from "starknet";
import { AMM_ADDRESS, AMM_METHODS } from "../../constants/amm";
import { debug } from "../../utils/debugger";
import AmmAbi from "../../abi/amm_abi.json";
import { invalidateStake } from "../../queries/client";
import { afterTransaction } from "../../utils/blockchain";
import {
  addTx,
  markTxAsDone,
  openNotEnoughUnlockedCapitalDialog,
  showToast,
} from "../../redux/actions";
import { ToastType } from "../../redux/reducers/ui";
import { TransactionAction } from "../../redux/reducers/transactions";
import { UserPoolInfo } from "../../classes/Pool";
import { toHex } from "../../utils/utils";

const calculateTokens = (
  pool: UserPoolInfo,
  amount: number
): [bigint, bigint] => {
  // amount * digits / value = percentage to withdraw
  // percentage * size = tokens to withdraw
  const NUM_PRECISSION = 1_000_000;

  const percentageWithPrecission =
    (BigInt(amount * NUM_PRECISSION) * 10n ** BigInt(pool.digits)) /
    pool.valueBase;

  const tokens =
    (percentageWithPrecission * pool.sizeBase) / BigInt(NUM_PRECISSION);

  const value =
    (percentageWithPrecission * pool.valueBase) / BigInt(NUM_PRECISSION);

  return [tokens, value];
};

export const withdrawCall = async (
  account: AccountInterface,
  setProcessing: (b: boolean) => void,
  pool: UserPoolInfo,
  amount: number | "all"
) => {
  setProcessing(true);

  const unlocked = await pool.getUnlocked();

  const [tokens, value] =
    amount === "all"
      ? [pool.sizeBase, pool.valueBase]
      : calculateTokens(pool, amount);

  // if withdrawing more than unlocked
  // show dialog and stop transaction
  if (value > unlocked) {
    debug("Withdrawing more than unlocked");
    openNotEnoughUnlockedCapitalDialog();
    setProcessing(false);
    return;
  }

  const calldata = [
    pool.underlying.address,
    pool.quoteToken.address,
    pool.baseToken.address,
    pool.type,
    toHex(tokens),
    "0", // uint256 trailing 0
  ];

  const withdraw = {
    contractAddress: AMM_ADDRESS,
    entrypoint: AMM_METHODS.WITHDRAW_LIQUIDITY,
    calldata,
  };

  debug(`Calling ${AMM_METHODS.WITHDRAW_LIQUIDITY}`, withdraw);

  const res = await account.execute(withdraw, [AmmAbi]).catch((e) => {
    debug("Withdraw rejected by user or failed\n", e.message);
    setProcessing(false);
  });

  if (res?.transaction_hash) {
    const hash = res.transaction_hash;

    addTx(hash, pool.poolId, TransactionAction.Withdraw);
    afterTransaction(res.transaction_hash, () => {
      invalidateStake();
      setProcessing(false);
      showToast("Successfully withdrew capital", ToastType.Success);
      markTxAsDone(hash);
    });
  }
};
