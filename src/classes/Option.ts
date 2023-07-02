import {
  decimalToMath64x61,
  intToDecimal,
  math64x61ToInt,
  uint256toDecimal,
} from "../utils/units";
import BN from "bn.js";
import {
  bnToOptionType,
  bnToOptionSide,
  convertSizeToInt,
} from "../utils/conversions";
import { math64x61toDecimal } from "../utils/units";
import {
  digitsByType,
  timestampToReadableDate,
  timestampToShortTimeDate,
  toHex,
} from "../utils/utils";
import {
  RawOptionBase,
  ParsedOptionBase,
  OptionSide,
  RawOptionWithPosition,
  RawOptionWithPremia,
  ParsedOptionWithPosition,
  ParsedOptionWithPremia,
  FinancialData,
} from "../types/options";
import { BASE_DIGITS } from "../constants/amm";
import { TokenPair, getTokenPairByAddresses } from "../tokens/tokens";
import { Pool } from "./Pool";
import { shortInteger } from "../utils/computations";

type Props =
  | {
      raw: RawOptionBase;
    }
  | {
      parsed: ParsedOptionBase;
    };

export class Option extends Pool {
  raw: RawOptionBase;
  parsed: ParsedOptionBase;
  id: string;
  tokenPair: TokenPair;

  constructor(props: Props) {
    super(props);
    if ("raw" in props) {
      this.raw = props.raw;
      this.parsed = this.parsedFromRaw(props.raw);
      this.id = this.generateId();
      this.tokenPair = getTokenPairByAddresses(
        this.parsed.baseToken,
        this.parsed.quoteToken
      );
    } else if ("parsed" in props) {
      this.parsed = props.parsed;
      this.raw = this.rawFromParsed(props.parsed);
      this.id = this.generateId();
      this.tokenPair = getTokenPairByAddresses(
        this.parsed.baseToken,
        this.parsed.quoteToken
      );
    } else {
      throw Error("No option specified in constructor");
    }
  }

  parsedFromRaw(raw: RawOptionBase): ParsedOptionBase {
    return {
      optionSide: bnToOptionSide(raw.option_side),
      optionType: bnToOptionType(raw.option_type),
      maturity: new BN(raw.maturity).toNumber(),
      strikePrice: math64x61toDecimal(raw.strike_price.toString(10)),
      quoteToken: toHex(raw.quote_token_address),
      baseToken: toHex(raw.base_token_address),
    };
  }

  rawFromParsed(parsed: ParsedOptionBase): RawOptionBase {
    return {
      option_side: new BN(parsed.optionSide),
      maturity: new BN(parsed.maturity),
      strike_price: new BN(decimalToMath64x61(parsed.strikePrice)),
      quote_token_address: new BN(parsed.quoteToken),
      base_token_address: new BN(parsed.baseToken),
      option_type: new BN(parsed.optionType),
    };
  }

  tradeCalldata(size: string | number): string[] {
    const targetSize = typeof size === "number" ? convertSizeToInt(size) : size;
    return [
      toHex(this.raw.option_type),
      toHex(this.raw.strike_price),
      new BN(this.raw.maturity).toString(10),
      toHex(this.raw.option_side),
      targetSize,
      toHex(this.raw.quote_token_address),
      toHex(this.raw.base_token_address),
    ];
  }

  addPosition(position_size: BN, value_of_position: BN): OptionWithPosition {
    const raw: RawOptionWithPosition = {
      ...this.raw,
      position_size,
      value_of_position,
    };
    return new OptionWithPosition({ raw });
  }

  addPremia(premia: BN): OptionWithPremia {
    const raw: RawOptionWithPremia = {
      ...this.raw,
      premia,
    };
    return new OptionWithPremia({ raw });
  }

  isSide(side: OptionSide): boolean {
    return this.parsed.optionSide === side;
  }

  financialDataCall(
    size: number,
    // premia is in base token
    premia: number,
    basePrice: number,
    quotePrice: number
  ): FinancialData {
    const premiaUsd = premia * basePrice;
    const premiaBase = premia;
    const premiaQuote = premiaUsd / quotePrice;
    const sizeOnePremiaUsd = premiaUsd / size;
    const sizeOnePremiaBase = premiaBase / size;
    const sizeOnePremiaQuote = premiaQuote / size;

    return {
      premiaUsd,
      premiaBase,
      premiaQuote,
      sizeOnePremiaUsd,
      sizeOnePremiaBase,
      sizeOnePremiaQuote,
    };
  }

