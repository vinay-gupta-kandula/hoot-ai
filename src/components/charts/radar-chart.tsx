"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export interface SkillRadarData {
  subject: string;
  score: number;
  fullMark: number;
}

interface SkillRadarProps {
  data: SkillRadarData[];
  height?: number;
}

export function SkillRadar({ data, height = 300 }: SkillRadarProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
        <PolarGrid stroke="#e4deff" strokeWidth={1} />
        <PolarAngleAxis
          dataKey="subject"
          tick={{
            fill: "#4a4270",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
          }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: "#9892b8", fontSize: 10 }}
          axisLine={false}
        />
        <Radar
          name="Accuracy"
          dataKey="score"
          stroke="#6457d4"
          strokeWidth={2}
          fill="url(#radarGradient)"
          fillOpacity={0.55}
          animationDuration={800}
          animationEasing="ease-out"
        />
        <Tooltip
          contentStyle={{
            background: "#1a0f3c",
            border: "none",
            borderRadius: 10,
            color: "#fff",
            fontSize: 12,
            fontFamily: "'DM Sans', sans-serif",
          }}
          formatter={(value: unknown) => [
            typeof value === "number" ? `${value.toFixed(1)}%` : String(value),
            "Accuracy",
          ]}
        />
        <defs>
          <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b7cf6" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#6457d4" stopOpacity={0.3} />
          </linearGradient>
        </defs>
      </RadarChart>
    </ResponsiveContainer>
  );
}
