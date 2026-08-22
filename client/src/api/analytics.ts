/* Triago analytics service: reads aggregate metrics derived from persisted incident-agent records. */
import { request } from "./client";
import type { Analytics } from "./types";

export async function getAnalytics(): Promise<Analytics> {
  return request<Analytics>("/api/analytics");
}
