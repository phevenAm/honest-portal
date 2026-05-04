export type Role = "admin" | "user";

export type DBUser = {
  id: string;
  created_at: string;
  email: string;
  first_name: string;
  last_name: string;
  dob: string;
  role: Role;
  disabled: boolean;
};

export type UserProfile = DBUser & {
  avatar: string;
  color: string;
};

export type AuthUser = DBUser & {
  // id: string;
  email: string | null;
  // role: string;

  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;

  email_confirmed_at?: string | null;

  user_metadata?: {
    first_name?: string;
    last_name?: string;
    dob?: string;
    [key: string]: any; // allow extra fields
  };

  app_metadata?: {
    provider?: string;
    providers?: string[];
    [key: string]: any;
  };

  identities?: any[]; // you said you're fine with loose typing here

  [key: string]: any; // catch-all for anything else Supabase adds
};

//!Questionnare stuff

export enum QuestionnaireFrequency {
  WEEKLY = "weekly",
  DAILY = "daily",
  FORTNIGHTLY = "fortnightly",
}

export type Questionnaire = {
  id: string;
  title: string;
  description?: string;
  frequency: QuestionnaireFrequency;
  is_active: boolean;
  created_at: string;

  questions: Question[];

  assignedTo: string[]; // derived from assignments table
};

export type Question = {
  id: string;
  text: string;
  type: "scale" | "text";
  min_value?: number;
  max_value?: number;
  min_label?: string;
  max_label?: string;
  order_index: number;
  is_required: boolean;
};

//Claude below

// ============================================================
// GLOBAL TYPES — mirrors Supabase schema exactly
// ============================================================

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

// ─── Database models ───────────────────────────────────────

// users table
export type UserProfile = {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  role: UserRole | string;
  dob: string; // date stored as ISO string
  disabled: boolean;
};

// questionnaires table
export type Questionnaire = {
  id: string;
  created_at: string;
  title: string;
  description?: string;
  frequency: QuestionnaireFrequency;
  is_active: boolean;

  // joined via select
  questions: Question[];

  // derived from questionnaire_assignments
  assignedTo: string[];
};

// questions table
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

// questionnaire_assignments table
export type QuestionnaireAssignment = {
  id: string;
  questionnaire_id: string;
  user_id: string;
  assigned_at: string;

  // joined optionally
  questionnaires?: Pick<
    Questionnaire,
    "id" | "title" | "frequency" | "is_active"
  >;
  users?: Pick<UserProfile, "id" | "first_name" | "last_name">;
};

// responses table
export type Response = {
  id: string;
  created_at: string;
  user_id: string;
  questionnaire_id: string;
  scores: Record<string, unknown>; // jsonb — { questionId: score/answer }
  submitted_at: string;
};

// resources table
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
  tags?: string; // comma-separated or JSON string
  content_format?: ContentFormat | string;
  is_published: boolean;
};

// ─── App-level types (not in DB) ───────────────────────────

// Used in authSlice — enriched user object for the session
export type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  dob: string;
  role: UserRole | string;
  jointedAt: string;
  avatar: string; // initials e.g. "JD"
  color: string; // UI color token e.g. "sage"
  disabled: boolean;
};

// ─── Utility types ─────────────────────────────────────────

// Scores payload shape for a submitted response
// key = question id, value = answer (number for scale, string for text)
export type ResponseScores = Record<string, number | string>;

// Partial update helpers
export type UpdateQuestionnaire = Partial<
  Omit<Questionnaire, "id" | "created_at" | "questions" | "assignedTo">
> & { id: string };
export type UpdateUser = Partial<Omit<UserProfile, "id" | "created_at">> & {
  id: string;
};
export type UpdateResource = Partial<Omit<Resource, "id" | "created_at">> & {
  id: string;
};

/// Chart

export interface ProgressChartProps {
  responses: Response[];
  questionnaire: Questionnaire | null;
  title?: string;
}
