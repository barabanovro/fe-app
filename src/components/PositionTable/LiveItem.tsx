import { OptionWithPosition } from "../../classes/Option";
import { timestampToReadableDate } from "../../utils/utils";
import { Button, TableCell, TableRow, Tooltip } from "@mui/material";
import { openCloseOptionDialog, setCloseOption } from "../../redux/actions";
import { useTxPending } from "../../hooks/useRecentTxs";
import { TransactionAction } from "../../redux/reducers/transactions";

type Props = {
  option: OptionWithPosition;
};

export const LiveItem = ({ option }: Props) => {
  const txPending = useTxPending(option.id, TransactionAction.TradeClose);
  const { strikePrice, maturity, positionSize, positionValue } = option.parsed;
  const msMaturity = maturity * 1000;

  const date = timestampToReadableDate(msMaturity);

  const desc = `${option.sideAsText} ${option.typeAsText} with strike $${strikePrice}`;
  const sizeTooltipMessage = option.raw.position_size.toString(10) + " tokens";
  const decimals = 4;
  const timeNow = new Date().getTime();
  const isExpired = msMaturity - timeNow <= 0;

  const handleClick = () => {
    setCloseOption(option);
    openCloseOptionDialog();
  };

  return (
    <TableRow>
      <TableCell>{desc}</TableCell>
      <TableCell>{isExpired ? `Expired on ${date}` : date}</TableCell>
      <TableCell>
        <Tooltip title={sizeTooltipMessage}>
          <span>{positionSize.toFixed(decimals)}</span>
        </Tooltip>
      </TableCell>
      <TableCell>
        <Tooltip title={positionValue}>
          <span>
            {option.symbol} {positionValue.toFixed(decimals)}
          </span>
        </Tooltip>
      </TableCell>
      <TableCell align="right">
        <Button variant="contained" onClick={handleClick} disabled={txPending}>
          {txPending ? "Processing..." : "Close"}
        </Button>
      </TableCell>
    </TableRow>
  );
};
