"use client";

import { useEffect, useState } from "react";

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 90,
  strokeWidth = 7,
  label,
  color = "#8b7cf6",
}: ProgressRingProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(animatedValue / max, 1);
  const strokeDashoffset = circumference * (1 - percentage);

  // Color based on accuracy
  const ringColor =
    color !== "#8b7cf6"
      ? color
      : value >= 80
      ? "#1dbf8a"
      : value >= 60
      ? "#f59e0b"
      : "#f4657e";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e4deff"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Animated progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
          />
        </svg>
        {/* Center percentage text */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <span className="text-[15px] font-bold text-[#1a0f3c]">
            {animatedValue.toFixed(0)}
            <span className="text-[10px] text-[#9892b8] font-medium">%</span>
          </span>
        </div>
      </div>
      {label && (
        <span className="text-[11px] font-semibold text-[#9892b8] uppercase tracking-wider text-center">
          {label}
        </span>
      )}
    </div>
  );
}
