import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const stylesheet = readFileSync(new URL("./index.css", import.meta.url), "utf8");
const commandCenter = readFileSync(new URL("./pages/CommandCenter.tsx", import.meta.url), "utf8");

describe("command-center cinematic entrance", () => {
  it("mounts the transition over the operational UI", () => {
    expect(commandCenter).toContain("function CommandCenterEntrance()");
    expect(commandCenter).toContain("<CommandCenterEntrance />");
  });

  it("keeps the three-second split contract and removes the white line at split start", () => {
    expect(stylesheet).toContain("animation:command-overlay-visibility 0s 3s forwards");
    expect(stylesheet).toContain("animation:command-panel-top-open 1.8s .7s");
    expect(stylesheet).toContain("animation:command-panel-bottom-open 1.8s .7s");
    expect(stylesheet).toContain("command-line-out 0s .7s step-end forwards");
  });

  it("uses the compact fade fallback for reduced-motion preferences", () => {
    expect(stylesheet).toContain(".command-center-entrance { animation:command-overlay-visibility 0s .22s forwards; }");
    expect(stylesheet).toContain(".command-entrance-panel { animation:reduced-overlay-fade .22s ease-out forwards; }");
    expect(stylesheet).toContain(".command-entrance-line { display:none; }");
  });

  it("keeps the same split sequence at the mobile breakpoint", () => {
    const mobileRules = stylesheet.split("@media (max-width:760px)")[1]?.split("@media (prefers-reduced-motion:reduce)")[0] ?? "";
    expect(mobileRules).not.toContain("command-center-entrance");
    expect(mobileRules).not.toContain("command-entrance-panel");
  });
});
