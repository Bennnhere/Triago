/* Triago API client: published deployments use the managed same-origin agent; local previews may still point at FastAPI. */

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) { super(message); this.name = "ApiError"; this.status = status; }
}

const configuredBase = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, "");

export function resolvePreviewApiBase(protocol: string, hostname: string): string {
  const previewHost = hostname.match(/^\d+-(.+)$/);
  if (previewHost) return `${protocol}//8000-${previewHost[1]}`;
  if (hostname === "localhost" || hostname === "127.0.0.1") return "http://127.0.0.1:8000";
  return `${protocol}//${hostname}`;
}

function developmentApiBase(): string {
  if (typeof window !== "undefined") return resolvePreviewApiBase(window.location.protocol, window.location.hostname);
  return "http://127.0.0.1:8000";
}

export const apiBaseUrl = configuredBase || developmentApiBase();

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers },
  });
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : null;
  if (!response.ok) throw new ApiError(payload?.detail || payload?.message || `Request failed with ${response.status}`, response.status);
  return payload as T;
}

export function webSocketUrl(path: string): string {
  const url = new URL(apiBaseUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = path;
  url.search = "";
  return url.toString();
}
