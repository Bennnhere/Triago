import { describe, expect, it } from "vitest";
import { decodeOAuthState, encodeOAuthState } from "./const";

describe("OAuth state", () => {
  it("round-trips the callback URI, CSRF nonce, and fixed in-app destination", () => {
    const state = encodeOAuthState({
      redirectUri: "https://triago.example/api/oauth/callback",
      nonce: "nonce-123",
      returnTo: "/app",
    });

    expect(decodeOAuthState(state)).toEqual({
      redirectUri: "https://triago.example/api/oauth/callback",
      nonce: "nonce-123",
      returnTo: "/app",
    });
  });

  it("fails closed for malformed state", () => {
    expect(decodeOAuthState("not-a-valid-state")).toEqual({ redirectUri: "" });
  });
});
