import { Box, Typography } from "@mui/material";
import { ClaimButton } from "./ClaimButton";
import { useAccount } from "../../hooks/useAccount";
import { useEffect, useState } from "react";
import { useNetwork } from "../../hooks/useNetwork";
import { NetworkName } from "../../types/network";
import { ProofResult, getProof } from "./getProof";
import { AccountInterface } from "starknet";
import { shortInteger } from "../../utils/computations";

type Props = {
  account: AccountInterface | undefined;
  message: string;
  data?: string[];
};

const AirdropTemplate = ({ account, message, data }: Props) => (
  <Box sx={{ my: 4 }}>
    <Typography sx={{ mb: 2 }} variant="h4">
      Airdrop
    </Typography>
    <Typography>{message}</Typography>
    {account && <ClaimButton account={account} data={data} />}
  </Box>
);

export const Airdrop = () => {
  const account = useAccount();
  const network = useNetwork();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ProofResult | undefined>();

  const isMainnet = network === NetworkName.Mainnet;

  useEffect(() => {
    if (account && isMainnet) {
      setLoading(true);
      getProof(account).then((res) => {
        setData(res);
        setLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, network]);

  if (!isMainnet) {
    return (
      <AirdropTemplate
        account={undefined}
        message="Please switch to Mainnet to access airdrop"
      />
    );
  }

  if (!account) {
    return (
      <AirdropTemplate
        account={account}
        message="Connect your wallet to see if you are eligible for an airdrop"
      />
    );
  }

  if (loading || !data) {
    return (
      <AirdropTemplate
        account={account}
        message="Checking if you are eligible for an airdrop..."
      />
    );
  }

  if (data.eligible) {
    if (data.claimable === "0") {
      const amount = shortInteger(data.claimed, 18);
      return (
        <AirdropTemplate
          account={undefined}
          message={`You cannot claim any tokens, you have already claimed ${amount}`}
        />
      );
    }

    const amount = shortInteger(data.claimable, 18);
    const message = `You are eligible to receive ${amount} Carmine tokens!`;

    return (
      <AirdropTemplate account={account} data={data.proof} message={message} />
    );
  }

  return (
    <AirdropTemplate
      account={account}
      message="Connected wallet is not eligible for an airdrop"
    />
  );
};
