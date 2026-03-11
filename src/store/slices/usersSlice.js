// ============================================================
// USERS SLICE — manages the client list (admin operations)
// ============================================================

import { createSlice } from '@reduxjs/toolkit';
import { MOCK_USERS } from '../../data/mockData';

const initialState = {
  users: MOCK_USERS.filter(u => u.role === 'client'), // Only clients
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addUser: (state, action) => {
      // Check for duplicate email before adding
      const exists = state.users.find(u => u.email === action.payload.email);
      if (!exists) {
        state.users.push({
          id: `user-${Date.now()}`,
          role: 'client',
          joinedAt: new Date().toISOString().split('T')[0],
          avatar: action.payload.name.split(' ').map(n => n[0]).join('').toUpperCase(),
          color: ['sage', 'lavender', 'blush', 'sky', 'peach'][state.users.length % 5],
          ...action.payload,
        });
      }
    },
    removeUser: (state, action) => {
      // action.payload = userId
      state.users = state.users.filter(u => u.id !== action.payload);
    },
    updateUser: (state, action) => {
      const index = state.users.findIndex(u => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...action.payload };
      }
    },
  },
});

export const { addUser, removeUser, updateUser } = usersSlice.actions;

// Selectors
export const selectAllUsers   = (state) => state.users.users;
export const selectUserById   = (id) => (state) => state.users.users.find(u => u.id === id);
export const selectUserCount  = (state) => state.users.users.length;

export default usersSlice.reducer;
