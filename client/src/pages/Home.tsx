/* Signal Gate Design: bilateral command console; incoming noise on the left, calm inspectable agent evidence on the right. */
import { useCallback, useEffect, useRef, useState } from "react";
import { Activity, ArrowUpRight, CircleDot, Database, Radio, RotateCcw, ShieldCheck, Zap } from "lucide-react";

type Alert = {
  id: number;
  service: string;
  alert_type: string;
  severity: string;
  message: string;
  timestamp: string;
};

type Trace = {
  id: string;
  stage: "Thought" | "Action" | "Observation" | "Decision" | "System";
  title: string;
  content: string;
  payload?: unknown;
  tone?: "muted" | "investigating" | "resolved" | "escalated";
  timestamp: string;
};

type AppState = {
  alerts: Alert[];
  incidents: { id: number; service: string; outcome: string; resolution_action: string; timestamp: string }[];
  memory_entries: number;
  webhook_configured: boolean;
};

const seedAlerts: Alert[] = [
  { id: 1049, service: "checkout-api", alert_type: "5xx spike", severity: "high", message: "Database connection pool saturation detected", timestamp: new Date(Date.now() - 60000).toISOString() },
  { id: 1048, service: "payment-service", alert_type: "timeout", severity: "high", message: "Authorization requests waiting on auth dependency", timestamp: new Date(Date.now() - 110000).toISOString() },
  { id: 1047, service: "auth-service", alert_type: "latency spike", severity: "high", message: "OIDC token validation p99 exceeds threshold", timestamp: new Date(Date.now() - 145000).toISOString() },
  { id: 1046, service: "notification-service", alert_type: "timeout", severity: "medium", message: "Verification dependency timing out", timestamp: new Date(Date.now() - 190000).toISOString() },
];

const scenarios = [
  { key: "known", label: "Known regression", detail: "checkout-api · auto-resolve", tone: "resolved" },
  { key: "correlated", label: "Correlation cluster", detail: "auth → payment → notification", tone: "investigating" },
  { key: "novel", label: "Novel incident", detail: "feature-flag-service · escalate", tone: "escalated" },
] as const;

const API_ORIGIN = "https://8000-ijboktzdlpc5sz6xz8m1h-af013721.sg1.manus.computer";

function compactTime(timestamp: string) {
  return new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date(timestamp));
}

function stageTone(stage: Trace["stage"], tone?: Trace["tone"]) {
  if (tone) return tone;
  if (stage === "Decision") return "resolved";
  if (stage === "Action") return "investigating";
  return "muted";
}

function TraceEntry({ entry, index }: { entry: Trace; index: number }) {
  const tone = stageTone(entry.stage, entry.tone);
  return (
    <article className={`trace-entry trace-${tone}`}>
      <div className="trace-index">{String(index + 1).padStart(2, "0")}</div>
      <div className="trace-content">
        <div className="trace-meta">
          <span className="trace-stage">{entry.stage}</span>
          <span className="trace-time">{compactTime(entry.timestamp)}</span>
        </div>
        <h3>{entry.title}</h3>
        <p>{entry.content}</p>
        {entry.payload !== undefined && (
          <details>
            <summary>inspect evidence</summary>
            <pre>{JSON.stringify(entry.payload, null, 2)}</pre>
          </details>
        )}
      </div>
    </article>
  );
}

