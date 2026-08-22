import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation("/login?next=%2Fapp", { replace: true });
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading || !isAuthenticated) {
    return (
      <main className="auth-gate" aria-live="polite">
        <Loader2 size={20} />
        <span>Checking secure session…</span>
      </main>
    );
  }

  return <>{children}</>;
}
