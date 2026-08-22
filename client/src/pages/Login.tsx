import { ArrowLeft, ArrowRight, Check, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { getOAuthFailureMessage } from "@shared/authPaths";

function resolveNextPath() {
  const raw = new URLSearchParams(window.location.search).get("next");
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/app";
}

export default function Login() {
  const [, setLocation] = useLocation();
  const nextPath = useMemo(resolveNextPath, []);
  const authError = useMemo(() => getOAuthFailureMessage(new URLSearchParams(window.location.search).get("error")), []);
  const { isAuthenticated, loading } = useAuth();
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      setLocation(nextPath, { replace: true });
    }
  }, [isAuthenticated, loading, nextPath, setLocation]);

  return (
    <main className="triago-auth-page">
      <section className="triago-auth-brand" aria-hidden="true">
        <div className="auth-grid" />
        <div className="auth-brand-content">
          <div className="brand auth-brand-logo"><span className="brand-glyph"><i /><i /><i /></span><span>TRIAGO</span></div>
          <span className="auth-kicker"><i /> SECURE COMMAND ACCESS</span>
          <h1>Pick up right where you left off.</h1>
          <p>Access the evidence, agent activity, and operational context that keeps your response moving.</p>
        </div>
        <div className="auth-assurances">
          <span><Check size={14} /> Manus-authenticated access</span>
          <span><Check size={14} /> Persistent secure session</span>
          <span><Check size={14} /> Live incident operations</span>
        </div>
      </section>

      <section className="triago-auth-panel">
        <button className="auth-return" onClick={() => setLocation("/")}><ArrowLeft size={15} /> Back to Triago</button>
        <div className="auth-form-content">
          <span className="section-kicker">WELCOME BACK TO TRIAGO</span>
          <h2>Open your command center.</h2>
          <p>Use your Manus account to continue to the protected Triago command center.</p>
          {authError && <p className="auth-error" role="alert">{authError}</p>}
          <button className="oauth-signin-button" onClick={() => { setIsStarting(true); startLogin(nextPath); }} disabled={isStarting}>
            {isStarting ? <><Loader2 size={17} /> Connecting securely…</> : <>Continue with Manus <ArrowRight size={17} /></>}
          </button>
          <div className="auth-divider"><span>SECURE SIGN-IN</span></div>
          <div className="auth-note"><ShieldCheck size={17} /><p>Triago uses Manus OAuth with CSRF-bound redirect state and creates a secure HTTP-only session for this workspace.</p></div>
          <button className="auth-secondary" onClick={() => setLocation("/")}>Explore the product first <ArrowRight size={15} /></button>
        </div>
      </section>
    </main>
  );
}
