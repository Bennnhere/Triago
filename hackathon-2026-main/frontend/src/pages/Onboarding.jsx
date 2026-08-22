import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Search,
  ChevronDown,
  X,
  Server,
  Database,
  Globe,
  GitBranch,
  Layers,
  Cpu,
  Shield,
  HardDrive,
  Bot,
  ShieldCheck,
  UserCheck,
  Loader2,
  CheckCircle2,
} from "lucide-react";

/* -------------------------------------------------------------------- */
/*  Static Reference Data                                               */
/* -------------------------------------------------------------------- */
const WORKSPACES = [
  "Acme Engineering",
  "Globex Core",
  "Stark Infrastructure",
  "Vandelay Systems",
  "PiedPiper Cloud",
];

const DEPARTMENTS = [
  "Engineering",
  "Infrastructure & SRE",
  "IT & Systems",
  "Security",
  "Data & Analytics",
  "Product",
  "Design",
  "Finance",
  "Operations",
  "Customer Support",
  "Sales",
  "Marketing",
  "Human Resources",
  "Legal & Compliance",
  "Hardware / Manufacturing",
  "Research & Development",
  "Other",
];

const ROLES_BY_DEPARTMENT = {
  Engineering: [
    "Backend Engineer",
    "Frontend Engineer",
    "Full-Stack Engineer",
    "Software Engineer",
    "DevOps / SRE",
    "Database Engineer",
    "Security Engineer",
    "Network Engineer",
    "Data Engineer",
    "ML / AI Engineer",
    "Engineering Manager",
    "Technical Lead",
    "CTO",
    "Other",
  ],
  "Infrastructure & SRE": [
    "DevOps / SRE",
    "Infrastructure Engineer",
    "Systems Administrator",
    "Cloud Architect",
    "Reliability Engineer",
    "Network Engineer",
    "Other",
  ],
  "IT & Systems": [
    "Systems Administrator",
    "IT Support Engineer",
    "Cloud Administrator",
    "Endpoint Administrator",
    "Infrastructure Engineer",
    "IT Manager",
    "Other",
  ],
  "Hardware / Manufacturing": [
    "Hardware Engineer",
    "Systems Engineer",
    "Embedded Engineer",
    "Electrical Engineer",
    "Field Engineer",
    "Hardware Technician",
    "Hardware Lead",
    "Other",
  ],
  DEFAULT: [
    "Team Lead",
    "Manager",
    "Specialist",
    "Contributor",
    "Other",
  ],
};

function getRolesForDepartment(dept) {
  return ROLES_BY_DEPARTMENT[dept] || ROLES_BY_DEPARTMENT.DEFAULT;
}

const SYSTEM_CATEGORIES = [
  {
    category: "APPLICATIONS",
    items: [
      { id: "backend-apis", name: "Backend APIs", icon: Globe },
      { id: "frontend", name: "Frontend", icon: Globe },
      { id: "mobile-apps", name: "Mobile Apps", icon: Globe },
      { id: "third-party", name: "Third-party Integrations", icon: Layers },
    ],
  },
  {
    category: "DATA",
    items: [
      { id: "databases", name: "Databases", icon: Database },
      { id: "data-pipelines", name: "Data Pipelines", icon: GitBranch },
      { id: "data-warehouses", name: "Data Warehouses", icon: Database },
    ],
  },
  {
    category: "INFRASTRUCTURE",
    items: [
      { id: "cloud", name: "Cloud", icon: Cpu },
      { id: "servers", name: "Servers", icon: Server },
      { id: "k8s", name: "Kubernetes / Containers", icon: Layers },
      { id: "networking", name: "Networking", icon: Globe },
    ],
  },
  {
    category: "OPERATIONS",
    items: [
      { id: "deployments", name: "Deployments", icon: GitBranch },
      { id: "cicd", name: "CI/CD", icon: GitBranch },
      { id: "monitoring", name: "Monitoring", icon: Cpu },
    ],
  },
  {
    category: "SECURITY",
    items: [
      { id: "sec-monitoring", name: "Security Monitoring", icon: Shield },
      { id: "identity-access", name: "Identity & Access", icon: Shield },
      { id: "vuln-mgmt", name: "Vulnerability Management", icon: Shield },
    ],
  },
  {
    category: "HARDWARE",
    items: [
      { id: "physical-servers", name: "Physical Servers", icon: Server },
      { id: "storage-systems", name: "Storage Systems", icon: HardDrive },
      { id: "network-devices", name: "Network Devices", icon: Cpu },
    ],
  },
];

