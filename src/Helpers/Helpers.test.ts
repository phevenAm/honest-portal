import { describe, expect, it } from "vitest";

import { getInitials, isQuestionnaireCheckInDue } from "./Helpers";

describe("isQuestionnaireCheckInDue", () => {
  it("returns true when 1 day has passed", () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);

    expect(isQuestionnaireCheckInDue(date.toISOString(), "daily")).toBe(true);
  });

  it("returns true if it's been more than one 1", () => {
    const date = new Date();
    date.setDate(date.getDate() - 5);
    expect(isQuestionnaireCheckInDue(date.toISOString(), "daily")).toBe(true);
  });

  it("returns false if it's been leess than one 1 day", () => {
    const date = new Date();
    expect(isQuestionnaireCheckInDue(date.toISOString(), "daily")).toBe(false);
  });

  it("returns true on 7th day", () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);

    expect(isQuestionnaireCheckInDue(date.toISOString(), "weekly")).toBe(true);
  });

  it("returns true after 7 days", () => {
    const date = new Date();
    date.setDate(date.getDate() - 8);

    expect(isQuestionnaireCheckInDue(date.toISOString(), "weekly")).toBe(true);
  });

  it("returns true on 14th day", () => {
    const date = new Date();
    date.setDate(date.getDate() - 14);

    expect(isQuestionnaireCheckInDue(date.toISOString(), "fortnightly")).toBe(true);
  });

  it("returns true after 14 days", () => {
    const date = new Date();
    date.setDate(date.getDate() - 15);

    expect(isQuestionnaireCheckInDue(date.toISOString(), "fortnightly")).toBe(true);
  });
});

describe("getInitials", () => {
  it("returns initials from a display name with two words", () => {
    expect(getInitials("Stephen Missah", "", "")).toBe("SM");
  });

  it("returns a single initial when the display name has only one word", () => {
    expect(getInitials("Stephen", "", "")).toBe("S");
  });

  it("falls back to first and last name when displayName is null", () => {
    expect(getInitials(null, "Stephen", "Missah")).toBe("SM");
  });

  it("returns an empty string when everything is empty", () => {
    expect(getInitials(null, "", "")).toBe("");
  });
});
