import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null); // rename to authUser
  const [profile, setProfile] = useState(null); // rename to user aprole
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const prevUserIdRef = useRef(null);

  const fetchProfile = async (authUser) => {
    if (!authUser) return null;

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

  useEffect(() => {
    const handleSession = async (session) => {
      const authUser = session?.user ?? null; //rename to session user
      const newUserId = authUser?.id ?? null;

      setUser(authUser);

      // Only refetch profile if user actually changed
      if (newUserId !== prevUserIdRef.current) {
        prevUserIdRef.current = newUserId;

        if (authUser) {
          const profileData = await fetchProfile(authUser);
          setProfile(profileData);
        } else {
          setProfile(null);
        }
      }

      setLoading(false);
    };

    // Subscribe to auth changes (handles initial load too)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        handleSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      throw error;
    }
  };

  const signUp = async (email, password, meta) => {
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: meta },
    });

    if (error) {
      setError(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    setError(null);
    const { error } = await supabase.auth.signOut();
    if (error) console.error("signOut error:", error.message);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        error,
        loading,
        isAuthenticated: !!user,
        isAdmin: profile?.role === "admin",
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}