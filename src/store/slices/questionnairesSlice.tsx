import {
  createSlice,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabase.js";
import type { Questionnaire } from "../../models/globalTypes.js";

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

    console.log("fetching questionnaires: ", { data, error });

    if (error) return rejectWithValue(error.message);
    return data;
  },
);

export const createQuestionnaire = createAsyncThunk(
  "questionnaires/createQuestionnaire",
  async (data: Questionnaire, { rejectWithValue }) => {
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

    if (questionnaireError) {
      return rejectWithValue(questionnaireError.message);
    }
    const questionRows = data.questions.map((question, index) => ({
      questionnaire_id: questionnaire.id,
      text: question.text,
      type: question.type,
      min_value: question.type === "scale" ? (question.min_value ?? 1) : null,
      max_value: question.type === "scale" ? (question.max_value ?? 10) : null,
      min_label:
        question.type === "scale" ? (question.min_label ?? null) : null,
      max_label:
        question.type === "scale" ? (question.max_label ?? null) : null,
      order_index: question.order_index ?? index + 1,
      is_required: question.is_required ?? true,
    }));

    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .insert(questionRows)
      .select();

    if (questionsError) {
      return rejectWithValue(questionsError.message);
    }

    return {
      ...questionnaire,
      questions,
    };
  },
);
``
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
      .addCase(createQuestionnaire.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createQuestionnaire.fulfilled, (state, action) => {
        console.log("Questionnaire created successfully:", action.payload);
        state.status = "succeeded";
        state.questionnaires.push(action.payload);
      })
      .addCase(createQuestionnaire.rejected, (state, action) => {
        console.error("Error creating questionnaire:", action.payload);
        state.status = "failed";
        state.error = action.payload as string;
      })
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
      });
  },
});

export const { clearQuestionnaireError } = questionnairesSlice.actions;

type RootState = {
  questionnaires: QuestionnairesState;
};

export const selectAllQuestionnaires = (state: RootState) =>
  state.questionnaires.questionnaires;

export const selectActiveQuestionnaires = createSelector(
  selectAllQuestionnaires,
  (questionnaires) => questionnaires.filter((q) => q.is_active),
);

export const selectQuestionnairesByFrequency = (frequency: string) =>
  createSelector(selectAllQuestionnaires, (questionnaires) =>
    questionnaires.filter((q) => q.frequency === frequency),
  );

export default questionnairesSlice.reducer;
