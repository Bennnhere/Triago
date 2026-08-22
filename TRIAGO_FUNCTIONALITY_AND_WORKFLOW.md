# Triago: Functionality, Component, and Workflow Guide

## 1. What Triago Is

**Triago is an autonomous incident-response product experience.** Its public site explains the product proposition and its command center demonstrates how incoming alerts can be grouped, investigated with evidence, compared against prior incidents, resolved cautiously, or escalated with complete context.

The implementation has two complementary layers. The **React application** is the user-facing experience: it contains the public landing page and the interactive command-center demo. The repository also contains a **FastAPI incident agent** that demonstrates a persistent, tool-driven backend workflow using SQLite, ChromaDB, local embeddings, WebSocket trace streaming, and an optional escalation webhook.

> **Important implementation boundary:** the current command-center screen uses its own client-side illustrative data and local React state. It does not yet call the FastAPI agent directly. This makes the visual product demo self-contained and reliable in a static browser preview, while the FastAPI service remains available as the next integration step for live data.

| Layer | Primary responsibility | Current behavior |
| --- | --- | --- |
| **Landing page** | Explain the value proposition and guide a visitor into the product. | Fully interactive navigation and CTA links. |
| **Command center** | Demonstrate incident triage, evidence, routing, memory, notifications, analytics, and simulation. | Uses in-browser state seeded from `triagoData.ts`. |
| **FastAPI agent** | Accept alerts, investigate using local tools, persist outcomes, stream traces, and optionally notify a webhook. | Runs independently at port 8000 when started. |
| **SQLite + ChromaDB** | Persist structured incident records and searchable vector memory. | Used by the FastAPI agent. |

---

## 2. End-to-End User Journey

The primary user journey begins at the landing page. Triago deliberately does not show the page immediately; it first presents a cinematic entrance overlay. Once the overlay clears, a visitor sees the product statement, a working-looking incident console, a visual **raw intake → gate → composed output** diagram, and several sections that explain how the product behaves.

Selecting **Launch Triago** or **Open Command Center** opens `/app`. The user then moves through an operations workspace rather than a marketing page. They can inspect active incidents, open an individual incident, search past incident memory, view ownership routing, review delivered notifications, inspect illustrative analytics, or run a simulator scenario.

| Step | Visitor or operator action | What Triago shows | Why it exists |
| --- | --- | --- | --- |
| 1 | Open `/` | Entrance animation, hero, product narrative. | Establishes the brand and explains the product before showing operational detail. |
| 2 | Select **Launch Triago** or **Open Command Center** | `/app` overview. | Creates a clear conversion path from product story to product experience. |
| 3 | Open an incident | Timeline, evidence, activity, concise decisions, resolution context. | Makes the investigation auditable without exposing private reasoning. |
| 4 | Search memory or check ownership | Prior incident matches and responsible people/teams. | Demonstrates how historical knowledge and routing reduce time-to-resolution. |
| 5 | Run a simulator scenario | Observable incident workflow and a resulting incident/notification. | Lets a presenter demonstrate safe automation live without external monitoring data. |
| 6 | Review notifications | Delivered completion or escalation summaries. | Shows that the system closes the communication loop, not just the technical loop. |

---

## 3. Application Bootstrap and Routing

The browser document provides the root element, metadata, typography resources, and application title. React mounts the application into that root. The top-level router then chooses between the two primary experiences.

| File | Responsibility | Why it is needed |
| --- | --- | --- |
| `client/index.html` | Browser shell, viewport metadata, title, fonts, and root mount element. | React needs a stable document container and the design needs its typography to load before users see the main interface. |
| `client/src/main.tsx` | Creates the React root and imports global styles. | It is the application’s bootstrap point. |
| `client/src/App.tsx` | Defines routes. `/` renders the landing page and `/app` renders the command center. | Separates the public product story from the operational workspace. |
| `client/src/index.css` | Global design tokens, responsive layout rules, animation rules, component styling, and the Triago palette. | Keeps the interface coherent across every page and interaction. |

The current route map is intentionally small:

| URL | Component | Purpose |
| --- | --- | --- |
| `/` | `Landing` | Product explanation, visual proof, and route into the command center. |
| `/app` | `CommandCenter` | Interactive incident-response demo. |
| Any other path | `Landing` | Safe fallback so visitors do not land on a blank error page. |

