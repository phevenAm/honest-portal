// ============================================================
// REDUX STORE CONFIGURATION
//
// configureStore() from @reduxjs/toolkit:
//   - Sets up the store with Redux DevTools enabled
//   - Adds redux-thunk middleware by default
//   - Uses the provided slices as reducers
// ============================================================

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import questionnairesReducer from './slices/questionnairesSlice';
import responsesReducer from './slices/responsesSlice';
import resourcesReducer from './slices/resourcesSlice';
import themeReducer from './slices/themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    questionnaires: questionnairesReducer,
    responses: responsesReducer,
    resources: resourcesReducer,
    theme: themeReducer,
  },
});

export default store;
