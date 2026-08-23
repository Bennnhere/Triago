import { describe, expect, it } from "vitest";
import { createIncidentAgent } from "./incidentAgent";

describe("managed incident agent", () => {
  it("preserves the simulator contract and safely auto-resolves a known checkout regression", () => {
    const agent = createIncidentAgent();
    const knownScenario = agent.scenarios().find(scenario => scenario.id === "known");
    expect(knownScenario).toBeDefined();

    const result = agent.ingest(knownScenario!.alert);
    expect(result.outcome).toBe("auto-resolved");
    expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    expect(result.trace.some(event => event.stage === "Decision" && event.title === "AUTO-RESOLVED")).toBe(true);

    const incident = agent.getIncident(result.incident.incident_id);
    expect(incident).toMatchObject({ status: "Resolved", remediation: "rollback" });
    expect(agent.getAnalytics()).toMatchObject({ autoResolved: 1, totalIncidents: 2 });
  });

  it("correlates seeded downstream signals and records a cautious escalation", () => {
    const agent = createIncidentAgent();
    const correlatedScenario = agent.scenarios().find(scenario => scenario.id === "correlated");
    const result = agent.ingest(correlatedScenario!.alert);

    expect(result.outcome).toBe("escalated");
    expect(result.trace.some(event => event.title === "PLAN / CORRELATE" && event.content.includes("related signals"))).toBe(true);
    expect(agent.getIncident(result.incident.incident_id)).toMatchObject({ status: "Escalated" });
    expect(agent.getActivity()).toMatchObject({ status: "connected", mode: "managed-node" });
  });
});

