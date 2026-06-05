import { describe, it, expect } from "vitest";
import { isWithinCadence } from "./Helpers";

describe("isWithinCadence", () => {

  it("returns true when 1 day has passed", () =>{
    const date = new Date();
    date.setDate(date.getDate() - 1);

    expect(isWithinCadence(date.toISOString(), "daily")).toBe(true)
  })

  it("returns true if it's been more than one 1", () => {
    const date = new Date();
    date.setDate(date.getDate() - 5);
    expect(isWithinCadence(date.toISOString(), "daily")).toBe(true)
  })

  it("returns false if it's been leess than one 1 day", () => {
    const date = new Date();
    expect(isWithinCadence(date.toISOString(), "daily")).toBe(false)
  })

  it("returns true on 7th day", () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);

    expect(isWithinCadence(date.toISOString(), "weekly")).toBe(true);
  });

  it("returns true after 7 days", () => {
    const date = new Date();
    date.setDate(date.getDate() - 8);

    expect(isWithinCadence(date.toISOString(), "weekly")).toBe(true);
  });

  it("returns true on 14th day", () => {
    const date = new Date();
    date.setDate(date.getDate() - 14);

    expect(isWithinCadence(date.toISOString(), "fortnightly")).toBe(true);
  });

  it("returns true after 14 days", () => {
    const date = new Date();
    date.setDate(date.getDate() - 15);

    expect(isWithinCadence(date.toISOString(), "fortnightly")).toBe(true);
  });
  });