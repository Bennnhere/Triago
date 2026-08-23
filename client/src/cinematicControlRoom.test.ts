import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const controlRoom = readFileSync(new URL("./pages/CommandCenter.tsx", import.meta.url), "utf8");
const cinematicStyles = readFileSync(new URL("./cinematic.css", import.meta.url), "utf8");
const landingStyles = readFileSync(new URL("./index.css", import.meta.url), "utf8");

describe("cinematic control room", () => {
  it("derives narrative activity from actual simulation traces or persisted incident timelines", () => {
    expect(controlRoom).toContain("const narrativeEvents = simulationEvents.length ? simulationEvents : featuredIncident?.timeline ?? []");
    expect(controlRoom).toContain("<InvestigationGraph events={narrativeEvents} state={agentState} />");
    expect(controlRoom).toContain("<AgentNarrative events={narrativeEvents} />");
  });

  it("renders the outcome and memory relay from backend-returned records", () => {
    expect(controlRoom).toContain("<OutcomeFrame incident={featuredIncident}");
    expect(controlRoom).toContain("memory.slice(0, 3).map((record)");
    expect(controlRoom).toContain("activeIncidents.slice(0, 5).map((incident, index)");
  });

  it("keeps cinematic motion restrained for reduced-motion preferences", () => {
    expect(landingStyles).toContain(".agent-visual *, .hero-noise i { animation:none!important; }");
    expect(cinematicStyles).toContain("@media (prefers-reduced-motion:reduce) { .graph-node { transition:none; } }");
  });

  it("contains explicit mobile layout rules for both the narrative landing and control room", () => {
    expect(landingStyles).toContain("@media (max-width:760px) { .cinematic-nav");
    expect(cinematicStyles).toContain(".control-room-band { grid-template-columns:1fr 52px 1fr;");
    expect(cinematicStyles).toContain(".control-room-grid,.control-room-evidence { gap:12px;");
  });

  it("keeps a single Settings destination in the command-center sidebar", () => {
    expect(controlRoom.match(/label: "Settings"/g)).toHaveLength(1);
    expect(controlRoom).not.toContain('<button onClick={() => changePage("settings")}><Settings');
  });
});