---

## 4. Landing Page Components and Their Purpose

### 4.1 Cinematic Entrance Overlay

The `EntranceOverlay` component is a fixed, full-viewport layer rendered **above an already-mounted landing page**. This is important: the reveal exposes the actual page underneath, not a loading placeholder. It has two black panels and one center line.

| Time | Visual behavior | Technical mechanism | Why it matters |
| --- | --- | --- | --- |
| **0.0–0.7 seconds** | Entire viewport remains black. | Both overlay panels remain in place. | Creates a brief, intentional opening moment. |
| **0.7–1.8 seconds** | Upper panel moves upward; lower panel moves downward; white line appears at the center. | Two transform animations open the panels while the line fades/scales in. | Reveals the real interface with a precise, engineered gesture. |
| **1.8–3.0 seconds** | Panels are clear; the line holds briefly, then fades. | The overlay visibility is removed after the animation window. | Ensures no residual line or black overlay remains in the final state. |
| **Reduced motion** | A short fade replaces the split effect. | `prefers-reduced-motion` CSS rules disable the elaborate movement. | Respects users who request reduced motion. |

### 4.2 Hero Area

The hero contains the statement **“Your First Responder When Production Breaks.”** The top eyebrow label was intentionally removed to reduce visual clutter. The word **“Breaks.”** is isolated in a `hero-breaks` span so it can use white Copperplate typography without changing the rest of the headline.

| Hero component | What it shows | Why it is needed |
| --- | --- | --- |
| Headline | The central reliability proposition. | Communicates the product’s role in one sentence. |
| Copperplate “Breaks.” | A deliberate typography accent for the moment of failure. | Gives the headline a more editorial, premium ending without restyling the entire page. |
| Hero paragraph | Plain-language description of investigation, memory, action, and escalation. | Explains what Triago does before a visitor enters the app. |
| Primary CTA | **Launch Triago** link to `/app`. | Gives the visitor an immediate route to the demo workspace. |
| Secondary CTA | Scroll link to the workflow section. | Serves visitors who want explanation before entering the app. |
| Trust statements | “Investigates with evidence” and “Escalates safely when uncertain.” | Clarifies the system’s safety posture. |

### 4.3 Mini Incident Console

`MiniIncidentConsole` is a compact visual simulation of a checkout incident. It is not connected to live monitoring; it is a static explanatory component. Its stages show an incident moving through log investigation, deployment checks, historical matching, action, and verification.

This component is needed because it makes the product’s workflow legible immediately. A visitor can understand that Triago does more than collect alerts: it observes evidence, compares history, acts cautiously, and checks the result.

### 4.4 Signal Translation Panel

The **Raw Intake → Triage Gate → Composed Output** panel is the landing page’s main product metaphor. Its three pieces are:

| Area | Meaning | User-facing message |
| --- | --- | --- |
| Raw intake | Numerous incoming alerts and fragmented telemetry. | “47 alerts.” |
| Triage gate | The structured filter that turns noise into a decision-ready incident. | “TRIAGE GATE.” |
| Composed output | One verified, owned incident outcome. | “1 verified incident; owner notified.” |

It is needed to show that Triago’s core value is **compression with evidence**: many signals become one coherent operational action.

### 4.5 Capability Strip, Comparison, Lifecycle, and Feature Grid

These sections explain the product in complementary ways rather than repeating the same pitch.

| Section | Component content | Why it is needed |
| --- | --- | --- |
| Capability strip | Alert correlation, autonomous investigation, incident memory, safe remediation. | Gives a fast operational summary. |
| Traditional vs. Triago comparison | Manual response chain versus one coherent Triago flow. | Shows what work the product removes. |
| Lifecycle | Detect, correlate, investigate, remember, decide, verify, notify. | Provides a sequential mental model for the workflow. |
| Feature grid | Six deeper product capabilities. | Gives buyers and evaluators a scan-friendly capability inventory. |
| Product preview | Static miniature command center. | Bridges the marketing explanation to the actual application interface. |
| Final CTA | “Make the response feel smaller.” | Repeats the conversion action after the user has seen the product story. |
| Footer | Brand, navigation, copyright. | Provides a durable end point and secondary navigation. |

---

## 5. Command Center Architecture

