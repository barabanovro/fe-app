import BN from "bn.js";
import { store } from "../redux/store";
import { NetworkName } from "../types/network";

type TokenAddresses = {
  ETH_ADDRESS: string;
  USD_ADDRESS: string;
  MAIN_CONTRACT_ADDRESS: string;
  LPTOKEN_CONTRACT_ADDRESS: string;
  LPTOKEN_CONTRACT_ADDRESS_PUT: string;
};

const testnetTokens = {
  ETH_ADDRESS:
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  USD_ADDRESS:
    "0x5a643907b9a4bc6a55e9069c4fd5fd1f5c79a22470690f75556c4736e34426",
  MAIN_CONTRACT_ADDRESS:
    "0x042a7d485171a01b8c38b6b37e0092f0f096e9d3f945c50c77799171916f5a54",
  LPTOKEN_CONTRACT_ADDRESS:
    "0x03b176f8e5b4c9227b660e49e97f2d9d1756f96e5878420ad4accd301dd0cc17",
  LPTOKEN_CONTRACT_ADDRESS_PUT:
    "0x0030fe5d12635ed696483a824eca301392b3f529e06133b42784750503a24972",
};

const testdevTokens = {
  ETH_ADDRESS:
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  USD_ADDRESS:
    "0x5a643907b9a4bc6a55e9069c4fd5fd1f5c79a22470690f75556c4736e34426",
  MAIN_CONTRACT_ADDRESS:
    "0x05cade694670f80dca1195c77766b643dce01f511eca2b7250ef113b57b994ec",
  LPTOKEN_CONTRACT_ADDRESS:
    "0x0149a0249403aa85859297ac2e3c96b7ca38f2b36d7a34212dcfbc92e8d66eb1",
  LPTOKEN_CONTRACT_ADDRESS_PUT:
    "0x077868613647e04cfa11593f628598e93071d52ca05f1e89a70add4bb3470897",
};

const mainnetTokens = {
  ETH_ADDRESS:
    "0x049D36570D4e46f48e99674bd3fcc84644DdD6b96F7C741B1562B82f9e004dC7",
  USD_ADDRESS:
    "0x053C91253BC9682c04929cA02ED00b3E423f6710D2ee7e0D5EBB06F3eCF368A8",
  MAIN_CONTRACT_ADDRESS:
    "0x76dbabc4293db346b0a56b29b6ea9fe18e93742c73f12348c8747ecfc1050aa",
  LPTOKEN_CONTRACT_ADDRESS:
    "0x7aba50fdb4e024c1ba63e2c60565d0fd32566ff4b18aa5818fc80c30e749024",
  LPTOKEN_CONTRACT_ADDRESS_PUT:
    "0x18a6abca394bd5f822cfa5f88783c01b13e593d1603e7b41b00d31d2ea4827a",
};

const devnetTokens = {
  ETH_ADDRESS:
    "0x049D36570D4e46f48e99674bd3fcc84644DdD6b96F7C741B1562B82f9e004dC7",
  USD_ADDRESS:
    "0x053C91253BC9682c04929cA02ED00b3E423f6710D2ee7e0D5EBB06F3eCF368A8",
  MAIN_CONTRACT_ADDRESS:
    "0x76dbabc4293db346b0a56b29b6ea9fe18e93742c73f12348c8747ecfc1050aa",
  LPTOKEN_CONTRACT_ADDRESS:
    "0x7aba50fdb4e024c1ba63e2c60565d0fd32566ff4b18aa5818fc80c30e749024",
  LPTOKEN_CONTRACT_ADDRESS_PUT:
    "0x18a6abca394bd5f822cfa5f88783c01b13e593d1603e7b41b00d31d2ea4827a",
};

const networkToTokenMap = new Map<NetworkName, TokenAddresses>([
  [NetworkName.Devnet, devnetTokens],
  [NetworkName.Testnet, testnetTokens],
  [NetworkName.Testdev, testdevTokens],
  [NetworkName.Mainnet, mainnetTokens],
]);

export const getTokenAddresses = (): TokenAddresses => {
  const network = store.getState().network.network.name;

  return networkToTokenMap.get(network) as TokenAddresses;
};

export const enum AMM_METHODS {
  IS_OPTION_AVAILABLE = "is_option_available",
  GET_POOL_AVAILABLE_BALANCE = "get_pool_available_balance",
  APPROVE = "approve",
  TRADE_OPEN = "trade_open",
  TRADE_CLOSE = "trade_close",
  TRADE_SETTLE = "trade_settle",
  GET_AVAILABLE_OPTIONS = "get_available_options",
  GET_OPTION_TOKEN_ADDRESS = "get_option_token_address",
  GET_ALL_NON_EXPIRED_OPTIONS_WITH_PREMIA = "get_all_non_expired_options_with_premia",
  GET_OPTION_WITH_POSITION_OF_USER = "get_option_with_position_of_user",
  DEPOSIT_LIQUIDITY = "deposit_liquidity",
  GET_USER_POOL_INFOS = "get_user_pool_infos",
  WITHDRAW_LIQUIDITY = "withdraw_liquidity",
  GET_TOTAL_PREMIA = "get_total_premia",
}

export const SLIPPAGE = 0.1;

export const ETH_DIGITS = 18;
export const USD_DIGITS = 6;
export const ETH_BASE_VALUE = new BN(10).pow(new BN(ETH_DIGITS));
export const USD_BASE_VALUE = new BN(10).pow(new BN(USD_DIGITS));
export const BASE_MATH_64_61 = new BN(2).pow(new BN(61));
export const USD_PRECISSION = 1000;

export const DEV_API_URL_TESTNET = "https://api.carmine-dev.eu/api/v1/testnet/";
export const DEV_API_URL_MAINNET = "https://api.carmine-dev.eu/api/v1/mainnet/";
export const API_URL_TESTNET = "https://api.carmine.finance/api/v1/testnet/";
export const API_URL_MAINNET = "https://api.carmine.finance/api/v1/mainnet/";
