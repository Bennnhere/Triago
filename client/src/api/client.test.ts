import { describe, expect, it } from "vitest";
import { resolvePreviewApiBase } from "./client";

describe("FastAPI preview routing", () => {
  it("maps any managed preview frontend port to the exposed FastAPI port", () => {
    expect(resolvePreviewApiBase("https:", "3000-ijboktzdlpc5sz6xz8m1h-af013721.sg1.manus.computer"))
      .toBe("https://8000-ijboktzdlpc5sz6xz8m1h-af013721.sg1.manus.computer");
    expect(resolvePreviewApiBase("https:", "5173-preview.example")).toBe("https://8000-preview.example");
  });

  it("uses localhost only outside the managed preview domain", () => {
    expect(resolvePreviewApiBase("http:", "localhost")).toBe("http://127.0.0.1:8000");
  });
});
