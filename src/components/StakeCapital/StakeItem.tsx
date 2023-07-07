import {
  Button,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { CSSProperties, useEffect, useState } from "react";
import { AccountInterface } from "starknet";
import { handleStake } from "./handleStake";
import { handleNumericChangeFactory } from "../../utils/inputHandling";
import { openCallWidoDialog, openPutWidoDialog } from "../../redux/actions";
import { Pool } from "../../classes/Pool";
import { hexToBN } from "../../utils/utils";
import { intToDecimal } from "../../utils/units";
import { BASE_DIGITS } from "../../constants/amm";
import { useTxPending } from "../../hooks/useRecentTxs";
import { TransactionAction } from "../../redux/reducers/transactions";

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
  const poolId = pool.isCall ? "eth-usdc-call" : "eth-usdc-put";
  fetch(`https://api.carmine.finance/api/v1/mainnet/${poolId}/state`)
    .then((response) => response.json())
    .then((result) => {
      if (result && result.status === "success") {
        const { lp_token_value, timestamp } = result.data;
        const lpValue = intToDecimal(
          hexToBN(lp_token_value).toString(10),
          BASE_DIGITS
        );
        const MAINNET_LAUNCH_TIMESTAMP = 1680864820;
        const YEAR_SECONDS = 31536000;
        const secondsSinceLaunch = timestamp - MAINNET_LAUNCH_TIMESTAMP;
        const yearFraction = YEAR_SECONDS / secondsSinceLaunch;
        const apySinceLaunch = Math.pow(lpValue, yearFraction);

        setYieldSinceLaunch((apySinceLaunch - 1) * 100);
      }
    });
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

  const displayApy =
    apy === undefined ? "--" : `${apy < 0 ? "" : "+"}${apy.toFixed(2)}%`;
  const apySx: CSSProperties = { fontWeight: "bold", textAlign: "center" };
  if (apy && apy < 0) {
    apySx.color = theme.palette.error.main;
  } else if (apy && apy > 0) {
    apySx.color = theme.palette.success.main;
  }

  const displayYieldSinceLaunch =
    yieldSinceLaunch === undefined
      ? "--"
      : `${yieldSinceLaunch < 0 ? "" : "+"}${yieldSinceLaunch.toFixed(2)}%`;
  const yslSx: CSSProperties = { fontWeight: "bold", textAlign: "center" };
  if (yieldSinceLaunch && yieldSinceLaunch < 0) {
    yslSx.color = theme.palette.error.main;
  } else if (yieldSinceLaunch && yieldSinceLaunch > 0) {
    yslSx.color = theme.palette.success.main;
  }

  const handleWidoClick = () => {
    pool.isCall ? openCallWidoDialog() : openPutWidoDialog();
  };

  return (
    <TableRow>
      <TableCell>
        <Typography>{pool.name}</Typography>
      </TableCell>
      <TableCell>
        <Typography sx={yslSx}>{displayYieldSinceLaunch}</Typography>
      </TableCell>
      <TableCell>
        <Typography sx={apySx}>{displayApy}</Typography>
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
        <Tooltip title="Stake from L1 directly to our liquidity pool - requires MetaMask">
          <Button sx={{ ml: 1 }} variant="contained" onClick={handleWidoClick}>
            Stake from L1
          </Button>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};