The command center is a single React component that acts like a multi-page workspace. Instead of changing the browser route for every internal view, it stores the active workspace in local state using the `page` value. This makes the demo feel immediate and keeps the logic easy to follow.

| State value | Function | What it changes |
| --- | --- | --- |
| `page` | Chooses Overview, Incidents, Memory, Engineers, Notifications, Analytics, Simulator, Settings, or an incident detail view. | Main content panel. |
| `incidentItems` | Holds the current in-browser incident collection. | Overview and incident-list rows. |
| `selected` | Holds the incident open in detail view. | Incident timeline, evidence, decisions, resolution card, tools. |
| `filter` | Holds All, Active, or Resolved filter choice. | Incident-list membership. |
| `memoryQuery` | Holds memory-search text. | Historical incident matching table. |
| `notifications` | Holds visible local notification summaries. | Notification inbox and empty state. |
| `simulation` and `simulationDone` | Hold the scenario choice and final workflow stage. | Simulator workflow display. |
| `toast` | Holds short user feedback. | Confirmation messages after actions. |
| `menuOpen` | Controls the mobile sidebar. | Responsive navigation drawer. |

The left sidebar is the workspace’s durable navigation. It keeps key operational domains visible so users can move between work areas without losing context. On mobile, it collapses behind a menu control so the content area remains usable.

---

## 6. Reusable Command-Center Components

The command center includes several reusable UI primitives. Each exists to avoid repeated markup and to keep the presentation consistent.

| Component | Inputs | What it does | Why it is needed |
| --- | --- | --- | --- |
| `SeverityBadge` | Severity level. | Displays Critical, High, Medium, or Low with semantic styling. | Makes incident urgency scannable. |
| `StatusBadge` | Incident status. | Displays Investigating, Resolved, Escalated, or Hardware with a status dot. | Separates lifecycle state from severity. |
| `EmptyState` | Icon, title, body, optional action. | Shows a meaningful no-results or cleared-inbox state. | Prevents blank screens after filtering or marking notifications read. |
| `SectionTop` | Kicker, title, body, optional action. | Standardizes page headers. | Keeps workspace pages coherent. |
| `MetricCard` | Label, number, change text, tone. | Shows top-line operational metrics. | Gives a high-level operational snapshot before detail. |
| `IncidentRow` | Incident object and open handler. | Renders one incident row with severity, correlation count, owner, and status. | Provides one consistent incident-list pattern across Overview and Incidents. |
| `Timeline` | Timeline event array. | Renders an icon-led event sequence. | Shows evidence and observable actions without exposing hidden reasoning. |
| `IncidentDetail` | Selected incident, back handler, notify handler. | Renders the complete investigation workspace. | Gives users the full context needed to review a decision. |

---

## 7. Every Command-Center Workspace

### 7.1 Overview

The Overview is the command center’s operational home. It contains:

| Component | What it does | Why it is needed |
| --- | --- | --- |
| System status | Shows a compact “All systems operational” indicator. | Provides immediate environmental context. |
| Command gate | Shows raw alert intake passing through Triago into agent output. | Reinforces the product’s central triage metaphor inside the workspace. |
| Metric cards | Summarize active incidents, resolved incidents, correlated alerts, and auto-resolution. | Gives a management-level scan before examining rows. |
| Active incident list | Shows the highest-priority current incidents. | Directs the user toward the most urgent work. |
| Recent agent activity | Lists the latest meaningful agent outcomes. | Shows what Triago has done most recently. |
| On-call routing | Shows people, ownership areas, and availability. | Makes it clear who receives a completed incident context. |

### 7.2 Incidents

The Incidents page shows the full local incident list. The segmented control filters rows into **All**, **Active**, and **Resolved**. Opening a row switches the page state to the detail workspace.

This page is necessary because an overview should show priority, while an incident list needs to support a broader operational queue.

### 7.3 Incident Detail

Incident Detail is the core evidence-review screen. It does not present a chat transcript or hidden model reasoning. Instead, it presents the observable workflow as a concise, auditable timeline.

