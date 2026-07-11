import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { supabase } from "@/lib/supabase.js";
import type { AuditLog } from "@/models/globalTypes.js";

type AuditLogsState = {
  logs: AuditLog[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: AuditLogsState = {
  logs: [],
  status: "idle",
  error: null,
};

// ─── Thunks ────────────────────────────────────────────────

export const fetchAuditLogs = createAsyncThunk<AuditLog[]>(
  "auditLogs/fetchAuditLogs",
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*, actor:users(first_name, last_name)")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) return rejectWithValue(error.message);
    return data as AuditLog[];
  },
);

// ─── Slice ─────────────────────────────────────────────────

const auditLogsSlice = createSlice({
  name: "auditLogs",
  initialState,
  reducers: {
    resetAuditLogs: (state) => {
      state.status = "idle";
      state.logs = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.logs = action.payload;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase("RESET_ALL", () => initialState);
  },
});

// ─── Selectors ─────────────────────────────────────────────

type RootState = { auditLogs: AuditLogsState };

export const selectAllAuditLogs = (state: RootState) => state.auditLogs.logs;
export const selectAuditLogsStatus = (state: RootState) => state.auditLogs.status;

export const { resetAuditLogs } = auditLogsSlice.actions;

export default auditLogsSlice.reducer;
