// ============================================================
// REDUX STORE CONFIGURATION
//
// configureStore() from @reduxjs/toolkit:
//   - Sets up the store with Redux DevTools enabled
//   - Adds redux-thunk middleware by default
//   - Uses the provided slices as reducers
// ============================================================

import { configureStore, Middleware } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import userDirectoryReducer from "./slices/userDirectorySlice";
import questionnairesReducer from "./slices/questionnairesSlice";
import assignmentsReducer from "./slices/questionnaireAssignmentsSlice";
import responsesReducer from "./slices/responsesSlice";
import resourcesReducer from "./slices/resourcesSlice";
import themeReducer from "./slices/themeSlice";
import { inspirationalQuotesApi } from "../services/inspirationalQuotesApi";

export const store = configureStore({
  reducer: {
    userDirectory: userDirectoryReducer,
    questionnaires: questionnairesReducer,
    assignments: assignmentsReducer,
    responses: responsesReducer,
    resources: resourcesReducer,
    theme: themeReducer,
    [inspirationalQuotesApi.reducerPath]: inspirationalQuotesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(inspirationalQuotesApi.middleware as Middleware),
});

setupListeners(store.dispatch);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
