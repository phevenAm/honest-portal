import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { supabase } from "../../lib/supabase";
import type { Todo } from "../../models/globalTypes";

type ToDoState = {
  status: string;
  todos: Todo[];
  error: string | null;
};

const initialState: ToDoState = {
  status: "idle",
  todos: [],
  error: null,
};

export const fetchAllTodos = createAsyncThunk<Todo[], void, { rejectValue: string }>(
  "todos/fetchAllTodos",
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase.from("admin_todos").select("*").order("created_at", { ascending: false });

    if (error) return rejectWithValue(error.message || "Failed to fetch todo list, please reload and try again");

    return data ?? [];
  },
);

const todoSlice = createSlice({
  name: "todo",
  initialState,
  reducers: {
    clearResponseError: (state) => {
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase("RESET_ALL", () => initialState)
      .addCase(fetchAllTodos.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllTodos.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchAllTodos.fulfilled, (state, action) => {
        state.todos = action.payload;
        state.status = "succeeded";
      });
  },
});

export const { clearResponseError } = todoSlice.actions;
export default todoSlice.reducer;
