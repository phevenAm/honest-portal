import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { supabase } from "@/lib/supabase.js";
import type { Session, SessionStatus } from "@/models/globalTypes.js";

// Admin fetches join client_stubs so the calendar can show a client name.
// Client fetches skip the join (RLS blocks client_stubs reads for non-admins).
export type SessionWithStub = Session & {
  client_stubs: { first_name: string; last_name: string } | null;
};

type SessionsState = {
  sessions: SessionWithStub[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: SessionsState = {
  sessions: [],
  status: "idle",
  error: null,
};

type CreateSessionPayload = {
  stub_id: string;
  scheduled_at: string;
  duration_minutes?: number;
  notes?: string;
  created_by: string;
};

export const createSession = createAsyncThunk<SessionWithStub, CreateSessionPayload>(
  "sessions/createSession",
  async (payload, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from("sessions")
      .insert({ ...payload })
      .select("*, client_stubs(first_name, last_name)")
      .single();

    if (error) {
      return rejectWithValue(error.message || "Failed to create session");
    }
    return data;
  },
);
export const fetchSessionsByClientId = createAsyncThunk<SessionWithStub[], string>(
  "sessions/fetchSessionsByClientId",
  async (clientIdPayload, { rejectWithValue }) => {
    const { data, error } = await supabase.from("sessions").select("*").eq("client_id", clientIdPayload);

    if (error) return rejectWithValue(error.message ?? "Failed to get your sessions, sorry!");

    return (data ?? []).map((session) => ({ ...session, client_stubs: null }));
  },
);

export const updateSession = createAsyncThunk<
  SessionWithStub,
  { id: string } & Partial<Pick<Session, "status" | "paid" | "notes" | "scheduled_at">>
>("sessions/updateSession", async (sessionToUpdate, { rejectWithValue }) => {
  const { id, ...fields } = sessionToUpdate;
  const { data, error } = await supabase
    .from("sessions")
    .update(fields)
    .eq("id", id)
    .select("*, client_stubs(first_name, last_name)")
    .single();

  if (error) return rejectWithValue(error.message || "Failed to update session. Please try again later");
  return data;
});

export const fetchAllSessions = createAsyncThunk<SessionWithStub[], void, { rejectValue: string }>(
  "sessions/fetchAllSessions",
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from("sessions")
      .select("*, client_stubs(first_name, last_name)")
      .order("scheduled_at", { ascending: false });
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
        state.status = "succeeded";

        const { id, ...rest } = action.payload;

        const targetIndex = state.sessions.indexOf(id);

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
