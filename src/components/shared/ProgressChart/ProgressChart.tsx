import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import Card from "../Card/Card";
import type {
  Questionnaire,
  Question,
  Response,
} from "../../../models/globalTypes";
import styles from "./ProgressChart.module.scss";

const LINE_COLORS = [
  "#2d7264",
  "#5a8a6a",
  "#3a7fa8",
  "#8a6a2d",
  "#a8633a",
  "#6a2d8a",
];

const scoreToHeatColor = (score: number) => {
  if (!score) return "var(--bg-muted)";

  const stops = [
    [220, 240, 235],
    [180, 220, 210],
    [90, 170, 150],
    [31, 73, 64],
  ] as const;

  const t = ((score - 1) / 9) * (stops.length - 1);
  const i = Math.floor(t);
  const f = t - i;

  const a = stops[Math.min(i, stops.length - 1)];
  const b = stops[Math.min(i + 1, stops.length - 1)];

  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)}, ${Math.round(
    a[1] + (b[1] - a[1]) * f,
  )}, ${Math.round(a[2] + (b[2] - a[2]) * f)})`;
};

const formatDate = (iso?: string) => {
  if (!iso) return "Unknown";
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return "Unknown";

  return `${date.getDate()}/${date.getMonth() + 1}`;
};

const getResponseDate = (response: Response) =>
  response.submitted_at ?? response.created_at ?? "";

const getScore = (response: Response, questionId: string) => {
  const scores = response.scores as Record<string, number | string>;
  const raw = scores?.[questionId];

  if (raw === undefined || raw === null || raw === "") return 0;

  return Number(raw);
};

const buildChartData = (responses: Response[], scaleQuestions: Question[]) =>
  responses.map((response, index) => {
    const point: Record<string, string | number> = {
      label: formatDate(getResponseDate(response)),
      index: index + 1,
    };

    scaleQuestions.forEach((question) => {
      point[question.id] = getScore(response, question.id);
    });

    return point;
  });

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-md)",
        padding: "10px 14px",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <p
        style={{
          fontWeight: 600,
          marginBottom: 6,
          color: "var(--text-primary)",
          fontSize: 13,
        }}
      >
        {label}
      </p>

      {payload.map((entry: any) => (
        <p
          key={entry.name}
          style={{
            color: entry.color,
            fontSize: 12,
            marginBottom: 2,
          }}
        >
          {entry.name}: <strong>{entry.value}/10</strong>
        </p>
      ))}
    </div>
  );
};

function LineView({
  data,
  scaleQuestions,
}: {
  data: Record<string, string | number>[];
  scaleQuestions: Question[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
        />

        <XAxis
          dataKey="label"
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          domain={[0, 10]}
          ticks={[0, 2, 4, 6, 8, 10]}
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip content={<CustomTooltip />} />

        <Legend
          wrapperStyle={{
            fontSize: 12,
            paddingTop: 14,
            color: "var(--text-secondary)",
          }}
        />

        {scaleQuestions.map((question, index) => (
          <Line
            key={question.id}
            type="monotone"
            dataKey={question.id}
            name={question.text}
            stroke={LINE_COLORS[index % LINE_COLORS.length]}
            strokeWidth={2.5}
            dot={{
              r: 3,
              fill: LINE_COLORS[index % LINE_COLORS.length],
              strokeWidth: 0,
            }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

function HeatView({
  responses,
  scaleQuestions,
}: {
  responses: Response[];
  scaleQuestions: Question[];
}) {
  const cols = responses.length;

  return (
    <div className={styles.heatmapWrap}>
      <div
        className={styles.heatmapGrid}
        style={{ gridTemplateColumns: `120px repeat(${cols}, 1fr)` }}
      >
        <div />

        {responses.map((response) => (
          <div key={response.id} className={styles.heatmapWeekLabel}>
            {formatDate(getResponseDate(response))}
          </div>
        ))}

        {scaleQuestions.map((question) => (
          <React.Fragment key={question.id}>
            <div className={styles.heatmapRowLabel} title={question.text}>
              {question.text.length > 18
                ? `${question.text.slice(0, 18)}…`
                : question.text}
            </div>

            {responses.map((response) => {
              const score = getScore(response, question.id);

              return (
                <div
                  key={`${response.id}-${question.id}`}
                  role="img"
                  aria-label={`${question.text} on ${formatDate(
                    getResponseDate(response),
                  )}: ${score}/10`}
                  title={`${question.text} — ${formatDate(
                    getResponseDate(response),
                  )}: ${score}/10`}
                  className={styles.heatCell}
                  style={{ background: scoreToHeatColor(score) }}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <div className={styles.heatLegend}>
        <span>Low</span>
        {[1, 3, 5, 7, 9].map((score) => (
          <div
            key={score}
            className={styles.heatLegendSwatch}
            style={{ background: scoreToHeatColor(score) }}
          />
        ))}
        <span>High</span>
      </div>
    </div>
  );
}

function RadarView({
  responses,
  scaleQuestions,
}: {
  responses: Response[];
  scaleQuestions: Question[];
}) {
  const latestResponse = responses[responses.length - 1];

  const data = scaleQuestions.map((question) => ({
    question:
      question.text.length > 22
        ? `${question.text.slice(0, 22)}…`
        : question.text,
    score: getScore(latestResponse, question.id),
    fullMark: 10,
  }));

  return (
    <ResponsiveContainer width="100%" height={360}>
      <RadarChart data={data} margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis
          dataKey="question"
          tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 10]}
          tickCount={6}
          tick={{ fill: "var(--text-muted)", fontSize: 10 }}
        />
        <Radar
          name="Latest check-in"
          dataKey="score"
          stroke="#2d7264"
          fill="#2d7264"
          fillOpacity={0.35}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

interface ProgressChartProps {
  responses: Response[];
  questionnaire: Questionnaire | null;
  title?: string;
}

export default function ProgressChart({
  responses,
  questionnaire,
  title = "Your Progress",
}: ProgressChartProps) {
  const [view, setView] = useState<"line" | "heat" | "radar">("line");

  const scaleQuestions =
    questionnaire?.questions?.filter((question) => question.type === "scale") ??
    [];

  if (!responses || responses.length === 0) {
    return (
      <Card>
        <p className={styles.empty}>
          No responses yet. Complete your first check-in to see your progress.
        </p>
      </Card>
    );
  }

  if (scaleQuestions.length === 0) {
    return (
      <Card>
        <p className={styles.empty}>
          No scale questions found, so there is nothing to plot yet.
        </p>
      </Card>
    );
  }

  const chartData = buildChartData(responses, scaleQuestions);

  return (
    <Card className={styles.card}>
      <div className={styles.chartHeader}>
        <div className={styles.chartMeta}>
          <h3>{title}</h3>
          <p>
            {responses.length} check-in{responses.length !== 1 ? "s" : ""}{" "}
            tracked
          </p>
        </div>

        <div role="group" aria-label="Chart type" className={styles.toggle}>
          {(["line", "heat", "radar"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setView(value)}
              aria-pressed={view === value}
              className={
                view === value ? styles.toggleBtnActive : styles.toggleBtn
              }
            >
              {value === "line"
                ? "Line graph"
                : value === "heat"
                  ? "Heatmap"
                  : "Radar"}
            </button>
          ))}
        </div>
      </div>

      {view === "line" ? (
        <LineView data={chartData} scaleQuestions={scaleQuestions} />
      ) : view === "heat" ? (
        <HeatView responses={responses} scaleQuestions={scaleQuestions} />
      ) : (
        <RadarView responses={responses} scaleQuestions={scaleQuestions} />
      )}
    </Card>
  );
}