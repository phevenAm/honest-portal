// ============================================================
// QUESTIONNAIRES SLICE
// ============================================================

import { createSlice } from '@reduxjs/toolkit';
import { MOCK_QUESTIONNAIRES } from '../../data/mockData';

const initialState = {
  questionnaires: MOCK_QUESTIONNAIRES,
};

const questionnairesSlice = createSlice({
  name: 'questionnaires',
  initialState,
  reducers: {
    addQuestionnaire: (state, action) => {
      state.questionnaires.push({
        id: `q-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
        isActive: true,
        assignedTo: [],
        ...action.payload,
      });
    },
    updateQuestionnaire: (state, action) => {
      const index = state.questionnaires.findIndex(q => q.id === action.payload.id);
      if (index !== -1) state.questionnaires[index] = { ...state.questionnaires[index], ...action.payload };
    },
    deleteQuestionnaire: (state, action) => {
      state.questionnaires = state.questionnaires.filter(q => q.id !== action.payload);
    },
    toggleActive: (state, action) => {
      const q = state.questionnaires.find(q => q.id === action.payload);
      if (q) q.isActive = !q.isActive;
    },
  },
});

export const { addQuestionnaire, updateQuestionnaire, deleteQuestionnaire, toggleActive } = questionnairesSlice.actions;

export const selectAllQuestionnaires   = (state) => state.questionnaires.questionnaires;
export const selectActiveQuestionnaires = (state) => state.questionnaires.questionnaires.filter(q => q.isActive);
export const selectQuestionnaireById   = (id) => (state) => state.questionnaires.questionnaires.find(q => q.id === id);

export default questionnairesSlice.reducer;
