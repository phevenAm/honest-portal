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

export const createQuestionnaire = createAsyncThunk(
  "questionnaires/createQuestionnaire",
  async (data: Questionnaire, { rejectWithValue }) => {
    console.log(' Creating questionnaire with data:', data);
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

      console.log("createQuestionnaire response:", { questionnaire, questionnaireError });

    if (questionnaireError) {
      return rejectWithValue(questionnaireError.message);
    }
      console.log(' Creating questionnaire with data:', data);
const questionRows = data.questions.map((question, index) => ({
  questionnaire_id: questionnaire.id,
  text: question.text,
  type: question.type,
  min_value: question.type === "scale" ? question.min ?? 1 : null,
  max_value: question.type === "scale" ? question.max ?? 10 : null,
  min_label: question.type === "scale" ? question.minLabel ?? null : null,
  max_label: question.type === "scale" ? question.maxLabel ?? null : null,
  order_index: question.orderIndex ?? index + 1,
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
  }
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