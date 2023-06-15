import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import { AccountInterface } from "starknet";
import { claim } from "../../calls/claim";

type Props = { account: AccountInterface; data?: string[] };

export const ClaimButton = ({ account, data }: Props) => {
  const [text, setText] = useState("");

  const handleClick = () => {
    setText("Confirm tokens transfer in your wallet");
    claim(account!, data!, setText);
  };

  return (
    <Box
      sx={{
        maxWidth: "100%",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 4,
        flexFlow: "row",
        m: 2,
      }}
    >
      <Button variant="contained" onClick={handleClick} disabled={!data}>
        Claim airdrop
      </Button>
      <Typography>
        {text}
      </Typography>
    </Box>
  );
};
