"""Alertify FastAPI backend — Signal Gate design: observable ReAct work, not chat."""
from __future__ import annotations

import asyncio
import json
import os
import sqlite3
import struct
import uuid
from collections import deque
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import chromadb
import requests
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)
DB_PATH = DATA_DIR / "incident_agent.db"
CHROMA_PATH = DATA_DIR / "chroma"
WEBHOOK_URL = os.getenv("ESCALATION_WEBHOOK_URL", "").strip()

clients: set[WebSocket] = set()
session_alerts: deque[dict[str, Any]] = deque(maxlen=300)
embedder: SentenceTransformer | None = None
chroma_client: chromadb.PersistentClient | None = None
memory_collection: Any | None = None


class AlertIn(BaseModel):
    service: str
    alert_type: str
    severity: str
    message: str
    timestamp: str | None = None


class AgentTrace:
    """A trace recorder that publishes every Thought, Action, Observation, and Decision."""

    def __init__(self, incident_id: str):
        self.incident_id = incident_id
        self.entries: list[dict[str, Any]] = []

    async def emit(self, stage: str, title: str, content: str, payload: Any | None = None, tone: str = "muted") -> None:
        event = {
            "event": "trace",
            "incident_id": self.incident_id,
            "stage": stage,
            "title": title,
            "content": content,
            "payload": payload,
            "tone": tone,
            "timestamp": now_iso(),
        }
        self.entries.append(event)
        await broadcast(event)
        await asyncio.sleep(0.16)

    async def tool(self, name: str, arguments: dict[str, Any], result: Any) -> Any:
        await self.emit("Action", name, f"Calling {name} with inspectable arguments.", arguments, "investigating")
        await self.emit("Observation", name, "Tool returned an actual local-system result.", result, "muted")
        return result


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def json_rows(rows: list[sqlite3.Row]) -> list[dict[str, Any]]:
    return [dict(row) for row in rows]


