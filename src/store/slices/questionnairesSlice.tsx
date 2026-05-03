import {
  createSlice,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabase.js";
import type {
  Questionnaire,
  UpdateQuestionnaire,
} from "../../models/globalTypes.js";

type QuestionnairesState = {
  questionnaires: Questionnaire[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: QuestionnairesState = {
  questionnaires: [],
  status: "idle",
  error: null,
};

export const fetchQuestionnaires = createAsyncThunk<Questionnaire[], void>(
  "questionnaires/fetchQuestionnaires",
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase.from("questionnaires").select(`
      *,
      questions (*)
    `);
    if (error) return rejectWithValue(error.message);
    return data;
  },
);

export const createQuestionnaire = createAsyncThunk<
  Questionnaire,
  Questionnaire
>("questionnaires/createQuestionnaire", async (data, { rejectWithValue }) => {
  const { data: questionnaire, error: questionnaireError } = await supabase
    .from("questionnaires")
    .insert({
      title: data.title,
      description: data.description,
      frequency: data.frequency,
      is_active: true,
    })
    .select()
    .single();

  if (questionnaireError) return rejectWithValue(questionnaireError.message);

  const questionRows = data.questions.map((question, index) => ({
    questionnaire_id: questionnaire.id,
    text: question.text,
    type: question.type,
    min_value: question.type === "scale" ? (question.min_value ?? 1) : null,
    max_value: question.type === "scale" ? (question.max_value ?? 10) : null,
    min_label: question.type === "scale" ? (question.min_label ?? null) : null,
    max_label: question.type === "scale" ? (question.max_label ?? null) : null,
    order_index: question.order_index ?? index + 1,
    is_required: question.is_required ?? true,
  }));

  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .insert(questionRows)
    .select();

  if (questionsError) return rejectWithValue(questionsError.message);

  return { ...questionnaire, questions };
});

export const updateQuestionnaire = createAsyncThunk<
  Questionnaire,
  UpdateQuestionnaire
>(
  "questionnaires/updateQuestionnaire",
  async ({ id, ...fields }, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from("questionnaires")
      .update(fields)
      .eq("id", id)
      .select("*, questions(*)")
      .single();

    if (error) return rejectWithValue(error.message);
    return data;
  },
);

export const deleteQuestionnaire = createAsyncThunk<string, string>(
  "questionnaires/deleteQuestionnaire",
  async (id, { rejectWithValue }) => {
    const { error } = await supabase
      .from("questionnaires")
      .delete()
      .eq("id", id);
    if (error) return rejectWithValue(error.message);
    return id;
  },
);

export const pauseQuestionnaire = createAsyncThunk<
  { id: string; is_active: boolean },
  { id: string; is_active: boolean }
>(
  "questionnaires/pauseQuestionnaire",
  async ({ id, is_active }, { rejectWithValue }) => {
    const { error } = await supabase
      .from("questionnaires")
      .update({ is_active })
      .eq("id", id);
    if (error) return rejectWithValue(error.message);
    return { id, is_active };
  },
);

const questionnairesSlice = createSlice({
  name: "questionnaires",
  initialState,
  reducers: {
    clearQuestionnaireError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestionnaires.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchQuestionnaires.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.questionnaires = action.payload;
      })
      .addCase(fetchQuestionnaires.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(createQuestionnaire.fulfilled, (state, action) => {
        state.questionnaires.unshift(action.payload);
      })
      .addCase(createQuestionnaire.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(updateQuestionnaire.fulfilled, (state, action) => {
        const index = state.questionnaires.findIndex(
          (q) => q.id === action.payload.id,
        );
        if (index !== -1) state.questionnaires[index] = action.payload;
      })
      .addCase(updateQuestionnaire.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteQuestionnaire.fulfilled, (state, action) => {
        state.questionnaires = state.questionnaires.filter(
          (q) => q.id !== action.payload,
        );
      })
      .addCase(deleteQuestionnaire.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(pauseQuestionnaire.fulfilled, (state, action) => {
        const q = state.questionnaires.find((q) => q.id === action.payload.id);
        if (q) q.is_active = action.payload.is_active;
      })
      .addCase(pauseQuestionnaire.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearQuestionnaireError } = questionnairesSlice.actions;

type RootState = { questionnaires: QuestionnairesState };

export const selectAllQuestionnaires = (state: RootState) =>
  state.questionnaires.questionnaires;
export const selectQuestionnairesStatus = (state: RootState) =>
  state.questionnaires.status;

export const selectActiveQuestionnaires = createSelector(
  selectAllQuestionnaires,
  (questionnaires) => questionnaires.filter((q) => q.is_active),
);

export const selectQuestionnaireById = (id: string) =>
  createSelector(selectAllQuestionnaires, (questionnaires) =>
    questionnaires.find((q) => q.id === id),
  );

export const selectQuestionnairesByFrequency = (frequency: string) =>
  createSelector(selectAllQuestionnaires, (questionnaires) =>
    questionnaires.filter((q) => q.frequency === frequency),
  );

export default questionnairesSlice.reducer;
