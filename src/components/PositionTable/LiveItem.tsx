import { OptionWithPosition } from "../../classes/Option";
import { timestampToReadableDate } from "../../utils/utils";
import { TableCell, TableRow, Tooltip } from "@mui/material";
import { openCloseOptionDialog, setCloseOption } from "../../redux/actions";
import { useTxPending } from "../../hooks/useRecentTxs";
import { TransactionAction } from "../../redux/reducers/transactions";
import buttonStyles from "../../style/button.module.css";
import { debug } from "../../utils/debugger";

type Props = {
  option: OptionWithPosition;
};

export const LiveItem = ({ option }: Props) => {
  const txPending = useTxPending(option.optionId, TransactionAction.TradeClose);
  const { strike, maturity, size, value } = option;

  debug("LIVE OPTION", option);

  const date = timestampToReadableDate(maturity * 1000);

  const desc = `${option.sideAsText} ${option.typeAsText} with strike $${strike}`;
  const sizeTooltipMessage = BigInt(option.sizeHex).toString(10) + " tokens";
  const decimals = 4;

  const handleClick = () => {
    setCloseOption(option);
    openCloseOptionDialog();
  };

  return (
    <TableRow>
      <TableCell>{desc}</TableCell>
      <TableCell>{option.isExpired ? `Expired on ${date}` : date}</TableCell>
      <TableCell>
        <Tooltip title={sizeTooltipMessage}>
          <span>{size.toFixed(decimals)}</span>
        </Tooltip>
      </TableCell>
      <TableCell>
        <Tooltip title={value}>
          <span>
            {option.symbol} {value.toFixed(decimals)}
          </span>
        </Tooltip>
      </TableCell>
      <TableCell align="right">
        <button
          className={buttonStyles.button}
          onClick={handleClick}
          disabled={txPending}
        >
          {txPending ? "Processing..." : "Close"}
        </button>
      </TableCell>
    </TableRow>
  );
};
