import { describe, expect, it } from "vitest";
import { getOAuthFailureMessage, getOAuthFailurePath, getPostOAuthPath } from "./authPaths";

describe("authentication navigation", () => {
  it("allows only the fixed command-center post-login destination", () => {
    expect(getPostOAuthPath("/app")).toBe("/app");
    expect(getPostOAuthPath("https://untrusted.example")).toBe("/");
    expect(getPostOAuthPath("/login")).toBe("/");
  });

  it("keeps OAuth errors on a fixed Triago login route with clear messages", () => {
    expect(getOAuthFailurePath("invalid_state")).toBe("/login?error=invalid_state");
    expect(getOAuthFailureMessage("callback_failed")).toContain("could not complete");
    expect(getOAuthFailureMessage("unexpected")).toBeNull();
  });
});
