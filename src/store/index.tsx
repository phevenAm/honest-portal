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

import { inspirationalQuotesApi } from "../services/inspirationalQuotesApi";
import assignmentsReducer from "./slices/questionnaireAssignmentsSlice";
import questionnairesReducer from "./slices/questionnairesSlice";
import resourcesReducer from "./slices/resourcesSlice";
import responsesReducer from "./slices/responsesSlice";
import tagsReducer from "./slices/tagsSlice";
import themeReducer from "./slices/themeSlice";
import userDirectoryReducer from "./slices/userDirectorySlice";

export const store = configureStore({
  reducer: {
    userDirectory: userDirectoryReducer,
    questionnaires: questionnairesReducer,
    assignments: assignmentsReducer,
    responses: responsesReducer,
    resources: resourcesReducer,
    tags: tagsReducer,
    theme: themeReducer,
    [inspirationalQuotesApi.reducerPath]: inspirationalQuotesApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(inspirationalQuotesApi.middleware as Middleware),
});

setupListeners(store.dispatch);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
