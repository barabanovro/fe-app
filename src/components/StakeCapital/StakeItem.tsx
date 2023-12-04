import {
  Button,
  TableCell,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { CSSProperties, useEffect, useState } from "react";
import { AccountInterface } from "starknet";
import { handleStake } from "./handleStake";
import { handleNumericChangeFactory } from "../../utils/inputHandling";
import { Pool } from "../../classes/Pool";
import { intToDecimal } from "../../utils/units";
import { BASE_DIGITS } from "../../constants/amm";
import { useTxPending } from "../../hooks/useRecentTxs";
import { TransactionAction } from "../../redux/reducers/transactions";
import { getPoolState } from "../../calls/getPoolState";

type Props = {
  account: AccountInterface | undefined;
  pool: Pool;
};

const getApy = async (setApy: (n: number) => void, pool: Pool) => {
  const poolId = pool.isCall ? "eth-usdc-call" : "eth-usdc-put";
  fetch(`https://api.carmine.finance/api/v1/mainnet/${poolId}/apy`)
    .then((response) => response.json())
    .then((result) => {
      if (result && result.status === "success") {
        setApy(result.data);
      }
    });
};

const getYieldSinceLaunch = async (
  setYieldSinceLaunch: (n: number) => void,
  pool: Pool
) => {
  const state = await getPoolState(
    pool.isCall ? "eth-usdc-call" : "eth-usdc-put"
  );
  const { lp_token_value, timestamp } = state;
  const lpValue = intToDecimal(lp_token_value.toString(10), BASE_DIGITS);
  const MAINNET_LAUNCH_TIMESTAMP = 1680864820;
  const YEAR_SECONDS = 31536000;
  const secondsSinceLaunch = timestamp - MAINNET_LAUNCH_TIMESTAMP;
  const yearFraction = YEAR_SECONDS / secondsSinceLaunch;
  const apySinceLaunch = Math.pow(lpValue, yearFraction);

  setYieldSinceLaunch((apySinceLaunch - 1) * 100);
};

export const StakeCapitalItem = ({ account, pool }: Props) => {
  const txPending = useTxPending(pool.id, TransactionAction.Stake);
  const [amount, setAmount] = useState<number>(0);
  const [text, setText] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(false);
  const [apy, setApy] = useState<number | undefined>();
  const [yieldSinceLaunch, setYieldSinceLaunch] = useState<
    number | undefined
  >();

  const theme = useTheme();

  useEffect(() => {
    getApy(setApy, pool);
    getYieldSinceLaunch(setYieldSinceLaunch, pool);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = handleNumericChangeFactory(setText, setAmount);

  const isOkAPY = (apy: number | undefined): apy is number => {
    const MAX = 100;
    const MIN = -70;

    if (apy === undefined) {
      return false;
    }

    if (apy > 0 && apy > MAX) {
      // too big
      return false;
    }

    if (apy < 0 && apy < MIN) {
      // too small
      return false;
    }

    return true;
  };

  const displayApy = isOkAPY(apy)
    ? `${apy < 0 ? "" : "+"}${apy.toFixed(2)}%`
    : "--";
  const apySx: CSSProperties = { fontWeight: "bold", textAlign: "center" };
  if (apy && apy < 0) {
    apySx.color = theme.palette.error.main;
  } else if (apy && apy > 0) {
    apySx.color = theme.palette.success.main;
  }

  const displayYieldSinceLaunch = isOkAPY(yieldSinceLaunch)
    ? `${yieldSinceLaunch < 0 ? "" : "+"}${yieldSinceLaunch.toFixed(2)}%`
    : "--";
  const yslSx: CSSProperties = { fontWeight: "bold", textAlign: "center" };
  if (yieldSinceLaunch && yieldSinceLaunch < 0) {
    yslSx.color = theme.palette.error.main;
  } else if (yieldSinceLaunch && yieldSinceLaunch > 0) {
    yslSx.color = theme.palette.success.main;
  }

  const showPutSinceLaunch = true;
  const showPutLastWeek = true;
  const showCallSinceLaunch = true;
  const showCallLastWeek = true;

  return (
    <TableRow>
      <TableCell>
        <Typography>{pool.name}</Typography>
      </TableCell>
      <TableCell>
        {(pool.isPut && showPutSinceLaunch) ||
        (pool.isCall && showCallSinceLaunch) ? (
          <Typography sx={yslSx}>{displayYieldSinceLaunch}</Typography>
        ) : (
          <Typography sx={{ ...yslSx, color: theme.palette.text.primary }}>
            --
          </Typography>
        )}
      </TableCell>
      <TableCell>
        {(pool.isPut && showPutLastWeek) ||
        (pool.isCall && showCallLastWeek) ? (
          <Typography sx={apySx}>{displayApy}</Typography>
        ) : (
          <Typography sx={{ ...yslSx, color: theme.palette.text.primary }}>
            --
          </Typography>
        )}
      </TableCell>
      <TableCell sx={{ minWidth: "100px" }} align="center">
        <TextField
          id="outlined-number"
          label="Amount"
          size="small"
          value={text}
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{
            inputMode: "decimal",
          }}
          onChange={handleChange}
        />
      </TableCell>
      <TableCell align="right">
        <Button
          disabled={loading || !account || txPending}
          variant="contained"
          onClick={() => handleStake(account!, amount, pool, setLoading)}
        >
          {loading || txPending
            ? "Processing..."
            : account
            ? "Stake"
            : "Connect wallet"}
        </Button>
      </TableCell>
    </TableRow>
  );
};
