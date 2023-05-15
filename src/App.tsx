import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import BalancePage from "./pages/balance";
import NotFound from "./pages/notFound";
import TradePage from "./pages/trade";
import StakePage from "./pages/stake";
import StakingExplainedPage from "./pages/stakeInfo";
import Settings from "./pages/settings";
import { Controller } from "./Controller";
import { CssBaseline } from "@mui/material";
import { MultiDialog } from "./components/MultiDialog/MultiDialog";
import { Toast } from "./components/Toast/Toast";
import HistoryPage from "./pages/history";
import TermsAndConditions from "./pages/termsAndConditions";
import { useState } from "react";
import { AlphaRibbon } from "./components/AlphaRibbon/AlphaRibbon";
import { isCookieSet } from "./utils/cookies";
import BenchPage from "./pages/bench";
import { isDev } from "./utils/utils";

const App = () => {
  const [check, rerender] = useState(false);

  const acceptedTermsAndConditions = isCookieSet("carmine-t&c");

  return (
    <Provider store={store}>
      <Controller>
        <CssBaseline />
        {acceptedTermsAndConditions ? (
          <>
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<TradePage />} />
                  <Route path="/trade" element={<TradePage />} />
                  <Route path="/position" element={<BalancePage />} />
                  <Route path="/staking" element={<StakePage />} />
                  <Route
                    path="/staking-explained"
                    element={<StakingExplainedPage />}
                  />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/settings" element={<Settings />} />
                  {isDev && <Route path="/bench" element={<BenchPage />} />}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </Router>
            <MultiDialog />
            <Toast />
            <AlphaRibbon />
          </>
        ) : (
          <TermsAndConditions check={check} rerender={rerender} />
        )}
      </Controller>
    </Provider>
  );
};

export default App;
