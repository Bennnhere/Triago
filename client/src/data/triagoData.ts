/* Triago design system data: operational, evidence-led, and explicitly demo-oriented rather than a live production claim. */
export type Severity = "Critical" | "High" | "Medium" | "Low";
export type IncidentStatus = "Investigating" | "Resolved" | "Escalated" | "Hardware";

export type TimelineEvent = {
  time: string;
  kind: "Alert" | "Correlation" | "Tool" | "Result" | "Decision" | "Notify" | "Resolved";
  title: string;
  detail: string;
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
  hardware?: boolean;
  issue: string;
  rootCause: string;
  remediation: string;
  verification: string;
  resolutionTime: string;
  timeline: TimelineEvent[];
};

export const incidents: Incident[] = [
  {
    id: 1042,
    title: "Checkout Service Degradation",
    service: "Checkout Service",
    severity: "Critical",
    status: "Investigating",
    alerts: 47,
    age: "8 minutes ago",
    owner: "Rahul Mehta",
    team: "Checkout",
    issue: "Elevated checkout 500s after a new connection-pool configuration rollout.",
    rootCause: "Connection pool saturation following deployment v2.4.1.",
    remediation: "Rollback v2.4.1 to the known-good checkout configuration.",
    verification: "Health checks are running; error rate is declining.",
    resolutionTime: "In progress",
    timeline: [
      { time: "09:42:11", kind: "Alert", title: "Alert received", detail: "47 related checkout alerts arrived within the correlation window." },
      { time: "09:42:13", kind: "Correlation", title: "Alerts correlated", detail: "Grouped into Incident #1042 using service, symptom, and time-window evidence." },
      { time: "09:42:16", kind: "Tool", title: "Logs tool", detail: "Querying checkout-service logs for request failures and pool pressure." },
      { time: "09:42:18", kind: "Result", title: "Evidence found", detail: "Elevated 500 errors and exhausted database connections detected." },
      { time: "09:42:20", kind: "Tool", title: "Deployment tool", detail: "Checking recent checkout deployments and configuration changes." },
      { time: "09:42:21", kind: "Result", title: "Deployment identified", detail: "Version v2.4.1 was deployed shortly before the error spike." },
      { time: "09:42:23", kind: "Tool", title: "Incident memory", detail: "Searching historical incidents for a similar deployment-related pattern." },
      { time: "09:42:24", kind: "Result", title: "Memory match found", detail: "94% similarity to a prior pool-exhaustion incident resolved by rollback." },
      { time: "09:42:27", kind: "Decision", title: "Decision: apply rollback", detail: "Reason: a high-confidence historical resolution and deployment evidence support a safe rollback." },
      { time: "09:42:31", kind: "Tool", title: "Health check", detail: "Verifying service recovery after the remediation." },
    ],
  },
  {
    id: 1043,
    title: "Database Server DB-03 Thermal Alert",
    service: "Database Server DB-03",
    severity: "Critical",
    status: "Hardware",
    alerts: 6,
    age: "14 minutes ago",
    owner: "Vikram Shah",
    team: "Infrastructure",
    hardware: true,
    issue: "Abnormal temperature and cooling-fan failure telemetry on DB-03.",
    rootCause: "Hardware cooling fault; physical inspection required.",
    remediation: "Automated remediation not attempted.",
    verification: "Infrastructure Team acknowledged the escalation.",
    resolutionTime: "Awaiting physical intervention",
    timeline: [
      { time: "09:36:04", kind: "Alert", title: "Hardware telemetry received", detail: "Temperature and fan-speed threshold alerts received from DB-03." },
      { time: "09:36:08", kind: "Correlation", title: "Hardware incident classified", detail: "Six thermal and cooling alerts were grouped into a single hardware incident." },
      { time: "09:36:12", kind: "Tool", title: "Service health", detail: "Checking database replicas and transaction failover readiness." },
      { time: "09:36:16", kind: "Decision", title: "Decision: do not remediate", detail: "Reason: physical hardware intervention is required; automation could increase risk." },
      { time: "09:36:18", kind: "Notify", title: "Infrastructure Team notified", detail: "Vikram Shah received the thermal summary, affected host, and escalation priority." },
    ],
  },
  {
    id: 1038,
    title: "Auth Token Validation Latency",
    service: "Auth Service",
    severity: "High",
    status: "Escalated",
    alerts: 19,
    age: "31 minutes ago",
    owner: "Ananya Rao",
    team: "Platform",
    issue: "OIDC validation latency increased without a matching historical remediation.",
    rootCause: "Novel upstream authentication dependency behavior under investigation.",
    remediation: "No automatic remediation performed.",
    verification: "Context package sent to the responsible engineer.",
    resolutionTime: "Escalated after 6 minutes",
    timeline: [
      { time: "09:10:01", kind: "Alert", title: "Alert received", detail: "Latency threshold exceeded for token validation." },
      { time: "09:10:04", kind: "Tool", title: "Logs tool", detail: "Querying validation request spans and upstream response times." },
      { time: "09:10:09", kind: "Result", title: "Evidence found", detail: "Latency originates in an external identity provider path." },
      { time: "09:10:13", kind: "Decision", title: "Decision: safe escalation", detail: "Reason: no safe, high-confidence historical remediation was found." },
      { time: "09:10:16", kind: "Notify", title: "Engineer notified", detail: "Ananya received an investigation summary, evidence, and recommended next step." },
    ],
  },
];

