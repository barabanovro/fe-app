import { NetworkName } from "./../types/network";
import BN from "bn.js";
import {
  ETH_DIGITS,
  USD_BASE_VALUE,
  USD_DIGITS,
  getTokenAddresses,
  API_URL_MAINNET,
  API_URL_TESTNET,
} from "../constants/amm";
import { Theme } from "@mui/system";
import { ThemeVariants } from "../style/themes";
import { OptionSide, OptionType } from "../types/options";
import { TESTNET_CHAINID } from "../constants/starknet";
import { store } from "../redux/store";

export const isNonEmptyArray = (v: unknown): v is Array<any> =>
  !!(v && Array.isArray(v) && v.length > 0);

export const handleBlockChainResponse = (v: unknown): BN | null =>
  v && isNonEmptyArray(v) ? v[0] : null;

export const weiToEth = (bn: BN, decimalPlaces: number): string => {
  const v: string = Number(bn)
    .toLocaleString("fullwide", { useGrouping: false })
    .padStart(19, "0");
  const index = v.length - 18;
  const [lead, tail] = [v.slice(0, index), v.slice(index)];
  const dec = tail.substring(0, decimalPlaces);

  if (Number(lead) === 0 && Number(dec) === 0) {
    return "0";
  }

  if (Number(dec) === 0) {
    return lead;
  }

  return `${lead}.${dec}`;
};

export const weiTo64x61 = (wei: string): string => {
  const base = new BN(wei);
  const m = new BN(2).pow(new BN(61));
  const d = new BN(10).pow(new BN(18));

  const res = base.mul(m).div(d).toString(10);
  return res;
};

export const timestampToReadableDate = (ts: number): string =>
  new Intl.DateTimeFormat("default", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZoneName: "short",
  }).format(ts);

export const timestampToShortTimeDate = (ts: number): string =>
  new Intl.DateTimeFormat("default", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(ts);

export const timestampToRichDate = (ts: number): string => {
  const d = new Date(ts);
  return d.getDate() + ". " + (d.getMonth() + 1) + ". " + d.getFullYear();
};

export const hashToReadable = (v: string): string =>
  v.slice(0, 4) + "..." + v.slice(v.length - 4);

export const premiaToUsd = (usdInMath64x61: BN): string => {
  return new BN(usdInMath64x61)
    .mul(new BN(USD_BASE_VALUE))
    .div(new BN(2).pow(new BN(61)))
    .toString(10);
};

export const premiaToWei = (bn: BN): string =>
  new BN(bn)
    .mul(new BN(10).pow(new BN(18)))
    .div(new BN(2).pow(new BN(61)))
    .toString(10);

export const debounce = (cb: (...args: any[]) => void, delay: number = 750) => {
  let timeout: number;

  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => {
      cb(...args);
    }, delay);
  };
};

export const isDarkTheme = (theme: Theme) =>
  theme.palette.mode === ThemeVariants.dark;

export const isCall = (type: OptionType): boolean => type === OptionType.Call;

export const isLong = (side: OptionSide): boolean => side === OptionSide.Long;

export const currencyAddresByType = (type: OptionType) =>
  getTokenAddresses()[isCall(type) ? "ETH_ADDRESS" : "USD_ADDRESS"];

export const digitsByType = (type: OptionType) =>
  isCall(type) ? ETH_DIGITS : USD_DIGITS;

export const toHex = (v: BN) => "0x" + v.toString(16);

export const hexToBN = (v: string): BN => new BN(v.substring(2), "hex");

export const assert = (condition: boolean, message?: string): void => {
  if (!condition) {
    throw new Error("Assertion failed " + message);
  }
};

type StarkscanProps = {
  chainId?: string;
  txHash?: string;
  contractHash?: string;
};

export const getStarkscanUrl = ({
  chainId,
  txHash,
  contractHash,
}: StarkscanProps): string => {
  const baseUrl = `https://${
    chainId === TESTNET_CHAINID ? "testnet." : ""
  }starkscan.co`;

  if (txHash) {
    return `${baseUrl}/tx/${txHash}`;
  }

  if (contractHash) {
    return `${baseUrl}/contract/${contractHash}`;
  }

  // fallback
  return "";
};

export const getApiUrl = () => {
  const network = store.getState().network.network.name;
  const [testnet, mainnet] = [API_URL_TESTNET, API_URL_MAINNET];

  if (network === NetworkName.Mainnet) {
    return mainnet;
  }
  if (network === NetworkName.Devnet) {
    return API_URL_MAINNET;
  }
  return testnet;
};

export const addressElision = (address: string, n: number = 5): string => {
  const standardised = standardiseAddress(address);

  if (standardised.length < 2 * n) {
    // too short for elision
    return standardised;
  }

  const start = standardised.substring(0, n);
  const end = standardised.substring(standardised.length - n);

  return `${start}...${end}`;
};

export const isDev =
  new URL(window.location.href).hostname !== "app.carmine.finance";

export const stripZerosFromAddress = (address: string): string => {
  const withoutPrefix = address.replace(/^0x0*/g, "");
  return "0x" + withoutPrefix;
};

export const standardiseAddress = (address: string): string => {
  const withoutPrefix = address.replace(/^0x0*/g, "").toLowerCase();
  return "0x" + withoutPrefix;
};

export const uniquePrimitiveValues = (
  value: any,
  index: number,
  array: any[]
) => array.indexOf(value) === index;
