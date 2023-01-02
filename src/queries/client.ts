import { QueryClient, QueryClientConfig } from "react-query";
import { QueryKeys } from "./keys";

// 15 minutes
const staleTime = 15 * 60 * 1000;

const queryConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime,
    },
  },
};

export const queryClient = new QueryClient(queryConfig);

export const invalidatePositions = () =>
  queryClient.invalidateQueries(QueryKeys.position);
export const invalidateStake = () =>
  queryClient.invalidateQueries(QueryKeys.stake);
