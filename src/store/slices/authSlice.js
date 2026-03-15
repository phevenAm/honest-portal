import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase.js'

// ── Async thunks ──────────────────────────────────────────
// createAsyncThunk handles the pending/fulfilled/rejected states for you

export const signUp = createAsyncThunk('auth/signUp', async ({ email, password }, { rejectWithValue }) => {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return rejectWithValue(error.message)
  return data.user
})

export const signIn = createAsyncThunk('auth/signIn', async ({ email, password }, { rejectWithValue }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return rejectWithValue(error.message)
  return data.user
})

export const signOut = createAsyncThunk('auth/signOut', async () => {
  await supabase.auth.signOut()
})

export const getSession = createAsyncThunk('auth/getSession', async () => {
  const { data } = await supabase.auth.getSession()
  return data.session?.user ?? null
})

// ── Slice ─────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    currentUser:     null,
    isAuthenticated: false,
    loading:         false,
    error:           null,
  },
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    // Sign in
    builder.addCase(signIn.pending,    (state) => { state.loading = true; state.error = null })
    builder.addCase(signIn.fulfilled,  (state, action) => { state.loading = false; state.currentUser = action.payload; state.isAuthenticated = true })
    builder.addCase(signIn.rejected,   (state, action) => { state.loading = false; state.error = action.payload })
    // Sign up
    builder.addCase(signUp.pending,    (state) => { state.loading = true; state.error = null })
    builder.addCase(signUp.fulfilled,  (state, action) => { state.loading = false; state.currentUser = action.payload; state.isAuthenticated = true })
    builder.addCase(signUp.rejected,   (state, action) => { state.loading = false; state.error = action.payload })
    // Sign out
    builder.addCase(signOut.fulfilled, (state) => { state.currentUser = null; state.isAuthenticated = false })
    // Restore session on page load
    builder.addCase(getSession.fulfilled, (state, action) => { state.currentUser = action.payload; state.isAuthenticated = !!action.payload })
  },
})

export const { clearError } = authSlice.actions

export const selectCurrentUser    = (state) => state.auth.currentUser
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectAuthLoading    = (state) => state.auth.loading
export const selectLoginError     = (state) => state.auth.error
// Role is now stored in Supabase user_metadata
export const selectIsAdmin        = (state) => state.auth.currentUser?.user_metadata?.role === 'admin'

export default authSlice.reducer