| Detail panel | Content | Why it is needed |
| --- | --- | --- |
| Incident header | ID, title, service, alert count, age, status, notify action. | Establishes exactly what the operator is reviewing. |
| Summary | Plain-language issue and correlation/ownership/classification facts. | Gives decision context before the event-level detail. |
| Timeline tab | Alert, correlation, tool, result, decision, notification, and resolution events. | Shows the operational sequence. |
| Evidence tab | Logs, deployment relationship, memory match. | Separates observed evidence from status text. |
| Activity tab | Tool inventory and invocation metadata. | Shows what resource categories were involved. |
| Concise decisions | Short reasoned decisions. | Makes the safety and decision posture understandable. |
| Resolution card | Root cause, remediation, verification, time to resolution, notified owner. | Summarizes the outcome in a consistent place. |
| Available tools | Logs, deployment history, service health, memory, remediation, notifications. | Makes the evidence surface inspectable. |

The hardware path intentionally differs from the software path. A hardware incident presents **“do not remediate”** and **“notify infrastructure”** decisions because physical intervention is required. This demonstrates that Triago is designed to avoid unsafe automation.

### 7.4 Incident Memory

The Memory page uses `useMemo` to filter `memoryRecords` against the user’s query. The search checks title, service, and root-cause fields. A result row contains severity, service, root cause, past resolution, age, and similarity score.

This view exists because incident response becomes more useful when prior proven outcomes can inform a current decision. In the current browser demo, clicking a result produces a confirmation toast. In the backend agent, memory is implemented with persistent vector search.

### 7.5 Engineers

The Engineers page is a lightweight ownership map. Each card shows a person, initials, owned service area, and availability status. Selecting **View ownership** returns a toast that confirms the routing context.

This is needed because a good incident process must know who should receive the completed context. Alerts alone are not sufficient; ownership makes an escalation actionable.

### 7.6 Notifications

The Notifications page shows delivery-ready summaries for a resolution, a hardware escalation, and a novel incident escalation. Each summary explicitly states the target person or team and the investigation outcome.

Selecting **Mark all read** clears the local `notifications` array and reveals an intentional empty state. The control demonstrates state change in the UI; it does not delete any backend record.

### 7.7 Analytics

The Analytics workspace uses labeled **illustrative demo data**. It contains metric cards, a bar chart, a donut outcome mix, and root-cause bars. These visualizations are designed for storytelling and UI evaluation, not as a claim about a real production organization.

It exists because product evaluators often need to understand the broader incident pattern beyond a single live incident.

### 7.8 Simulator

The Simulator is the primary live-demo interaction. It has four predefined scenario choices:

| Scenario | Intended behavior | Resulting local state |
| --- | --- | --- |
| Checkout Deployment Failure | Known pattern with a safe rollback available. | Creates a resolved incident and completion notification. |
| Database Latency Spike | Requires investigation and controlled mitigation. | Creates an escalated/investigated outcome. |
| Server Hardware Failure | Requires physical intervention. | Creates a Hardware incident and Infrastructure routing notification. |
| Unknown Service Failure | Novel pattern without safe remediation. | Creates an Escalated incident and responsible-engineer notification. |

When the user selects a scenario, the right panel displays the observable stages: alert received, correlation, investigation, memory search, decision, and verification/notification. When **Start Simulation** is pressed, the command center:

1. Validates that a scenario has been selected.
2. Creates a new `Incident` object appropriate to the scenario.
3. Inserts that incident at the beginning of `incidentItems`.
4. Selects it as the current incident.
5. Adds a matching notification to `notifications`.
6. Displays a toast confirmation.
7. After 1.5 seconds, marks the final simulator stage as completed.

Because this state is stored in React memory, it is intentionally reset by a full browser refresh. This is correct for a static, self-contained demo. Persistence becomes available when the frontend is connected to the FastAPI service.

### 7.9 Settings

Settings presents four configuration categories: monitoring integrations, notification channels, service ownership, and agent settings. The controls currently open descriptive toasts, which means they are conceptually wired in the interface but do not yet persist configuration.

This page exists to show the expected integration boundary for a production version without pretending the browser demo already stores secrets or team configuration.

---

## 8. Data Model and Why It Exists

`triagoData.ts` contains the browser demo’s typed seed data. It uses three primary types.

| Type | Key fields | Why it is needed |
| --- | --- | --- |
| `Severity` | Critical, High, Medium, Low. | Separates impact/urgency from lifecycle status. |
| `IncidentStatus` | Investigating, Resolved, Escalated, Hardware. | Represents what Triago has done or must do next. |
| `TimelineEvent` | Time, kind, title, detail. | Powers the observable incident investigation timeline. |
| `Incident` | ID, service, severity, status, owner, root cause, remediation, verification, timeline. | Ensures every workspace can reference the same complete incident information. |

