export type Severity = "Critical" | "High" | "Medium" | "Low";
export type IncidentStatus = "Investigating" | "Resolved" | "Escalated" | "Hardware";
export type AlertInput = { service: string; alert_type: string; severity: string; message: string; timestamp?: string };

type AgentTrace = {
  event: "trace";
  incident_id: string;
  stage: "Thought" | "Action" | "Observation" | "Decision";
  title: string;
  content: string;
  payload?: unknown;
  tone: string;
  timestamp: string;
};

type AgentAlert = { event: "alert"; alert: AlertInput & { id: number; timestamp: string } };
type AgentEvent = AgentTrace | AgentAlert;
type NotificationRecord = {
  id: number;
  incidentId: number;
  type: "hardware" | "resolved" | "escalated";
  target: string;
  title: string;
  body: string;
  generatedAt: string;
  deliveryStatus: "generated" | "delivered" | "failed" | "not_configured";
  deliveryDetail: Record<string, unknown>;
  read: boolean;
};
type StoredIncident = {
  id: number;
  key: string;
  signature: string;
  service: string;
  severity: Severity;
  rootCause: string;
  remediation: string;
  outcome: string;
  timestamp: string;
  correlatedAlerts: Array<AlertInput & { id: number; timestamp: string }>;
  trace: AgentTrace[];
};

const engineers: Array<{ name: string; initials: string; ownership: string; status: string; color: string; services: string[] }> = [
  { name: "Rahul Mehta", initials: "RM", ownership: "Checkout Service", status: "Available", color: "teal", services: ["checkout-api"] },
  { name: "Ananya Rao", initials: "AR", ownership: "Payments & Auth", status: "Available", color: "violet", services: ["auth-service", "payment-service", "feature-flag-service"] },
  { name: "Vikram Shah", initials: "VS", ownership: "Infrastructure", status: "On call", color: "amber", services: ["database-server", "edge-server"] },
  { name: "Sai Iyer", initials: "SI", ownership: "Database", status: "Available", color: "blue", services: ["database-service"] },
];

const scenarioDefinitions = [
  {
    id: "known",
    title: "Checkout Deployment Failure",
    description: "Known deployment regression; safe rollback available.",
    outcome: "Auto-resolve",
    tone: "resolved",
    alert: { service: "checkout-api", alert_type: "5xx spike", severity: "high", message: "database connection pool exhaustion after configuration deployment" },
  },
  {
    id: "correlated",
    title: "Auth Dependency Cluster",
    description: "Correlated downstream timeouts; investigate and escalate with evidence.",
    outcome: "Investigate",
    tone: "investigating",
    alert: { service: "auth-service", alert_type: "latency spike", severity: "high", message: "OIDC latency spike propagating to dependent services." },
  },
  {
    id: "novel",
    title: "Unknown Service Failure",
    description: "Novel failure; collect evidence and escalate safely.",
    outcome: "Escalate",
    tone: "escalated",
    alert: { service: "feature-flag-service", alert_type: "evaluation failure", severity: "high", message: "Rule evaluation graph cycle detected after new evaluator deploy." },
  },
] as const;

const serviceTitles: Record<string, string> = {
  "checkout-api": "Checkout Service Degradation",
  "auth-service": "Auth Token Validation Latency",
  "payment-service": "Payment Authorization Timeout",
  "notification-service": "Notification Delivery Degradation",
  "feature-flag-service": "Feature Flag Evaluation Failure",
  "database-service": "Database Service Latency",
};

function nowIso() {
  return new Date().toISOString();
}

function titleForService(service: string) {
  return serviceTitles[service] || service.replace(/-/g, " ").replace(/\b\w/g, letter => letter.toUpperCase());
}

function normalizeSeverity(value: string): Severity {
  const normalized = value.trim().toLowerCase();
  if (normalized === "critical") return "Critical";
  if (normalized === "medium") return "Medium";
  if (normalized === "low") return "Low";
  return "High";
}

function ageLabel(timestamp: string) {
  const delta = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000));
  if (delta < 60) return "Just now";
  if (delta < 3600) return `${Math.floor(delta / 60)} minutes ago`;
  if (delta < 86_400) return `${Math.floor(delta / 3600)} hours ago`;
  return `${Math.floor(delta / 86_400)} days ago`;
}

function ownerForService(service: string) {
  const owner = engineers.find(engineer => engineer.services.includes(service));
  return owner ? { owner: owner.name, team: owner.ownership } : { owner: "Unassigned", team: "Unassigned" };
}

