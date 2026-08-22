/* Triago API contracts: persistent FastAPI data is the command center's operational source of truth. */

export type Severity = "Critical" | "High" | "Medium" | "Low";
export type IncidentStatus = "Investigating" | "Resolved" | "Escalated" | "Hardware";
export type TimelineKind = "Alert" | "Correlation" | "Tool" | "Result" | "Decision" | "Notify" | "Resolved";

export type TimelineEvent = { time: string; kind: TimelineKind; title: string; detail: string };
export type ToolEvent = { stage: "Action" | "Observation"; title: string; content: string; payload?: unknown; timestamp?: string };
export type MemoryMatch = { incident_id: number; signature: string; resolution_summary: string; similarity: number };

export type IncidentEvidence = {
  logs: { id: number; service: string; log_line: string; timestamp: string }[];
  deployments: { id: number; service: string; deployed_at: string; version: string; description: string }[];
  service_health: { service: string; status: string; last_checked: string };
  memory_matches: MemoryMatch[];
};

export type Incident = {
  id: number;
  title: string;
  service: string;
  severity: Severity;
  status: IncidentStatus;
  alerts: number;
  age: string;
  owner: string;
  team: string;
  hardware: boolean;
  issue: string;
  rootCause: string;
  remediation: string;
  verification: string;
  resolutionTime: string;
  timestamp: string;
  outcome: string;
  timeline: TimelineEvent[];
  evidence?: IncidentEvidence;
  activity?: ToolEvent[];
  decision?: { title: string; content: string; payload?: unknown; timestamp?: string } | null;
};

export type MemoryRecord = { id: number; title: string; service: string; severity: Severity; rootCause: string; resolution: string; age: string; similarity: number | null };
export type Engineer = { name: string; initials: string; ownership: string; status: string; color: string; services: string[] };
export type Notification = { id: number; incidentId: number; type: "hardware" | "resolved" | "escalated"; target: string; title: string; body: string; time: string; deliveryStatus: "generated" | "delivered" | "failed" | "not_configured"; deliveryDetail: Record<string, unknown> };
export type Analytics = { totalIncidents: number; activeIncidents: number; resolvedIncidents: number; escalatedIncidents: number; autoResolved: number; notificationCount: number; deliveredNotifications: number; severityDistribution: Record<Severity, number>; rootCauses: { label: string; count: number }[]; incidentsOverTime: { label: string; count: number }[] };
export type AlertPayload = { service: string; alert_type: string; severity: string; message: string; timestamp?: string };
export type SimulatorScenario = { id: string; title: string; description: string; outcome: string; tone: string; alert: AlertPayload };
export type AgentTraceEvent = { event: "trace"; incident_id: string; stage: "Thought" | "Action" | "Observation" | "Decision"; title: string; content: string; payload?: unknown; tone: string; timestamp: string };
export type AgentAlertEvent = { event: "alert"; alert: AlertPayload & { id: number } };
export type AgentSystemEvent = { event: "system"; status: string; message: string };
export type AgentEvent = AgentTraceEvent | AgentAlertEvent | AgentSystemEvent;