The seed data includes three deliberately different safety cases:

| Example | Decision logic illustrated |
| --- | --- |
| Checkout degradation | A historical match and deployment evidence support a known rollback path. |
| DB-03 thermal alert | Hardware requires human physical intervention; automated remediation is intentionally withheld. |
| Auth latency | A novel upstream dependency issue lacks a proven safe remediation; the system escalates with context. |

---

## 9. FastAPI Agent Workflow

The backend is designed as an inspectable, tool-driven incident agent. It creates a trace with high-level plan, action, observation, and decision events. The trace is deliberately operational: it records what evidence source was used and what result was observed rather than exposing private model chain-of-thought.

### 9.1 Persistent Stores

| Store | Contents | Why it is needed |
| --- | --- | --- |
| SQLite | Alerts, logs, deployments, service status, incidents, and structured incident memory. | Provides queryable operational records and a durable audit log. |
| ChromaDB | Vector embeddings of historical incident signatures and resolution summaries. | Supports similarity search for incident memory. |
| In-memory session deque | Recent alerts, capped at 300 entries. | Enables short-window correlation during the current service session. |
| WebSocket client set | Connected trace viewers. | Enables live trace broadcasting to subscribed clients. |

### 9.2 Backend Tools

The agent calls real local functions against its data stores. These are not decorative placeholders.

| Tool | Function | Purpose |
| --- | --- | --- |
| Logs | `query_logs` | Retrieves recent service log lines. |
| Deployment history | `query_deploy_history` | Checks recent versions and rollout descriptions. |
| Service health | `query_service_status` | Retrieves the stored health state. |
| Incident memory | `search_incident_memory` | Finds similar historical incident signatures using vector similarity. |
| Remediation | `execute_resolution` | Allows only `rollback`, `restart`, or `clear_cache`. |
| Notification | `notify_engineer` | Posts an escalation summary only when `ESCALATION_WEBHOOK_URL` is configured. |
| Persistence | `log_incident` | Saves the incident and updates vector memory. |

### 9.3 Alert-Processing Sequence

The backend `POST /alerts` flow is:

1. Validate the incoming alert with the `AlertIn` model.
2. Persist the alert in SQLite and place it in short-lived session memory.
3. Broadcast the raw alert to connected WebSocket clients.
4. Classify the alert and find correlations within a 15-minute window.
5. Form candidate explanations based on the alert content and correlated services.
6. Search incident memory before any autonomous decision.
7. Assign a confidence band from the top memory match.
8. If confidence is at least **0.85** and the historical match has a proven executable resolution, inspect deployment context and apply the known action.
9. Otherwise, inspect service health, logs, and deployment history; then escalate with the assembled evidence when confidence is insufficient or a safe action is unproven.
10. Persist the result to SQLite and ChromaDB, then broadcast the final decision.

> **Safety rule:** a high-similarity historical match alone is not enough to trigger automation. It must also contain a known executable resolution. A prior escalation cannot be reused as permission to invent an action.

### 9.4 Confidence Outcomes

| Confidence band | Backend interpretation | Expected behavior |
| --- | --- | --- |
| **≥ 0.85** | High-confidence match. | Auto-resolve only if a known safe executable resolution is present. |
| **0.60–0.85** | Partial match. | Investigate current health, logs, and deployments; provide a suggested action or escalate. |
| **< 0.60** | Novel incident. | Complete evidence gathering, then escalate safely. |

