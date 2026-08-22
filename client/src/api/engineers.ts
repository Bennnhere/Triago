/* Triago engineers service: obtains ownership and availability from the backend. */
import { request } from "./client";
import type { Engineer } from "./types";

export async function getEngineers(): Promise<Engineer[]> {
  return (await request<{ engineers: Engineer[] }>("/api/engineers")).engineers;
}
