"use client";

import { useState } from "react";

export interface HeatmapGridProps {
  rows: string[];
  cols: string[];
  data: number[][];
  colorScale?: [string, string, string];
  height?: number;
}

function interpolateColor(value: number, min: number, max: number, colors: [string, string, string]) {
  const ratio = max === min ? 0.5 : (value - min) / (max - min);

  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
      : { r: 0, g: 0, b: 0 };
  };

  const low = hexToRgb(colors[0]);
  const mid = hexToRgb(colors[1]);
  const high = hexToRgb(colors[2]);

  let r: number, g: number, b: number;
  if (ratio < 0.5) {
    const t = ratio * 2;
    r = Math.round(low.r + (mid.r - low.r) * t);
    g = Math.round(low.g + (mid.g - low.g) * t);
    b = Math.round(low.b + (mid.b - low.b) * t);
  } else {
    const t = (ratio - 0.5) * 2;
    r = Math.round(mid.r + (high.r - mid.r) * t);
    g = Math.round(mid.g + (high.g - mid.g) * t);
    b = Math.round(mid.b + (high.b - mid.b) * t);
  }

  return `rgb(${r},${g},${b})`;
}

export function HeatmapGrid({
  rows,
  cols,
  data,
  colorScale = ["#f4657e", "#f59e0b", "#1dbf8a"],
}: HeatmapGridProps) {
  const [tooltip, setTooltip] = useState<{ row: string; col: string; value: number; x: number; y: number } | null>(null);

  const allValues = data.flat().filter((v) => v !== null && v !== undefined);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);

  return (
    <div className="relative overflow-x-auto">
      {/* Column headers */}
      <div
        className="grid gap-[2px] mb-[2px]"
        style={{ gridTemplateColumns: `140px repeat(${cols.length}, minmax(60px, 1fr))` }}
      >
        <div /> {/* empty corner */}
        {cols.map((col) => (
          <div
            key={col}
            className="text-center text-[10px] font-semibold text-[#9892b8] uppercase tracking-wider py-1.5 truncate px-1"
          >
            {col}
          </div>
        ))}
      </div>

      {/* Rows */}
      {rows.map((row, ri) => (
        <div
          key={`${row}-${ri}`}
          className="grid gap-[2px] mb-[2px]"
          style={{ gridTemplateColumns: `140px repeat(${cols.length}, minmax(60px, 1fr))` }}
        >
          {/* Row label */}
          <div className="text-[11px] font-medium text-[#4a4270] truncate pr-2 flex items-center">
            {row}
          </div>

          {/* Cells */}
          {cols.map((col, ci) => {
            const value = data[ri]?.[ci] ?? 0;
            const bgColor = interpolateColor(value, minVal, maxVal, colorScale);
            const isLight = value > (maxVal + minVal) / 2;

            return (
              <div
                key={`${row}-${col}-${ci}`}
                className="rounded-[6px] flex items-center justify-center py-2.5 px-1 cursor-default transition-transform hover:scale-105"
                style={{ background: bgColor, minHeight: 36 }}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({ row, col, value, x: rect.left, y: rect.top });
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: isLight ? "#fff" : "#1a0f3c", fontFamily: "'DM Mono', monospace" }}
                >
                  {value.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>
      ))}

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-3 py-2 rounded-[10px] shadow-lg pointer-events-none"
          style={{
            background: "#1a0f3c",
            color: "#fff",
            fontSize: 12,
            fontFamily: "'DM Sans'",
            left: tooltip.x,
            top: tooltip.y - 44,
          }}
        >
          <span className="font-semibold">{tooltip.row}</span>
          <span className="text-white/60 mx-1">·</span>
          <span>{tooltip.col}</span>
          <span className="text-white/60 mx-1">·</span>
          <span className="font-semibold">{tooltip.value.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
}
