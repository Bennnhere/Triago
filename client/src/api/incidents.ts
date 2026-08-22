/* Triago incidents service: reads persistent FastAPI/SQLite records for the existing incident UI. */
import { request } from "./client";
import type { Incident } from "./types";

export async function getIncidents(status?: string): Promise<Incident[]> {
  const suffix = status && status !== "All" ? `?status=${encodeURIComponent(status)}` : "";
  return (await request<{ incidents: Incident[] }>(`/api/incidents${suffix}`)).incidents;
}

export async function getIncident(id: number): Promise<Incident> {
  return (await request<{ incident: Incident }>(`/api/incidents/${id}`)).incident;
}

export async function notifyIncident(id: number): Promise<{ id: number; delivery_status: string; sent: boolean }> {
  return (await request<{ notification: { id: number; delivery_status: string; sent: boolean } }>(`/api/incidents/${id}/notify`, { method: "POST" })).notification;
}
