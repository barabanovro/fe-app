import { openNetworkMismatchDialog, updateNetwork } from "../redux/actions";
import {
  StarknetWindowObject,
  getStarknet,
  ConnectedStarknetWindowObject,
} from "get-starknet-core";
import { debug } from "../utils/debugger";
import { store } from "../redux/store";
import { SupportedWalletIds } from "../types/wallet";
import { addWalletEventHandlers } from "./walletEvents";
import { NetworkName } from "../types/network";

const isConnectedWallet = (
  wallet: StarknetWindowObject | undefined
): wallet is ConnectedStarknetWindowObject => {
  if (wallet && wallet.isConnected && wallet.account) {
    return true;
  }

  return false;
};

export const getWallet = (): ConnectedStarknetWindowObject | undefined => {
  const { walletId } = store.getState().network;

  if (!walletId) {
    return undefined;
  }

  const wallet =
    walletId === SupportedWalletIds.ArgentX
      ? window.starknet_argentX
      : window.starknet_braavos;

  if (isConnectedWallet(wallet)) {
    return wallet;
  }
  return undefined;
};

export const disconnect = () => {
  const sn = getStarknet();
  sn.disconnect().then(() => {
    updateNetwork({ walletId: undefined });
    debug("Wallet disconnected");
  });
};

export const connect = (
  wallet: StarknetWindowObject,
  fromLatest: boolean = false
) => {
  const sn = getStarknet();
  sn.enable(wallet).then(async () => {
    if (!isConnectedWallet(wallet)) {
      return;
    }
    updateNetwork({ walletId: wallet.id as SupportedWalletIds });
    debug("Wallet connected", wallet);

    const network = store.getState().network.network;

    const accountChainId = await wallet.account.getChainId();

    debug("Connecting wallet", {
      walletNetworkName: wallet.chainId,
      walletChainId: wallet.account.chainId,
      appChainId: network.chainId,
      appNetworkName: network.name,
      accountChainId,
    });

    if (network.chainId !== accountChainId) {
      if (store.getState().network.network.name === NetworkName.Devnet) {
        // devnet - ignore network mismatch
        return;
      }
      debug("Wallet - App network mismatch, opening dialog");
      disconnect();
      if (fromLatest) {
        // do not open the dialog if the page is loading/just loaded
        return;
      }
      openNetworkMismatchDialog();
    }

    addWalletEventHandlers(wallet);
  });
};

const foundWallet = (): boolean =>
  !!window.starknet_argentX || !!window.starknet_braavos;

export const connectToLatest = async () => {
  const { walletId } = store.getState().network;

  if (walletId) {
    // already connected
    return;
  }

  let n = 0;
  while (n < 5) {
    if (foundWallet()) {
      debug(`Found wallet on attempt #${n}`);
      break;
    }
    const waitTime = 2 ** n;
    await new Promise((r) => setTimeout(r, waitTime));
    n++;
  }

  debug("Available wallets", {
    argentX: !!window.starknet_argentX,
    braavos: !!window.starknet_braavos,
  });

  const sn = getStarknet();
  const latestWallet = await sn.getLastConnectedWallet();

  debug("Latest wallet", latestWallet);

  if (latestWallet) {
    return connect(latestWallet, true);
  }
};
