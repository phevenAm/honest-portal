// ============================================================
// RESOURCES SLICE — articles, videos, and other content
// ============================================================

import { createSlice } from '@reduxjs/toolkit';
import { MOCK_RESOURCES } from '../../data/mockData';

const initialState = {
  resources: MOCK_RESOURCES,
};

const resourcesSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    addResource: (state, action) => {
      state.resources.push({
        id: `res-${Date.now()}`,
        publishedAt: new Date().toISOString().split('T')[0],
        isPublished: false,
        ...action.payload,
      });
    },
    updateResource: (state, action) => {
      const index = state.resources.findIndex(r => r.id === action.payload.id);
      if (index !== -1) state.resources[index] = { ...state.resources[index], ...action.payload };
    },
    deleteResource: (state, action) => {
      state.resources = state.resources.filter(r => r.id !== action.payload);
    },
    togglePublished: (state, action) => {
      const r = state.resources.find(r => r.id === action.payload);
      if (r) r.isPublished = !r.isPublished;
    },
  },
});

export const { addResource, updateResource, deleteResource, togglePublished } = resourcesSlice.actions;

export const selectAllResources       = (state) => state.resources.resources;
export const selectPublishedResources = (state) => state.resources.resources.filter(r => r.isPublished);
export const selectResourcesByType    = (type) => (state) => state.resources.resources.filter(r => r.type === type && r.isPublished);

export default resourcesSlice.reducer;
