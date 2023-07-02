import { useState } from "react";
import { useAccount } from "../../hooks/useAccount";
import { TokenKey, tokensList } from "../../tokens/tokens";
import { useUserBalance } from "../../hooks/useUserBalance";
import { useCurrency } from "../../hooks/useCurrency";
import { LoadingAnimation } from "../loading";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import { shortInteger } from "../../utils/computations";
import { useQuery } from "react-query";
import { QueryKeys } from "../../queries/keys";
import { fetchOptions } from "../TradeTable/fetchOptions";
import {
  timestampToReadableDate,
  uniquePrimitiveValues,
} from "../../utils/utils";
import { debug } from "../../utils/debugger";
import { handleNumericChangeFactory } from "../../utils/inputHandling";
import {
  openBuyInsuranceDialog,
  setBuyInsuranceModal,
  showToast,
} from "../../redux/actions";
import { ToastType } from "../../redux/reducers/ui";

export const BuyInsuranceBox = () => {
  const account = useAccount();
  const balance = useUserBalance();
  const [currency, setCurrency] = useState<TokenKey>(TokenKey.ETH);
  const token = tokensList[currency];
  const displayBalance = balance
    ? shortInteger(balance[currency].toString(10), token.decimals).toFixed(4)
    : undefined;
  const valueInUsd = useCurrency(currency);
  const { isLoading, isError, data } = useQuery(
    QueryKeys.options,
    fetchOptions
  );
  const [currentStrike, setCurrentStrike] = useState<number>();
  const [size, setSize] = useState<number>(0);
  const [textSize, setTextSize] = useState<string>("0");
  const [interacted, setInteracted] = useState(false);
  const [expiry, setExpiry] = useState<number>();

  if (valueInUsd === undefined || isLoading) {
    return <LoadingAnimation />;
  }

  if (isError || !data) {
    return (
      <Typography>Something went wrong, please try again later</Typography>
    );
  }

  if (displayBalance && !interacted) {
    // if no interaction with input, set size to user balance
    setSize(parseFloat(displayBalance));
    setTextSize(displayBalance);
    setInteracted(true);
  }

  const options = data.filter(
    // only Long Puts for the chosen currency
    (o) => o.tokenPair.base.id === currency && o.isPut && o.isLong && o.isFresh
  );

  const handleCurrencyChange = (event: SelectChangeEvent) => {
    setCurrency(event.target.value as TokenKey);
  };
  const handleStrikeChange = (event: SelectChangeEvent) => {
    setCurrentStrike(parseInt(event.target.value) as number);
  };
  const handleExpiryChange = (event: SelectChangeEvent) => {
    setExpiry(parseInt(event.target.value) as number);
  };
  const handleSizeChange = handleNumericChangeFactory(
    setTextSize,
    setSize,
    (n) => {
      setInteracted(true);
      return n;
    }
  );

  // show all expiries
  const expiries = options
    .map((o) => o.parsed.maturity)
    .filter(uniquePrimitiveValues)
    .sort();

  if (!expiry) {
    setExpiry(expiries[0]);
  }

  // show strikes for current expiry
  const strikes = options
    .filter((o) => o.parsed.maturity === expiry)
    .map((o) => o.parsed.strikePrice)
    .filter(uniquePrimitiveValues)
    .sort();

  if (!currentStrike || !strikes.includes(currentStrike)) {
    setCurrentStrike(strikes[0]);
  }

  const pickedOption = options.find(
    (o) =>
      o.parsed.maturity === expiry && o.parsed.strikePrice === currentStrike
  )!;

  const handleButtonClick = () => {
    if (size === 0) {
      showToast("Please select size greater than 0", ToastType.Warn);
      return;
    }
    if (!pickedOption) {
      showToast("Select an insurance first", ToastType.Warn);
      return;
    }
    debug("Buying this option", pickedOption, "with size", size);
    setBuyInsuranceModal({ option: pickedOption, size });
    openBuyInsuranceDialog();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexFlow: "column",
        alignItems: "flex-start",
        gap: 2,
      }}
    >
      <table style={{ borderSpacing: "15px" }}>
        <tbody>
          <tr>
            <td>
              <Typography>Select crypto asset to insure</Typography>
            </td>
            <td>
              <FormControl size="small">
                <InputLabel id="currency-select-label">Asset</InputLabel>
                <Select
                  sx={{ px: 1 }}
                  labelId="currency-select-label"
                  id="currency-select"
                  value={currency}
                  label="Asset"
                  onChange={handleCurrencyChange}
                >
                  <MenuItem value={TokenKey.ETH}>ETH</MenuItem>
                  <MenuItem disabled>More coming!</MenuItem>
                </Select>
              </FormControl>
            </td>
          </tr>
          {account && (
            <tr>
              <td>
                <Typography>
                  {balance ? `You currently have` : "Getting your balance..."}
                </Typography>
              </td>
              <td>
                {}
                <Typography>
                  {balance ? `${displayBalance} ${token.symbol}` : <Skeleton />}
                </Typography>
              </td>
            </tr>
          )}
          <tr>
            <td>
              <Typography>
                {valueInUsd
                  ? `Current ${token.symbol} price`
                  : `Getting ${token.symbol} price...`}
              </Typography>
            </td>
            <td>
              <Typography>
                {valueInUsd ? `$${valueInUsd}` : <Skeleton />}
              </Typography>
            </td>
          </tr>
          {options.length > 0 && (
            <>
              <tr>
                <td>
                  <Typography>Select expiry</Typography>
                </td>
                <td>
                  <FormControl size="small">
                    <InputLabel id="expiry-select-label">Expiry</InputLabel>
                    <Select
                      sx={{ px: 1 }}
                      labelId="expiry-select-label"
                      id="expiry-select"
                      label="Expiry"
                      value={expiry ? expiry + "" : undefined}
                      onChange={handleExpiryChange}
                    >
                      {expiries.map((e, i) => (
                        <MenuItem key={i} value={e}>
                          {timestampToReadableDate(e * 1000)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>{" "}
                </td>
              </tr>
              <tr>
                <td>
                  <Typography>Select price to insure</Typography>
                </td>
                <td>
                  <FormControl size="small">
                    <InputLabel id="strike-select-label">Price</InputLabel>
                    <Select
                      sx={{ px: 1 }}
                      labelId="strike-select-label"
                      id="strike-select"
                      label="Insure price"
                      value={"" + currentStrike}
                      onChange={handleStrikeChange}
                    >
                      {strikes.map((s) => (
                        <MenuItem key={s} value={s}>
                          ${s}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </td>
              </tr>
              <tr>
                <td>
                  <Typography>Select size to insure</Typography>
                </td>
                <td>
                  <TextField
                    id="outlined-number"
                    label="Size"
                    size="small"
                    value={textSize}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      inputMode: "decimal",
                    }}
                    onChange={handleSizeChange}
                  />
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>

      {options.length === 0 && (
        <Typography>
          We currently do not have any available insurance, please try again
          later
        </Typography>
      )}
      {!account && <Typography>Connect wallet to buy insurance</Typography>}
      <Button
        disabled={!account || options.length === 0}
        variant="contained"
        onClick={handleButtonClick}
      >
        Buy Insurance
      </Button>
    </Box>
  );
};
