import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ReadOnlyProvider } from "@/contexts/ReadOnlyContext";
import { AppShell } from "@/components/AppShell";
import { LoginPage } from "@/pages/LoginPage";
import { TrialsList } from "@/pages/TrialsList";
import { TrialView } from "@/pages/TrialView";
import { IngredientsPage } from "@/pages/IngredientsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
    },
  },
});

const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/60 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <ReadOnlyProvider value={role === "viewer"}>
      {children}
    </ReadOnlyProvider>
  );
};

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AuthGate>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<AppShell />}>
                <Route path="/" element={<Navigate to="/trials" replace />} />
                <Route path="/trials" element={<TrialsList />} />
                <Route path="/trials/:id" element={<TrialView />} />
                <Route path="/ingredients" element={<IngredientsPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/trials" replace />} />
            </Routes>
          </AuthGate>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};
