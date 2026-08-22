import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Check,
  ArrowRight,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import "../styles/globals.css";

/* -------------------------------------------------------------------- */
/*  Small inline Google mark                                            */
/* -------------------------------------------------------------------- */
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03l2.97-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------- */
/*  Small inline GitHub mark                                            */
/* -------------------------------------------------------------------- */
function GithubMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------- */
/*  Abstract TRIAGO logo mark                                           */
/* -------------------------------------------------------------------- */
function TriagoMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="28" height="28" rx="8" fill="url(#triagoMarkGrad)" />
      <path d="M9 19.5L15 9l6 10.5" stroke="#F7F5FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="15" cy="9" r="1.6" fill="#F7F5FF" />
      <defs>
        <linearGradient id="triagoMarkGrad" x1="1" y1="1" x2="29" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B6BF2" />
          <stop offset="1" stopColor="#4C3196" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* -------------------------------------------------------------------- */
/*  Mock Authentication Service Layer                                   */
/* -------------------------------------------------------------------- */
const MOCK_USERS = [
  {
    userId: "USR-1024",
    email: "employee@acme.com",
    password: "TriagoDemo123",
    name: "Demo Employee",
    workspaceId: "WS-001",
    workspaceName: "Acme Engineering",
    status: "ACTIVE",
    role: "employee",
    onboardingComplete: true,
  },
  {
    userId: "USR-2048",
    email: "owner@acme.com",
    password: "TriagoDemo123",
    name: "Workspace Owner",
    workspaceId: "WS-001",
    workspaceName: "Acme Engineering",
    status: "ACTIVE",
    role: "workspaceOwner",
    onboardingComplete: true,
  },
  {
    userId: "USR-3099",
    email: "pending@acme.com",
    password: "TriagoDemo123",
    name: "Pending User",
    workspaceId: "WS-001",
    workspaceName: "Acme Engineering",
    status: "INVITED",
    role: "employee",
    onboardingComplete: false,
  },
];

function authenticateUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = MOCK_USERS.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user || user.password !== password) {
    return { success: false, error: "Incorrect email or password." };
  }

  if (user.status === "SUSPENDED") {
    return { success: false, error: "Your account has been suspended. Contact your workspace administrator." };
  }

  if (user.status === "INVITED" || !user.onboardingComplete) {
    return { success: true, user, redirectTo: "/onboarding", notice: "Your TRIAGO account setup is incomplete." };
  }

  return { success: true, user, redirectTo: "/dashboard" };
}

