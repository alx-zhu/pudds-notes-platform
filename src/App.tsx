import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { TrialsList } from "@/pages/TrialsList";
import { TrialView } from "@/pages/TrialView";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
    },
  },
});

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/trials" replace />} />
          <Route element={<AppShell />}>
            <Route path="/trials" element={<TrialsList />} />
            <Route path="/trials/:id" element={<TrialView />} />
          </Route>
          <Route path="*" element={<Navigate to="/trials" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
