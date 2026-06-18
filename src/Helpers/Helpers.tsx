import type { Response } from "../models/globalTypes";

export const isQuestionnaireCheckInDue = (date: string, frequency: string) => {
  const now = new Date();
  const d = new Date(date);

  const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);

  if (frequency === "daily") return diffDays >= 1;
  if (frequency === "weekly") return diffDays >= 7;
  if (frequency === "fortnightly") return diffDays >= 14;

  return false;
};

export const getResponseDate = (response: Response) => response.submitted_at ?? response.created_at ?? "";

export const getInitials = (displayName: string | null, firstName = "", lastName = ""): string => {
  const name = displayName?.trim() || `${firstName} ${lastName}`.trim();
  const parts = name.split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
};

export const AVATAR_COLORS = ["teal", "sage", "stone", "sky", "clay"] as const;
export type AvatarColor = (typeof AVATAR_COLORS)[number];
export const pickColor = (userId: string): AvatarColor =>
  AVATAR_COLORS[userId.charCodeAt(0) % AVATAR_COLORS.length];

export const isAdultFromDob = (dob: string | null | undefined): boolean => {
  if (!dob) return false;
  const birth = new Date(dob);
  const now = new Date();
  const age = now.getFullYear() - birth.getFullYear();
  const hadBirthday = now >= new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  return age > 18 || (age === 18 && hadBirthday);
};
