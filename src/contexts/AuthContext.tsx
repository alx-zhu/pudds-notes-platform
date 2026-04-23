import { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type Role = "guest" | "viewer" | "editor" | "owner";

interface AuthContextValue {
  session: Session | null;
  isLoading: boolean;
  role: Role;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  isLoading: true,
  role: "guest",
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null | "loading">("loading");
  const [role, setRole] = useState<Role>("guest");

  const fetchRole = async (userId: string) => {
    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();
    const r = data?.role;
    setRole(r === "owner" ? "owner" : r === "editor" ? "editor" : "viewer");
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) fetchRole(data.session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s);
      if (s) fetchRole(s.user.id);
      else setRole("guest");
    });

    return () => subscription.unsubscribe();
  }, []);

  const isLoading = session === "loading";
  const resolvedSession = isLoading ? null : session;

  return (
    <AuthContext.Provider value={{ session: resolvedSession, isLoading, role }}>
      {children}
    </AuthContext.Provider>
  );
};
