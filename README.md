# Triago

> **Something broke. Triago is working.**

Triago is an **autonomous incident investigation and response platform** designed to turn raw operational alerts into structured, inspectable, and actionable incident outcomes.

Instead of treating an alert as the end of the process, Triago investigates the surrounding evidence, correlates signals, retrieves relevant historical incidents, determines whether an issue can be resolved safely, and records the resulting operational context.

---

## What is Triago?

Modern systems generate enormous amounts of operational noise.

A single service failure can produce alerts from multiple systems, logs with thousands of entries, deployment changes, health signals, and historical incidents that may contain the solution.

Triago acts as an autonomous investigation layer between those signals and the engineers responsible for resolving them.

```text
Incoming Signals
       │
       ▼
┌──────────────────┐
│      TRIAGO      │
│  Autonomous      │
│  Investigation   │
└────────┬─────────┘
         │
   ┌─────┼──────┬─────────┐
   ▼     ▼      ▼         ▼
 Alerts Logs  Health   Deployments
   │     │      │         │
   └─────┴──────┴─────────┘
              │
              ▼
      Evidence Correlation
              │
              ▼
       Incident Decision
         /          \
     Resolve      Escalate
        │             │
        ▼             ▼
   Record Outcome   Route to Owner
              │
              ▼
    Persistent Memory
```

The goal is simple:

**Give engineers a conclusion, not just another alert.**

---

## Core Capabilities

### Autonomous Incident Investigation

Triago investigates incidents instead of simply displaying alerts.

The investigation activity can include:

* Querying current service state
* Collecting incident-specific logs
* Correlating alert signatures
* Inspecting runtime symptoms
* Gathering deployment evidence
* Checking service health
* Consulting historical incident memory
* Building an evidence-backed incident narrative

Every significant step is recorded in the **Agent Activity** view, making the autonomous work inspectable.

---

### Persistent Incident Memory

Every incident can become useful knowledge for future investigations.

Triago maintains an incident memory containing information such as:

* Previous incidents
* Affected services
* Root causes
* Resolutions
* Historical outcomes
* Similarity relationships

For example:

```text
Current Incident
       │
       ▼
   Vector Search
       │
       ▼
Prior Resolutions
       │
       ▼
Relevant Historical Evidence
```

A previous **Checkout Service Degradation** incident, for example, is recorded with a root cause involving database connection pool exhaustion after a configuration deployment and a resolution of:

> rollback; resolved

This historical information can then provide decision support during future incidents.

---

## Incident Lifecycle

Triago organizes incidents around a clear operational lifecycle.

### 1. Incoming

Signals are persisted as they arrive.

The overview dashboard exposes the number of incoming persisted signals so operators can immediately understand the current workload.

### 2. Investigating

Triago gathers evidence from available operational sources.

The investigation timeline records tool calls and results, including service queries and log collection.

### 3. Decision

After evidence has been assembled, Triago reaches an operational decision:

```text
Resolve / Escalate
```

### 4. Outcome

The resulting incident context is recorded.

If the issue requires human intervention, Triago escalates the incident rather than pretending that autonomous resolution is safe.

### 5. Memory

Relevant incident information becomes persistent operational knowledge that can assist future investigations.

---

## Evidence Convergence

The Live Investigation Map represents Triago's investigation model.

Evidence converges around the autonomous agent from multiple operational sources:

* **Alerts**
* **Logs**
* **Memory**
* **Health**
* **Deployments**

The system then produces a recorded decision rather than leaving engineers to manually reconstruct the incident from disconnected systems.

This creates an operational flow of:

**Signal → Evidence → Investigation → Decision → Record**

---

## Inspectable Agent Activity

Autonomous systems can be difficult to trust when their actions are invisible.

Triago addresses this by maintaining a live investigation record.

The activity timeline distinguishes between actions such as:

```text
RESULT
query_service_status

TOOL CALL
query_logs

RESULT
REACT / ESCALATE

TOOL CALL
record_notification
```

This gives engineers visibility into **what Triago investigated and what it ultimately decided**.

The objective isn't just automation.

It's **inspectable automation**.

---

## Resolve vs Escalate

Triago is designed around a safety-oriented operational decision:

### Resolve

