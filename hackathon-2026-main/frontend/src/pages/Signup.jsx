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
  Building2,
  Users,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import "../styles/globals.css";

/* -------------------------------------------------------------------- */
/*  Inline Marks & Brand Assets                                         */
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

function TriagoMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="28" height="28" rx="8" fill="url(#triagoMarkGrad)" />
      <path
        d="M9 19.5L15 9l6 10.5"
        stroke="#F7F5FF"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
/*  Validation Helpers                                                  */
/* -------------------------------------------------------------------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateField(name, value, allValues, mode = "CREATE") {
  switch (name) {
    case "fullName":
      if (!value.trim()) return "Enter your full name.";
      if (value.trim().length < 2) return "Name must be at least 2 characters.";
      return "";
    case "email":
      if (mode === "JOIN") return "";
      if (!value.trim()) return "Enter your work email.";
      if (!EMAIL_RE.test(value.trim())) return "Enter a valid email address.";
      return "";
    case "password":
      if (!value) return "Create a password.";
      if (value.length < 8) return "Use at least 8 characters.";
      if (!/[A-Z]/.test(value)) return "Add an uppercase letter.";
      if (!/\d/.test(value)) return "Add a number.";
      return "";
    case "confirmPassword":
      if (!value) return "Confirm your password.";
      if (value !== allValues.password) return "Passwords don’t match.";
      return "";
    case "workspaceName":
      if (mode === "CREATE" && !value.trim()) return "Enter a workspace name.";
      return "";
    case "inviteCode":
      if (mode === "JOIN" && !value.trim()) return "Enter an invitation code.";
      return "";
    default:
      return "";
  }
}

function getPasswordChecks(value) {
  return {
    length: value.length >= 8,
    uppercase: /[A-Z]/.test(value),
    number: /\d/.test(value),
  };
}

function getStrength(value) {
  if (!value) return { score: 0, label: "" };
  const checks = getPasswordChecks(value);
  const met = Object.values(checks).filter(Boolean).length;
  const bonus = value.length >= 12 && met === 3 ? 1 : 0;
  const level = Math.min(met + bonus, 3);
  return { score: level, label: ["Weak", "Fair", "Good", "Strong"][level] };
}

/* -------------------------------------------------------------------- */
/*  Component                                                           */
/* -------------------------------------------------------------------- */
export default function Signup() {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  // Mode: null (unselected), 'CREATE', 'JOIN'
  const [signupMode, setSignupMode] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    workspaceName: "",
    workspaceEmailDomain: "",
    inviteCode: "",
  });

  // Invitation Verification State
  const [inviteVerified, setInviteVerified] = useState(false);
  const [inviteVerifying, setInviteVerifying] = useState(false);
  const [inviteDetails, setInviteDetails] = useState({
    workspaceName: "",
    email: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [agreedError, setAgreedError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const fieldRefs = {
    fullName: useRef(null),
    email: useRef(null),
    password: useRef(null),
    confirmPassword: useRef(null),
    workspaceName: useRef(null),
    inviteCode: useRef(null),
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

  useEffect(() => {
    if (touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateField("confirmPassword", formData.confirmPassword, formData, signupMode),
      }));
    }
  }, [formData.password, signupMode, touched.confirmPassword]);

  function handleChange(e) {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    setFormData(next);
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value, next, signupMode) }));
    }
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value, formData, signupMode) }));
  }

  function handleAgreedChange() {
    setAgreed((prev) => {
      const next = !prev;
      if (next) setAgreedError("");
      return next;
    });
  }

  /* ---------------- Invitation Verification (Demo Logic) ---------------- */
  function handleVerifyInvite() {
    if (!formData.inviteCode.trim()) {
      setErrors((prev) => ({ ...prev, inviteCode: "Enter an invitation code." }));
      return;
    }

    setInviteVerifying(true);
    setErrors((prev) => ({ ...prev, inviteCode: "" }));

    setTimeout(() => {
      setInviteVerifying(false);
      if (formData.inviteCode.trim().toUpperCase() === "TRIAGO-DEMO") {
        setInviteVerified(true);
        setInviteDetails({
          workspaceName: "Acme Engineering",
          email: "employee@acme.com",
        });
        setFormData((prev) => ({ ...prev, email: "employee@acme.com" }));
        showToast("success", "Invitation verified ✓");
      } else {
        setInviteVerified(false);
        setErrors((prev) => ({
          ...prev,
          inviteCode: "We couldn't verify that invitation code. Please check and try again.",
        }));
      }
    }, 800);
  }

  function validateAll() {
    const nextErrors = {};
    let firstInvalid = null;

    const fieldsToValidate =
      signupMode === "CREATE"
        ? ["fullName", "email", "password", "confirmPassword", "workspaceName"]
        : ["fullName", "password", "confirmPassword"];

    fieldsToValidate.forEach((name) => {
      const err = validateField(name, formData[name], formData, signupMode);
      nextErrors[name] = err;
      if (err && !firstInvalid) firstInvalid = name;
    });

    setErrors(nextErrors);
    const touchedState = {};
    fieldsToValidate.forEach((k) => (touchedState[k] = true));
    setTouched(touchedState);

    let termsInvalid = false;
    if (!agreed) {
      setAgreedError("You need to accept the terms to continue.");
      termsInvalid = true;
    } else {
      setAgreedError("");
    }

    if (firstInvalid) {
      fieldRefs[firstInvalid]?.current?.focus();
      return false;
    }
    if (termsInvalid) return false;
    return true;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;

    if (signupMode === "JOIN" && !inviteVerified) {
      handleVerifyInvite();
      return;
    }

    if (!validateAll()) {
      showToast("error", "Check the highlighted fields and try again.");
      return;
    }

    setIsSubmitting(true);

    const authContext =
      signupMode === "CREATE"
        ? {
            role: "Workspace Owner",
            workspaceName: formData.workspaceName,
            workspaceEmailDomain: formData.workspaceEmailDomain || "",
            accountOwner: true,
            user: { fullName: formData.fullName, email: formData.email },
          }
        : {
            role: "Employee",
            workspaceName: inviteDetails.workspaceName,
            accountOwner: false,
            membershipStatus: "active",
            user: { fullName: formData.fullName, email: inviteDetails.email },
          };

    window.setTimeout(() => {
      setIsSubmitting(false);
      showToast("success", "Welcome to TRIAGO!", 1200);
      window.setTimeout(() => {
        navigate("/onboarding", { state: authContext });
      }, 600);
    }, 1200);
  }

  function handleSocial(provider) {
    showToast("info", `${provider} authentication coming soon.`);
  }

  const strength = getStrength(formData.password);
  const passwordChecks = getPasswordChecks(formData.password);

  /* ---------------- Motion Variants ---------------- */
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
    show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
  };
  const fieldVariant = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
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
          </div>

          <div className="brand-content">
            <div className="brand-logo-row">
              <TriagoMark />
              <span className="trago-logo-word">TRIAGO</span>
            </div>

            <div className="status-badge">
              <span className="status-dot" />
              AUTONOMOUS INCIDENT RESPONSE
            </div>

            <h1 className="brand-heading">
              Build what&rsquo;s next.
              <br />
              Move without limits.
            </h1>

            <p className="brand-sub">
              TRIAGO gives modern teams the tools, intelligence, and momentum to resolve incidents seamlessly from idea to impact.
            </p>
          </div>

          <div className="brand-footer">
            <p className="trust-line">Built for engineering teams moving forward.</p>
            <ul className="trust-list">
              <li>
                <Check size={14} strokeWidth={2.5} /> Fast setup
              </li>
              <li>
                <Check size={14} strokeWidth={2.5} /> Built to scale
              </li>
              <li>
                <Check size={14} strokeWidth={2.5} /> Autonomous AI
              </li>
            </ul>
            <p className="copyright">© 2026 TRIAGO</p>
          </div>
        </motion.aside>

        {/* ============================= RIGHT: FORM PANEL ============================= */}
        <div className="form-panel">
          <div className="form-panel-inner">
            <div className="form-top-row">
              <span className="eyebrow">WELCOME TO TRIAGO</span>
              <p className="signin-prompt">
                Already have an account?{" "}
                <Link to="/login" className="signin-link">
                  Sign in <ArrowRight size={14} />
                </Link>
              </p>
            </div>

            <h2 className="form-heading">Create your TRIAGO account</h2>
            <p className="form-subtitle">Start a workspace or join your team.</p>

            {/* ----------------- WORKSPACE OPTION CHOICE STEP ----------------- */}
            <div className="workspace-choice-container" style={{ margin: "20px 0 24px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                {/* Option A: Create Workspace */}
                <button
                  type="button"
                  onClick={() => {
                    setSignupMode("CREATE");
                    setErrors({});
                  }}
                  style={{
                    textAlign: "left",
                    padding: "14px",
                    borderRadius: "12px",
                    border: signupMode === "CREATE" ? "1.5px solid #6366F1" : "1px solid #E2E8F0",
                    background: signupMode === "CREATE" ? "#EEF2FF" : "#FFFFFF",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: signupMode === "CREATE" ? "#6366F1" : "#F1F5F9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: signupMode === "CREATE" ? "#FFFFFF" : "#475569",
                        }}
                      >
                        <Building2 size={16} />
                      </div>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: signupMode === "CREATE" ? "#E0E7FF" : "#F1F5F9",
                          color: signupMode === "CREATE" ? "#4338CA" : "#64748B",
                          letterSpacing: "0.5px",
                        }}
                      >
                        ADMINS
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "#0F172A", marginBottom: "4px" }}>
                      Create workspace
                    </div>
                    <p style={{ fontSize: "12px", color: "#64748B", margin: 0, lineHeight: 1.3 }}>
                      Set up TRIAGO as a workspace owner.
                    </p>
                  </div>
                  <div style={{ marginTop: "12px", fontSize: "12px", fontWeight: 600, color: signupMode === "CREATE" ? "#4F46E5" : "#64748B", display: "flex", alignItems: "center", gap: "4px" }}>
                    Create workspace <ArrowRight size={12} />
                  </div>
                </button>

                {/* Option B: Join Workspace */}
                <button
                  type="button"
                  onClick={() => {
                    setSignupMode("JOIN");
                    setErrors({});
                  }}
                  style={{
                    textAlign: "left",
                    padding: "14px",
                    borderRadius: "12px",
                    border: signupMode === "JOIN" ? "1.5px solid #6366F1" : "1px solid #E2E8F0",
                    background: signupMode === "JOIN" ? "#EEF2FF" : "#FFFFFF",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    justify: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: signupMode === "JOIN" ? "#6366F1" : "#F1F5F9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: signupMode === "JOIN" ? "#FFFFFF" : "#475569",
                        }}
                      >
                        <Users size={16} />
                      </div>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: signupMode === "JOIN" ? "#E0E7FF" : "#F1F5F9",
                          color: signupMode === "JOIN" ? "#4338CA" : "#64748B",
                          letterSpacing: "0.5px",
                        }}
                      >
                        EMPLOYEES
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "#0F172A", marginBottom: "4px" }}>
                      Join workspace
                    </div>
                    <p style={{ fontSize: "12px", color: "#64748B", margin: 0, lineHeight: 1.3 }}>
                      Join an existing workspace with an invitation.
                    </p>
                  </div>
                  <div style={{ marginTop: "12px", fontSize: "12px", fontWeight: 600, color: signupMode === "JOIN" ? "#4F46E5" : "#64748B", display: "flex", alignItems: "center", gap: "4px" }}>
                    Join workspace <ArrowRight size={12} />
                  </div>
                </button>
              </div>
            </div>

            {/* Dynamic Form Area */}
            {signupMode === "CREATE" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div className="social-row">
                  <button type="button" className="social-btn" onClick={() => handleSocial("Google")}>
                    <GoogleMark /> Continue with Google
                  </button>
                  <button type="button" className="social-btn" onClick={() => handleSocial("GitHub")}>
                    <GithubMark /> Continue with GitHub
                  </button>
                </div>

                <div className="divider">
                  <span>OR CONTINUE WITH WORKEMAIL</span>
                </div>

                <motion.form className="signup-form" variants={formStagger} initial="hidden" animate="show" onSubmit={handleSubmit} noValidate>
                  {/* Full Name */}
                  <motion.div className={`field ${errors.fullName && touched.fullName ? "has-error" : ""}`} variants={fieldVariant}>
                    <label htmlFor="fullName">Full name</label>
                    <input
                      ref={fieldRefs.fullName}
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your name"
                      value={formData.fullName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <span className="field-error" role="alert">{touched.fullName ? errors.fullName : ""}</span>
                  </motion.div>

                  {/* Work Email */}
                  <motion.div className={`field ${errors.email && touched.email ? "has-error" : ""}`} variants={fieldVariant}>
                    <label htmlFor="email">Work email</label>
                    <input
                      ref={fieldRefs.email}
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <span className="field-error" role="alert">{touched.email ? errors.email : ""}</span>
                  </motion.div>

                  {/* Password */}
                  <motion.div className={`field ${errors.password && touched.password ? "has-error" : ""}`} variants={fieldVariant}>
                    <label htmlFor="password">Password</label>
                    <div className="input-with-action">
                      <input
                        ref={fieldRefs.password}
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a secure password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
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

                    {formData.password && (
                      <div className="strength-meter">
                        <div className="strength-track">
                          <div className={`strength-fill strength-${strength.score}`} />
                        </div>
                        <span className={`strength-label strength-label-${strength.score}`}>{strength.label}</span>
                      </div>
                    )}

                    <ul className="req-list">
                      <li className={passwordChecks.length ? "is-met" : ""}><Check size={12} strokeWidth={3} /> 8+ characters</li>
                      <li className={passwordChecks.uppercase ? "is-met" : ""}><Check size={12} strokeWidth={3} /> Uppercase letter</li>
                      <li className={passwordChecks.number ? "is-met" : ""}><Check size={12} strokeWidth={3} /> Number</li>
                    </ul>
                    <span className="field-error" role="alert">{touched.password ? errors.password : ""}</span>
                  </motion.div>

                  {/* Confirm Password */}
                  <motion.div className={`field ${errors.confirmPassword && touched.confirmPassword ? "has-error" : ""}`} variants={fieldVariant}>
                    <label htmlFor="confirmPassword">Confirm password</label>
                    <div className="input-with-action">
                      <input
                        ref={fieldRefs.confirmPassword}
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <button
                        type="button"
                        className="input-action"
                        onClick={() => setShowConfirm((v) => !v)}
                        aria-label={showConfirm ? "Hide password" : "Show password"}
                      >
                        {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    <span className="field-error" role="alert">{touched.confirmPassword ? errors.confirmPassword : ""}</span>
                  </motion.div>

                  {/* WORKSPACE SETUP SECTION */}
                  <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#4F46E5", letterSpacing: "0.8px", marginBottom: "12px", textTransform: "uppercase" }}>
                      Workspace Setup
                    </div>

                    <motion.div className={`field ${errors.workspaceName && touched.workspaceName ? "has-error" : ""}`} variants={fieldVariant}>
                      <label htmlFor="workspaceName">Workspace name</label>
                      <input
                        ref={fieldRefs.workspaceName}
                        id="workspaceName"
                        name="workspaceName"
                        type="text"
                        placeholder="Acme Engineering"
                        value={formData.workspaceName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <span className="field-error" role="alert">{touched.workspaceName ? errors.workspaceName : ""}</span>
                    </motion.div>

                    <motion.div className="field" variants={fieldVariant}>
                      <label htmlFor="workspaceEmailDomain">Organization email domain (optional)</label>
                      <input
                        id="workspaceEmailDomain"
                        name="workspaceEmailDomain"
                        type="text"
                        placeholder="acme.com"
                        value={formData.workspaceEmailDomain}
                        onChange={handleChange}
                      />
                      <p style={{ fontSize: "11px", color: "#64748B", marginTop: "4px" }}>
                        Used to help identify members of your organization.
                      </p>
                    </motion.div>
                  </div>

                  {/* Terms */}
                  <motion.div variants={fieldVariant}>
                    <label className="checkbox-row" htmlFor="terms">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={agreed}
                        onChange={handleAgreedChange}
                        className="visually-hidden-checkbox"
                      />
                      <span className="custom-checkbox">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      <span>
                        I agree to the <a href="#terms" className="inline-link" onClick={(e) => e.preventDefault()}>Terms of Service</a> and <a href="#privacy" className="inline-link" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
                      </span>
                    </label>
                    <span className="field-error" role="alert">{agreedError}</span>
                  </motion.div>

                  <motion.button type="submit" className="submit-btn" variants={fieldVariant} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 size={17} className="spin" /> Creating workspace...
                      </>
                    ) : (
                      <>
                        Create workspace <ArrowRight size={17} />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              </motion.div>
            )}

            {signupMode === "JOIN" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                {!inviteVerified ? (
                  <div style={{ padding: "16px", borderRadius: "12px", background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#4F46E5", letterSpacing: "0.5px", marginBottom: "8px", textTransform: "uppercase" }}>
                      JOIN YOUR TEAM
                    </div>
                    <p style={{ fontSize: "13px", color: "#475569", marginBottom: "16px" }}>
                      Enter your organization invitation code to proceed (Try: <strong style={{ color: "#0F172A" }}>TRIAGO-DEMO</strong>).
                    </p>

                    <div className={`field ${errors.inviteCode ? "has-error" : ""}`}>
                      <label htmlFor="inviteCode">Invitation code</label>
                      <input
                        ref={fieldRefs.inviteCode}
                        id="inviteCode"
                        name="inviteCode"
                        type="text"
                        placeholder="e.g. TRIAGO-DEMO"
                        value={formData.inviteCode}
                        onChange={handleChange}
                      />
                      <span className="field-error" role="alert">{errors.inviteCode}</span>
                    </div>

                    <button
                      type="button"
                      className="submit-btn"
                      onClick={handleVerifyInvite}
                      disabled={inviteVerifying}
                      style={{ marginTop: "12px" }}
                    >
                      {inviteVerifying ? (
                        <>
                          <Loader2 size={17} className="spin" /> Verifying...
                        </>
                      ) : (
                        "Verify invitation →"
                      )}
                    </button>
                  </div>
                ) : (
                  <motion.form className="signup-form" variants={formStagger} initial="hidden" animate="show" onSubmit={handleSubmit} noValidate>
                    <div style={{ padding: "12px 16px", borderRadius: "8px", background: "#ECFDF5", border: "1px solid #A7F3D0", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                      <ShieldCheck size={20} style={{ color: "#059669" }} />
                      <div>
                        <div style={{ fontSize: "12px", color: "#059669", fontWeight: 600 }}>Invitation Verified</div>
                        <div style={{ fontSize: "13px", color: "#064E3B" }}>
                          You’ve been invited to join <strong>{inviteDetails.workspaceName}</strong>.
                        </div>
                      </div>
                    </div>

                    {/* Email - Read-only invited identity */}
                    <div className="field">
                      <label>Invited Email</label>
                      <input type="email" value={inviteDetails.email} disabled style={{ opacity: 0.7, cursor: "not-allowed" }} />
                    </div>

                    {/* Full Name */}
                    <motion.div className={`field ${errors.fullName && touched.fullName ? "has-error" : ""}`} variants={fieldVariant}>
                      <label htmlFor="fullName">Full name</label>
                      <input
                        ref={fieldRefs.fullName}
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="Enter your name"
                        value={formData.fullName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <span className="field-error" role="alert">{touched.fullName ? errors.fullName : ""}</span>
                    </motion.div>

                    {/* Password */}
                    <motion.div className={`field ${errors.password && touched.password ? "has-error" : ""}`} variants={fieldVariant}>
                      <label htmlFor="password">Password</label>
                      <div className="input-with-action">
                        <input
                          ref={fieldRefs.password}
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={formData.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
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
                      <span className="field-error" role="alert">{touched.password ? errors.password : ""}</span>
                    </motion.div>

                    {/* Confirm Password */}
                    <motion.div className={`field ${errors.confirmPassword && touched.confirmPassword ? "has-error" : ""}`} variants={fieldVariant}>
                      <label htmlFor="confirmPassword">Confirm password</label>
                      <div className="input-with-action">
                        <input
                          ref={fieldRefs.confirmPassword}
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirm ? "text" : "password"}
                          placeholder="Confirm password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        <button
                          type="button"
                          className="input-action"
                          onClick={() => setShowConfirm((v) => !v)}
                          aria-label={showConfirm ? "Hide password" : "Show password"}
                        >
                          {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                      <span className="field-error" role="alert">{touched.confirmPassword ? errors.confirmPassword : ""}</span>
                    </motion.div>

                    {/* Terms */}
                    <motion.div variants={fieldVariant}>
                      <label className="checkbox-row" htmlFor="terms">
                        <input
                          type="checkbox"
                          id="terms"
                          checked={agreed}
                          onChange={handleAgreedChange}
                          className="visually-hidden-checkbox"
                        />
                        <span className="custom-checkbox">
                          <Check size={12} strokeWidth={3} />
                        </span>
                        <span>
                          I agree to the <a href="#terms" className="inline-link" onClick={(e) => e.preventDefault()}>Terms of Service</a> and <a href="#privacy" className="inline-link" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
                        </span>
                      </label>
                      <span className="field-error" role="alert">{agreedError}</span>
                    </motion.div>

                    <motion.button type="submit" className="submit-btn" variants={fieldVariant} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 size={17} className="spin" /> Joining workspace...
                        </>
                      ) : (
                        <>
                          Join workspace <ArrowRight size={17} />
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                )}
              </motion.div>
            )}

            {!signupMode && (
              <p style={{ textAlign: "center", fontSize: "13px", color: "#64748B", marginTop: "16px" }}>
                Select an option above to continue with account setup.
              </p>
            )}
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
            <button type="button" className="toast-close" aria-label="Dismiss notification" onClick={() => setToast(null)}>
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}