const CONFIG_MESSAGES = [
  "Initializing TRIAGO...",
  "Mapping your responsibilities...",
  "Preparing incident routing...",
  "Configuring AI autonomy...",
];

/* -------------------------------------------------------------------- */
/*  TRIAGO Logo Mark                                                    */
/* -------------------------------------------------------------------- */
function TriagoMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="28" height="28" rx="8" fill="url(#triagoMarkGrad)" />
      <path
        d="M9 19.5L15 9l6 10.5"
        stroke="#F5F5F7"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="15" cy="9" r="1.6" fill="#F5F5F7" />
      <defs>
        <linearGradient id="triagoMarkGrad" x1="1" y1="1" x2="29" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9B7BFF" />
          <stop offset="1" stopColor="#5B3FD9" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* -------------------------------------------------------------------- */
/*  Main Component                                                      */
/* -------------------------------------------------------------------- */
export default function Onboarding() {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  // Lifecycle states: 'form' | 'configuring' | 'ready'
  const [phase, setPhase] = useState("form");
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Form Outputs
  const [workspace, setWorkspace] = useState(WORKSPACES[0]);
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [selectedSystems, setSelectedSystems] = useState(["backend-apis", "databases", "cloud"]);
  const [ownershipType, setOwnershipType] = useState("own");
  const [autonomyMode, setAutonomyMode] = useState("approval");
  const [humanRequiredForCritical, setHumanRequiredForCritical] = useState(true);

  // UI interaction states
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [deptSearch, setDeptSearch] = useState("");
  const [roleSearch, setRoleSearch] = useState("");
  const [systemSearch, setSystemSearch] = useState("");
  const [errors, setErrors] = useState({});

  // Configuration animation state
  const [configMsgIndex, setConfigMsgIndex] = useState(0);

  // Refs for closing dropdowns on outside click
  const wsRef = useRef(null);
  const deptRef = useRef(null);
  const roleRef = useRef(null);

  // Handle outside clicks for dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (wsRef.current && !wsRef.current.contains(e.target)) setWorkspaceOpen(false);
      if (deptRef.current && !deptRef.current.contains(e.target)) setDeptOpen(false);
      if (roleRef.current && !roleRef.current.contains(e.target)) setRoleOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Configuring timer effect
  useEffect(() => {
    if (phase !== "configuring") return undefined;

    setConfigMsgIndex(0);
    let idx = 0;
    const intervalTime = 1800 / CONFIG_MESSAGES.length;

    const timer = window.setInterval(() => {
      idx += 1;
      if (idx >= CONFIG_MESSAGES.length) {
        window.clearInterval(timer);
        window.setTimeout(() => setPhase("ready"), 400);
        return;
      }
      setConfigMsgIndex(idx);
    }, intervalTime);

    return () => window.clearInterval(timer);
  }, [phase]);

  // Filtered dropdown lists
  const filteredDepartments = DEPARTMENTS.filter((d) =>
    d.toLowerCase().includes(deptSearch.toLowerCase())
  );
  const availableRoles = getRolesForDepartment(department);
  const filteredRoles = availableRoles.filter((r) =>
    r.toLowerCase().includes(roleSearch.toLowerCase())
  );

  // Step validation and transition
  function handleContinue() {
    const nextErrors = {};
    if (step === 0) {
      if (!workspace.trim()) nextErrors.workspace = "Select or enter a workspace.";
      if (!department) nextErrors.department = "Select your department.";
      if (!role) nextErrors.role = "Select your role.";
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;

      setDirection(1);
      setStep(1);
    } else if (step === 1) {
      if (selectedSystems.length === 0) {
        setErrors({ systems: "Select at least one system or area." });
        return;
      }
      setErrors({});
      setDirection(1);
      setStep(2);
    } else if (step === 2) {
      setErrors({});
      setPhase("configuring");
    }
  }

  function handleBack() {
    setErrors({});
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  }

  const toggleSystem = useCallback((id) => {
    setSelectedSystems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    setErrors((prev) => ({ ...prev, systems: "" }));
  }, []);

  // Motion variants
  const slideVariants = {
    enter: (dir) => ({ opacity: 0, x: prefersReducedMotion ? 0 : dir * 30 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
    exit: (dir) => ({ opacity: 0, x: prefersReducedMotion ? 0 : dir * -30, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }),
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-bg" aria-hidden="true" />

      <motion.div
        className="onboarding-container"
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* ============================= HEADER & PROGRESS ============================= */}
        {phase === "form" && (
          <header className="onboarding-header">
            <div className="onboarding-brand">
              <TriagoMark />
              <span className="onboarding-wordmark">TRIAGO</span>
            </div>

            <div className="progress-indicator">
              <span className="progress-text">Step {step + 1} of 3</span>
              <div className="progress-bar-track" aria-hidden="true">
                <motion.div
                  className="progress-bar-fill"
                  animate={{ width: `${((step + 1) / 3) * 100}%` }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          </header>
        )}

        {/* ============================= STEP 1: WHO ARE YOU? ============================= */}
        <AnimatePresence mode="wait">
          {phase === "form" && step === 0 && (
            <motion.section
              key="step-0"
              className="onboarding-step"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <div className="step-title-group">
                <span className="step-badge">01 — WHO YOU ARE</span>
                <h1 className="step-heading">Who are you?</h1>
                <p className="step-subtitle">
                  Tell TRIAGO where you fit in your organization so incidents can reach the right people.
                </p>
              </div>

              <div className="onboarding-form-fields">
                {/* Workspace Selector */}
                <div className="field-group" ref={wsRef}>
                  <label className="field-label" id="workspace-label">Workspace</label>
                  <div className="custom-select-wrap">
                    <button
                      type="button"
                      className="custom-select-trigger"
                      onClick={() => setWorkspaceOpen((o) => !o)}
                      aria-expanded={workspaceOpen}
                      aria-labelledby="workspace-label"
                    >
                      <span className="select-value-text">{workspace}</span>
                      <ChevronDown size={16} className={`select-chevron ${workspaceOpen ? "open" : ""}`} />
                    </button>

                    {workspaceOpen && (
                      <div className="custom-dropdown-menu">
                        <div className="dropdown-search-item create-new">
                          <input
                            type="text"
                            placeholder="Create or type workspace..."
                            value={workspace}
                            onChange={(e) => setWorkspace(e.target.value)}
                            className="dropdown-inline-input"
                            autoFocus
                          />
                        </div>
                        <div className="dropdown-list">
                          {WORKSPACES.map((ws) => (
                            <button
                              key={ws}
                              type="button"
                              className={`dropdown-option ${workspace === ws ? "selected" : ""}`}
                              onClick={() => {
                                setWorkspace(ws);
                                setWorkspaceOpen(false);
                                setErrors((p) => ({ ...p, workspace: "" }));
                              }}
                            >
                              <span>{ws}</span>
                              {workspace === ws && <Check size={14} />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.workspace && <span className="field-error-msg">{errors.workspace}</span>}
                </div>

                {/* Department Selector */}
                <div className="field-group" ref={deptRef}>
                  <label className="field-label" id="dept-label">Department</label>
                  <div className="custom-select-wrap">
                    <button
                      type="button"
                      className={`custom-select-trigger ${!department ? "placeholder" : ""}`}
                      onClick={() => setDeptOpen((o) => !o)}
                      aria-expanded={deptOpen}
                      aria-labelledby="dept-label"
                    >
                      <span className="select-value-text">{department || "Search departments..."}</span>
                      <ChevronDown size={16} className={`select-chevron ${deptOpen ? "open" : ""}`} />
                    </button>

                    {deptOpen && (
                      <div className="custom-dropdown-menu">
                        <div className="dropdown-search-box">
                          <Search size={14} className="dropdown-search-icon" />
                          <input
                            type="text"
                            placeholder="Search departments..."
                            value={deptSearch}
                            onChange={(e) => setDeptSearch(e.target.value)}
                            className="dropdown-search-input"
                            autoFocus
                          />
                        </div>
                        <div className="dropdown-list">
                          {filteredDepartments.map((d) => (
                            <button
                              key={d}
                              type="button"
                              className={`dropdown-option ${department === d ? "selected" : ""}`}
                              onClick={() => {
                                setDepartment(d);
                                setRole(""); // Reset role on department change
                                setDeptOpen(false);
                                setDeptSearch("");
                                setErrors((p) => ({ ...p, department: "", role: "" }));
                              }}
                            >
                              <span>{d}</span>
                              {department === d && <Check size={14} />}
                            </button>
                          ))}
                          {filteredDepartments.length === 0 && (
                            <div className="dropdown-empty">No departments found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.department && <span className="field-error-msg">{errors.department}</span>}
                </div>

                {/* Role Selector */}
                <div className="field-group" ref={roleRef}>
                  <label className="field-label" id="role-label">Role</label>
                  <div className="custom-select-wrap">
                    <button
                      type="button"
                      className={`custom-select-trigger ${!role ? "placeholder" : ""} ${!department ? "disabled" : ""}`}
                      onClick={() => {
                        if (department) setRoleOpen((o) => !o);
                      }}
                      disabled={!department}
                      aria-expanded={roleOpen}
                      aria-labelledby="role-label"
                    >
                      <span className="select-value-text">
                        {!department ? "Select a department first" : role || "Select your role..."}
                      </span>
                      <ChevronDown size={16} className={`select-chevron ${roleOpen ? "open" : ""}`} />
                    </button>

                    {roleOpen && department && (
                      <div className="custom-dropdown-menu">
                        <div className="dropdown-search-box">
                          <Search size={14} className="dropdown-search-icon" />
                          <input
                            type="text"
                            placeholder="Search roles..."
                            value={roleSearch}
                            onChange={(e) => setRoleSearch(e.target.value)}
                            className="dropdown-search-input"
                            autoFocus
                          />
                        </div>
                        <div className="dropdown-list">
                          {filteredRoles.map((r) => (
                            <button
                              key={r}
                              type="button"
                              className={`dropdown-option ${role === r ? "selected" : ""}`}
                              onClick={() => {
                                setRole(r);
                                setRoleOpen(false);
                                setRoleSearch("");
                                setErrors((p) => ({ ...p, role: "" }));
                              }}
                            >
                              <span>{r}</span>
                              {role === r && <Check size={14} />}
                            </button>
                          ))}
                          {filteredRoles.length === 0 && (
                            <div className="dropdown-empty">No roles found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.role && <span className="field-error-msg">{errors.role}</span>}
                </div>
              </div>

              <div className="onboarding-actions">
                <div />
                <button type="button" className="onboarding-primary-btn" onClick={handleContinue}>
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </motion.section>
          )}

          {/* ============================= STEP 2: WHAT DO YOU OWN? ============================= */}
          {phase === "form" && step === 1 && (
            <motion.section
              key="step-1"
              className="onboarding-step"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <div className="step-title-group">
                <div className="step-title-header-row">
                  <span className="step-badge">02 — WHAT YOU OWN</span>
                  <span className="selection-count-badge">{selectedSystems.length} selected</span>
                </div>
                <h1 className="step-heading">What do you work with?</h1>
                <p className="step-subtitle">
                  Tell TRIAGO which systems, services, or areas are part of your work.
                </p>
              </div>

              <div className="systems-search-wrapper">
                <Search size={15} className="systems-search-icon" />
                <input
                  type="text"
                  placeholder="Search systems, services, or areas..."
                  value={systemSearch}
                  onChange={(e) => setSystemSearch(e.target.value)}
                  className="systems-search-input"
                />
                {systemSearch && (
                  <button type="button" className="systems-clear-btn" onClick={() => setSystemSearch("")}>
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="systems-categories-container">
                {SYSTEM_CATEGORIES.map((cat) => {
                  const matchingItems = cat.items.filter((item) =>
                    item.name.toLowerCase().includes(systemSearch.toLowerCase())
                  );
                  if (matchingItems.length === 0) return null;

                  return (
                    <div key={cat.category} className="system-category-group">
                      <span className="category-title">{cat.category}</span>
                      <div className="system-cards-grid">
                        {matchingItems.map((item) => {
                          const Icon = item.icon;
                          const isSelected = selectedSystems.includes(item.id);
                          return (
                            <button
                              type="button"
                              key={item.id}
                              className={`system-card ${isSelected ? "selected" : ""}`}
                              onClick={() => toggleSystem(item.id)}
                            >
                              <span className="system-card-icon">
                                <Icon size={16} strokeWidth={1.8} />
                              </span>
                              <span className="system-card-name">{item.name}</span>
                              <span className={`system-card-checkbox ${isSelected ? "checked" : ""}`}>
                                {isSelected && <Check size={11} strokeWidth={3} />}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              {errors.systems && <span className="field-error-msg">{errors.systems}</span>}

              {/* Ownership Preference */}
              <div className="ownership-section">
                <p className="ownership-question">Are you primarily responsible for any of these?</p>
                <div className="ownership-options-row">
                  <button
                    type="button"
                    className={`ownership-radio-btn ${ownershipType === "own" ? "active" : ""}`}
                    onClick={() => setOwnershipType("own")}
                  >
                    <span className={`radio-dot ${ownershipType === "own" ? "checked" : ""}`} />
                    <span>Yes, I own these</span>
                  </button>
                  <button
                    type="button"
                    className={`ownership-radio-btn ${ownershipType === "work-with" ? "active" : ""}`}
                    onClick={() => setOwnershipType("work-with")}
                  >
                    <span className={`radio-dot ${ownershipType === "work-with" ? "checked" : ""}`} />
                    <span>I work with these</span>
                  </button>
                </div>
              </div>

              <div className="onboarding-actions">
                <button type="button" className="onboarding-secondary-btn" onClick={handleBack}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button type="button" className="onboarding-primary-btn" onClick={handleContinue}>
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </motion.section>
          )}

          {/* ============================= STEP 3: HOW SHOULD TRIAGO HELP? ============================= */}
          {phase === "form" && step === 2 && (
            <motion.section
              key="step-2"
              className="onboarding-step"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <div className="step-title-group">
                <span className="step-badge">03 — HOW TRIAGO HELPS</span>
                <h1 className="step-heading">How should TRIAGO help?</h1>
                <p className="step-subtitle">
                  TRIAGO investigates incidents automatically while keeping you in control of risky actions.
                </p>
              </div>

              <div className="autonomy-options-stack">
                {/* Option 1 */}
                <button
                  type="button"
                  className={`autonomy-option-card ${autonomyMode === "autonomous" ? "selected" : ""}`}
                  onClick={() => setAutonomyMode("autonomous")}
                >
                  <div className="autonomy-icon-box">
                    <Bot size={18} strokeWidth={1.8} />
                  </div>
                  <div className="autonomy-content">
                    <div className="autonomy-title-row">
                      <span className="autonomy-title">Let TRIAGO handle safe issues</span>
                    </div>
                    <span className="autonomy-desc">
                      TRIAGO can automatically resolve known, low-risk incidents when confidence is high.
                    </span>
                  </div>
                  <span className={`autonomy-radio ${autonomyMode === "autonomous" ? "checked" : ""}`} />
                </button>

                {/* Option 2 (Recommended Default) */}
                <button
                  type="button"
                  className={`autonomy-option-card ${autonomyMode === "approval" ? "selected" : ""}`}
                  onClick={() => setAutonomyMode("approval")}
                >
                  <div className="autonomy-icon-box">
                    <ShieldCheck size={18} strokeWidth={1.8} />
                  </div>
                  <div className="autonomy-content">
                    <div className="autonomy-title-row">
                      <span className="autonomy-title">Ask me before acting</span>
                      <span className="recommended-tag">RECOMMENDED</span>
                    </div>
                    <span className="autonomy-desc">
                      TRIAGO investigates automatically and asks for approval before making changes.
                    </span>
                  </div>
                  <span className={`autonomy-radio ${autonomyMode === "approval" ? "checked" : ""}`} />
                </button>

                {/* Option 3 */}
                <button
                  type="button"
                  className={`autonomy-option-card ${autonomyMode === "human-first" ? "selected" : ""}`}
                  onClick={() => setAutonomyMode("human-first")}
                >
                  <div className="autonomy-icon-box">
                    <UserCheck size={18} strokeWidth={1.8} />
                  </div>
                  <div className="autonomy-content">
                    <div className="autonomy-title-row">
                      <span className="autonomy-title">Keep me in control</span>
                    </div>
                    <span className="autonomy-desc">
                      TRIAGO investigates and recommends actions, but a human approves every fix.
                    </span>
                  </div>
                  <span className={`autonomy-radio ${autonomyMode === "human-first" ? "checked" : ""}`} />
                </button>
              </div>

              {/* Safety Setting */}
              <div className="safety-checkbox-wrapper">
                <button
                  type="button"
                  className="safety-checkbox-btn"
                  onClick={() => setHumanRequiredForCritical((v) => !v)}
                  role="checkbox"
                  aria-checked={humanRequiredForCritical}
                >
                  <span className={`safety-checkbox-box ${humanRequiredForCritical ? "checked" : ""}`}>
                    {humanRequiredForCritical && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span className="safety-checkbox-text">
                    Always involve a human for critical, security, or physical issues.
                  </span>
                </button>
              </div>

              <div className="onboarding-actions">
                <button type="button" className="onboarding-secondary-btn" onClick={handleBack}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button type="button" className="onboarding-primary-btn" onClick={handleContinue}>
                  Finish Setup <ArrowRight size={16} />
                </button>
              </div>
            </motion.section>
          )}

          {/* ============================= CONFIGURING SEQUENCE ============================= */}
          {phase === "configuring" && (
            <motion.div
              key="configuring"
              className="configuring-screen-wrap"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="configuring-spinner-wrap">
                <Loader2 size={38} className="spin configuring-loader" />
              </div>
              <div className="configuring-message-box">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={configMsgIndex}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="configuring-message-text"
                  >
                    {CONFIG_MESSAGES[configMsgIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ============================= READY SCREEN ============================= */}
          {phase === "ready" && (
            <motion.div
              key="ready"
              className="ready-screen-wrap"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="ready-success-icon-box">
                <CheckCircle2 size={44} className="ready-icon" />
              </div>

              <div className="ready-title-group">
                <h1 className="ready-heading">TRIAGO IS READY</h1>
                <p className="ready-subtitle">Your AI teammate is configured.</p>
              </div>

              <div className="summary-compact-card">
                <div className="summary-row">
                  <span className="summary-key">Workspace</span>
                  <span className="summary-val">{workspace || "Acme Engineering"}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-key">Department</span>
                  <span className="summary-val">{department || "Engineering"}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-key">Role</span>
                  <span className="summary-val">{role || "Backend Engineer"}</span>
                </div>
                <div className="summary-row">
                  <span className="summary-key">Systems</span>
                  <span className="summary-val">{selectedSystems.length} selected</span>
                </div>
                <div className="summary-row">
                  <span className="summary-key">AI Mode</span>
                  <span className="summary-val">
                    {autonomyMode === "autonomous"
                      ? "Let TRIAGO handle safe issues"
                      : autonomyMode === "approval"
                      ? "Ask before acting"
                      : "Keep me in control"}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-key">Safety</span>
                  <span className="summary-val">
                    {humanRequiredForCritical ? "Human approval for critical issues" : "Standard routing"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="onboarding-primary-btn ready-enter-btn"
                onClick={() => navigate("/dashboard")}
              >
                Enter Dashboard <ArrowRight size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}