"use client";

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Sector,
} from "recharts";

export interface PieData {
  name: string;
  value: number;
  color: string;
}

interface DistributionPieProps {
  data: PieData[];
  height?: number;
  title?: string;
}

/* Custom active shape for hover effect */
function renderActiveShape(props: any) {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value,
  } = props;

  return (
    <g>
      <text
        x={cx}
        y={cy - 8}
        dy={0}
        textAnchor="middle"
        fill="#1a0f3c"
        style={{ fontSize: 18, fontWeight: 700, fontFamily: "'DM Sans'" }}
      >
        {value}
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        fill="#9892b8"
        style={{ fontSize: 11, fontWeight: 500, fontFamily: "'DM Sans'" }}
      >
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 11}
        fill={fill}
      />
    </g>
  );
}

export function DistributionPie({ data, height = 260, title }: DistributionPieProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            dataKey="value"
            onMouseEnter={(_, index) => setActiveIndex(index)}
            animationDuration={600}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#1a0f3c",
              border: "none",
              borderRadius: 10,
              color: "#fff",
              fontSize: 12,
              fontFamily: "'DM Sans'",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-1 px-2">
        {data.map((entry, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 cursor-pointer"
            onMouseEnter={() => setActiveIndex(i)}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: entry.color }}
            />
            <span className="text-[11px] font-medium text-[#4a4270]">
              {entry.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