### 9.5 API and Streaming Surface

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/health` | GET | Reports service status, memory entry count, and webhook configuration state. |
| `/state` | GET | Returns recent persisted alerts and incidents. |
| `/scenarios` | GET | Returns the predefined backend demo alert payloads. |
| `/alerts` | POST | Accepts and investigates an alert. |
| `/demo/{scenario}` | POST | Runs one named demo: `known`, `correlated`, or `novel`. |
| `/ws/trace` | WebSocket | Streams system, alert, trace, and decision events to live clients. |

### 9.6 Backend Demo Validation

The `validate_agent.py` script runs each backend scenario twice and checks the key safety outcomes:

| Scenario | Validation expectation |
| --- | --- |
| Known checkout regression | Memory confidence is at least 0.85 and the outcome is `auto-resolved`. |
| Correlated auth incident | At least two dependent alerts are found in the correlation group. |
| Novel feature-flag failure | Confidence is below 0.60 and the outcome is `escalated`. |

---

## 10. Frontend and Backend Integration Status

The visual app and backend are both present, but they are deliberately decoupled today.

| Area | Current state | What a production integration would add |
| --- | --- | --- |
| Overview incidents | Client seed data plus simulator-created items. | Fetch `/state` and subscribe to `/ws/trace`. |
| Incident timeline | Local seeded `TimelineEvent` arrays. | Render live `AgentTrace` events from WebSocket. |
| Simulator | Creates React-local incident and notification state. | Call `POST /demo/{scenario}` and show the returned trace. |
| Memory search | Filters a local record array. | Query a backend search endpoint backed by ChromaDB. |
| Notifications | Local inbox items and toasts. | Display delivery status from webhook notifications. |
| Settings | Demonstrative controls. | Persist integrations, ownership, and policy configuration securely. |

This separation is intentional for a visual demo: the site works without a backend dependency. The next engineering milestone is replacing client-only demo functions with API calls while retaining the exact same user interface.

---

## 11. Visual System and Accessibility Decisions

Triago uses a defined four-color system:

| Color | Role in the interface |
| --- | --- |
| Deep Navy `#0A2947` | Dominant product foundation, navigation, headers, and dark operational surfaces. |
| Warm Cream `#F3E4C9` | Primary high-contrast text, selected buttons, light emphasis, and hero highlights. |
| Soft Stone `#D4D3C0` | Borders, muted structure, icons, and secondary contrast. |
| Earthy Brown `#8B5E3C` | Active selection, secondary emphasis, chart accents, and restrained operational warmth. |

Severity and success states use muted, palette-adjacent tints rather than unrelated neon colors. The design preserves contrast by placing cream or stone text on navy surfaces and using darker text on cream buttons.

The mobile layout collapses the persistent desktop sidebar into a menu drawer, stacks dense grids, and keeps the entrance effect simplified for reduced-motion users. This is needed because incident tools must remain understandable on narrow screens without relying on desktop-only density.

---

## 12. What Is Fully Functional Today vs. What Is Demonstrative

| Capability | Status | Explanation |
| --- | --- | --- |
| Landing-page navigation | **Functional** | CTA and navigation links route users correctly. |
| Cinematic entrance | **Functional** | Runs on initial load and supports reduced motion. |
| Command-center navigation | **Functional** | Sidebar and mobile drawer change visible workspaces. |
| Incident filters, detail tabs, memory filtering, mark-all-read | **Functional** | State changes occur in the browser. |
| Simulator state flow | **Functional in-browser demo** | Creates incidents and notifications in shared React state until refresh. |
| Charts and analytics | **Illustrative** | Explicitly labeled demo values; no live analytics source. |
| Backend agent API | **Functional when the FastAPI process is started** | Uses local persistence, vector memory, tool calls, and trace streaming. |
| Frontend-to-backend live connection | **Not yet wired** | The command center currently uses its independent demo layer. |
| External engineer notification | **Configurable backend capability** | Requires `ESCALATION_WEBHOOK_URL`; otherwise the backend returns `not_configured`. |
| Authentication and saved team settings | **Conceptual UI only** | Requires database-backed users, authorization, and secure secret management. |

---

## 13. Recommended Next Engineering Steps

The product is already useful as a demonstration and presentation artifact. To turn it into a live operational application, the recommended order is:

1. **Connect `/app` to the FastAPI service.** Replace the local scenario function with `POST /demo/{scenario}` and subscribe to `/ws/trace` for live timelines.
2. **Persist browser state.** Add a database/API layer for notifications, simulator runs, user preferences, and team ownership configuration.
3. **Add authentication and team workspaces.** Ensure operators only see the incidents and settings for their organization.
4. **Secure real integrations.** Store monitoring credentials and webhook configuration in protected environment variables or a server-side secrets store.
5. **Add live incident controls carefully.** Keep the existing safe-action allowlist and require approval policy for higher-risk actions.

The current design already supports this progression: the visual shell, state model, incident detail, memory, ownership, notification, and simulation concepts can remain consistent while the source of truth moves from local browser data to the FastAPI service.