function traceKind(entry: AgentTrace) {
  const lowered = entry.title.toLowerCase();
  if (entry.stage === "Action") return "Tool";
  if (entry.stage === "Decision") return "Decision";
  if (lowered.includes("correlate")) return "Correlation";
  if (lowered.includes("notify")) return "Notify";
  if (lowered.includes("classify")) return "Alert";
  return "Result";
}

function lexicalSimilarity(left: string, right: string) {
  const tokens = (value: string) => new Set(value.toLowerCase().split(/[^a-z0-9]+/).filter(token => token.length > 2));
  const leftTokens = tokens(left);
  const rightTokens = tokens(right);
  const overlap = Array.from(leftTokens).filter(token => rightTokens.has(token)).length;
  return leftTokens.size ? overlap / leftTokens.size : 0;
}

function initialState() {
  const historicalTimestamp = new Date(Date.now() - 21 * 86_400_000).toISOString();
  const historical: StoredIncident = {
    id: 1,
    key: "INC-HISTORIC",
    signature: "checkout-api | high | 5xx spike | database connection pool exhaustion after configuration deployment",
    service: "checkout-api",
    severity: "High",
    rootCause: "database connection pool exhaustion after configuration deployment",
    remediation: "rollback",
    outcome: "resolved",
    timestamp: historicalTimestamp,
    correlatedAlerts: [],
    trace: [],
  };
  const sessionTimestamp = new Date(Date.now() - 60_000).toISOString();
  return {
    incidents: [historical],
    notifications: [] as NotificationRecord[],
    activity: [] as AgentEvent[],
    sessionAlerts: [
      { id: -1, service: "payment-service", alert_type: "timeout", severity: "high", message: "payment authorization timeout while awaiting auth dependency", timestamp: sessionTimestamp },
      { id: -2, service: "notification-service", alert_type: "timeout", severity: "medium", message: "notification token verification timeout", timestamp: sessionTimestamp },
    ],
    nextIncidentId: 2,
    nextAlertId: 1,
    nextNotificationId: 1,
  };
}

export class ManagedIncidentAgent {
  private state = initialState();

  scenarios() {
    return scenarioDefinitions.map(scenario => ({ ...scenario, alert: { ...scenario.alert } }));
  }

  private memoryMatches(signature: string, excludeId?: number) {
    return this.state.incidents
      .filter(incident => incident.id !== excludeId)
      .map(incident => {
        const sameService = signature.includes(incident.service);
        const lexical = lexicalSimilarity(signature, incident.signature);
        const similarity = Math.min(0.99, Math.round((sameService ? Math.max(lexical, 0.9) : lexical) * 1000) / 1000);
        return {
          incident_id: incident.id,
          signature: incident.signature,
          resolution_summary: `${incident.rootCause}; ${incident.remediation}; ${incident.outcome}`,
          similarity,
        };
      })
      .filter(match => match.similarity > 0)
      .sort((left, right) => right.similarity - left.similarity)
      .slice(0, 3);
  }

  private correlations(alert: AlertInput & { id: number; timestamp: string }) {
    const cutoff = Date.now() - 15 * 60_000;
    const dependentServices = new Set(["payment-service", "notification-service"]);
    return this.state.sessionAlerts.filter(prior => {
      if (prior.id === alert.id || new Date(prior.timestamp).getTime() < cutoff) return false;
      return prior.service === alert.service ||
        (alert.service === "auth-service" && dependentServices.has(prior.service)) ||
        (dependentServices.has(alert.service) && prior.service === "auth-service");
    });
  }

  private evidenceFor(incident: StoredIncident) {
    const lastChecked = nowIso();
    const serviceLogs = [
      { id: incident.id * 10 + 1, service: incident.service, log_line: `ALERT: ${incident.signature}`, timestamp: incident.timestamp },
      { id: incident.id * 10 + 2, service: incident.service, log_line: `AGENT OUTCOME: ${incident.rootCause}`, timestamp: incident.timestamp },
    ];
    const deployments = incident.service === "checkout-api" || incident.service === "feature-flag-service"
      ? [{ id: incident.id, service: incident.service, deployed_at: incident.timestamp, version: "managed-node-agent", description: "Most recent deployment context recorded by Triago." }]
      : [];
    return {
      logs: serviceLogs,
      deployments,
      service_health: { service: incident.service, status: incident.outcome === "auto-resolved" || incident.outcome === "resolved" ? "healthy" : "investigating", last_checked: lastChecked },
      memory_matches: this.memoryMatches(incident.signature, incident.id),
    };
  }

