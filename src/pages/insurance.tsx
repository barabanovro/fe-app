import { useEffect } from "react";
import { Layout } from "../components/layout";
import { Typography } from "@mui/material";
import { BuyInsuranceBox } from "../components/Insurance/BuyInsuranceBox";
import { ActiveInsurance } from "../components/Insurance/ActiveInsurance";
import { ClaimInsurance } from "../components/Insurance/ClaimInsurance";

const Insurance = () => {
  useEffect(() => {
    document.title = "Insurance | Carmine Finance";
  });

  return (
    <Layout>
      <Typography sx={{ mb: 2 }} variant="h4">
        Buy Insurance on Price Drops
      </Typography>
      <BuyInsuranceBox />
      <Typography sx={{ mb: 2, mt: 6 }} variant="h4">
        Claimable Insurance
      </Typography>
      <ClaimInsurance />
      <Typography sx={{ mb: 2, mt: 6 }} variant="h4">
        Active Insurance
      </Typography>
      <ActiveInsurance />
    </Layout>
  );
};

export default Insurance;
