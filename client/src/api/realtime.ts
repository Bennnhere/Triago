/* Triago realtime service: a reconnecting, deduplicated WebSocket bridge for FastAPI agent events. */
import { webSocketUrl } from "./client";
import type { AgentEvent } from "./types";

type TraceHandlers = { onEvent: (event: AgentEvent) => void; onStatus: (status: "connecting" | "connected" | "disconnected") => void };

export function connectTrace({ onEvent, onStatus }: TraceHandlers): () => void {
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
      try {
        const event = JSON.parse(message.data) as AgentEvent;
        const key = "timestamp" in event ? `${event.event}:${event.timestamp}:${event.title ?? ""}` : `${event.event}:${JSON.stringify(event)}`;
        if (seen.has(key)) return;
        seen.add(key);
        if (seen.size > 250) seen.clear();
        onEvent(event);
      } catch { /* Malformed messages are ignored so the incident workspace remains usable. */ }
    };
    socket.onclose = () => {
      onStatus("disconnected");
      if (!stopped) {
        const delay = Math.min(8000, 500 * 2 ** retry++);
        reconnectTimer = window.setTimeout(connect, delay);
      }
    };
    socket.onerror = () => socket?.close();
  };

  connect();
  return () => { stopped = true; if (reconnectTimer) window.clearTimeout(reconnectTimer); socket?.close(); };
}
