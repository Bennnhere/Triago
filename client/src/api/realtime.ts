/* Triago realtime service: published instances poll managed activity; preview FastAPI keeps its native trace socket. */
import { apiBaseUrl, request, webSocketUrl } from "./client";
import type { AgentEvent } from "./types";

type TraceHandlers = { onEvent: (event: AgentEvent) => void; onStatus: (status: "connecting" | "connected" | "disconnected") => void };

function dedupeEvent(event: AgentEvent, seen: Set<string>, onEvent: (event: AgentEvent) => void) {
  const key = "timestamp" in event ? `${event.event}:${event.timestamp}:${event.title ?? ""}` : `${event.event}:${JSON.stringify(event)}`;
  if (seen.has(key)) return;
  seen.add(key);
  if (seen.size > 250) seen.clear();
  onEvent(event);
}

export function connectTrace({ onEvent, onStatus }: TraceHandlers): () => void {
  const sameOrigin = typeof window !== "undefined" && new URL(apiBaseUrl).origin === window.location.origin;
  if (!sameOrigin) {
    let socket: WebSocket | null = null;
    let stopped = false;
    let retry = 0;
    let reconnectTimer: number | undefined;
    const seen = new Set<string>();
    const connect = () => {
      if (stopped) return;
      onStatus("connecting");
      socket = new WebSocket(webSocketUrl("/ws/trace"));
      socket.onopen = () => { retry = 0; onStatus("connected"); };
      socket.onmessage = (message) => {
        try { dedupeEvent(JSON.parse(message.data) as AgentEvent, seen, onEvent); } catch { /* Ignore malformed preview trace frames. */ }
      };
      socket.onclose = () => {
        onStatus("disconnected");
        if (!stopped) reconnectTimer = window.setTimeout(connect, Math.min(8000, 500 * 2 ** retry++));
      };
      socket.onerror = () => socket?.close();
    };
    connect();
    return () => { stopped = true; if (reconnectTimer) window.clearTimeout(reconnectTimer); socket?.close(); };
  }

  let stopped = false;
  let pollTimer: number | undefined;
  let hasConnected = false;
  const seen = new Set<string>();

  const poll = async () => {
    if (stopped) return;
    if (!hasConnected) onStatus("connecting");
    try {
      const payload = await request<{ status: string; events: AgentEvent[] }>("/api/agent/activity");
      hasConnected = payload.status === "connected";
      onStatus(hasConnected ? "connected" : "disconnected");
      for (const event of payload.events) {
        dedupeEvent(event, seen, onEvent);
      }
    } catch {
      onStatus("disconnected");
    } finally {
      if (!stopped) pollTimer = window.setTimeout(poll, 1250);
    }
  };

  void poll();
  return () => { stopped = true; if (pollTimer) window.clearTimeout(pollTimer); };
}
