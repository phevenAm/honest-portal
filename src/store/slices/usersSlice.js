// ============================================================
// USERS SLICE — manages the client list (admin operations)
// ============================================================

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabase.js";

const initialState = {
  users: [], // Start with empty, can add via admin UI
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
};

export const fetchUsers = createAsyncThunk(
  "users/fetchAll",
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("role", "client");

    console.log("Fetched users from Supabase:", data, error);

    if (error) return rejectWithValue(error.message);
    return data;
  },
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    addUser: (state, action) => {
      // Check for duplicate email before adding
      const exists = state.users.find((u) => u.email === action.payload.email);
      if (!exists) {
        state.users.push({
          id: `user-${Date.now()}`,
          role: "client",
          joinedAt: new Date().toISOString().split("T")[0],
          avatar: action.payload.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase(),
          color: ["sage", "lavender", "blush", "sky", "peach"][
            state.users.length % 5
          ],
          ...action.payload,
        });
      }
    },
    removeUser: (state, action) => {
      // action.payload = userId
      state.users = state.users.filter((u) => u.id !== action.payload);
    },
    updateUser: (state, action) => {
      const index = state.users.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUsers.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.users = action.payload;
    });
    builder.addCase(fetchUsers.rejected, (state) => {
      state.status = "failed";
    });
  },
});

export const { addUser, removeUser, updateUser } = usersSlice.actions;

// Selectors
export const selectAllUsers = (state) => state.users.users;
export const selectUserById = (id) => (state) =>
  state.users.users.find((u) => u.id === id);
export const selectUserCount = (state) => state.users.users.length;

export default usersSlice.reducer;