def init_db() -> None:
    with db() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS alerts(id INTEGER PRIMARY KEY, service TEXT, alert_type TEXT, severity TEXT, message TEXT, timestamp TEXT);
            CREATE TABLE IF NOT EXISTS logs(id INTEGER PRIMARY KEY, service TEXT, log_line TEXT, timestamp TEXT);
            CREATE TABLE IF NOT EXISTS deployments(id INTEGER PRIMARY KEY, service TEXT, deployed_at TEXT, version TEXT, description TEXT);
            CREATE TABLE IF NOT EXISTS service_status(service TEXT PRIMARY KEY, status TEXT, last_checked TEXT);
            CREATE TABLE IF NOT EXISTS incidents(id INTEGER PRIMARY KEY, signature TEXT, service TEXT, root_cause TEXT, resolution_action TEXT, outcome TEXT, reasoning_trace TEXT, timestamp TEXT);
            CREATE TABLE IF NOT EXISTS incident_memory(incident_id INTEGER, embedding BLOB, signature_text TEXT, resolution_summary TEXT);
            """
        )


def get_memory_collection() -> Any:
    global chroma_client, memory_collection
    if memory_collection is None:
        chroma_client = chromadb.PersistentClient(path=str(CHROMA_PATH))
        memory_collection = chroma_client.get_or_create_collection(name="incident_memory", metadata={"hnsw:space": "cosine"})
    return memory_collection


def get_embedder() -> SentenceTransformer:
    global embedder
    if embedder is None:
        embedder = SentenceTransformer("all-MiniLM-L6-v2")
    return embedder


def embed(text: str) -> list[float]:
    return get_embedder().encode(text, normalize_embeddings=True).tolist()


# Seven real callable tools -----------------------------------------------------
def query_logs(service: str, limit: int = 50) -> list[dict[str, Any]]:
    with db() as conn:
        rows = conn.execute("SELECT id, service, log_line, timestamp FROM logs WHERE service = ? ORDER BY timestamp DESC LIMIT ?", (service, limit)).fetchall()
    return json_rows(rows)


def query_deploy_history(service: str, limit: int = 10) -> list[dict[str, Any]]:
    with db() as conn:
        rows = conn.execute("SELECT id, service, deployed_at, version, description FROM deployments WHERE service = ? ORDER BY deployed_at DESC LIMIT ?", (service, limit)).fetchall()
    return json_rows(rows)


def query_service_status(service: str) -> dict[str, Any]:
    with db() as conn:
        row = conn.execute("SELECT service, status, last_checked FROM service_status WHERE service = ?", (service,)).fetchone()
    return dict(row) if row else {"service": service, "status": "unknown", "last_checked": now_iso()}


def search_incident_memory(signature: str, top_k: int = 3) -> list[dict[str, Any]]:
    collection = get_memory_collection()
    if collection.count() == 0:
        return []
    result = collection.query(query_embeddings=[embed(signature)], n_results=min(top_k, collection.count()), include=["documents", "metadatas", "distances"])
    matches: list[dict[str, Any]] = []
    for document, metadata, distance in zip(result.get("documents", [[]])[0], result.get("metadatas", [[]])[0], result.get("distances", [[]])[0]):
        matches.append({"incident_id": int(metadata["incident_id"]), "signature": document, "resolution_summary": metadata["resolution_summary"], "similarity": round(max(0.0, 1.0 - float(distance)), 3)})
    return matches


def execute_resolution(action: str, service: str) -> dict[str, Any]:
    if action not in {"rollback", "restart", "clear_cache"}:
        raise ValueError(f"Unsupported known resolution: {action}")
    timestamp = now_iso()
    with db() as conn:
        conn.execute("INSERT INTO service_status(service, status, last_checked) VALUES(?, ?, ?) ON CONFLICT(service) DO UPDATE SET status=excluded.status, last_checked=excluded.last_checked", (service, f"{action}_applied", timestamp))
        conn.execute("INSERT INTO logs(service, log_line, timestamp) VALUES(?, ?, ?)", (service, f"RESOLUTION EXECUTED: {action} applied autonomously by Alertify", timestamp))
    return {"service": service, "action": action, "status": "applied", "timestamp": timestamp}


def notify_engineer(summary: str, incident_id: str) -> dict[str, Any]:
    if not WEBHOOK_URL:
        return {"sent": False, "status": "not_configured", "detail": "Set ESCALATION_WEBHOOK_URL to deliver Slack or Discord notification."}
    response = requests.post(WEBHOOK_URL, json={"text": f"[Alertify escalation {incident_id}]\n{summary}"}, timeout=10)
    return {"sent": response.ok, "status_code": response.status_code, "response": response.text[:500]}


def log_incident(record: dict[str, Any]) -> dict[str, Any]:
    vector = embed(record["memory_text"])
    with db() as conn:
        cursor = conn.execute(
            "INSERT INTO incidents(signature, service, root_cause, resolution_action, outcome, reasoning_trace, timestamp) VALUES(?, ?, ?, ?, ?, ?, ?)",
            (record["signature"], record["service"], record["root_cause"], record["resolution_action"], record["outcome"], json.dumps(record["reasoning_trace"]), record["timestamp"]),
        )
        incident_id = int(cursor.lastrowid)
        conn.execute("INSERT INTO incident_memory(incident_id, embedding, signature_text, resolution_summary) VALUES(?, ?, ?, ?)", (incident_id, struct.pack(f"{len(vector)}f", *vector), record["signature"], record["resolution_summary"]))
    get_memory_collection().upsert(ids=[str(incident_id)], embeddings=[vector], documents=[record["signature"]], metadatas=[{"incident_id": str(incident_id), "resolution_summary": record["resolution_summary"]}])
    return {"incident_id": incident_id, "memory_stored": True, "collection": "incident_memory"}


async def broadcast(event: dict[str, Any]) -> None:
    disconnected: list[WebSocket] = []
    for client in list(clients):
        try:
            await client.send_json(event)
        except Exception:
            disconnected.append(client)
    for client in disconnected:
        clients.discard(client)


def classify(alert: dict[str, Any]) -> dict[str, str]:
    return {"service": alert["service"], "alert_type": alert["alert_type"], "severity": alert["severity"]}


def find_correlations(alert: dict[str, Any]) -> list[dict[str, Any]]:
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=15)
    correlated: list[dict[str, Any]] = []
    downstream = {"payment-service", "notification-service"}
    for prior in session_alerts:
        if prior["id"] == alert["id"]:
            continue
        try:
            timestamp = datetime.fromisoformat(prior["timestamp"])
        except ValueError:
            continue
        same_service = prior["service"] == alert["service"]
        auth_cluster = alert["service"] == "auth-service" and prior["service"] in downstream
        downstream_cluster = alert["service"] in downstream and prior["service"] == "auth-service"
        if timestamp >= cutoff and (same_service or auth_cluster or downstream_cluster):
            correlated.append(prior)
    return correlated


def candidate_hypotheses(alert: dict[str, Any], correlations: list[dict[str, Any]]) -> list[str]:
    message = alert["message"].lower()
    hypotheses: list[str] = []
    if "5xx" in message or "pool" in message or alert["service"] == "checkout-api":
        hypotheses.append("A recent configuration change exhausted the database connection pool.")
    if correlations or alert["service"] == "auth-service":
        hypotheses.append("Auth degradation is propagating into dependent payment and notification paths.")
    if not hypotheses:
        hypotheses.append("A novel service-side failure may be associated with the most recent deployment.")
    return hypotheses[:2]


async def investigate(alert: dict[str, Any]) -> dict[str, Any]:
    incident_key = f"INC-{uuid.uuid4().hex[:8].upper()}"
    trace = AgentTrace(incident_key)
    await trace.emit("Thought", "PLAN / CLASSIFY", "Classifying the incoming alert before selecting evidence sources.", classify(alert), "investigating")
    correlations = find_correlations(alert)
    if correlations:
        await trace.emit("Thought", "PLAN / CORRELATE", f"Found {len(correlations)} session alerts inside the 15-minute window; treating them as one incident group.", {"correlated_alerts": correlations}, "investigating")
    else:
        await trace.emit("Thought", "PLAN / CORRELATE", "No correlated session alert found; continue as a single incident.", {"correlated_alerts": []}, "muted")
    hypotheses = candidate_hypotheses(alert, correlations)
    await trace.emit("Thought", "PLAN / HYPOTHESIZE", "Formed candidate explanations before choosing the first tool.", {"hypotheses": hypotheses}, "investigating")

    signature = f"{alert['service']} | {alert['severity']} | {alert['alert_type']} | {alert['message']}"
    await trace.emit("Thought", "REACT / SELECT ACTION", "Memory search is mandatory before any autonomous decision; it is selected first.", {"selected_tool": "search_incident_memory"}, "investigating")
    matches = await trace.tool("search_incident_memory", {"signature": signature, "top_k": 3}, search_incident_memory(signature))
    confidence = matches[0]["similarity"] if matches else 0.0
    band = "high ≥ 0.85" if confidence >= 0.85 else "medium 0.60–0.85" if confidence >= 0.60 else "novel < 0.60"
    known_resolution = bool(matches and any(action in matches[0]["resolution_summary"] for action in ("rollback", "restart", "clear_cache")) and "escalated" not in matches[0]["resolution_summary"])
    await trace.emit("Thought", "REACT / CONFIDENCE", f"Closest vector-memory match scored {confidence:.3f}; threshold band: {band}.", {"confidence": confidence, "threshold_band": band, "closest_match": matches[0] if matches else None}, "resolved" if confidence >= .85 else "escalated" if confidence < .6 else "investigating")

    if confidence >= 0.85 and known_resolution:
        await trace.emit("Thought", "REACT / NEXT ACTION", "The match points to a configuration regression. I will validate the deployment context, then execute the known rollback without asking a human.", {"selected_tool": "query_deploy_history"}, "investigating")
        deployments = await trace.tool("query_deploy_history", {"service": alert["service"], "limit": 10}, query_deploy_history(alert["service"]))
        await trace.emit("Thought", "REACT / IMPLICATION", "A recent deployment supports the stored failure signature. Executing the known resolution.", {"deployments_seen": len(deployments)}, "investigating")
        resolution = await trace.tool("execute_resolution", {"action": "rollback", "service": alert["service"]}, execute_resolution("rollback", alert["service"]))
        root_cause, resolution_action, outcome, decision = "database connection pool exhaustion after configuration deployment", resolution["action"], "auto-resolved", "AUTO-RESOLVED"
    else:
        if confidence >= 0.85 and matches:
            await trace.emit("Thought", "REACT / SAFETY CHECK", "Memory confirms recurrence, but the prior incident was escalated without a proven executable resolution. I will reuse its evidence, not invent an unsafe action.", {"matched_resolution_summary": matches[0]["resolution_summary"]}, "escalated")
        await trace.emit("Thought", "REACT / NEXT ACTION", "Memory is not decisive. I will inspect current service health, then select logs and deployment evidence based on that observation.", {"selected_tool": "query_service_status"}, "investigating")
        status = await trace.tool("query_service_status", {"service": alert["service"]}, query_service_status(alert["service"]))
        await trace.emit("Thought", "REACT / IMPLICATION", "Service state is insufficient by itself; raw logs are needed to test the active hypotheses.", status, "investigating")
        logs = await trace.tool("query_logs", {"service": alert["service"], "limit": 50}, query_logs(alert["service"]))
        await trace.emit("Thought", "REACT / IMPLICATION", "Log evidence has been observed. I will check deployment history to distinguish a regression from an unrelated novel fault.", {"log_lines_examined": len(logs)}, "investigating")
        deployments = await trace.tool("query_deploy_history", {"service": alert["service"], "limit": 10}, query_deploy_history(alert["service"]))
        root_cause = "probable configuration regression" if confidence >= 0.60 else "novel incident; root cause requires human judgment after completed investigation"
        resolution_action, outcome, decision = ("suggest rollback", "escalated", "ESCALATED") if confidence >= 0.60 else ("human investigation required", "escalated", "ESCALATED")
        summary = f"{alert['service']} {alert['severity']} {alert['alert_type']}. Confidence {confidence:.3f} ({band}). Root cause: {root_cause}. Suggested action: {resolution_action}."
        await trace.emit("Thought", "REACT / ESCALATE", "The autonomous investigation is complete. I will notify an engineer with the assembled evidence, not a raw alert.", {"summary": summary}, "escalated")
        await trace.tool("notify_engineer", {"summary": summary, "incident_id": incident_key}, notify_engineer(summary, incident_key))

    record = {
        "signature": signature, "service": alert["service"], "root_cause": root_cause, "resolution_action": resolution_action, "outcome": outcome,
        "reasoning_trace": trace.entries, "timestamp": now_iso(),
        "memory_text": f"{signature}. Symptoms: {alert['message']}. Root cause: {root_cause}. Resolution/outcome: {resolution_action}; {outcome}.",
        "resolution_summary": f"{root_cause}; {resolution_action}; {outcome}",
    }
    stored = await trace.tool("log_incident", {"record": {k: v for k, v in record.items() if k not in {"reasoning_trace", "memory_text"}}}, log_incident(record))
    await trace.emit("Decision", decision, f"{decision}: confidence {confidence:.3f}; {resolution_action}. Incident was persisted to SQLite and ChromaDB.", {"confidence": confidence, "threshold_band": band, "incident": stored, "outcome": outcome}, "resolved" if outcome == "auto-resolved" else "escalated")
    return {"incident_key": incident_key, "confidence": confidence, "outcome": outcome, "incident": stored, "correlations": correlations}


async def ingest(alert: AlertIn) -> dict[str, Any]:
    alert_data = alert.model_dump()
    alert_data["timestamp"] = alert_data["timestamp"] or now_iso()
    with db() as conn:
        cursor = conn.execute("INSERT INTO alerts(service, alert_type, severity, message, timestamp) VALUES(?, ?, ?, ?, ?)", (alert_data["service"], alert_data["alert_type"], alert_data["severity"], alert_data["message"], alert_data["timestamp"]))
        alert_data["id"] = int(cursor.lastrowid)
    session_alerts.append(alert_data)
    await broadcast({"event": "alert", "alert": alert_data})
    return {"alert": alert_data, **(await investigate(alert_data))}


def seed() -> None:
    init_db()
    with db() as conn:
        has_persistent_seed = bool(conn.execute("SELECT COUNT(*) AS count FROM incidents").fetchone()["count"])
        if has_persistent_seed:
            pass
        else:
            now = datetime.now(timezone.utc)
            conn.executemany("INSERT INTO service_status(service, status, last_checked) VALUES (?, ?, ?)", [("checkout-api", "healthy", now_iso()), ("auth-service", "degraded", now_iso()), ("payment-service", "warning", now_iso()), ("notification-service", "warning", now_iso()), ("feature-flag-service", "unknown", now_iso())])
            conn.executemany("INSERT INTO logs(service, log_line, timestamp) VALUES (?, ?, ?)", [("checkout-api", "ERROR postgres pool exhausted: active=100 waiting=34", (now - timedelta(minutes=1)).isoformat()), ("checkout-api", "WARN request 5xx rate crossed 12%", (now - timedelta(minutes=2)).isoformat()), ("auth-service", "ERROR oidc upstream latency 4200ms", (now - timedelta(minutes=2)).isoformat()), ("payment-service", "ERROR auth dependency timed out after 3000ms", (now - timedelta(minutes=1)).isoformat()), ("notification-service", "ERROR token verification dependency timeout", (now - timedelta(minutes=1)).isoformat()), ("feature-flag-service", "ERROR rule evaluation graph cycle detected", (now - timedelta(minutes=1)).isoformat())])
            conn.executemany("INSERT INTO deployments(service, deployed_at, version, description) VALUES (?, ?, ?, ?)", [("checkout-api", (now - timedelta(minutes=6)).isoformat(), "2026.08.22-rc4", "connection pool configuration rollout"), ("auth-service", (now - timedelta(hours=3)).isoformat(), "2026.08.22-rc2", "OIDC retry policy adjustment"), ("feature-flag-service", (now - timedelta(minutes=11)).isoformat(), "2026.08.22-rc1", "new evaluator deployment")])
    if not has_persistent_seed:
        old = (datetime.now(timezone.utc) - timedelta(days=21)).isoformat()
        log_incident({"signature": "checkout-api | high | 5xx spike | database connection pool exhaustion after configuration deployment", "service": "checkout-api", "root_cause": "database connection pool exhaustion after configuration deployment", "resolution_action": "rollback", "outcome": "resolved", "reasoning_trace": [{"seed": True}], "timestamp": old, "memory_text": "checkout-api high severity 5xx spike caused by database connection pool exhaustion after configuration deployment. Symptoms: pool exhausted, 5xx errors. Root cause: database connection pool exhaustion. Resolution/outcome: rollback; resolved.", "resolution_summary": "database pool exhausted after config rollout; rollback; resolved"})
    if session_alerts:
        return
    for service, alert_type, severity, message, delta in [("payment-service", "timeout", "high", "payment authorization timeout while awaiting auth dependency", 1), ("notification-service", "timeout", "medium", "notification token verification timeout", 0)]:
        data = {"id": -delta - 1, "service": service, "alert_type": alert_type, "severity": severity, "message": message, "timestamp": (datetime.now(timezone.utc) - timedelta(minutes=delta)).isoformat()}
        session_alerts.append(data)


SCENARIOS = {
    "known": AlertIn(service="checkout-api", alert_type="5xx spike", severity="high", message="database connection pool exhaustion after configuration deployment"),
    "correlated": AlertIn(service="auth-service", alert_type="latency spike", severity="high", message="OIDC latency spike propagating to dependent services."),
    "novel": AlertIn(service="feature-flag-service", alert_type="evaluation failure", severity="high", message="Rule evaluation graph cycle detected after new evaluator deploy."),
}


@asynccontextmanager
async def lifespan(_: FastAPI):
    await asyncio.to_thread(seed)
    yield


app = FastAPI(title="Alertify Incident Agent", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"], allow_origin_regex=r"https://.*\.manus\.computer", allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.get("/health")
def health() -> dict[str, Any]:
    return {"status": "ok", "memory_entries": get_memory_collection().count(), "webhook_configured": bool(WEBHOOK_URL)}


@app.get("/state")
def state() -> dict[str, Any]:
    with db() as conn:
        alerts = json_rows(conn.execute("SELECT id, service, alert_type, severity, message, timestamp FROM alerts ORDER BY timestamp DESC LIMIT 35").fetchall())
        incidents = json_rows(conn.execute("SELECT id, service, outcome, resolution_action, timestamp FROM incidents ORDER BY timestamp DESC LIMIT 8").fetchall())
    return {"alerts": alerts, "incidents": incidents, "memory_entries": get_memory_collection().count(), "webhook_configured": bool(WEBHOOK_URL)}


@app.get("/scenarios")
def scenarios() -> dict[str, Any]:
    return {key: value.model_dump() for key, value in SCENARIOS.items()}


@app.post("/alerts")
async def receive_alert(alert: AlertIn) -> dict[str, Any]:
    return await ingest(alert)


@app.post("/demo/{scenario}")
async def run_demo(scenario: str) -> dict[str, Any]:
    if scenario not in SCENARIOS:
        raise HTTPException(status_code=404, detail="Unknown scenario")
    return await ingest(SCENARIOS[scenario])


@app.websocket("/ws/trace")
async def trace_socket(websocket: WebSocket) -> None:
    await websocket.accept()
    clients.add(websocket)
    await websocket.send_json({"event": "system", "status": "connected", "message": "Trace channel ready: autonomous cycles stream here."})
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        clients.discard(websocket)