export const memoryRecords = [
  { id: 887, title: "Checkout API Failure", service: "Checkout Service", rootCause: "Deployment v2.4.1 connection-pool configuration", resolution: "Rollback → v2.4.0", age: "14 days ago", similarity: 94, severity: "Critical" as Severity },
  { id: 861, title: "Payment Authorization Queueing", service: "Payments", rootCause: "Auth dependency retry exhaustion", resolution: "Increase retry backoff and restart worker", age: "26 days ago", similarity: 82, severity: "High" as Severity },
  { id: 844, title: "Notification Worker Timeout", service: "Notifications", rootCause: "Expired provider credential", resolution: "Rotate provider credential", age: "41 days ago", similarity: 71, severity: "Medium" as Severity },
  { id: 799, title: "Inventory Cache Drift", service: "Inventory", rootCause: "Consumer offset mismatch", resolution: "Replay consumer partition", age: "62 days ago", similarity: 66, severity: "Medium" as Severity },
];

export const engineers = [
  { name: "Rahul Mehta", initials: "RM", ownership: "Checkout Service", status: "Available", color: "teal" },
  { name: "Ananya Rao", initials: "AR", ownership: "Payments & Auth", status: "Available", color: "violet" },
  { name: "Vikram Shah", initials: "VS", ownership: "Infrastructure", status: "On call", color: "amber" },
  { name: "Sai Iyer", initials: "SI", ownership: "Database", status: "Available", color: "blue" },
];

export const notifications = [
  { id: 1, type: "resolved", title: "Triago resolved Checkout Service Incident #1042", body: "Deployment history checked. Known remediation applied. Service health verification is in progress. Rahul Mehta notified.", time: "Just now", target: "Rahul Mehta" },
  { id: 2, type: "hardware", title: "Hardware Incident Detected", body: "Server DB-03: overheating and cooling failure. Automated remediation not attempted. Infrastructure Team notified.", time: "14 min ago", target: "Infrastructure Team" },
  { id: 3, type: "escalated", title: "Auth Service investigation escalated", body: "Triago completed evidence collection and routed the incident context to Ananya Rao.", time: "31 min ago", target: "Ananya Rao" },
];

export const simScenarios = [
  { id: "checkout", title: "Checkout Deployment Failure", description: "Known deployment regression; safe rollback available.", outcome: "Auto-resolved", tone: "resolved" },
  { id: "latency", title: "Database Latency Spike", description: "Dependency investigation and controlled mitigation.", outcome: "Investigate", tone: "investigating" },
  { id: "hardware", title: "Server Hardware Failure", description: "Hardware classification; infrastructure team is notified.", outcome: "Escalate", tone: "hardware" },
  { id: "unknown", title: "Unknown Service Failure", description: "Novel incident; evidence package escalated safely.", outcome: "Escalate", tone: "escalated" },
];
