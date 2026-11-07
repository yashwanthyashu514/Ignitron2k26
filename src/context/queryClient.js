import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute data freshness
      gcTime: 5 * 60 * 1000, // 5 minutes cache retention
      refetchOnWindowFocus: false, // do not re-fetch on window focus
      retry: 1, // retry once on network error
    },
  },
});

