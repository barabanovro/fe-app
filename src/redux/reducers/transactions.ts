import { createSlice } from "@reduxjs/toolkit";
import { constants } from "starknet";

export enum TransactionAction {
  TradeOpen = "TradeOpen",
  TradeClose = "TradeClose",
  Stake = "Stake",
  Withdraw = "Withdraw",
  Settle = "Settle",
  ClaimAirdrop = "ClaimAirdrop",
  Vote = "Vote",
}

export enum TransactionStatus {
  Pending = "Pending",
  Success = "Success",
  Failed = "Failed",
}

export interface Transaction {
  action: TransactionAction;
  hash: string;
  id: string;
  timestamp: number;
  finishedTimestamp?: number;
  status: TransactionStatus;
  chainId: constants.StarknetChainId;
}

export const txs = createSlice({
  name: "txs",
  initialState: [] as Transaction[],
  reducers: {
    addTxReducer: (state, action: { payload: Transaction }) => {
      state.push(action.payload);
      return state;
    },
    setTxStatusReducer: (
      state,
      action: { payload: { hash: string; status: TransactionStatus } }
    ) => {
      const tx = state.find((tx) => tx.hash === action.payload.hash);
      if (tx) {
        const timestamp = new Date().getTime();

        tx.status = action.payload.status;
        tx.finishedTimestamp = timestamp;
      }
      return state;
    },
  },
});

export const { addTxReducer, setTxStatusReducer } = txs.actions;