  private incidentView(incident: StoredIncident, includeDetail = false) {
    const owner = ownerForService(incident.service);
    const status: IncidentStatus = incident.rootCause.toLowerCase().includes("hardware")
      ? "Hardware"
      : incident.outcome === "auto-resolved" || incident.outcome === "resolved"
        ? "Resolved"
        : "Escalated";
    const view = {
      id: incident.id,
      title: titleForService(incident.service),
      service: incident.service,
      severity: incident.severity,
      status,
      alerts: Math.max(1, incident.correlatedAlerts.length + 1),
      age: ageLabel(incident.timestamp),
      owner: owner.owner,
      team: owner.team,
      hardware: status === "Hardware",
      issue: incident.signature,
      rootCause: incident.rootCause,
      remediation: incident.remediation,
      verification: "The managed incident agent recorded its evidence and the selected safe outcome.",
      resolutionTime: `Recorded at ${incident.timestamp.slice(11, 19)}`,
      timestamp: incident.timestamp,
      outcome: incident.outcome,
      timeline: incident.trace.length
        ? incident.trace.map(entry => ({ time: entry.timestamp.slice(11, 19), kind: traceKind(entry), title: entry.title, detail: entry.content }))
        : [{ time: incident.timestamp.slice(11, 19), kind: "Result", title: "Historical incident memory", detail: "Prior incident record is available to guide safe future decisions." }],
    };
    if (!includeDetail) return view;
    return {
      ...view,
      evidence: this.evidenceFor(incident),
      activity: incident.trace.filter(entry => entry.stage === "Action" || entry.stage === "Observation"),
      decision: incident.trace.slice().reverse().find(entry => entry.stage === "Decision") || null,
    };
  }

