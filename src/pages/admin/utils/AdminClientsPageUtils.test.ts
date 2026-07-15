import { describe, expect, it, test } from "vitest";

import { Questionnaire, QuestionnaireFrequency, Response } from "@models/globalTypes";

import { generateAccessToken, getScoreAverage } from "./AdminClientsPageUtils";

describe("ageScoreAverage", () => {
  it("returns null if response and questionnaire are undefined", () => {
    expect(getScoreAverage(undefined, undefined)).toBe(null);
  });

  it("returns null if questionnaire has no scale questions", () => {
    const response: Response = {
      id: "123123123",
      created_at: "fakeDate",
      user_id: "fakeUserId",
      questionnaire_id: "weeklyQuestionnaireFake",
      scores: { id: "value" },
      submitted_at: "yesterday",
    };

    const mockQuestionnaire: Questionnaire = {
      id: "test123",
      created_at: "fakeDate",
      title: "Test Questionnaire",
      frequency: QuestionnaireFrequency.WEEKLY,
      is_active: true,
      assignedTo: [],
      questions: [
        {
          id: "123123123",
          questionnaire_id: "test123",
          text: "hello",
          type: "text",
          order_index: 1,
          is_required: true,
        },
      ],
    };

    expect(getScoreAverage(response, mockQuestionnaire)).toBe(null);
  });

  it("sums scale answers correctly", () => {
    const response: Response = {
      id: "123123123",
      created_at: "fakeDate",
      user_id: "fakeUserId",
      questionnaire_id: "weeklyQuestionnaireFake",
      scores: { "qId-1": "value", "qId-2": 4, "qId-3": 6, "qId-4": 5 },
      submitted_at: "yesterday",
    };

    const mockQuestionnaire: Questionnaire = {
      id: "questiionareID",
      created_at: "fakeDate",
      title: "Test Questionnaire",
      frequency: QuestionnaireFrequency.WEEKLY,
      is_active: true,
      assignedTo: [],
      questions: [
        {
          id: "qId-1",
          questionnaire_id: "questiionareID",
          text: "hello",
          type: "text",
          order_index: 1,
          is_required: true,
        },
        {
          id: "qId-2",
          questionnaire_id: "questiionareID",
          text: "hello",
          type: "scale",
          order_index: 1,
          is_required: true,
        },
        {
          id: "qId-3",
          questionnaire_id: "questiionareID",
          text: "hello",
          type: "scale",
          order_index: 1,
          is_required: true,
        },
        {
          id: "qId-4",
          questionnaire_id: "questiionareID",
          text: "hello",
          type: "scale",
          order_index: 1,
          is_required: true,
        },
      ],
    };

    expect(getScoreAverage(response, mockQuestionnaire)).toBe("5.0");
  });
});

describe("generateAccessToken", () => {
  const regExPattern = /^[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/i;

  it("creates a token in the correct format", () => {
    const accessToken = generateAccessToken();

    expect(accessToken).toMatch(regExPattern);
  });

  //!bad tokens
  const badTokens: string[] = ["asd-2-", "234-sdf-2333333", "3", "234234234-dfsdfsdfsdf-$$$$$", "----"];

  test.each(badTokens)(" %s does not match the regex", (dodgyToken) => {
    expect(dodgyToken).not.toMatch(regExPattern);
  });
});
