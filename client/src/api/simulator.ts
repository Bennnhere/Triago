/* Triago simulator service: fetches backend scenarios and submits their actual alert payloads to the agent. */
import { request } from "./client";
import type { AgentTraceEvent, AlertPayload, SimulatorScenario } from "./types";

export async function getSimulatorScenarios(): Promise<SimulatorScenario[]> {
  return (await request<{ scenarios: SimulatorScenario[] }>("/api/scenarios")).scenarios;
}

export async function submitAlert(alert: AlertPayload): Promise<{ incident: { incident_id: number }; outcome: string; confidence: number; trace: AgentTraceEvent[] }> {
  return request("/alerts", { method: "POST", body: JSON.stringify(alert) });
}
