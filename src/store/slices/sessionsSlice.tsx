import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { supabase } from "@/lib/supabase.js";
import type { Session, SessionStatus } from "@/models/globalTypes.js";

type SessionsState = {
  sessions: Session[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: SessionsState = {
  sessions: [],
  status: "idle",
  error: null,
};

type CreateSessionPayload = Omit<Session, "id" | "created_at" | "status">;

export const createSession = createAsyncThunk<Session, CreateSessionPayload>(
  "sessions/createSession",
  async (payload, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from("sessions")
      .insert({ ...payload })
      .select("*")
      .single();

    if (error) {
      return rejectWithValue(error.message || "Failed to create session");
    }
    return data;
  },
);
export const fetchSessionsByClientId = createAsyncThunk<Session[], string>(
  "sessions/fetchSessionsByClientId",
  async (clientId, { rejectWithValue }) => {
    const { data, error } = await supabase.from("sessions").select("*").eq("client_id", clientId);

    if (error) return rejectWithValue(error.message ?? "Failed to get your sessions, sorry!");

    return data ?? [];
  },
);

export const updateSession = createAsyncThunk<
  Session,
  { id: string } & Partial<Pick<Session, "status" | "attended" | "paid" | "notes" | "scheduled_at">>
>("sessions/updateSession", async (sessionToUpdate, { rejectWithValue }) => {
  const { id, ...fields } = sessionToUpdate;
  const { data, error } = await supabase.from("sessions").update(fields).eq("id", id).select("*").single();

  if (error) return rejectWithValue(error.message || "Failed to update session. Please try again later");
  return data;
});

export const fetchAllSessions = createAsyncThunk<Session[], void, { rejectValue: string }>(
  "sessions/fetchAllSessions",
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase.from("sessions").select("*").order("scheduled_at", { ascending: false });
    if (error) return rejectWithValue(error?.message ?? "Something went wrong, could not get sessions!");

    return data ?? [];
  },
);

const sessionsSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    clearResponseError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      //-----fetch all sessions
      .addCase(fetchAllSessions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllSessions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.sessions = action.payload;
      })
      .addCase(fetchAllSessions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      //-----fetch sessions by client
      .addCase(fetchSessionsByClientId.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSessionsByClientId.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.sessions = action.payload.sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
      })
      .addCase(fetchSessionsByClientId.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      //-----create session
      .addCase(createSession.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.sessions.push(action.payload);
        state.sessions.sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
      })
      .addCase(createSession.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      //-----update session
      .addCase(updateSession.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateSession.fulfilled, (state, action) => {
        const targetIndex = state.sessions.findIndex((s) => s.id === action.payload.id);

        if (targetIndex !== -1) {
          state.sessions[targetIndex] = action.payload;
        }

        state.status = "succeeded";
      })
      .addCase(updateSession.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { clearResponseError } = sessionsSlice.actions;
export default sessionsSlice.reducer;
