import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { supabase } from "@/lib/supabase.js";
import type { Tag } from "@/models/globalTypes.js";

type TagsState = {
  tags: Tag[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: TagsState = {
  tags: [],
  status: "idle",
  error: null,
};

// ─── Thunks ────────────────────────────────────────────────

export const fetchTags = createAsyncThunk<Tag[]>("tags/fetchTags", async (_, { rejectWithValue }) => {
  const { data, error } = await supabase.from("tags").select("*").order("name");
  if (error) return rejectWithValue(error.message);
  return data;
});

export const createTag = createAsyncThunk<Tag, Pick<Tag, "name">>(
  "tags/createTag",
  async (payload, { rejectWithValue }) => {
    const { data, error } = await supabase.from("tags").insert(payload).select().single();
    if (error) return rejectWithValue(error.message);
    return data;
  },
);

export const updateTag = createAsyncThunk<Tag, Pick<Tag, "id" | "name">>(
  "tags/updateTag",
  async ({ id, ...fields }, { rejectWithValue }) => {
    const { data, error } = await supabase.from("tags").update(fields).eq("id", id).select().single();
    if (error) return rejectWithValue(error.message);
    return data;
  },
);

export const deleteTag = createAsyncThunk<string, string>("tags/deleteTag", async (id, { rejectWithValue }) => {
  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) return rejectWithValue(error.message);
  return id;
});

// ─── Slice ─────────────────────────────────────────────────

const tagsSlice = createSlice({
  name: "tags",
  initialState,
  reducers: {
    clearTagError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTags.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tags = action.payload;
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(createTag.fulfilled, (state, action) => {
        state.tags.push(action.payload);
        state.tags.sort((a, b) => a.name.localeCompare(b.name));
      })
      .addCase(createTag.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateTag.fulfilled, (state, action) => {
        const index = state.tags.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) state.tags[index] = action.payload;
      })
      .addCase(updateTag.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteTag.fulfilled, (state, action) => {
        state.tags = state.tags.filter((t) => t.id !== action.payload);
      })
      .addCase(deleteTag.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearTagError } = tagsSlice.actions;

// ─── Selectors ─────────────────────────────────────────────

type RootState = { tags: TagsState };

export const selectAllTags = (state: RootState) => state.tags.tags;
export const selectTagsStatus = (state: RootState) => state.tags.status;
export const selectTagById = (id: string | null) => (state: RootState) =>
  id ? state.tags.tags.find((t) => t.id === id) : undefined;

export default tagsSlice.reducer;
