import type { Database, Tables } from "./database.types";

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

// ─── App types derived from DB schema ──────────────────────
// Each type uses Omit<Tables<'table'>, fields> & { stricterFields }
// Fields in the Omit list are re-added with stricter (non-null) types.
// Fields NOT in the Omit list are inherited from the DB type and
// automatically updated when the schema changes.

// Hand-typed until `npm run "update types"` is run after the tags migration.
// After: replace with Omit<Tables<"tags">, never> or just Tables<"tags">.
export type Tag = Tables<"tags">;

export type UserProfile = Omit<Tables<"users">, "age" | "first_name" | "role" | "disabled"> & {
  email: string;
  first_name: string;
  role: UserRole | string;
  disabled: boolean;
};

export type Questionnaire = Omit<Tables<"questionnaires">, "title" | "description" | "frequency" | "is_active"> & {
  title: string;
  description?: string;
  frequency: QuestionnaireFrequency;
  is_active: boolean;
  // joined — not in DB row
  questions: Question[];
  assignedTo: string[];
};

export type Question = Omit<
  Tables<"questions">,
  "questionnaire_id" | "text" | "type" | "order_index" | "is_required"
> & {
  questionnaire_id: string;
  text: string;
  type: QuestionType | "scale" | "text";
  order_index: number;
  is_required: boolean;
  // tag_id will be inherited from Tables<"questions"> after the migration + type regen.
  // Declared here so the rest of the app can use it before that step.
  tag_id: string | null;
  tag?: Pick<Tag, "id" | "name">;
};

export type QuestionnaireAssignment = Omit<
  Tables<"questionnaire_assignments">,
  "questionnaire_id" | "user_id" | "assigned_at"
> & {
  questionnaire_id: string;
  user_id: string;
  assigned_at: string;
  // join extensions
  questionnaires?: Pick<Questionnaire, "id" | "title" | "frequency" | "is_active">;
  users?: Pick<UserProfile, "id" | "first_name" | "last_name">;
};

export type Response = Omit<Tables<"responses">, "questionnaire_id" | "user_id" | "scores" | "submitted_at"> & {
  questionnaire_id: string;
  user_id: string;
  scores: Record<string, unknown>;
  submitted_at: string;
};

export type Resource = Omit<Tables<"resources">, "title" | "category" | "type" | "is_published" | "updated_at"> & {
  title: string;
  category: string;
  type: ResourceType | string;
  is_published: boolean;
  updated_at: string;
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
  questions: Question[];
  title?: string;
}

export type AuditLog = {
  id: string;
  created_at: string;
  actor_id: string | null;
  action: "INSERT" | "UPDATE" | "DELETE";
  table_name: string;
  record_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  actor?: Pick<UserProfile, "first_name" | "last_name"> | null;
};

export type SessionStatus = Database["public"]["Enums"]["session_status"];

export type Session = Tables<"sessions">;
