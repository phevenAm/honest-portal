//This replaces the mock auth in Redux. React Context is the right tool here because 
//auth state needs to be available everywhere, and Supabase manages the session for you:
//jsx

import React, {createContext, useContext, useEffect, useState} from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});
// Hook — any component can call useAuth() to get the current user
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true); // true while we check existing session


 useEffect(() => {
    // Check if there's already a session (e.g. user refreshed the page)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for sign in / sign out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // Cleanup listener when component unmounts
    return () => subscription.unsubscribe()
  }, []);

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

const signUp = async (email, password, { firstName, lastName, dob }) => {
  const { error } = await supabase.auth.signUp({ 
    email, 
    password, 
    options: { 
      data: { 
        first_name: firstName, 
        last_name: lastName, 
        dob 
      } 
    } 
  })
  if (error) throw error
}
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // Don't render children until we know the auth state
  // This prevents a flash of the login page for already-logged-in users
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#faf9f7' }}>
      <p style={{ color: '#9e9894', fontFamily: 'Georgia, serif' }}>Loading…</p>
    </div>
  )

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut  }}>
      {children}
    </AuthContext.Provider>
  )

}