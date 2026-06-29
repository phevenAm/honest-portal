import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

afterEach(cleanup);
import ProgressChart, { buildTagChartData, getResponseDate } from "./ProgressChart";
import type { Question, Response } from "@models/globalTypes";

// ─── Fixtures ──────────────────────────────────────────────

const tag1 = { id: "tag-sleep", name: "Sleep" };
const tag2 = { id: "tag-mood", name: "Mood" };

const makeQuestion = (id: string, tag?: { id: string; name: string }): Question =>
  ({
    id,
    type: "scale",
    text: "Question text",
    questionnaire_id: "q1",
    order_index: 1,
    is_required: true,
    tag_id: tag?.id ?? null,
    tag: tag,
  }) as unknown as Question;

const makeResponse = (id: string, scores: Record<string, number>, submittedAt = "2024-01-15"): Response =>
  ({
    id,
    submitted_at: submittedAt,
    scores,
    questionnaire_id: "q1",
    user_id: "u1",
  }) as unknown as Response;

// ─── getResponseDate ────────────────────────────────────────

const dummyResponse = { submitted_at: null, created_at: null } as unknown as Response;

describe("getResponseDate", () => {
  it("returns empty string when neither date is set", () => {
    expect(getResponseDate(dummyResponse)).toBe("");
  });

  it("prefers submitted_at over created_at", () => {
    const r = { submitted_at: "2024-06-01", created_at: "2024-01-01" } as unknown as Response;
    expect(getResponseDate(r)).toBe("2024-06-01");
  });
});

// ─── buildTagChartData ──────────────────────────────────────

describe("buildTagChartData", () => {
  it("produces one data point per response", () => {
    const questions = [makeQuestion("q1", tag1)];
    const responses = [makeResponse("r1", { q1: 7 }), makeResponse("r2", { q1: 5 }, "2024-01-22")];
    const data = buildTagChartData(responses, questions);
    expect(data).toHaveLength(2);
  });

  it("averages scores for questions sharing the same tag", () => {
    const questions = [makeQuestion("q1", tag1), makeQuestion("q2", tag1)];
    const responses = [makeResponse("r1", { q1: 8, q2: 6 })];
    const data = buildTagChartData(responses, questions);
    expect(data[0][tag1.id]).toBe(7);
  });

  it("keeps different tags as separate keys on the data point", () => {
    const questions = [makeQuestion("q1", tag1), makeQuestion("q2", tag2)];
    const responses = [makeResponse("r1", { q1: 8, q2: 4 })];
    const data = buildTagChartData(responses, questions);
    expect(data[0][tag1.id]).toBe(8);
    expect(data[0][tag2.id]).toBe(4);
  });

  it("excludes questions with no tag", () => {
    const questions = [makeQuestion("q1", tag1), makeQuestion("q2")];
    const responses = [makeResponse("r1", { q1: 6, q2: 10 })];
    const data = buildTagChartData(responses, questions);
    expect(data[0][tag1.id]).toBe(6);
    expect(data[0]["undefined"]).toBeUndefined();
  });

  it("skips zero scores from the average", () => {
    const questions = [makeQuestion("q1", tag1), makeQuestion("q2", tag1)];
    const responses = [makeResponse("r1", { q1: 8, q2: 0 })];
    const data = buildTagChartData(responses, questions);
    // q2 has score 0 so only q1 contributes → avg = 8
    expect(data[0][tag1.id]).toBe(8);
  });

  it.each([
    [{ q1: 7, q2: 3 }, 5],
    [{ q1: 10, q2: 10 }, 10],
    [{ q1: 1, q2: 9 }, 5],
  ])("averages %o to %d", (scores, expected) => {
    const questions = [makeQuestion("q1", tag1), makeQuestion("q2", tag1)];
    const responses = [makeResponse("r1", scores)];
    const [point] = buildTagChartData(responses, questions);
    expect(point[tag1.id]).toBe(expected);
  });
});

// ─── ProgressChart component ────────────────────────────────

const mockQuestions = [makeQuestion("q1", tag1)];
const mockResponses = [makeResponse("r1", { q1: 7 })];

describe("ProgressChart", () => {
  it("shows check-in count and no error state when data is valid", () => {
    render(<ProgressChart responses={mockResponses} questions={mockQuestions} />);
    expect(screen.getByText("1 check-in tracked")).toBeInTheDocument();
    expect(screen.queryByText(/no responses yet/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/no tags assigned/i)).not.toBeInTheDocument();
  });

  it("shows empty state when there are no responses", () => {
    render(<ProgressChart responses={[]} questions={mockQuestions} />);
    expect(screen.getByText(/no responses yet/i)).toBeInTheDocument();
  });

  it("falls back to per-question lines when no tags are assigned", () => {
    const untaggedQuestions = [makeQuestion("q1")];
    render(<ProgressChart responses={mockResponses} questions={untaggedQuestions} />);
    // fallback renders the chart — no empty-state message shown
    expect(screen.queryByText(/no tags assigned/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/no responses yet/i)).not.toBeInTheDocument();
  });
});
