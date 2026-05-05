import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { AuthUser, UserProfile } from "../models/globalTypes";
import type { Session } from "@supabase/supabase-js";

type AuthContextType = {
  authUser: AuthUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    meta?: any,
    accessToken?: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const prevUserIdRef = useRef<string | null>(null);

  const fetchProfile = async (
    authUser: AuthUser,
  ): Promise<UserProfile | null> => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (error) {
      console.error("fetchProfile error:", error.message);
      return null;
    }

    return data;
  };

  const handleSession = async (session: Session | null) => {
    const authUser = session?.user ?? null;
    const newUserId = authUser?.id ?? null;

    setAuthUser(authUser);

    if (newUserId !== prevUserIdRef.current) {
      prevUserIdRef.current = newUserId;

      if (authUser) {
        const profileData = await fetchProfile(authUser);
        setUserProfile(profileData);
      } else {
        setUserProfile(null);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    let initialised = false;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      await handleSession(data.session);
      initialised = true;
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("onAuthStateChange event:", event);
      if (!initialised) return;
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    meta?: any,
    accessToken?: string,
  ) => {
    setError(null);

    const cleanedToken = accessToken?.trim();

    if (!cleanedToken) {
      const message = "Access token is required";
      setError(message);
      throw new Error(message);
    }

    const { data: tokenRow, error: tokenError } = await supabase
      .from("platform_access_token")
      .select("id, token, is_used")
      .eq("token", cleanedToken)
      .maybeSingle();

    if (tokenError) {
      throw new Error(tokenError.message);
    }

    if (!tokenRow) {
      throw new Error("Invalid access token.");
    }

    if (tokenRow.is_used) {
      throw new Error("This access token has already been used.");
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: meta },
    });

    if (signUpError) {
      setError(signUpError.message);
      throw signUpError;
    }

    const { error: updateTokenError } = await supabase
      .from("platform_access_token")
      .update({ is_used: true })
      .eq("id", tokenRow.id);

    if (updateTokenError) {
      setError(updateTokenError.message);
      throw updateTokenError;
    }
  };

  const signOut = async () => {
    setError(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("signOut error:", error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authUser,
        userProfile,
        error,
        loading,
        isAuthenticated: !!authUser,
        isAdmin: userProfile?.role === "admin",
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
