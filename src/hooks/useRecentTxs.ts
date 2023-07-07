import { useSelector } from "react-redux";
import {
  Transaction,
  TransactionAction,
  TransactionStatus,
} from "../redux/reducers/transactions";
import { RootState } from "../redux/store";

export const useRecentTxs = (): Transaction[] =>
  useSelector((s: RootState) => s.txs);

export const useTxPending = (
  id: string,
  action: TransactionAction
): boolean => {
  const txs = useSelector((s: RootState) => s.txs);
  return txs.some(
    (tx) =>
      tx.id === id &&
      tx.action === action &&
      tx.status === TransactionStatus.Pending
  );
};
