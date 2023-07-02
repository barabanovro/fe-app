import { LoadingAnimation } from "../loading";
import { Box, Button, Typography } from "@mui/material";
import { useQuery } from "react-query";
import { QueryKeys } from "../../queries/keys";
import { useAccount } from "../../hooks/useAccount";
import { AccountInterface } from "starknet";
import { fetchPositions } from "../PositionTable/fetchPositions";
import { OptionWithPosition } from "../../classes/Option";
import { openCloseOptionDialog, setCloseOption } from "../../redux/actions";

const InsuranceDisplay = ({ option }: { option: OptionWithPosition }) => {
  const symbol = option.tokenPair.base.symbol;
  const handleButtonClick = () => {
    setCloseOption(option);
    openCloseOptionDialog();
  };
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
          Insurance covers {option.size} {symbol} at price $
          {option.parsed.strikePrice} and expires {option.dateRich}
        </Typography>
        <Button onClick={handleButtonClick} variant="contained">
          Close
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

  const insurance = data.filter((o) => o.isPut && o.isLong && o.isFresh);

  if (insurance.length === 0) {
    // no options for the given currency
    return (
      <Box sx={{ display: "flex", flexFlow: "column", gap: 2 }}>
        <Typography>You currently do not have any active insurance</Typography>
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
        Your Carmine portfolio consists of {insurance.length} Long Put option
        {insurance.length > 1 ? "s" : ""} which insures these crypto assets
      </Typography>
      {insurance.map((o, i) => (
        <InsuranceDisplay key={i} option={o} />
      ))}
    </Box>
  );
};

export const ActiveInsurance = () => {
  const account = useAccount();

  if (!account) {
    return <Typography>Connect wallet to see your active insurance</Typography>;
  }

  return <WithAccount account={account} />;
};
