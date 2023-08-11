import AppBar from "@mui/material/AppBar";
import { Link as RouterLink } from "react-router-dom";
import GlobalStyles from "@mui/material/GlobalStyles";
import { WalletButton } from "./ConnectWallet/Button";
import { ReactNode } from "react";
import { Box, Button, useTheme } from "@mui/material";
import { NetworkSwitch } from "./networkSwitch";
import SettingsIcon from "@mui/icons-material/Settings";
import { useAccount } from "../hooks/useAccount";
import { AccountInterface } from "starknet";

type NavLinkProps = {
  title: string;
  link: string;
};

const navLinks = [
  {
    title: "Trade",
    link: "/trade",
  },
  {
    title: "Insurance",
    link: "/insurance",
  },
  {
    title: "My Position",
    link: "/position",
  },
  {
    title: "Staking",
    link: "/staking",
  },
  {
    title: "History",
    link: "/history",
  },
  {
    title: "Dashboard",
    link: "/dashboard",
  },
] as NavLinkProps[];

const navLink = (
  { title, link }: NavLinkProps,
  i: number,
  account: AccountInterface | undefined
): ReactNode => (
  <RouterLink style={{ textDecoration: "none" }} to={link} key={i}>
    <Button sx={{ color: "text.primary", my: 1, mx: 1.5 }} key={i}>
      {title}
    </Button>
  </RouterLink>
);

export const Header = () => {
  const account = useAccount();
  const theme = useTheme();
  return (
    <>
      <GlobalStyles
        styles={{ ul: { margin: 0, padding: 0, listStyle: "none" } }}
      />
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          padding: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexFlow: "row",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            maxWidth: "1250px",
            width: "100%",
          }}
        >
          <RouterLink to="/" style={{ marginRight: "auto" }}>
            <img
              width="47.5px"
              height="47.5px"
              src="/logo.svg"
              alt="Carmine logo"
            />
          </RouterLink>
          <NetworkSwitch />
          {navLinks.map((navData, i) => navLink(navData, i, account))}
          <RouterLink to="/settings">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1,
                px: 2,
                mr: 2,
              }}
            >
              <SettingsIcon sx={{ color: theme.palette.text.primary }} />
            </Box>
          </RouterLink>
          <WalletButton />
        </Box>
      </AppBar>
    </>
  );
};
