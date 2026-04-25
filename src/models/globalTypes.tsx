export type Role = 'admin' | 'user';

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