export type Role = "admin" | "client";

export type AuthUser = {
  id: string;
  email: string | null;
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at?: string | null;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    dob?: string;
    // biome-ignore lint/suspicious/noExplicitAny: Supabase user_metadata is an open-ended JSON object
    [key: string]: any;
  };
  app_metadata?: {
    provider?: string;
    providers?: string[];
    // biome-ignore lint/suspicious/noExplicitAny: Supabase app_metadata is an open-ended JSON object
    [key: string]: any;
  };
  // biome-ignore lint/suspicious/noExplicitAny: Supabase identities shape varies by provider
  identities?: any[];
  // biome-ignore lint/suspicious/noExplicitAny: catch-all for Supabase auth fields not in our schema
  [key: string]: any;
};

// ─── Enums ─────────────────────────────────────────────────

export enum QuestionnaireFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  FORTNIGHTLY = "fortnightly",
}

export enum UserRole {
  ADMIN = "admin",
  CLIENT = "client",
}

export enum QuestionType {
  SCALE = "scale",
  TEXT = "text",
}

export enum ResourceType {
  ARTICLE = "article",
  VIDEO = "video",
  AUDIO = "audio",
  DOCUMENT = "document",
  LINK = "link",
}

export enum ContentFormat {
  MARKDOWN = "markdown",
  HTML = "html",
  PLAIN = "plain",
}

// ─── App types (mirrors Supabase schema + app-level extensions) ────

export type UserProfile = {
  id: string;
  created_at: string;
  email: string;
  first_name: string;
  last_name: string;
  dob: string | null;
  role: UserRole | string;
  disabled: boolean;
  onboarding_completed: boolean;
  display_name: string | null;
  avatar_url: string | null;
  focus_keywords: string[] | null;
};

export type Questionnaire = {
  id: string;
  created_at: string;
  title: string;
  description?: string;
  frequency: QuestionnaireFrequency;
  is_active: boolean;
  questions: Question[];
  assignedTo: string[];
};

export type Question = {
  id: string;
  created_at?: string;
  questionnaire_id: string;
  text: string;
  type: QuestionType | "scale" | "text";
  min_label?: string;
  min_value?: number;
  max_label?: string;
  max_value?: number;
  order_index: number;
  is_required: boolean;
};

export type QuestionnaireAssignment = {
  id: string;
  questionnaire_id: string;
  user_id: string;
  assigned_at: string;
  questionnaires?: Pick<Questionnaire, "id" | "title" | "frequency" | "is_active">;
  users?: Pick<UserProfile, "id" | "first_name" | "last_name">;
};

export type Response = {
  id: string;
  created_at: string;
  user_id: string;
  questionnaire_id: string;
  scores: Record<string, unknown>;
  submitted_at: string;
};

export type Resource = {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  summary?: string;
  category: string;
  content?: string;
  type: ResourceType | string;
  url?: string;
  videoUrl?: string;
  content_format?: ContentFormat | string;
  is_published: boolean;
  is_sensitive: boolean;
};

// ─── Utility types ─────────────────────────────────────────

export type ResponseScores = Record<string, number | string>;

export type UpdateQuestionnaire = Partial<Omit<Questionnaire, "id" | "created_at" | "questions" | "assignedTo">> & {
  id: string;
};
export type UpdateUser = Partial<Omit<UserProfile, "id" | "created_at">> & {
  id: string;
};
export type UpdateResource = Partial<Omit<Resource, "id" | "created_at">> & {
  id: string;
};

export interface ProgressChartProps {
  responses: Response[];
  questionnaire: Questionnaire | null;
  title?: string;
}
