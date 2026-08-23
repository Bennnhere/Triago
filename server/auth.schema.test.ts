import { getTableColumns, getTableName } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { users } from "../drizzle/schema";

describe("Manus OAuth persistence schema", () => {
  it("defines the users table and all identity/session metadata columns", () => {
    expect(getTableName(users)).toBe("users");
    expect(Object.keys(getTableColumns(users))).toEqual([
      "id",
      "openId",
      "name",
      "email",
      "loginMethod",
      "role",
      "createdAt",
      "updatedAt",
      "lastSignedIn",
    ]);
  });
});