When sufficient evidence supports a safe resolution, the incident can be recorded as resolved.

### Escalate

When the investigation indicates that human intervention is required, Triago records an escalation containing the assembled incident context.

For example, an incident may be escalated because:

```text
auth degradation is propagating into dependent
payment and notification paths
```

Instead of sending an engineer a raw alert, Triago provides the surrounding operational context needed to continue the investigation.

---

## Service Ownership & On-Call Routing

Incidents need to reach the right people.

Triago maintains a managed ownership map connecting services to engineers and teams.

The current interface demonstrates ownership across areas including:

| Engineer    | Ownership        |
| ----------- | ---------------- |
| Rahul Mehta | Checkout Service |
| Ananya Rao  | Payments & Auth  |
| Vikram Shah | Infrastructure   |
| Sai Iyer    | Database         |

Each engineer can have an availability state such as:

* Available
* On call

This allows completed incident context to be routed toward the appropriate owner instead of being broadcast indiscriminately.

---

## Operational Incidents

The Incidents view provides a centralized operational record.

Each incident can expose:

* Severity
* Incident name
* Number of persisted alerts
* Affected service
* Current status
* Owner
* Time information
* Incident details

Supported operational states shown in the interface include:

* **Active**
* **Resolved**
* **Escalated**

Example incidents include:

* Feature Flag Evaluation Failure
* Auth Token Validation Latency
* Checkout Service Degradation

---

## Incident Memory

The Memory section provides historical operational knowledge.

Instead of treating every incident as completely new, Triago can use previously recorded incidents as decision support.

The memory interface exposes:

```text
Incident
   │
   ├── Root Cause
   │
   ├── Resolution
   │
   └── Similarity
```

This creates a feedback loop:

```text
Incident
   ↓
Investigation
   ↓
Resolution
   ↓
Recorded Memory
   ↓
Future Investigation
   ↓
Better Decision Support
```

The more useful incidents that are recorded, the more operational context becomes available to future investigations.

---

## Operational Visibility

Triago's dashboard provides a high-level view of the current operational state.

The overview exposes metrics such as:

* Persisted incoming signals
* Active incident narratives
* Verified safe resolutions
* Current escalations

The interface is intentionally designed as a **live control room**, giving operators both the current state and the evidence behind it.

---

## Notifications

Triago includes a dedicated Notifications area for operational updates.

Notifications can surface important incident activity and keep engineers informed when attention is required.

---

## Analytics

The Analytics section provides a dedicated area for understanding operational activity and incident behavior.

This creates a distinction between:

**Responding to incidents**
and
**Understanding incident patterns.**

---

## Simulator

Triago also includes a Simulator for testing incident behavior.

This provides a controlled environment for generating or exploring operational scenarios without relying exclusively on real production incidents.

A simulator is particularly useful for testing:

* Alert ingestion
* Investigation flows
* Evidence correlation
* Resolution decisions
* Escalation behavior
* Memory retrieval
* Ownership routing

---

## Managed API Mode

Triago's interface exposes a **Managed API mode** described as a:

> Same-origin incident agent

This provides the operational interface with an agent-backed workflow while keeping the incident experience integrated into the command centre.

---

## Product Architecture

At a conceptual level, Triago can be viewed as several cooperating layers:

```text
┌───────────────────────────────────────────┐
│             TRIAGO COMMAND CENTRE         │
├───────────────────────────────────────────┤
│ Overview │ Incidents │ Memory │ Analytics │
│ Engineers │ Notifications │ Simulator     │
├───────────────────────────────────────────┤
│              INCIDENT AGENT               │
│                                           │
│  Investigation → Correlation → Decision   │
├───────────────────────────────────────────┤
│              EVIDENCE LAYER               │
│                                           │
│ Alerts │ Logs │ Health │ Deployments      │
├───────────────────────────────────────────┤
│             MEMORY / RETRIEVAL            │
│                                           │
│ Current Incident → Vector Search          │
│                  → Prior Resolutions      │
├───────────────────────────────────────────┤
│          OPERATIONAL OWNERSHIP            │
│                                           │
│ Services → Engineers → On-Call Routing    │
└───────────────────────────────────────────┘
```

The important architectural idea is that **investigation, memory, and routing are connected rather than existing as isolated dashboard features**.