/* -------------------------------------------------------------------- */
/*  Validation helpers                                                  */
/* -------------------------------------------------------------------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateField(name, value) {
  switch (name) {
    case "email":
      if (!value.trim()) return "Enter your email address.";
      if (!EMAIL_RE.test(value.trim())) return "Enter a valid email address.";
      return "";
    case "password":
      if (!value) return "Enter your password.";
      if (value.length < 8) return "Password must be at least 8 characters.";
      return "";
    default:
      return "";
  }
}

/* -------------------------------------------------------------------- */
/*  Component                                                           */
/* -------------------------------------------------------------------- */
export default function Login() {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const fieldRefs = {
    email: useRef(null),
    password: useRef(null),
  };

  const toastTimer = useRef(null);

  const showToast = useCallback((type, message, duration = 3200) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), duration);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    setFormData(next);
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  }

  function validateAll() {
    const nextErrors = {};
    let firstInvalid = null;

    ["email", "password"].forEach((name) => {
      const err = validateField(name, formData[name]);
      nextErrors[name] = err;
      if (err && !firstInvalid) firstInvalid = name;
    });

    setErrors(nextErrors);
    setTouched({ email: true, password: true });

    if (firstInvalid) {
      fieldRefs[firstInvalid].current?.focus();
      return false;
    }
    return true;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateAll()) {
      showToast("error", "Check the highlighted fields and try again.");
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      const authResult = authenticateUser(formData.email, formData.password);

      if (!authResult.success) {
        showToast("error", authResult.error);
        return;
      }

      localStorage.setItem("triago_user", JSON.stringify(authResult.user));

      if (authResult.notice) {
        showToast("info", authResult.notice, 2000);
      } else {
        showToast("success", "Welcome back to TRIAGO.", 1400);
      }

      window.setTimeout(() => {
        navigate(authResult.redirectTo);
      }, 700);
    }, 1200);
  }

  function handleSocial(provider) {
    showToast("info", `${provider} authentication will be connected soon.`);
  }

  /* ---------------------------- motion variants ---------------------------- */
  const containerVariants = {
    hidden: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.97, y: prefersReducedMotion ? 0 : 10 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
  };
  const brandVariants = {
    hidden: { opacity: 0, x: prefersReducedMotion ? 0 : -18 },
    show: { opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] } },
  };
  const formStagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.22 } },
  };
  const fieldVariant = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div className="trago-page">
      <motion.div
        className="trago-container"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* ============================= LEFT: BRAND PANEL ============================= */}
        <motion.aside
          className="brand-panel"
          variants={brandVariants}
          initial="hidden"
          animate="show"
          aria-hidden="true"
        >
          <div className="brand-panel-bg" />

          <div className="decorative-visuals">
            <div className="deco-glow deco-glow-1" />
            <div className="deco-glow deco-glow-2" />
            <div className="deco-grid" />

            <motion.div
              className="deco-cube deco-cube-1"
              animate={prefersReducedMotion ? {} : { y: [0, -16, 0], rotate: [6, 14, 6] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="deco-cube deco-cube-2"
              animate={prefersReducedMotion ? {} : { y: [0, 14, 0], rotate: [-8, -2, -8] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="deco-ring"
              animate={prefersReducedMotion ? {} : { y: [0, -10, 0], rotate: [0, 12, 0] }}
              transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="deco-sphere"
              animate={prefersReducedMotion ? {} : { y: [0, 12, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="deco-glass"
              animate={prefersReducedMotion ? {} : { y: [0, -9, 0], rotate: [-4, 4, -4] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            <span className="deco-particle p1" />
            <span className="deco-particle p2" />
            <span className="deco-particle p3" />
            <span className="deco-particle p4" />
            <span className="deco-particle p5" />
          </div>

          <div className="brand-content">
            <div className="brand-logo-row">
              <TriagoMark />
              <span className="trago-logo-word">TRIAGO</span>
            </div>

            <div className="status-badge">
              <span className="status-dot" />
              WELCOME BACK
            </div>

            <h1 className="brand-heading">
              Pick up right
              <br />
              where you left off.
            </h1>

            <p className="brand-sub">
              Access your workspace, projects, and team momentum instantly.
            </p>
          </div>

          <div className="brand-footer">
            <p className="trust-line">Built for people moving forward.</p>
            <ul className="trust-list">
              <li>
                <Check size={14} strokeWidth={2.5} /> Secure access
              </li>
              <li>
                <Check size={14} strokeWidth={2.5} /> Real-time sync
              </li>
              <li>
                <Check size={14} strokeWidth={2.5} /> Team connected
              </li>
            </ul>
            <p className="copyright">© 2026 TRIAGO</p>
          </div>
        </motion.aside>

        {/* ============================= RIGHT: FORM PANEL ============================= */}
        <div className="form-panel">
          <div className="form-panel-inner">
            <div className="form-top-row">
              <span className="eyebrow">WELCOME BACK TO TRIAGO</span>
              <p className="signin-prompt">
                Don&rsquo;t have a TRIAGO account?{" "}
                <Link to="/signup" className="signin-link">
                  Create account <ArrowRight size={14} />
                </Link>
              </p>
            </div>

            <h2 className="form-heading">Welcome back</h2>
            <p className="form-subtitle">
              Sign in to continue to your TRIAGO workspace.
            </p>

            <div className="social-row">
              <button
                type="button"
                className="social-btn"
                onClick={() => handleSocial("Google")}
              >
                <GoogleMark />
                Continue with Google
              </button>
              <button
                type="button"
                className="social-btn"
                onClick={() => handleSocial("GitHub")}
              >
                <GithubMark />
                Continue with GitHub
              </button>
            </div>

            <div className="divider">
              <span>OR CONTINUE WITH EMAIL</span>
            </div>

            <motion.form
              className="signup-form"
              variants={formStagger}
              initial="hidden"
              animate="show"
              onSubmit={handleSubmit}
              noValidate
            >
              {/* Email */}
              <motion.div className={`field ${errors.email && touched.email ? "has-error" : ""}`} variants={fieldVariant}>
                <label htmlFor="email">Work email</label>
                <input
                  ref={fieldRefs.email}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!(errors.email && touched.email)}
                  aria-describedby="err-email"
                />
                <span id="err-email" className="field-error" role="alert">
                  {touched.email ? errors.email : ""}
                </span>
              </motion.div>

              {/* Password */}
              <motion.div className={`field ${errors.password && touched.password ? "has-error" : ""}`} variants={fieldVariant}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label htmlFor="password">Password</label>
                  <a
                    href="#forgot"
                    className="inline-link"
                    style={{ fontSize: "12px", textDecoration: "none" }}
                    onClick={(e) => {
                      e.preventDefault();
                      showToast("info", "Password recovery will be connected soon.");
                    }}
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="input-with-action">
                  <input
                    ref={fieldRefs.password}
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={!!(errors.password && touched.password)}
                    aria-describedby="err-password"
                  />
                  <button
                    type="button"
                    className="input-action"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                <span id="err-password" className="field-error" role="alert">
                  {touched.password ? errors.password : ""}
                </span>
              </motion.div>

              <motion.button
                type="submit"
                className="submit-btn"
                variants={fieldVariant}
                whileHover={prefersReducedMotion ? {} : { y: -2 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                disabled={isSubmitting}
                style={{ marginTop: "12px" }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={17} className="spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={17} />
                  </>
                )}
              </motion.button>
            </motion.form>
          </div>
        </div>
      </motion.div>

      {/* ================================= TOAST ================================= */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`toast toast-${toast.type}`}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            role="status"
          >
            {toast.type === "success" && <CheckCircle2 size={18} />}
            {toast.type === "error" && <AlertCircle size={18} />}
            {toast.type === "info" && <CheckCircle2 size={18} />}
            <span>{toast.message}</span>
            <button
              type="button"
              className="toast-close"
              aria-label="Dismiss notification"
              onClick={() => setToast(null)}
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}