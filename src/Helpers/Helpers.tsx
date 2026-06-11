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

export const getInitials = (
  displayName: string | null,
  firstName: string,
  lastName: string
): string => {
  const name = displayName?.trim() || `${firstName} ${lastName}`;
  return name
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const isAdultFromDob = (dob: string | null | undefined): boolean => {
  if (!dob) return false;
  const birth = new Date(dob);
  const now = new Date();
  const age = now.getFullYear() - birth.getFullYear();
  const hadBirthday =
    now >= new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  return age > 18 || (age === 18 && hadBirthday);
};