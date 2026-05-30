import { Questionnaire, Response } from "../../../../models/globalTypes";

export const generateAccessToken = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const groups = Array.from({ length: 3 }, () =>
    Array.from({ length: 4 }, () =>
      alphabet[Math.floor(Math.random() * alphabet.length)],
    ).join(""),
  );

  return groups.join("-");
};

export const getResponseDate = (response: Response) =>
  response.submitted_at ?? response.created_at ?? "";

export const getScoreAverage = (
  response: Response | undefined,
  questionnaire: Questionnaire | undefined,
) => {
  if (!response || !questionnaire) return null;

  const scaleQuestions = questionnaire.questions?.filter(
    (question) => question.type === "scale",
  );

  if (!scaleQuestions?.length) return null;

  const total = scaleQuestions.reduce((sum, question) => {
    const raw = (response.scores as Record<string, number | string>)[question.id];
    const score = Number(raw ?? 0);
    return sum + (Number.isFinite(score) ? score : 0);
  }, 0);

  return (total / scaleQuestions.length).toFixed(1);
};

export const getQuestionnaireForResponse = (
  response: Response | undefined,
  questionnaires: Questionnaire[],
) => {
  if (!response) return undefined;
  return questionnaires.find(
    (questionnaire) => questionnaire.id === response.questionnaire_id,
  );
};