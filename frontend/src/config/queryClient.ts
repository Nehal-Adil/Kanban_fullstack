import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (garbage collection time)
      retry: 1, // Retry failed requests once
      refetchOnWindowFocus: false, // Don't refetch when user returns to tab
    },
    mutations: {
      retry: 0, // Don't retry failed mutations
    },
  },
});