export default function Home() {
  const [alerts, setAlerts] = useState<Alert[]>(seedAlerts);
  const [trace, setTrace] = useState<Trace[]>([
    { id: "boot", stage: "System", title: "TRACE CHANNEL", content: "Awaiting the next autonomous incident cycle.", timestamp: new Date().toISOString(), tone: "muted" },
  ]);
  const [connected, setConnected] = useState(false);
  const [agentState, setAgentState] = useState<"IDLE" | "INVESTIGATING" | "AUTO-RESOLVED" | "ESCALATED">("IDLE");
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [memoryCount, setMemoryCount] = useState(0);
  const [webhookConfigured, setWebhookConfigured] = useState(false);
  const traceBottom = useRef<HTMLDivElement | null>(null);

  const appendTrace = useCallback((next: Omit<Trace, "id">) => {
    setTrace((current) => [...current.slice(-70), { ...next, id: `${Date.now()}-${current.length}` }]);
  }, []);

  useEffect(() => {
    fetch(`${API_ORIGIN}/state`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Agent service unavailable")))
      .then((state: AppState) => {
        if (state.alerts?.length) setAlerts(state.alerts);
        setMemoryCount(state.memory_entries);
        setWebhookConfigured(state.webhook_configured);
      })
      .catch(() => appendTrace({ stage: "System", title: "LOCAL SERVICE", content: "FastAPI agent is offline. Start the local agent to activate live execution.", timestamp: new Date().toISOString(), tone: "escalated" }));
  }, [appendTrace]);

  useEffect(() => {
    const socket = new WebSocket(`${API_ORIGIN.replace("https://", "wss://")}/ws/trace`);
    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onerror = () => setConnected(false);
    socket.onmessage = ({ data }) => {
      const event = JSON.parse(data) as { event: string; alert?: Alert; stage?: Trace["stage"]; title?: string; content?: string; payload?: unknown; tone?: Trace["tone"]; timestamp?: string; message?: string };
      if (event.event === "alert" && event.alert) {
        setAlerts((current) => [event.alert as Alert, ...current.filter((alert) => alert.id !== event.alert?.id)].slice(0, 45));
        setAgentState("INVESTIGATING");
      }
      if (event.event === "trace" && event.stage && event.title && event.content && event.timestamp) {
        appendTrace({ stage: event.stage, title: event.title, content: event.content, payload: event.payload, tone: event.tone, timestamp: event.timestamp });
        if (event.stage === "Decision") {
          setAgentState(event.tone === "resolved" ? "AUTO-RESOLVED" : "ESCALATED");
          setActiveScenario(null);
        }
      }
      if (event.event === "system") appendTrace({ stage: "System", title: "TRACE CHANNEL", content: event.message || "Connected", timestamp: new Date().toISOString(), tone: "muted" });
    };
    return () => socket.close();
  }, [appendTrace]);

  useEffect(() => {
    traceBottom.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [trace]);

  const runScenario = async (key: string) => {
    setActiveScenario(key);
    setAgentState("INVESTIGATING");
    try {
      const response = await fetch(`${API_ORIGIN}/demo/${key}`, { method: "POST" });
      if (!response.ok) throw new Error("Agent did not accept scenario");
      const result = await response.json();
      setMemoryCount((value) => Math.max(value, result.incident?.incident_id || value));
    } catch {
      appendTrace({ stage: "System", title: "INGESTION INTERRUPTED", content: "The scenario could not reach the FastAPI agent. Verify that the local service is running on port 8000.", timestamp: new Date().toISOString(), tone: "escalated" });
      setAgentState("ESCALATED");
      setActiveScenario(null);
    }
  };

  return (
    <main className="signal-gate-console">
      <div className="center-gate" aria-hidden="true" />
      <header className="console-header">
        <div className="brand-lockup">
          <span className="brand-mark">
            <img src="/manus-storage/alertify-mark_57c55314.png" alt="Alertify" onError={(event) => { event.currentTarget.style.display = "none"; event.currentTarget.nextElementSibling?.classList.add("is-visible"); }} />
            <span className="mark-fallback" aria-hidden="true"><i /><i /><i /></span>
          </span>
          <div>
            <span className="product-name">ALERTIFY</span>
            <span className="product-subtitle">AUTONOMOUS INCIDENT TRIAGE</span>
          </div>
        </div>
        <div className="header-readout">
          <span className={`connection ${connected ? "connection-live" : "connection-idle"}`}><Radio size={13} /> {connected ? "TRACE STREAM LIVE" : "LOCAL MODE"}</span>
          <span><Database size={13} /> MEMORY {memoryCount || "—"}</span>
          <span className={webhookConfigured ? "webhook-live" : "webhook-idle"}><ArrowUpRight size={13} /> {webhookConfigured ? "ESCALATION LINKED" : "WEBHOOK READY"}</span>
        </div>
      </header>

      <section className="signal-panel signal-in" aria-labelledby="signal-in-title">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">01 / RAW TELEMETRY</span>
            <h1 id="signal-in-title">Signal In</h1>
          </div>
          <div className="noise-meter"><span /> 2,000+/WK</div>
        </div>
        <p className="panel-summary">Unfiltered alerts enter here first. The agent never forwards this noise unchanged.</p>
        <div className="alert-stream" aria-live="polite">
          {alerts.map((alert) => (
            <article className="alert-row" key={alert.id}>
              <div className="alert-rail" />
              <div className="alert-core">
                <div className="alert-meta"><span>{compactTime(alert.timestamp)}</span><span>#{String(alert.id).padStart(4, "0")}</span><span className={`severity severity-${alert.severity.toLowerCase()}`}>{alert.severity}</span></div>
                <div className="alert-service">{alert.service}</div>
                <p>{alert.alert_type} — {alert.message}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="intake-footer"><Zap size={14} /> INTAKE ACTIVE · ALERTS ARE WRITTEN BEFORE AGENT REASONING BEGINS</div>
      </section>

      <section className="signal-panel reasoning" aria-labelledby="reasoning-title">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">02 / OBSERVABLE REACT LOOP</span>
            <h2 id="reasoning-title">Agent Reasoning</h2>
          </div>
          <div className={`agent-pill ${agentState.toLowerCase().replace("-", "")}`}><Activity size={14} /> {agentState}</div>
        </div>
        <p className="panel-summary">Thought → action → observation → decision. Each tool call and return is inspectable.</p>
        <div className="trace-stream" aria-live="polite">
          {trace.map((entry, index) => <TraceEntry entry={entry} index={index} key={entry.id} />)}
          <div ref={traceBottom} />
        </div>
      </section>

      <section className="scenario-deck" aria-label="Demo incident scenarios">
        <div className="scenario-intro"><ShieldCheck size={16} /><span>LIVE DEMO / INJECT AN ALERT</span></div>
        <div className="scenario-buttons">
          {scenarios.map((scenario) => (
            <button className={`scenario-button scenario-${scenario.tone}`} key={scenario.key} onClick={() => runScenario(scenario.key)} disabled={activeScenario !== null}>
              <span className="scenario-symbol"><CircleDot size={14} /></span>
              <span><strong>{activeScenario === scenario.key ? "PROCESSING…" : scenario.label}</strong><small>{scenario.detail}</small></span>
              <RotateCcw size={14} className="scenario-arrow" />
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
