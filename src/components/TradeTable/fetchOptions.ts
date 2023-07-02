import { debug } from "../../utils/debugger";
import { OptionWithPremia } from "../../classes/Option";
import { getNonExpiredOptions } from "../../calls/getNonExpiredOptions";
import { chooseType } from "./chooseType";
import { OptionType } from "../../types/options";

export const fetchOptionsWithType = async (): Promise<
  [OptionWithPremia[], OptionType]
> => {
  const [optionsResult, chosenTypeResult] = await Promise.allSettled([
    getNonExpiredOptions(),
    chooseType(),
  ]);

  if (
    optionsResult.status === "rejected" ||
    chosenTypeResult.status === "rejected"
  ) {
    debug("Failed fetching options and type", {
      optionsResult,
      chosenTypeResult,
    });
    return [[], OptionType.Call];
  }

  const optionsWithPremia = optionsResult.value;
  const chosenType = chosenTypeResult.value;

  debug("Fetched options with premia (with type)", optionsWithPremia);

  return [optionsWithPremia, chosenType];
};

export const fetchOptions = async (): Promise<OptionWithPremia[]> => {
  const optionsWithPremia = await getNonExpiredOptions().catch((e) => {
    debug("fetch options failed:", e);
    return null;
  });

  if (optionsWithPremia === null) {
    return [];
  }

  debug("Fetched options with premia", optionsWithPremia);

  return optionsWithPremia;
};
