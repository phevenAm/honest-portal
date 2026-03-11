// ============================================================
// AUTH SLICE — Redux Toolkit
//
// Redux architecture lesson:
//   createSlice() bundles your: initial state + reducers + action creators
//   into one tidy object. You export the actions and the reducer separately.
//
//   Flow: Component dispatches action → reducer updates state → component re-renders
// ============================================================

import { createSlice } from '@reduxjs/toolkit';
import { MOCK_CREDENTIALS, MOCK_USERS } from '../../data/mockData';

// Shape of the auth state in the Redux store
const initialState = {
  currentUser: null,      // The logged-in user object (or null)
  isAuthenticated: false,
  loginError: null,
  // In a real app you'd store a JWT token here:
  // token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,

  // Reducers are pure functions: (currentState, action) => newState
  // RTK uses Immer under the hood, so you CAN "mutate" state directly here
  reducers: {
    loginSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
      state.loginError = null;
    },
    loginFailure: (state, action) => {
      state.loginError = action.payload;
      state.isAuthenticated = false;
      state.currentUser = null;
    },
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.loginError = null;
    },
    clearError: (state) => {
      state.loginError = null;
    },
  },
});

// Export actions (these are the "dispatch-able" functions)
export const { loginSuccess, loginFailure, logout, clearError } = authSlice.actions;

// ── Thunks ────────────────────────────────────────────────
// Thunks are functions that return functions — they let you do async work
// before dispatching to the store. RTK ships with createAsyncThunk but
// manual thunks like this are great for learning the pattern.

export const loginUser = (email, password) => (dispatch) => {
  const creds = MOCK_CREDENTIALS[email];
  if (creds && creds.password === password) {
    const user = MOCK_USERS.find(u => u.id === creds.userId);
    // In real app: const { data } = await axios.post('/api/auth/login', { email, password })
    dispatch(loginSuccess(user));
    return { success: true, role: user.role };
  } else {
    dispatch(loginFailure('Invalid email or password. Try admin@mindfulspace.com / admin123'));
    return { success: false };
  }
};

// ── Selectors ─────────────────────────────────────────────
// Selectors are functions that extract data from the store.
// Centralising them here means you change them in one place.
export const selectCurrentUser    = (state) => state.auth.currentUser;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectLoginError     = (state) => state.auth.loginError;
export const selectIsAdmin        = (state) => state.auth.currentUser?.role === 'admin';

export default authSlice.reducer;
