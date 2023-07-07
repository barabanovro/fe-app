import {
  Box,
  Link,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useRecentTxs } from "../../hooks/useRecentTxs";
import {
  Transaction,
  TransactionStatus,
} from "../../redux/reducers/transactions";
import { HourglassBottomTwoTone, Done, Report } from "@mui/icons-material";
import { debug } from "../../utils/debugger";
import { addressElision, getStarkscanUrl } from "../../utils/utils";
import { useCurrentChainId } from "../../hooks/useCurrentChainId";

const Tx = ({ tx }: { tx: Transaction }) => {
  const theme = useTheme();

  const { hash, timestamp, action, status, chainId } = tx;
  const exploreUrl = getStarkscanUrl({
    chainId: chainId,
    txHash: hash,
  });

  debug("TX", { hash, timestamp, action, status });

  const shade = theme.palette.mode;

  const color =
    status === TransactionStatus.Pending
      ? theme.palette.warning[shade]
      : status === TransactionStatus.Success
      ? theme.palette.success[shade]
      : theme.palette.error[shade];

  const Icon =
    status === TransactionStatus.Pending
      ? HourglassBottomTwoTone
      : status === TransactionStatus.Success
      ? Done
      : Report;

  const d = new Date(timestamp);
  const dateOptions = {
    day: "numeric",
    month: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZoneName: "short",
  } as const;
  const date = new Intl.DateTimeFormat("default", dateOptions).format(d);

  return (
    <Paper
      sx={{
        display: "flex",
        flexFlow: "column",
        background: color,
        m: 1,
        p: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexFlow: "row",
        }}
      >
        <div>
          <Tooltip title={hash}>
            <Link
              sx={{ color: theme.palette.text.primary }}
              target="_blank"
              href={exploreUrl}
              rel="noreferrer"
            >
              <Typography>{addressElision(hash)}</Typography>
            </Link>
          </Tooltip>
        </div>
        <div>
          <Typography>{action}</Typography>
        </div>
        <div>
          <Tooltip title={status}>
            <Icon />
          </Tooltip>
        </div>
      </Box>
      <Box>
        <Typography variant="caption">{date}</Typography>
      </Box>
    </Paper>
  );
};

export const RecentTransaction = () => {
  const chainId = useCurrentChainId();
  const txs = useRecentTxs();

  const currentNetworkTxs = txs.filter((tx) => tx.chainId === chainId);

  debug("txs", { chainId, txs, currentNetworkTxs });

  if (txs.length === 0) {
    return <Box>Transactions will appear here</Box>;
  }

  return (
    <Box>
      <Stack
        sx={{
          maxHeight: "60vh",
          overflowY: "auto",
        }}
      >
        {txs.map((tx, i) => (
          <Tx tx={tx} key={i} />
        ))}
      </Stack>
    </Box>
  );
};
