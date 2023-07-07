import {
  Button,
  ButtonGroup,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { AccountInterface } from "starknet";
import { withdrawCall } from "./withdrawCall";
import { handleNumericChangeFactory } from "../../utils/inputHandling";
import { UserPoolDisplayData } from "../../types/pool";
import BN from "bn.js";
import { debug } from "../../utils/debugger";
import { isCall } from "../../utils/utils";
import { POOL_NAMES } from "../../constants/texts";
import { showToast } from "../../redux/actions";
import { ToastType } from "../../redux/reducers/ui";
import { useTxPending } from "../../hooks/useRecentTxs";
import { TransactionAction } from "../../redux/reducers/transactions";

interface Props extends UserPoolDisplayData {
  account: AccountInterface;
}

export const WithdrawItem = ({ account, value, fullSize, type }: Props) => {
  // TODO: use proper pool id
  const txPending = useTxPending(String(type), TransactionAction.Withdraw);
  const [amount, setAmount] = useState<number>(0);
  const [text, setText] = useState<string>("0");
  const [processing, setProcessing] = useState<boolean>(false);

  const cb = (n: number): number => (n >= 100 ? 100 : n);
  const handleChange = handleNumericChangeFactory(setText, setAmount, cb);

  const precission = 10000;
  const relativeSize = new BN(amount * precission)
    .mul(new BN(fullSize))
    .div(new BN(100 * precission))
    .toString(10);
  debug("Relative size", relativeSize);
  const handleWithdraw = () => {
    if (!amount) {
      showToast("Cannot withdraw 0", ToastType.Warn);
      return;
    }
    withdrawCall(account, setProcessing, type, relativeSize);
  };
  const handleWithdrawAll = () =>
    withdrawCall(account, setProcessing, type, fullSize);

  const [pool, currency] = isCall(type)
    ? [POOL_NAMES.CALL, "Ξ"]
    : [POOL_NAMES.PUT, "$"];

  const displayDigits = 5;
  const displayValue = currency + " " + value.toFixed(displayDigits);

  return (
    <TableRow>
      <TableCell>{pool}</TableCell>
      <TableCell>
        <Tooltip title={String(value) === displayValue ? "" : value}>
          <Typography>{displayValue}</Typography>
        </Tooltip>
      </TableCell>
      <TableCell>
        <Typography>{fullSize}</Typography>
      </TableCell>
      <TableCell sx={{ minWidth: "100px" }}>
        <TextField
          id="outlined-number"
          label="Percentage %"
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
        <ButtonGroup
          disableElevation
          variant="contained"
          aria-label="Disabled elevation buttons"
          disabled={processing || txPending}
        >
          {processing || txPending ? (
            <Button>Processing...</Button>
          ) : (
            <>
              <Button onClick={handleWithdraw}>Withdraw</Button>
              <Button onClick={handleWithdrawAll}>Max</Button>
            </>
          )}
        </ButtonGroup>
      </TableCell>
    </TableRow>
  );
};
