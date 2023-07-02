import { FunctionComponent } from "react";
import { fetchPositions } from "./fetchPositions";
import { TableWrapper } from "../TableWrapper";
import { Box, Typography } from "@mui/material";
import { useQuery } from "react-query";
import { QueryKeys } from "../../queries/keys";
import { NoContent } from "../TableNoContent";
import { LoadingAnimation } from "../loading";
import { OptionWithPosition } from "../../classes/Option";
import { TableElement } from "./TableElement";
import { LiveItem } from "./LiveItem";
import { InMoneyItem } from "./InMoneyItem";
import { OutOfMoneyItem } from "./OutOfMoneyItem";
import { useAccount } from "../../hooks/useAccount";

type PositionsTemplateProps = {
  Live: FunctionComponent;
  InMoney: FunctionComponent;
  OutOfMoney: FunctionComponent;
};

const PositionsTemplate = ({
  Live,
  InMoney,
  OutOfMoney,
}: PositionsTemplateProps) => (
  <>
    <Typography variant="h4">Options Balance</Typography>

    <Typography sx={{ maxWidth: "66ch" }}>
      These options have not matured yet. You can either close your position or
      wait for the maturity.
    </Typography>
    <TableWrapper slippage>
      <Live />
    </TableWrapper>
    <Typography variant="h4">Expired - Profit</Typography>
    <Typography sx={{ maxWidth: "66ch" }}>
      These options matured in the money and you will get your funds upon
      settling.
    </Typography>
    <TableWrapper>
      <InMoney />
    </TableWrapper>
    <Typography variant="h4">Expired - No Profit</Typography>
    <Typography sx={{ maxWidth: "66ch" }}>
      These options matured out of the money, you will not receive any funds
      from settling them. Settling these options will simply remove them.
    </Typography>
    <TableWrapper>
      <OutOfMoney />
    </TableWrapper>
  </>
);

type PropsAddress = {
  address: string;
};

const PositionsWithAddress = ({ address }: PropsAddress) => {
  const { isLoading, isError, isFetching, data } = useQuery(
    [QueryKeys.position, address],
    fetchPositions
  );

  if (isError) {
    const child = () =>
      NoContent({
        text: "Something went wrong while getting your positions, please try again later",
      });
    return (
      <PositionsTemplate Live={child} InMoney={child} OutOfMoney={child} />
    );
  }

  if (isLoading || !data) {
    const child = () => (
      <Box sx={{ padding: "20px" }}>
        <LoadingAnimation size={40} />
      </Box>
    );
    return (
      <PositionsTemplate Live={child} InMoney={child} OutOfMoney={child} />
    );
  }

  const liveOptions = data.filter(
    (option: OptionWithPosition) => option.isFresh
  );

  const inOptions = data.filter(
    (option: OptionWithPosition) => option.isInTheMoney
  );

  const outOptions = data.filter(
    (option: OptionWithPosition) => option.isOutOfTheMoney
  );

  return (
    <PositionsTemplate
      Live={() =>
        TableElement({
          isFetching,
          data: liveOptions,
          titles: ["Option", "Maturity", "Size", "Value"],
          ItemElem: LiveItem,
          desc: "live",
        })
      }
      InMoney={() =>
        TableElement({
          isFetching,
          data: inOptions,
          titles: ["Option", "Expiry", "Size", "Value"],
          ItemElem: InMoneyItem,
          desc: "expired with profit",
        })
      }
      OutOfMoney={() =>
        TableElement({
          isFetching,
          data: outOptions,
          titles: ["Option", "Expiry", "Size"],
          ItemElem: OutOfMoneyItem,
          desc: "expired without profit",
        })
      }
    />
  );
};

export const Positions = () => {
  const account = useAccount();

  if (!account) {
    const child = () =>
      NoContent({ text: "Connect your wallet to see your positions" });
    return (
      <PositionsTemplate Live={child} InMoney={child} OutOfMoney={child} />
    );
  }

  return <PositionsWithAddress address={account.address} />;
};
