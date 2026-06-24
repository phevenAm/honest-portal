import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { supabase } from "../../lib/supabase.js";
import type { UserProfile } from "../../models/globalTypes.js";

type UserDirectoryState = {
  users: UserProfile[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: UserDirectoryState = {
  users: [],
  status: "idle",
  error: null,
};

export const fetchAllUsers = createAsyncThunk("userDirectory/fetchAllUsers", async (_, { rejectWithValue }) => {
  const { data, error } = await supabase.from("users").select("*");

  if (error) return rejectWithValue(error.message);

  return data;
});

export const deleteUser = createAsyncThunk("userDirectory/deleteUser", async (id: string, { rejectWithValue }) => {
  const { error } = await supabase.rpc("delete_user_by_id", { target_user_id: id });

  if (error) return rejectWithValue(error.message);

  return id;
});

export const deleteOwnAccount = createAsyncThunk("userDirectory/deleteOwnAccount", async (id: string, { rejectWithValue }) => {
  const { error } = await supabase.rpc("delete_own_account");

  if (error) return rejectWithValue(error.message);

  return id;
});

const userDirectorySlice = createSlice({
  name: "userDirectory",
  initialState,
  reducers: {
    addUser: (state, action) => {
      const exists = state.users.find((u) => u.email === action.payload.email);

      if (!exists) {
        state.users.push({
          id: `user-${Date.now()}`,
          firstName: action.payload.first_name,
          lastName: action.payload.last_name,
          role: action.payload.role,
          joinedAt: new Date().toISOString().split("T")[0],
          avatar: action.payload.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase(),
          color: ["sage", "lavender", "blush", "sky", "peach"][state.users.length % 5],
          ...action.payload,
        });
      }
    },
    updateUser: (state, action) => {
      const index = state.users.findIndex((u) => u.id === action.payload.id);

      if (index !== -1) {
        state.users[index] = {
          ...state.users[index],
          ...action.payload,
        };
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = state.users.filter((u) => u.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(deleteOwnAccount.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      })
      .addCase(deleteOwnAccount.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { addUser, updateUser } = userDirectorySlice.actions;

// Selectors
export const selectAllUsers = (state: { userDirectory: UserDirectoryState }) => state.userDirectory.users;

export const selectUserById = (id: string) => (state: { userDirectory: UserDirectoryState }) =>
  state.userDirectory.users.find((u) => u.id === id);

export const selectClientUsers = (state: { userDirectory: UserDirectoryState }) =>
  state.userDirectory.users.filter((u) => u.role === "client");
export const selectUserCount = (state: { userDirectory: UserDirectoryState }) => state.userDirectory.users.length;

export default userDirectorySlice.reducer;
