import { OptionWithPremia } from "../classes/Option";
import { parseBatchOfOptions } from "../utils/optionParsers/batch";
import { parseNonExpiredOption } from "../utils/optionParsers/parseNonExpiredOption";
import { getApiUrl } from "./../utils/utils";
import BN from "bn.js";

export const getNonExpiredOptions = async (): Promise<OptionWithPremia[]> =>
  fetch(`${getApiUrl()}live-options`)
    .then((res) => res.json())
    .then((res) => {
      if (res?.status !== "success" || !res?.data?.length) {
        return [];
      }
      const bnArr = res.data.map((v: string) => new BN(v.slice(2), 16));

      const optionsWithPremia = parseBatchOfOptions(
        bnArr,
        7,
        parseNonExpiredOption
      );

      return optionsWithPremia;
    });
