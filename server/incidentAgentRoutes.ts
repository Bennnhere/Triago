import type { Express, Request, Response } from "express";
import { createIncidentAgent, type AlertInput } from "./incidentAgent";

function alertFromRequest(req: Request): AlertInput | null {
  const body = req.body as Partial<AlertInput> | undefined;
  if (!body || typeof body.service !== "string" || typeof body.alert_type !== "string" || typeof body.severity !== "string" || typeof body.message !== "string") return null;
  if (![body.service, body.alert_type, body.severity, body.message].every(value => value.trim())) return null;
  return { service: body.service, alert_type: body.alert_type, severity: body.severity, message: body.message, timestamp: typeof body.timestamp === "string" ? body.timestamp : undefined };
}

function numericId(res: Response, value: string) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ detail: "A positive incident id is required." });
    return null;
  }
  return id;
}

export function registerIncidentAgentRoutes(app: Express) {
  const agent = createIncidentAgent();

  app.get("/api/agent/health", (_req, res) => {
    res.json({ status: "connected", mode: "managed-node", message: "Triago's same-origin managed incident agent is available." });
  });
  app.get("/api/agent/activity", (_req, res) => res.json(agent.getActivity()));
  app.get("/api/incidents", (req, res) => res.json({ incidents: agent.getIncidents(typeof req.query.status === "string" ? req.query.status : undefined) }));
  app.get("/api/incidents/:id", (req, res) => {
    const id = numericId(res, req.params.id);
    if (!id) return;
    const incident = agent.getIncident(id);
    if (!incident) return res.status(404).json({ detail: "Incident not found." });
    res.json({ incident });
  });
  app.post("/api/incidents/:id/notify", (req, res) => {
    const id = numericId(res, req.params.id);
    if (!id) return;
    const notification = agent.notifyIncident(id);
    if (!notification) return res.status(404).json({ detail: "Incident not found." });
    res.json({ notification });
  });
  app.get("/api/memory", (req, res) => res.json({ records: agent.getMemory(typeof req.query.query === "string" ? req.query.query : "") }));
  app.get("/api/engineers", (_req, res) => res.json({ engineers: agent.getEngineers() }));
  app.get("/api/notifications", (_req, res) => res.json({ notifications: agent.getNotifications() }));
  app.post("/api/notifications/mark-read", (_req, res) => res.json({ updated: agent.markNotificationsRead() }));
  app.get("/api/analytics", (_req, res) => res.json(agent.getAnalytics()));
  app.get("/api/scenarios", (_req, res) => res.json({ scenarios: agent.scenarios() }));
  app.post("/alerts", (req, res) => {
    const alert = alertFromRequest(req);
    if (!alert) return res.status(400).json({ detail: "service, alert_type, severity, and message are required." });
    res.status(201).json(agent.ingest(alert));
  });
}

