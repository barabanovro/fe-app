import { LoadingAnimation } from "../loading";
import { Box, Button, Typography } from "@mui/material";
import { useQuery } from "react-query";
import { QueryKeys } from "../../queries/keys";
import { useAccount } from "../../hooks/useAccount";
import { AccountInterface } from "starknet";
import { fetchPositions } from "../PositionTable/fetchPositions";
import { OptionWithPosition } from "../../classes/Option";
import { tradeSettle } from "../../calls/tradeSettle";

const ClaimItem = ({
  option,
  account,
}: {
  option: OptionWithPosition;
  account: AccountInterface;
}) => {
  const symbol = option.tokenPair.base.symbol;

  const handleButtonClick = () => tradeSettle(account, option);

  return (
    <Box sx={{ display: "flex", flexFlow: "column" }}>
      <Typography variant="h6">
        {symbol} ${option.parsed.strikePrice}
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexFlow: "row",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Typography>
          You are eligible to claim ${option.parsed.positionValue.toFixed(4)}
        </Typography>
        <Button onClick={handleButtonClick} variant="contained">
          Claim
        </Button>
      </Box>
    </Box>
  );
};

const WithAccount = ({ account }: { account: AccountInterface }) => {
  const { isLoading, isError, data } = useQuery(
    [QueryKeys.position, account.address],
    fetchPositions
  );

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError || !data) {
    return <Typography>Oh no :O</Typography>;
  }

  const insurance = data.filter((o) => o.isPut && o.isLong && o.isInTheMoney);

  if (insurance.length === 0) {
    // no options for the given currency
    return (
      <Box sx={{ display: "flex", flexFlow: "column", gap: 2 }}>
        <Typography>
          You currently do not have any claimable insurance
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexFlow: "column",
        gap: 2,
      }}
    >
      <Typography>
        You have {insurance.length} claimable insurance event
        {insurance.length > 1 ? "s" : ""}:
      </Typography>
      {insurance.map((o, i) => (
        <ClaimItem key={i} option={o} account={account} />
      ))}
    </Box>
  );
};

export const ClaimInsurance = () => {
  const account = useAccount();

  if (!account) {
    return <Typography>Connect wallet to see claimable insurance</Typography>;
  }

  return <WithAccount account={account} />;
};