---

## Example Investigation

Consider an authentication incident.

### Incoming signals

Multiple alerts indicate elevated authentication latency.

### Investigation

Triago queries:

```text
Service Status
      +
Incident Logs
      +
Health Signals
      +
Deployment Evidence
      +
Historical Memory
```

### Correlation

Triago determines whether the symptoms are related and whether historical incidents provide useful evidence.

### Decision

The investigation produces:

```text
RESOLVE
```

or

```text
ESCALATE
```

### Escalation

If escalation is required, the incident is associated with the appropriate service owner.

### Recording

The resulting operational context is recorded so that the investigation isn't lost after the incident ends.

---

## Design Philosophy

Triago is built around a few core principles.

### Evidence over guesswork

An alert is a signal, not an explanation.

Triago attempts to assemble evidence before reaching an operational conclusion.

### Automation with visibility

Autonomous work should remain inspectable.

Every investigation should leave behind an operational record.

### Memory over repetition

If an incident has already been solved, that knowledge should be useful the next time a similar incident occurs.

### Context over noise

Engineers should receive an incident narrative with useful context rather than being forced to manually correlate dozens of disconnected signals.

### Escalation when necessary

Automation should know when it needs human attention.

---

## Command Centre

The Triago command centre currently provides:

* **Overview** — live operational control room
* **Incidents** — incident records and current status
* **Memory** — historical incident knowledge
* **Engineers** — service ownership and on-call routing
* **Notifications** — operational updates
* **Analytics** — operational analysis
* **Simulator** — controlled incident scenarios
* **Settings** — system configuration

---

## Incident State Model

A simplified representation of Triago's incident state model is:

```text
                 ┌───────────────┐
                 │    SIGNAL     │
                 └───────┬───────┘
                         │
                         ▼
                 ┌───────────────┐
                 │ INVESTIGATE   │
                 └───────┬───────┘
                         │
                         ▼
                ┌─────────────────┐
                │  EVIDENCE       │
                │  CONVERGENCE    │
                └────────┬────────┘
                         │
                         ▼
                 ┌───────────────┐
                 │    DECIDE     │
                 └───────┬───────┘
                         │
                 ┌───────┴────────┐
                 ▼                ▼
            ┌─────────┐      ┌───────────┐
            │ RESOLVE │      │ ESCALATE  │
            └────┬────┘      └─────┬─────┘
                 │                 │
                 └────────┬────────┘
                          ▼
                  ┌──────────────┐
                  │ RECORD       │
                  │ OUTCOME      │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │    MEMORY    │
                  └──────────────┘
```

---

## Why Triago?

Traditional incident management often looks like:

```text
Alert
  ↓
Engineer wakes up
  ↓
Search logs
  ↓
Check deployments
  ↓
Ask "did we change something?"
  ↓
Search old incidents
  ↓
Figure out ownership
  ↓
Fix it
  ↓
Write everything down
```

Triago aims to compress that process into an autonomous investigation loop:

```text
Alert
  ↓
Triago
  ↓
Evidence
  ↓
Context
  ↓
Decision
  ↓
Resolution / Escalation
  ↓
Memory
```

The engineer can then focus on **the problem that actually requires engineering judgment**, rather than spending the first part of an incident reconstructing what happened.

---

## Project Status

Triago is an evolving incident-response platform.

The current command centre demonstrates the core product concepts around:

* Autonomous incident investigation
* Evidence aggregation
* Incident narratives
* Persistent operational memory
* Historical retrieval
* Resolution and escalation
* Service ownership
* On-call routing
* Operational visibility
* Incident simulation

Implementation details such as the exact backend services, database, vector store, deployment infrastructure, and frontend stack should be documented here as those components become finalized.

---

## Contributing

Contributions, ideas, and feedback are welcome.

If you're interested in improving Triago, useful areas include:

* Incident detection
* Evidence correlation
* Agent reasoning
* Retrieval and memory
* Incident simulation
* Ownership routing
* Observability
* Safety and escalation policies
* Developer experience

---

## 📄 License

Add the project's license here once the repository's licensing terms are finalized.

---

### Triago

**Something broke. Triago is working.**

*Investigate. Understand. Decide. Remember.*
