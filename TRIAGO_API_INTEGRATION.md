# Triago API Integration

## Runtime model

The existing React command center now reads operational state from the FastAPI incident agent. The landing page and its cinematic entrance remain client-rendered; the `/app` workspace requests persisted incidents, detail evidence, vector-memory search results, ownership data, notifications, analytics, and backend simulator scenarios.

| Process | Command | Purpose |
| --- | --- | --- |
| FastAPI agent | `uvicorn backend.app:app --host 0.0.0.0 --port 8000` | Serves the REST API and `/ws/trace` WebSocket stream. |
| React development UI | `pnpm dev` | Serves the existing landing page and command center. |
| Build validation | `pnpm build` | Builds the React client and bundled static server. |
| Agent scenario validation | `python3 backend/validate_agent.py` | Exercises known remediation, correlation, and safe escalation twice against the live agent. |

## Frontend configuration

The browser reads `VITE_API_BASE_URL` when supplied at build or development time. Set it to the public FastAPI origin for a deployed environment, for example:

```text
VITE_API_BASE_URL=https://api.example.com
```

The app never reads backend secrets. Webhook configuration remains server-side through `ESCALATION_WEBHOOK_URL`; the UI reports `not configured` or `failed` accurately rather than claiming an external delivery succeeded.

For the managed development preview, the client derives the paired exposed FastAPI origin from the preview address when an explicit `VITE_API_BASE_URL` is not present. This behavior is for development-preview connectivity; a published deployment should provide an explicit backend URL through environment configuration.

## Data flow

```text
Command center → API service layer → FastAPI → SQLite / ChromaDB
Simulator → POST /alerts → agent tools → incident persistence + WebSocket trace
WebSocket trace → command-center timeline and live simulator workflow
```

The command-center interface deliberately has no local operational fallback. If FastAPI is unavailable, it displays a contextual retry state instead of returning to illustrative incident records.
