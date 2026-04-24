// ============================================================
// RESPONSES SLICE — stores client questionnaire submissions
// ============================================================

import { createSlice } from '@reduxjs/toolkit';
import { MOCK_RESPONSES } from '../../data/mockData';

const initialState = {
  responses: MOCK_RESPONSES,
};

const responsesSlice = createSlice({
  name: 'responses',
  initialState,
  reducers: {
    submitResponse: (state, action) => {
      state.responses.push({
        id: `resp-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        ...action.payload,
      });
    },
  },
});

export const { submitResponse } = responsesSlice.actions;

// Get all responses for a specific user
export const selectResponsesByUser = (userId) => (state) =>
  state.responses.responses.filter(r => r.userId === userId);

// Get responses for a specific user + questionnaire, sorted oldest → newest
export const selectUserQuestionnaireResponses = (userId, questionnaireId) => (state) =>
  state.responses.responses
    .filter(r => r.userId === userId && r.questionnaireId === questionnaireId)
    .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));

export default responsesSlice.reducer;
