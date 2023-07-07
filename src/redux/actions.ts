import { setSlippageState, updateSettingsState } from "./reducers/settings";
import { updateNetworkState } from "./reducers/network";
import {
  DialogContentElem,
  setBuyInsuranceModalState,
  setCloseOptionState,
  setToastState,
  ToastType,
  toggleDialog,
} from "./reducers/ui";
import { store } from "./store";
import { Settings } from "../types/settings";
import { NetworkState } from "../types/network";
import { OptionWithPosition } from "../classes/Option";
import {
  addTxReducer,
  setTxStatusReducer,
  Transaction,
  TransactionAction,
  TransactionStatus,
} from "./reducers/transactions";
import { BuyInsuranceModalData } from "../components/Insurance/BuyInsuranceModal";

export const updateSettings = (v: Partial<Settings>) =>
  store.dispatch(updateSettingsState(v));

export const updateNetwork = (v: Partial<NetworkState>) =>
  store.dispatch(updateNetworkState(v));

export const closeDialog = () =>
  store.dispatch(
    toggleDialog({
      dialogOpen: false,
    })
  );

const openDialogWithContent = (content: DialogContentElem) =>
  store.dispatch(
    toggleDialog({
      dialogOpen: true,
      dialogContent: content,
    })
  );

export const openNetworkMismatchDialog = () =>
  openDialogWithContent(DialogContentElem.NetworkMismatch);

export const openWalletConnectDialog = () =>
  openDialogWithContent(DialogContentElem.Wallet);

export const openSlippageDialog = () =>
  openDialogWithContent(DialogContentElem.Slippage);

export const openCloseOptionDialog = () =>
  openDialogWithContent(DialogContentElem.CloseOption);

export const openBuyInsuranceDialog = () =>
  openDialogWithContent(DialogContentElem.BuyInsurance);

export const openAccountDialog = () =>
  openDialogWithContent(DialogContentElem.Account);

export const openCallWidoDialog = () =>
  openDialogWithContent(DialogContentElem.CallWido);

export const openPutWidoDialog = () =>
  openDialogWithContent(DialogContentElem.PutWido);

export const openMetamaskMissingDialog = () =>
  openDialogWithContent(DialogContentElem.MetamaskMissing);

export const setSlippage = (n: number) => store.dispatch(setSlippageState(n));

export const setCloseOption = (option: OptionWithPosition) =>
  store.dispatch(setCloseOptionState(option));

export const setBuyInsuranceModal = (data: BuyInsuranceModalData) =>
  store.dispatch(setBuyInsuranceModalState(data));

export const showToast = (message: string, type: ToastType = ToastType.Info) =>
  store.dispatch(setToastState({ message, open: true, type }));

export const hideToast = () => store.dispatch(setToastState({ open: false }));

export const addTx = (hash: string, id: string, action: TransactionAction) => {
  const tx: Transaction = {
    id,
    hash,
    action,
    status: TransactionStatus.Pending,
    timestamp: new Date().getTime(),
    chainId: store.getState().network.network.chainId,
  };
  store.dispatch(addTxReducer(tx));
};

export const markTxAsDone = (hash: string) =>
  store.dispatch(
    setTxStatusReducer({ hash, status: TransactionStatus.Success })
  );

export const markTxAsFailed = (hash: string) =>
  store.dispatch(
    setTxStatusReducer({ hash, status: TransactionStatus.Failed })
  );
