import { QueryClient } from "@tanstack/react-query";

// QueryClient simplificado - agora usamos os serviços do apiService
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});