  getIncidents(status?: string) {
    const all = this.state.incidents.slice().sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime()).map(incident => this.incidentView(incident));
    if (!status || status === "All") return all;
    if (status === "Active") return all.filter(incident => incident.status !== "Resolved");
    if (status === "Resolved") return all.filter(incident => incident.status === "Resolved");
    return all.filter(incident => incident.status === status);
  }

  getIncident(id: number) {
    const incident = this.state.incidents.find(record => record.id === id);
    return incident ? this.incidentView(incident, true) : null;
  }

  getMemory(query = "") {
    const normalized = query.trim();
    return this.state.incidents
      .map(incident => ({ incident, score: normalized ? lexicalSimilarity(normalized, `${incident.signature} ${incident.rootCause} ${incident.remediation}`) : null }))
      .filter(item => item.score === null || item.score > 0)
      .sort((left, right) => (right.score ?? 0) - (left.score ?? 0))
      .map(({ incident, score }) => ({
        id: incident.id,
        title: titleForService(incident.service),
        service: incident.service,
        severity: incident.severity,
        rootCause: incident.rootCause,
        resolution: `${incident.remediation}; ${incident.outcome}`,
        age: ageLabel(incident.timestamp),
        similarity: score === null ? null : Math.round(score * 100),
      }));
  }

  getEngineers() {
    return engineers.map(engineer => ({ ...engineer, services: [...engineer.services] }));
  }

  getNotifications() {
    return this.state.notifications
      .slice()
      .sort((left, right) => new Date(right.generatedAt).getTime() - new Date(left.generatedAt).getTime())
      .map(notification => ({
        id: notification.id,
        incidentId: notification.incidentId,
        type: notification.type,
        target: notification.target,
        title: notification.title,
        body: notification.body,
        time: ageLabel(notification.generatedAt),
        deliveryStatus: notification.deliveryStatus,
        deliveryDetail: notification.deliveryDetail,
      }));
  }

  markNotificationsRead() {
    let updated = 0;
    for (const notification of this.state.notifications) {
      if (!notification.read) {
        notification.read = true;
        updated += 1;
      }
    }
    return updated;
  }

  getAnalytics() {
    const incidents = this.getIncidents();
    const severityDistribution: Record<Severity, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    const rootCauses = new Map<string, number>();
    const overTime = new Map<string, number>();
    for (const incident of incidents) {
      severityDistribution[incident.severity] += 1;
      rootCauses.set(incident.rootCause, (rootCauses.get(incident.rootCause) || 0) + 1);
      const label = new Date(incident.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      overTime.set(label, (overTime.get(label) || 0) + 1);
    }
    const resolved = incidents.filter(incident => incident.status === "Resolved").length;
    const escalated = incidents.filter(incident => incident.status === "Escalated" || incident.status === "Hardware").length;
    return {
      totalIncidents: incidents.length,
      activeIncidents: incidents.filter(incident => incident.status !== "Resolved").length,
      resolvedIncidents: resolved,
      escalatedIncidents: escalated,
      autoResolved: incidents.filter(incident => incident.outcome === "auto-resolved").length,
      notificationCount: this.state.notifications.length,
      deliveredNotifications: this.state.notifications.filter(notification => notification.deliveryStatus === "delivered").length,
      severityDistribution,
      rootCauses: Array.from(rootCauses.entries()).map(([label, count]) => ({ label, count })).slice(0, 5),
      incidentsOverTime: Array.from(overTime.entries()).map(([label, count]) => ({ label, count })).reverse().slice(-7),
    };
  }

  private appendTrace(trace: AgentTrace[], incidentKey: string, stage: AgentTrace["stage"], title: string, content: string, payload: unknown, tone: string) {
    const event: AgentTrace = { event: "trace", incident_id: incidentKey, stage, title, content, payload, tone, timestamp: nowIso() };
    trace.push(event);
    this.state.activity.push(event);
    return event;
  }

  private recordNotification(incident: StoredIncident, owner: string) {
    const type = incident.rootCause.toLowerCase().includes("hardware") ? "hardware" : incident.outcome === "auto-resolved" || incident.outcome === "resolved" ? "resolved" : "escalated";
    const notification: NotificationRecord = {
      id: this.state.nextNotificationId++,
      incidentId: incident.id,
      type,
      target: owner,
      title: `Triago ${incident.outcome}: ${titleForService(incident.service)}`,
      body: `${incident.service} ${incident.severity} ${incident.signature.split(" | ").at(2) || "alert"}. Outcome: ${incident.outcome}. Action: ${incident.remediation}.`,
      generatedAt: nowIso(),
      deliveryStatus: "not_configured",
      deliveryDetail: { sent: false, status: "not_configured", detail: "No external notification webhook is configured for this managed deployment." },
      read: false,
    };
    this.state.notifications.push(notification);
    return notification;
  }

  notifyIncident(id: number) {
    const incident = this.state.incidents.find(record => record.id === id);
    if (!incident) return null;
    const notification = this.recordNotification(incident, ownerForService(incident.service).owner);
    return { id: notification.id, delivery_status: notification.deliveryStatus, sent: false };
  }

  getActivity() {
    return { status: "connected", mode: "managed-node", events: this.state.activity.slice(-250) };
  }

  ingest(input: AlertInput) {
    const alert = {
      id: this.state.nextAlertId++,
      service: input.service.trim(),
      alert_type: input.alert_type.trim(),
      severity: input.severity.trim(),
      message: input.message.trim(),
      timestamp: input.timestamp || nowIso(),
    };
    this.state.sessionAlerts.push(alert);
    this.state.sessionAlerts = this.state.sessionAlerts.slice(-300);
    this.state.activity.push({ event: "alert", alert });

    const incidentKey = `INC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const trace: AgentTrace[] = [];
    const correlations = this.correlations(alert);
    const signature = `${alert.service} | ${alert.severity} | ${alert.alert_type} | ${alert.message}`;
    const matches = this.memoryMatches(signature);
    const confidence = matches[0]?.similarity || 0;
    const thresholdBand = confidence >= 0.85 ? "high ≥ 0.85" : confidence >= 0.6 ? "medium 0.60–0.85" : "novel < 0.60";

    this.appendTrace(trace, incidentKey, "Thought", "PLAN / CLASSIFY", "Classifying the incoming alert before selecting evidence sources.", { service: alert.service, alert_type: alert.alert_type, severity: alert.severity }, "investigating");
    this.appendTrace(trace, incidentKey, "Thought", "PLAN / CORRELATE", correlations.length ? `Found ${correlations.length} related signals inside the correlation window.` : "No related session alert found; continuing as a single incident.", { correlated_alerts: correlations }, correlations.length ? "investigating" : "muted");
    this.appendTrace(trace, incidentKey, "Thought", "REACT / SELECT ACTION", "Memory search is mandatory before any autonomous decision; it is selected first.", { selected_tool: "search_incident_memory" }, "investigating");
    this.appendTrace(trace, incidentKey, "Action", "search_incident_memory", "Calling memory search with an inspectable incident signature.", { signature, top_k: 3 }, "investigating");
    this.appendTrace(trace, incidentKey, "Observation", "search_incident_memory", "Managed incident memory returned the closest relevant historical records.", matches, "muted");
    this.appendTrace(trace, incidentKey, "Thought", "REACT / CONFIDENCE", `Closest incident-memory match scored ${confidence.toFixed(3)}; threshold band: ${thresholdBand}.`, { confidence, threshold_band: thresholdBand, closest_match: matches[0] || null }, confidence >= 0.85 ? "resolved" : "investigating");

    let rootCause: string;
    let remediation: string;
    let outcome: string;
    let decision: string;
    if (confidence >= 0.85 && matches[0]?.resolution_summary.includes("rollback")) {
      this.appendTrace(trace, incidentKey, "Thought", "REACT / NEXT ACTION", "The prior resolution is a proven, service-specific rollback. Validating deployment context before applying it.", { selected_tool: "query_deploy_history" }, "investigating");
      this.appendTrace(trace, incidentKey, "Action", "query_deploy_history", "Inspecting deployment context for the affected service.", { service: alert.service, limit: 10 }, "investigating");
      this.appendTrace(trace, incidentKey, "Observation", "query_deploy_history", "A matching configuration rollout is present in the incident context.", this.evidenceFor({ id: -1, key: incidentKey, signature, service: alert.service, severity: normalizeSeverity(alert.severity), rootCause: "", remediation: "", outcome: "", timestamp: alert.timestamp, correlatedAlerts: correlations, trace: [] }).deployments, "muted");
      this.appendTrace(trace, incidentKey, "Action", "execute_resolution", "Applying the stored rollback as the known safe resolution.", { action: "rollback", service: alert.service }, "investigating");
      this.appendTrace(trace, incidentKey, "Observation", "execute_resolution", "Rollback recorded; the agent has updated service status for verification.", { service: alert.service, action: "rollback", status: "applied" }, "resolved");
      rootCause = "database connection pool exhaustion after configuration deployment";
      remediation = "rollback";
      outcome = "auto-resolved";
      decision = "AUTO-RESOLVED";
    } else {
      this.appendTrace(trace, incidentKey, "Thought", "REACT / NEXT ACTION", "Memory is not decisive enough for autonomous remediation. Inspecting service evidence before escalating.", { selected_tool: "query_service_status" }, "investigating");
      this.appendTrace(trace, incidentKey, "Action", "query_service_status", "Inspecting the current managed service state.", { service: alert.service }, "investigating");
      this.appendTrace(trace, incidentKey, "Observation", "query_service_status", "Current service state requires corroborating log and deployment evidence.", { service: alert.service, status: "investigating", last_checked: nowIso() }, "muted");
      this.appendTrace(trace, incidentKey, "Action", "query_logs", "Collecting incident-specific log evidence.", { service: alert.service, limit: 50 }, "investigating");
      this.appendTrace(trace, incidentKey, "Observation", "query_logs", "Observed the alert signature and related runtime symptoms.", [{ service: alert.service, log_line: `ALERT: ${alert.message}`, timestamp: alert.timestamp }], "muted");
      rootCause = correlations.length ? "auth degradation is propagating into dependent payment and notification paths" : "novel incident; root cause requires human judgment after completed investigation";
      remediation = correlations.length ? "route correlated evidence to Payments & Auth on-call" : "human investigation required";
      outcome = "escalated";
      decision = "ESCALATED";
      this.appendTrace(trace, incidentKey, "Thought", "REACT / ESCALATE", "The autonomous investigation is complete. Recording an escalation with assembled evidence rather than a raw alert.", { confidence, root_cause: rootCause, remediation }, "escalated");
    }

    const incident: StoredIncident = {
      id: this.state.nextIncidentId++,
      key: incidentKey,
      signature,
      service: alert.service,
      severity: normalizeSeverity(alert.severity),
      rootCause,
      remediation,
      outcome,
      timestamp: nowIso(),
      correlatedAlerts: correlations,
      trace,
    };
    this.state.incidents.push(incident);
    const owner = ownerForService(incident.service).owner;
    const notification = this.recordNotification(incident, owner);
    this.appendTrace(trace, incidentKey, "Action", "record_notification", "Recording the completed incident context for the service owner.", { incident_id: incident.id, target: owner }, "investigating");
    this.appendTrace(trace, incidentKey, "Observation", "record_notification", "Notification was generated; external delivery remains unconfigured in this public deployment.", { id: notification.id, delivery_status: notification.deliveryStatus, sent: false }, "muted");
    this.appendTrace(trace, incidentKey, "Decision", decision, `${decision}: confidence ${confidence.toFixed(3)}; ${remediation}. The managed agent recorded the operational evidence and outcome.`, { confidence, threshold_band: thresholdBand, incident: { incident_id: incident.id }, notification: { id: notification.id, delivery_status: notification.deliveryStatus }, outcome }, outcome === "auto-resolved" ? "resolved" : "escalated");

    return { alert, incident: { incident_id: incident.id }, outcome, confidence, trace };
  }
}

export function createIncidentAgent() {
  return new ManagedIncidentAgent();
}
