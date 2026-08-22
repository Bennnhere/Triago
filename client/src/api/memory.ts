/* Triago memory service: routes historical similarity searches through FastAPI and ChromaDB. */
import { request } from "./client";
import type { MemoryRecord } from "./types";

export async function searchMemory(query = ""): Promise<MemoryRecord[]> {
  return (await request<{ records: MemoryRecord[] }>(`/api/memory?query=${encodeURIComponent(query)}`)).records;
}
