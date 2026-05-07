import { describe, it, expect } from "vitest";
import { isWithinCadence } from "./Helpers";

describe("isWithinCadence", () => {
  it("returns true within 7 days", () => {
    const date = new Date();
    date.setDate(date.getDate() - 3);

    expect(isWithinCadence(date.toISOString(), "weekly")).toBe(true);
  });

  it("returns false after 7 days", () => {
    const date = new Date();
    date.setDate(date.getDate() - 8);

    expect(isWithinCadence(date.toISOString(), "weekly")).toBe(false);
  });

  it("returns true within 14 days", () => {
    const date = new Date();
    date.setDate(date.getDate() - 10);

    expect(isWithinCadence(date.toISOString(), "fortnightly")).toBe(true);
  });

  it("returns false after 14 days", () => {
    const date = new Date();
    date.setDate(date.getDate() - 15);

    expect(isWithinCadence(date.toISOString(), "fortnightly")).toBe(false);
  });
  });