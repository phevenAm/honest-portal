import { describe, expect, it } from "vitest";

import { Resource } from "../../../models/globalTypes";
import resourcesReducer, { fetchResources } from "../resourcesSlice";

type ResourcesState = {
  resources: Resource[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: ResourcesState = {
  resources: [],
  status: "idle",
  error: null,
};

const resourceDummy: Resource = {
  id: "123123",
  created_at: "123213",
  updated_at: "123123",
  title: "1231231",
  type: "video",
  ispublished: false,
};

const dummyError = new Error("something went wrong");

describe("resources reducer", () => {
  it("sets status to loading when fetchResources is pending", () => {
    const result = resourcesReducer(initialState, fetchResources.pending("", undefined));
    expect(result.status).toBe("loading");
  });

  it("sets status to succeeded when fetchResources is fullfiled", () => {
    const result = resourcesReducer(initialState, fetchResources.fulfilled([resourceDummy], ""));
    expect(result.status).toBe("succeeded");
    expect(result.resources).toEqual([resourceDummy]);
  });

  it("sets state status to failed if reject", () => {
    const result = resourcesReducer(initialState, fetchResources.rejected(null, "", undefined, "something went wrong"));
    expect(result.status).toBe("failed");
    expect(result.error).toBe(dummyError.message);
  });
});
