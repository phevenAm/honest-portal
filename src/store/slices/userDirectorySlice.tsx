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

export const fetchAllUsers = createAsyncThunk(
  "userDirectory/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase.from("users").select("*");

    if (error) return rejectWithValue(error.message);

    return data;
  },
);

export const deleteUser = createAsyncThunk(
  "userDirectory/deleteUser",
  async (id: string, { rejectWithValue }) => {
    console.log("deleting id;::deleteUser: ", id);
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id)
      .select();

    if (error) return rejectWithValue(error.message);

    return id;
  },
);

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
          color: ["sage", "lavender", "blush", "sky", "peach"][
            state.users.length % 5
          ],
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
        console.log("fulfilled delete payload", action.payload);

        state.status = "succeeded";
        state.users = state.users.filter((u) => u.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { addUser, updateUser } = userDirectorySlice.actions;

// Selectors
export const selectAllUsers = (state) => state.userDirectory.users;

export const selectUserById = (id) => (state) =>
  state.userDirectory.users.find((u) => u.id === id);

export const selectUserCount = (state) => state.userDirectory.users.length;

export default userDirectorySlice.reducer;
