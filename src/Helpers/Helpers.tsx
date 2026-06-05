import type {
  Response,
} from "../models/globalTypes";

export const isQuestionnaireCheckInDue = (date: string, frequency: string) => {
  const now = new Date();
  const d = new Date(date);

  const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);

  if (frequency === "daily") return diffDays >= 1;
  if (frequency === "weekly") return diffDays >= 7;
  if (frequency === "fortnightly") return diffDays >= 14;

  return false;
};

export const getResponseDate = (response: Response) =>
  response.submitted_at ?? response.created_at ?? "";