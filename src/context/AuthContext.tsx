import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchProfile = async (authUser) => {
    if (!authUser) return null;
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();
    if (error) { console.error("fetchProfile error:", error.message); return null; }
    return data;
  };

  useEffect(() => {
    // Fetch profile separately from onAuthStateChange to avoid Supabase deadlock
    const loadProfile = async (authUser) => {
      if (!authUser) { setProfile(null); return; }
      const profile = await fetchProfile(authUser);
      setProfile(profile);
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);
      loadProfile(currentUser);
    });

    let currentUserId = null;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser?.id !== currentUserId) {
          currentUserId = currentUser?.id ?? null;
          loadProfile(currentUser);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); throw error; }
  };

  const signUp = async (email, password, meta) => {
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password, options: { data: meta } });
    if (error) { setError(error.message); throw error; }
  };

  const signOut = async () => {
    setError(null);
    const { error } = await supabase.auth.signOut();
    if (error) console.error("signOut error:", error.message);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      error,
      loading,
      isAuthenticated: !!user,
      isAdmin: profile?.role === "admin",
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
