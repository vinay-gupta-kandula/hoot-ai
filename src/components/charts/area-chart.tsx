"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface TrendData {
  date: string;
  value: number;
}

interface TrendAreaChartProps {
  data: TrendData[];
  height?: number;
  color?: string;
  label?: string;
}

export function TrendAreaChart({
  data,
  height = 250,
  color = "#8b7cf6",
  label = "Value",
}: TrendAreaChartProps) {
  const gradientId = `areaGrad-${color.replace("#", "")}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4deff" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "#9892b8", fontSize: 11, fontFamily: "'DM Sans'" }}
          axisLine={{ stroke: "#e4deff" }}
          tickLine={false}
        />
        <YAxis
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
            typeof value === "number" ? value.toFixed(1) : String(value),
            label,
          ]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          fillOpacity={1}
          fill={`url(#${gradientId})`}
          animationDuration={800}
          animationEasing="ease-out"
          dot={{ r: 3, fill: color, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: color, stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
