// ============================================================
// STORE CONFIGURATION
//
// Redux Toolkit's configureStore() wires everything together.
// Each slice gets its own "key" in the state tree.
//
// Final state shape:
// {
//   auth:             { currentUser, isAuthenticated, loginError },
//   users:            { users: [...] },
//   questionnaires:   { questionnaires: [...] },
//   responses:        { responses: [...] },
//   resources:        { resources: [...] },
//   theme:            { mode: 'light' | 'dark' },
// }
// ============================================================

import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import questionnairesReducer from "./slices/questionnairesSlice";
import resourcesReducer from "./slices/resourcesSlice";
import responsesReducer from "./slices/responsesSlice";
import themeReducer from "./slices/themeSlice";
import usersReducer from "./slices/usersSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    questionnaires: questionnairesReducer,
    responses: responsesReducer,
    resources: resourcesReducer,
    theme: themeReducer,
  },
  // RTK enables Redux DevTools Extension automatically in development
  // Install the browser extension to inspect state changes in real time!
});

// TypeScript users: export RootState & AppDispatch types here
// export type RootState = ReturnType<typeof store.getState>
// export type AppDispatch = typeof store.dispatch
