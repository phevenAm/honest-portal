import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAppSelector, useFetchOnIdle } from "../../../store/hooks";
import { useAuth } from "../../../context/AuthContext";
import { getResponseDate, isQuestionnaireCheckInDue } from "../../../Helpers/Helpers";
import {
  selectActiveQuestionnaires,
  fetchQuestionnaires,
} from "../../../store/slices/questionnairesSlice";
import {
  selectUserResponses,
  selectUserQuestionnaireResponses,
  fetchResponsesByUser,
} from "../../../store/slices/responsesSlice";
import ProgressChart from "../../../components/shared/ProgressChart/ProgressChart";
import Card from "../../../components/shared/Card/Card";
import Button from "../../../components/shared/Button/Button";
import type { RootState } from "../../../store/index";
import { useGetQuoteByKeywordQuery, useGetRandomQuoteQuery } from "../../../services/inspirationalQuotesApi";
import styles from "./ClientDashboard.module.scss";
import { inspirationalQuote } from "../../../models/globalTypes";
import Spinner from "../../../ui-components/Spinner/Spinner";

const getLatestResponseForQuestionnaire = (
  responses: any[], //all submitted check-in answers ever
  questionnaireId: string,
) =>
  responses
    .filter((response) => response.questionnaire_id === questionnaireId)
    .sort(
      (a, b) =>
        new Date(getResponseDate(b)).getTime() -
        new Date(getResponseDate(a)).getTime(),
    )[0];

export default function ClientDashboard() {
  const { authUser, userProfile } = useAuth();

  const questionnairesStatus = useSelector(
    (state: RootState) => state.questionnaires.status,
  );
  const responsesStatus = useSelector(
    (state: RootState) => state.responses.status,
  );

  const questionnaires = useSelector(selectActiveQuestionnaires); // all available questionnares (backend should only return assigned; frontend checks anyway)
  const allUserResponses = useSelector(selectUserResponses(authUser?.id ?? "")); // all submissions ever

  const quoteKeyword = useMemo(() => {
    const kws = userProfile?.focus_keywords;
    if (!kws || kws.length === 0) return null;
    return kws[Math.floor(Math.random() * kws.length)];
  }, [userProfile?.id]);

  const { data: keywordData } = useGetQuoteByKeywordQuery(quoteKeyword!, {
    skip: !quoteKeyword,
  });
  const { data: randomData } = useGetRandomQuoteQuery(undefined, {
    skip: !!quoteKeyword,
  });

  const quotes: inspirationalQuote[] = keywordData?.results ?? randomData ?? [];

  const filtered = quotes.filter((q) => q.length <= 70);

  const randomQuote =
    filtered.length > 0
      ? filtered[Math.floor(Math.random() * filtered.length)]
      : undefined;

  const assignedQs = questionnaires.filter((q) =>
    q.assignedTo.includes(authUser?.id ?? ""),
  );

  const availableAssignedQs = assignedQs.filter((q) => {
    const latestResponse = getLatestResponseForQuestionnaire(
      allUserResponses,
      q.id,
    );

    if (!latestResponse) return true;

    return isQuestionnaireCheckInDue(getResponseDate(latestResponse), q.frequency);
  });

  const questionnaire = assignedQs[0] ?? null;

  const responses = useSelector(
    selectUserQuestionnaireResponses(
      authUser?.id ?? "",
      questionnaire?.id ?? "",
    ),
  );

  useFetchOnIdle(
    (state: RootState) => state.questionnaires.status,
    () => fetchQuestionnaires(),
    'Error fetch questionnares'
  )

  useFetchOnIdle(
    (state: RootState) => state.responses.status,
    () => fetchResponsesByUser(authUser?.id ?? ''),
    'Failed to fetch user responses'
  )


  const latestResponse = responses[responses.length - 1] ?? null;

  const scaleAverage = (response: typeof latestResponse) => {
    if (!response) return null;

    const scaleQuestions =
      questionnaire?.questions.filter((q) => q.type === "scale") ?? [];

    if (scaleQuestions.length === 0) return null;

    const total = scaleQuestions.reduce(
      (sum, q) =>
        sum + ((response.scores as Record<string, number>)[q.id] ?? 0),
      0,
    );

    return (total / scaleQuestions.length).toFixed(1);
  };

  const avgScore = scaleAverage(latestResponse) ?? "–";
  const firstAvg = scaleAverage(responses[0] ?? null);

  const improvement =
    firstAvg && latestResponse
      ? (parseFloat(avgScore as string) - parseFloat(firstAvg)).toFixed(1)
      : null;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const stats = [
    {
      label: "Latest score",
      value: `${avgScore}/10`,
      sub: "This week's average",
      color: "teal",
    },
    {
      label: "Weeks tracked",
      value: responses.length,
      sub: "Total check-ins",
      color: "stone",
    },
    ...(improvement !== null
      ? [
        {
          label: "Overall change",
          value: `${parseFloat(improvement) >= 0 ? "+" : ""}${improvement}`,
          sub: "Since you started",
          color: parseFloat(improvement) >= 0 ? "teal" : "danger",
        },
      ]
      : []),
    {
      label: "Available check-ins",
      value: availableAssignedQs.length,
      sub: "Ready to complete",
      color: "warm",
    },
  ];

  if (questionnairesStatus !== "succeeded" || responsesStatus !== "succeeded") {
    return (
      <div className={styles.page}>
        <Spinner />
      </div>
    );
  }
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1>
            {greeting}, {userProfile?.display_name ?? userProfile?.first_name ?? 'friend'}
          </h1>
          <p>Here's a look at how you've been doing</p>
        </div>

        {randomQuote ? (
          <section className={`${styles.quotes} ${styles.warm}`}>
            <h3>{randomQuote?.content}</h3>
            <small>{randomQuote?.author}</small>
          </section>
        ) : null}

        <div className={styles.statsRow}>
          {stats.map((s) => (
            <div
              key={s.label}
              className={`${styles.statCard} ${styles[s.color as keyof typeof styles]
                }`}
            >
              <p className={styles.statLabel}>{s.label}</p>
              <p className={styles.statValue}>{s.value}</p>
              <p className={styles.statSub}>{s.sub}</p>
            </div>
          ))}
        </div>

        <div className={styles.chartWrap}>
          <ProgressChart
            responses={responses}
            questionnaire={questionnaire}
            title="Your Wellbeing Over Time"
          />
        </div>

        <div className={styles.bottomGrid}>
          <Card>
            <div className={styles.cardPad}>
              <h3 className={styles.cardTitle}>Your Check-ins</h3>

              {assignedQs.length === 0 ? (
                <p className={styles.emptyText}>No check-ins assigned yet.</p>
              ) : availableAssignedQs.length === 0 ? (
                <p className={styles.emptyText}>
                  You have completed your assigned check-ins for now.
                </p>
              ) : (
                <div className={styles.checkInList}>
                  {availableAssignedQs.map((q) => (
                    <div key={q.id} className={styles.checkInRow}>
                      <div>
                        <p className={styles.checkInTitle}>{q.title}</p>
                        <p className={styles.checkInFreq}>{q.frequency}</p>
                      </div>

                      <Link to="/check-in" style={{ textDecoration: "none" }}>
                        <Button size="sm" variant="secondary">
                          Start
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className={styles.resourcesCard}>
              <h3 className={styles.resourcesTitle}>Resources for you</h3>
              <p className={styles.resourcesDesc}>
                Articles, breathing exercises, and tools curated by your
                practitioner.
              </p>

              <Link to="/resources" style={{ textDecoration: "none" }}>
                <Button variant="primary" size="sm">
                  Browse resources
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
