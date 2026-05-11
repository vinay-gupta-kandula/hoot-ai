"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

export interface AccuracyBarData {
  name: string;
  accuracy: number;
}

interface AccuracyBarChartProps {
  data: AccuracyBarData[];
  height?: number;
  layout?: "horizontal" | "vertical";
  showLabels?: boolean;
  colorScale?: boolean;
}

const getBarColor = (accuracy: number, colorScale: boolean) => {
  if (!colorScale) return "#8b7cf6";
  if (accuracy >= 80) return "#1dbf8a";
  if (accuracy >= 60) return "#f59e0b";
  return "#f4657e";
};

export function AccuracyBarChart({
  data,
  height = 300,
  layout = "horizontal",
  showLabels = true,
  colorScale = false,
}: AccuracyBarChartProps) {
  if (layout === "vertical") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e4deff" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: "#9892b8", fontSize: 11, fontFamily: "'DM Sans'" }}
            axisLine={{ stroke: "#e4deff" }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            tick={{ fill: "#4a4270", fontSize: 11, fontFamily: "'DM Sans'" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#1a0f3c",
              border: "none",
              borderRadius: 10,
              color: "#fff",
              fontSize: 12,
              fontFamily: "'DM Sans'",
            }}
            formatter={(value: unknown) => [
              typeof value === "number" ? `${value.toFixed(1)}%` : String(value),
              "Accuracy",
            ]}
          />
          <Bar
            dataKey="accuracy"
            radius={[0, 6, 6, 0]}
            animationDuration={600}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={getBarColor(entry.accuracy, colorScale)} />
            ))}
            {showLabels && (
              <LabelList
                dataKey="accuracy"
                position="right"
                formatter={(v: unknown) =>
                  typeof v === "number" ? `${v.toFixed(1)}%` : String(v)
                }
                style={{ fill: "#4a4270", fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans'" }}
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4deff" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: "#4a4270", fontSize: 11, fontFamily: "'DM Sans'" }}
          axisLine={{ stroke: "#e4deff" }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: "#9892b8", fontSize: 11, fontFamily: "'DM Sans'" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#1a0f3c",
            border: "none",
            borderRadius: 10,
            color: "#fff",
            fontSize: 12,
            fontFamily: "'DM Sans'",
          }}
          formatter={(value: unknown) => [
            typeof value === "number" ? `${value.toFixed(1)}%` : String(value),
            "Accuracy",
          ]}
        />
        <Bar
          dataKey="accuracy"
          radius={[6, 6, 0, 0]}
          animationDuration={600}
          animationEasing="ease-out"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={getBarColor(entry.accuracy, colorScale)} />
          ))}
          {showLabels && (
            <LabelList
              dataKey="accuracy"
              position="top"
              formatter={(v: unknown) =>
                typeof v === "number" ? `${v.toFixed(1)}%` : String(v)
              }
              style={{ fill: "#4a4270", fontSize: 10, fontWeight: 600, fontFamily: "'DM Sans'" }}
            />
          )}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
