// ============================================================
// RESPONSES SLICE — client questionnaire submissions
// ============================================================

import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabase.js";
import type { Response, ResponseScores } from "../../models/globalTypes.js";

type ResponsesState = {
  responses: Response[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: ResponsesState = {
  responses: [],
  status: "idle",
  error: null,
};

// ─── Thunks ────────────────────────────────────────────────

// Admin: fetch all responses across all users
export const fetchAllResponses = createAsyncThunk<Response[]>(
  "responses/fetchAllResponses",
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from("responses")
      .select("*")
      .order("submitted_at", { ascending: false });
    if (error) return rejectWithValue(error.message);
    return data;
  },
);

// Admin: fetch all responses for a specific client
export const fetchResponsesByUser = createAsyncThunk<Response[], string>(
  "responses/fetchResponsesByUser",
  async (userId, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from("responses")
      .select("*")
      .eq("user_id", userId)
      .order("submitted_at", { ascending: false });
    if (error) return rejectWithValue(error.message);
    return data;
  },
);

// Admin: fetch responses for a specific questionnaire (for analytics)
export const fetchResponsesByQuestionnaire = createAsyncThunk<
  Response[],
  string
>(
  "responses/fetchResponsesByQuestionnaire",
  async (questionnaireId, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from("responses")
      .select("*")
      .eq("questionnaire_id", questionnaireId)
      .order("submitted_at", { ascending: false });
    if (error) return rejectWithValue(error.message);
    return data;
  },
);

// Client: submit a completed questionnaire
export const submitResponse = createAsyncThunk<
  Response,
  { user_id: string; questionnaire_id: string; scores: ResponseScores }
>("responses/submitResponse", async (payload, { rejectWithValue }) => {
  const { data, error } = await supabase
    .from("responses")
    .insert({ ...payload, submitted_at: new Date().toISOString() })
    .select()
    .single();
  if (error) return rejectWithValue(error.message);
  return data;
});

// Admin: delete a response
export const deleteResponse = createAsyncThunk<string, string>(
  "responses/deleteResponse",
  async (id, { rejectWithValue }) => {
    const { error } = await supabase.from("responses").delete().eq("id", id);
    if (error) return rejectWithValue(error.message);
    return id;
  },
);

// ─── Slice ─────────────────────────────────────────────────

const responsesSlice = createSlice({
  name: "responses",
  initialState,
  reducers: {
    clearResponseError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllResponses.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllResponses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.responses = action.payload;
      })
      .addCase(fetchAllResponses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchResponsesByUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchResponsesByUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.responses = action.payload;
      })
      .addCase(fetchResponsesByUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchResponsesByQuestionnaire.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchResponsesByQuestionnaire.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.responses = action.payload;
      })
      .addCase(fetchResponsesByQuestionnaire.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(submitResponse.fulfilled, (state, action) => {
        state.responses.unshift(action.payload);
      })
      .addCase(submitResponse.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteResponse.fulfilled, (state, action) => {
        state.responses = state.responses.filter(
          (r) => r.id !== action.payload,
        );
      })
      .addCase(deleteResponse.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearResponseError } = responsesSlice.actions;

// ─── Selectors ─────────────────────────────────────────────

type RootState = { responses: ResponsesState };

export const selectAllResponses = (state: RootState) =>
  state.responses.responses;
export const selectResponsesStatus = (state: RootState) =>
  state.responses.status;
export const selectResponsesError = (state: RootState) => state.responses.error;

// All responses for a user, oldest first (for trend/progress charts)
export const selectResponsesByUser = (userId: string) =>
  createSelector(selectAllResponses, (responses) =>
    responses
      .filter((r) => r.user_id === userId)
      .sort(
        (a, b) =>
          new Date(a.submitted_at).getTime() -
          new Date(b.submitted_at).getTime(),
      ),
  );

// Responses for a user + specific questionnaire (progress tracking)
export const selectUserQuestionnaireResponses = (
  userId: string,
  questionnaireId: string,
) =>
  createSelector(selectAllResponses, (responses) =>
    responses
      .filter(
        (r) => r.user_id === userId && r.questionnaire_id === questionnaireId,
      )
      .sort(
        (a, b) =>
          new Date(a.submitted_at).getTime() -
          new Date(b.submitted_at).getTime(),
      ),
  );

// Most recent response per questionnaire for a user (client dashboard summary)
export const selectLatestResponsesByUser = (userId: string) =>
  createSelector(selectAllResponses, (responses) => {
    const userResponses = responses.filter((r) => r.user_id === userId);
    const latest = new Map<string, Response>();
    for (const r of userResponses) {
      const existing = latest.get(r.questionnaire_id);
      if (
        !existing ||
        new Date(r.submitted_at) > new Date(existing.submitted_at)
      ) {
        latest.set(r.questionnaire_id, r);
      }
    }
    return Array.from(latest.values());
  });

export default responsesSlice.reducer;