  financialDataPut(
    size: number,
    // premia is in quote token
    premia: number,
    basePrice: number,
    quotePrice: number
  ): FinancialData {
    const premiaUsd = premia * quotePrice;
    const premiaBase = premiaUsd / basePrice;
    const premiaQuote = premia;
    const sizeOnePremiaUsd = premiaUsd / size;
    const sizeOnePremiaBase = premiaBase / size;
    const sizeOnePremiaQuote = premiaQuote / size;

    return {
      premiaUsd,
      premiaBase,
      premiaQuote,
      sizeOnePremiaUsd,
      sizeOnePremiaBase,
      sizeOnePremiaQuote,
    };
  }

  financialData(
    size: number,
    premia: number,
    basePrice: number,
    quotePrice: number
  ): FinancialData {
    return this.isCall
      ? this.financialDataCall(size, premia, basePrice, quotePrice)
      : this.financialDataPut(size, premia, basePrice, quotePrice);
  }

  ////////////
  // GETTERS
  ////////////

  get otherSideOption(): Option {
    const otherSide =
      this.parsed.optionSide === OptionSide.Long
        ? OptionSide.Short
        : OptionSide.Long;
    const parsed: ParsedOptionBase = {
      ...this.parsed,
      optionSide: otherSide,
    };
    return new Option({ parsed });
  }

  get sideAsText(): string {
    return this.parsed.optionSide === OptionSide.Long ? "Long" : "Short";
  }

  get isLong(): boolean {
    return this.parsed.optionSide === OptionSide.Long;
  }

  get isShort(): boolean {
    return this.parsed.optionSide === OptionSide.Short;
  }

  get display(): string {
    return `${this.sideAsText} ${this.typeAsText} - strike price $${
      this.parsed.strikePrice
    } - expires ${timestampToReadableDate(this.parsed.maturity * 1000)}`;
  }

  get isFresh(): boolean {
    return this.parsed.maturity * 1000 > new Date().getTime();
  }

  get isExpired(): boolean {
    return !this.isFresh;
  }

  get struct(): string[] {
    return [
      toHex(this.raw.option_side),
      new BN(this.raw.maturity).toString(10),
      toHex(this.raw.strike_price),
      toHex(this.raw.quote_token_address),
      toHex(this.raw.base_token_address),
      toHex(this.raw.option_type),
    ];
  }

  get dateShort(): string {
    return timestampToShortTimeDate(this.parsed.maturity * 1000);
  }

  get dateRich(): string {
    return timestampToReadableDate(this.parsed.maturity * 1000);
  }
}

export class OptionWithPosition extends Option {
  raw: RawOptionWithPosition;
  parsed: ParsedOptionWithPosition;
  id: string;

  constructor(props: { raw: RawOptionWithPosition }) {
    super(props);
    this.raw = props.raw;
    this.parsed = this.parsedFromRaw(props.raw);
    this.id = this.generateId();
  }

  parsedFromRaw(raw: RawOptionWithPosition): ParsedOptionWithPosition {
    // Uint256 - just one part
    // ETH_DIGITS for token count
    const positionSize = uint256toDecimal(raw.position_size, BASE_DIGITS);
    // math64_61
    const positionValue = math64x61toDecimal(
      raw.value_of_position.toString(10)
    );

    const withoutPosition = super.parsedFromRaw(raw);

    return {
      ...withoutPosition,
      positionSize,
      positionValue,
    };
  }

  get fullSize(): string {
    return this.raw.position_size.toString(10);
  }

  get size(): number {
    return shortInteger(this.fullSize, this.tokenPair.base.decimals);
  }

  get isInTheMoney(): Boolean {
    return !!this.parsed.positionValue && this.isExpired;
  }

  get isOutOfTheMoney(): Boolean {
    return !this.parsed.positionValue && this.isExpired;
  }
}

export class OptionWithPremia extends Option {
  raw: RawOptionWithPremia;
  parsed: ParsedOptionWithPremia;
  id: string;

  constructor(props: { raw: RawOptionWithPremia }) {
    super(props);
    this.raw = props.raw;
    this.parsed = this.parsedFromRaw(props.raw);
    this.id = this.generateId();
  }

  parsedFromRaw(raw: RawOptionWithPremia): ParsedOptionWithPremia {
    const type = bnToOptionType(raw.option_type);
    const digits = digitsByType(type);
    const premiaBase = math64x61ToInt(raw.premia.toString(10), digits);
    const premiaDecimal = intToDecimal(premiaBase, digits);

    const withoutPosition = super.parsedFromRaw(raw);

    return {
      ...withoutPosition,
      premiaBase,
      premiaDecimal,
    };
  }
}
