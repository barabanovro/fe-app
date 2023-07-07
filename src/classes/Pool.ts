import BN from "bn.js";
import { bnToOptionType } from "../utils/conversions";
import { hexToBN, toHex } from "../utils/utils";
import { OptionType } from "../types/options";
import { Token, TokenPair, getTokenPairByAddresses } from "../tokens/tokens";
import { RawPool } from "../types/pool";
import { ParsedPool } from "../types/pool";
import { getMultipleTokensValueInUsd } from "../tokens/tokenPrices";

type Props =
  | {
      raw: RawPool;
    }
  | {
      parsed: ParsedPool;
    };

export class Pool {
  public raw: RawPool;
  public parsed: ParsedPool;
  public tokenPair: TokenPair;
  public id: string;

  constructor(props: Props) {
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
      // unreachable
      throw Error(`Unexpected Pool props: ${JSON.stringify(props)}`);
    }
  }

  parsedFromRaw(raw: RawPool): ParsedPool {
    return {
      optionType: bnToOptionType(raw.option_type),
      quoteToken: toHex(raw.quote_token_address),
      baseToken: toHex(raw.base_token_address),
    };
  }

  rawFromParsed(parsed: ParsedPool): RawPool {
    return {
      quote_token_address: hexToBN(parsed.quoteToken),
      base_token_address: hexToBN(parsed.baseToken),
      option_type: new BN(parsed.optionType),
    };
  }

  generateId(): string {
    return JSON.stringify(this.parsed, Object.keys(this.parsed).sort());
  }

  eq(other: Pool): boolean {
    return this.id === other.id;
  }

  isType(type: OptionType): boolean {
    return this.parsed.optionType === type;
  }

  async tokenPricesInUsd() {
    const [base, quote] = await getMultipleTokensValueInUsd([
      this.tokenPair.base.id,
      this.tokenPair.quote.id,
    ]);
    return { base, quote };
  }

  ////////////
  // GETTERS
  ////////////

  get typeAsText(): string {
    return this.parsed.optionType === OptionType.Call ? "Call" : "Put";
  }

  get isCall(): boolean {
    return this.parsed.optionType === OptionType.Call;
  }

  get isPut(): boolean {
    return this.parsed.optionType === OptionType.Put;
  }

  get underlying(): Token {
    return this.isCall ? this.tokenPair.base : this.tokenPair.quote;
  }

  get digits(): number {
    // call has base decimals, put has quote decimals
    return this.underlying.decimals;
  }

  get tokenAddress(): string {
    return this.underlying.tokenAddress;
  }

  get symbol(): string {
    return this.underlying.symbol;
  }

  get name(): string {
    return `${this.tokenPair.base.symbol}/${this.tokenPair.quote.symbol} ${this.typeAsText} Pool (${this.symbol})`;
  }
}
