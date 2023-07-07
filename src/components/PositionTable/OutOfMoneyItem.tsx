import { OptionWithPosition } from "../../classes/Option";
import { timestampToReadableDate } from "../../utils/utils";
import { Button, TableCell, TableRow } from "@mui/material";
import { debug } from "../../utils/debugger";
import { tradeSettle } from "../../calls/tradeSettle";
import { invalidatePositions } from "../../queries/client";
import { afterTransaction } from "../../utils/blockchain";
import { useAccount } from "../../hooks/useAccount";
import { useTxPending } from "../../hooks/useRecentTxs";
import { TransactionAction } from "../../redux/reducers/transactions";

type Props = {
  option: OptionWithPosition;
};

export const OutOfMoneyItem = ({ option }: Props) => {
  const txPending = useTxPending(option.id, TransactionAction.Settle);
  const account = useAccount();

  const handleSettle = () => {
    if (!account || !option?.raw?.position_size) {
      debug("Could not trade close", { account, raw: option?.raw });
      return;
    }

    tradeSettle(account, option).then((res) => {
      if (res?.transaction_hash) {
        afterTransaction(res.transaction_hash, () => {
          invalidatePositions();
        });
      }
    });
  };

  const { strikePrice, maturity, positionSize } = option.parsed;
  const msMaturity = maturity * 1000;

  const date = timestampToReadableDate(msMaturity);
  const desc = `${option.sideAsText} ${option.typeAsText} with strike $${strikePrice}`;
  const decimals = 4;

  return (
    <TableRow>
      <TableCell>{desc}</TableCell>
      <TableCell>{date}</TableCell>
      <TableCell>{positionSize.toFixed(decimals)}</TableCell>
      <TableCell align="right">
        <Button disabled={txPending} variant="contained" onClick={handleSettle}>
          {txPending ? "Processing..." : "Settle"}
        </Button>
      </TableCell>
    </TableRow>
  );
};
