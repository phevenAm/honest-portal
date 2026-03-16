import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabase.js";
import type { User } from "../../models/globalTypes.js";

export const signUp = createAsyncThunk(
  "auth/signUp",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return rejectWithValue(error.message);
    return data.user;
  },
);

export const signIn = createAsyncThunk(
  "auth/signIn",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return rejectWithValue(error.message);

    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    const { first_name, last_name, dob } = data.user.user_metadata || 
      data.user.identities?.[0]?.identity_data || {};

    const profile: User = {
      id:         data.user.id,
      email:      data.user.email ?? '',
      first_name: first_name ?? '',
      last_name:  last_name ?? '',
      dob:        dob ?? '',
      role:       profileData?.role ?? 'user',
    }

    return { user: data.user, profile }
  },
);

export const signOut = createAsyncThunk("auth/signOut", async () => {
  await supabase.auth.signOut();
});

export const getSession = createAsyncThunk("auth/getSession", async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    currentUser: null as any,
    profile:     null as User | null,
    isAuthenticated: false,
    loading: false,
    error: null as string | null,
  },
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder.addCase(signIn.pending,    (state) => { state.loading = true; state.error = null })
    builder.addCase(signIn.fulfilled,  (state, action) => {
      state.loading = false
      state.isAuthenticated = true
      state.currentUser = action.payload.user
      state.profile     = action.payload.profile
    })
    builder.addCase(signIn.rejected,   (state, action) => { state.loading = false; state.error = action.payload as string })

    builder.addCase(signUp.pending,    (state) => { state.loading = true; state.error = null })
    builder.addCase(signUp.fulfilled,  (state, action) => { state.loading = false; state.currentUser = action.payload; state.isAuthenticated = true })
    builder.addCase(signUp.rejected,   (state, action) => { state.loading = false; state.error = action.payload as string })

    builder.addCase(signOut.fulfilled, (state) => { state.currentUser = null; state.profile = null; state.isAuthenticated = false })

    builder.addCase(getSession.fulfilled, (state, action) => {
      state.currentUser    = action.payload
      state.isAuthenticated = !!action.payload
    })
  },
});

export const { clearError } = authSlice.actions;

export const selectCurrentUser     = (state: any) => state.auth.currentUser;
export const selectProfile         = (state: any) => state.auth.profile;
export const selectIsAuthenticated = (state: any) => state.auth.isAuthenticated;
export const selectAuthLoading     = (state: any) => state.auth.loading;
export const selectLoginError      = (state: any) => state.auth.error;
export const selectIsAdmin         = (state: any) => state.auth.profile?.role === 'admin';

export default authSlice.reducer;