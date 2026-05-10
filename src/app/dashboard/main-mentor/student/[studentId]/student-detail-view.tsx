"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Target, Layers, Clock, Repeat, User } from "lucide-react";
import { SkillRadar } from "@/components/charts/radar-chart";
import type { SkillRadarData } from "@/components/charts/radar-chart";
import { AccuracyBarChart } from "@/components/charts/bar-chart";
import { ProgressRing } from "@/components/charts/progress-ring";

/* ─── Types ─── */
interface StudentInfo {
  id: string; name: string; rollNo: string; branch: string;
  college: string; technology: string; gender: string; email: string;
}
interface MentorInfo { name: string; email: string; poolNo: number; }
interface StudentStats { avgAccuracy: number; totalModules: number; totalTime: number; totalAttempts: number; }
interface ModuleData { name: string; accuracy: number; course: string; avgDuration: number; totalAttempts: number; date: string; }

interface StudentDetailViewProps {
  student: StudentInfo;
  mentor: MentorInfo | null;
  stats: StudentStats;
  courseAccuracy: SkillRadarData[];
  moduleAccuracy: ModuleData[];
  courseModules: Record<string, ModuleData[]>;
}

/* ─── Helpers ─── */
const BRANCH_COLORS: Record<string, string> = {
  CSE: "#8b7cf6", AIML: "#6457d4", ECE: "#3b82f6", DS: "#1dbf8a", IT: "#f4657e", IOT: "#f59e0b",
};
const accColor = (v: number) => v >= 80 ? "text-[#1dbf8a]" : v >= 60 ? "text-[#f59e0b]" : "text-[#f4657e]";

function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

function formatTime(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ${seconds % 60}s`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

/* ─── Component ─── */
export function StudentDetailView({
  student, mentor, stats, courseAccuracy, moduleAccuracy, courseModules,
}: StudentDetailViewProps) {
  const [activeTab, setActiveTab] = useState(courseAccuracy[0]?.subject || "Listening");
  const courses = Object.keys(courseModules);
  const tabModules = courseModules[activeTab] || [];

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: "#f5f3ff", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Back */}
      <Link
        href="/dashboard/main-mentor"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#6457d4] hover:text-[#4a3ab5] transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Overview
      </Link>

      {/* ── Header ── */}
      <div className="flex items-start gap-4 mb-7 flex-wrap">
        <div
          className="w-16 h-16 rounded-[16px] flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
          style={{ background: `linear-gradient(135deg,${BRANCH_COLORS[student.branch] || "#8b7cf6"},#6457d4)` }}
        >
          {initials(student.name)}
        </div>
        <div className="flex-1">
          <h1 className="text-[26px] font-semibold text-[#1a0f3c] tracking-tight leading-tight">{student.name}</h1>
          <p className="text-[13px] text-[#9892b8] mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>{student.rollNo}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Badge className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full border-0 bg-[#f3f0ff] text-[#6457d4]">{student.branch}</Badge>
            <Badge className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full border-0 bg-[#eef6ff] text-[#2563eb]">{student.college}</Badge>
            <Badge className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full border-0 bg-[#e8fdf5] text-[#0d8a62]">{student.technology}</Badge>
            <Badge className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full border-0 bg-[#fff1f3] text-[#d63a5a]">{student.gender}</Badge>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-7">
        {[
          { label: "Avg Accuracy", value: `${stats.avgAccuracy}%`, icon: <Target className="w-4 h-4" />, accent: true },
          { label: "Modules", value: stats.totalModules, icon: <Layers className="w-4 h-4" /> },
          { label: "Total Time", value: formatTime(stats.totalTime), icon: <Clock className="w-4 h-4" /> },
          { label: "Attempts", value: stats.totalAttempts.toLocaleString(), icon: <Repeat className="w-4 h-4" /> },
        ].map((s, i) => (
          <div
            key={i}
            className="rounded-[16px] p-4 relative overflow-hidden"
            style={s.accent
              ? { background: "linear-gradient(135deg,#6457d4,#8b7cf6)", minHeight: 100 }
              : { background: "#fff", border: "1px solid rgba(139,124,246,0.1)", minHeight: 100 }
            }
          >
            <p className={`text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${s.accent ? "text-white/70" : "text-[#9892b8]"}`}>{s.label}</p>
            <p className={`text-[28px] font-bold tracking-tight leading-none ${s.accent ? "text-white" : "text-[#1a0f3c]"}`}>{s.value}</p>
            <div className={`absolute top-3 right-3 w-8 h-8 rounded-[8px] flex items-center justify-center ${s.accent ? "bg-white/15" : "bg-[#f3f0ff]"}`}>
              <span className={s.accent ? "text-white" : "text-[#6457d4]"}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Section 1: Radar + Rings ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <Card className="border-0 shadow-lg shadow-[#8b7cf610]" style={{ borderRadius: 20, background: "#fff" }}>
          <CardHeader className="px-[22px] pt-4 pb-0">
            <span className="text-[13px] font-semibold text-[#1a0f3c]">Course Skill Radar</span>
          </CardHeader>
          <CardContent className="px-[22px] pb-4">
            <SkillRadar data={courseAccuracy} height={280} />
            <div className="flex justify-center gap-6 mt-3">
              {courseAccuracy.map(c => (
                <ProgressRing key={c.subject} value={c.score} label={c.subject} size={70} strokeWidth={5} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-[#8b7cf610]" style={{ borderRadius: 20, background: "#fff" }}>
          <CardHeader className="px-[22px] pt-4 pb-0">
            <span className="text-[13px] font-semibold text-[#1a0f3c]">Module Performance</span>
          </CardHeader>
          <CardContent className="px-[22px] pb-4">
            <AccuracyBarChart
              data={moduleAccuracy.map(m => ({ name: m.name, accuracy: m.accuracy }))}
              height={450}
              layout="vertical"
              colorScale
            />
          </CardContent>
        </Card>
      </div>

      {/* ── Section 2: Course Tabs Deep Dive ── */}
      <Card className="border-0 shadow-lg shadow-[#8b7cf610] mb-5" style={{ borderRadius: 20, background: "#fff" }}>
        <CardHeader className="px-[22px] pt-4 pb-0">
          <span className="text-[13px] font-semibold text-[#1a0f3c]">Course Deep Dive</span>
          <div className="flex gap-1.5 mt-3">
            {courses.map(c => (
              <button
                key={c}
                onClick={() => setActiveTab(c)}
                className="text-[11.5px] font-semibold px-3.5 py-1.5 rounded-[10px] transition-colors"
                style={activeTab === c
                  ? { background: "linear-gradient(135deg,#6457d4,#8b7cf6)", color: "#fff" }
                  : { background: "#f3f0ff", color: "#6457d4" }
                }
              >
                {c}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="px-[22px] pb-4">
          <div className="flex items-center gap-6 my-4">
            <ProgressRing
              value={courseAccuracy.find(c => c.subject === activeTab)?.score || 0}
              label={activeTab}
              size={90}
              strokeWidth={7}
            />
            <div>
              <p className="text-[22px] font-bold text-[#1a0f3c]">
                {courseAccuracy.find(c => c.subject === activeTab)?.score.toFixed(1) || 0}%
              </p>
              <p className="text-[12px] text-[#9892b8]">Average accuracy in {activeTab}</p>
            </div>
          </div>

          {/* Module table for this course */}
          <table className="w-full" style={{ fontFamily: "'DM Sans'" }}>
            <thead>
              <tr className="text-[10px] font-semibold text-[#9892b8] uppercase tracking-wider">
                <th className="text-left py-2 px-2">Module</th>
                <th className="text-right py-2 px-2">Accuracy</th>
                <th className="text-right py-2 px-2">Duration</th>
                <th className="text-right py-2 px-2">Attempts</th>
              </tr>
            </thead>
            <tbody>
              {tabModules.map((m, i) => (
                <tr key={i} className="border-t border-[#8b7cf60a] hover:bg-[#f5f3ff] transition-colors">
                  <td className="py-2.5 px-2 text-[12.5px] font-medium text-[#1a0f3c]">{m.name}</td>
                  <td className={`py-2.5 px-2 text-right text-[12.5px] font-bold ${accColor(m.accuracy)}`} style={{ fontFamily: "'DM Mono'" }}>
                    {m.accuracy.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-2 text-right text-[12px] text-[#9892b8]" style={{ fontFamily: "'DM Mono'" }}>
                    {m.avgDuration}s
                  </td>
                  <td className="py-2.5 px-2 text-right text-[12px] text-[#9892b8]" style={{ fontFamily: "'DM Mono'" }}>
                    {m.totalAttempts.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mini bar chart for this course */}
          {tabModules.length > 0 && (
            <div className="mt-4">
              <AccuracyBarChart
                data={tabModules.map(m => ({ name: m.name, accuracy: m.accuracy }))}
                height={180}
                colorScale
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Section 3: Mentor Info ── */}
      <Card className="border-0 shadow-lg shadow-[#8b7cf610]" style={{ borderRadius: 20, background: "#fff" }}>
        <CardHeader className="px-[22px] pt-4 pb-0">
          <span className="text-[13px] font-semibold text-[#1a0f3c]">Assigned Mentor</span>
        </CardHeader>
        <CardContent className="px-[22px] pb-4">
          {mentor ? (
            <div className="flex items-center gap-3 rounded-[14px] p-3.5 mt-2" style={{ background: "#f5f3ff", border: "1px solid #e4deff" }}>
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#8b7cf6,#6457d4)" }}
              >
                {initials(mentor.name)}
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#1a0f3c]">{mentor.name}</p>
                <p className="text-[11px] text-[#9892b8]">{mentor.email} · Pool #{mentor.poolNo}</p>
              </div>
              <Badge className="ml-auto text-[10px] font-semibold px-2.5 py-0.5 rounded-full border-0 bg-[#e4deff] text-[#6457d4]">
                Mentor
              </Badge>
            </div>
          ) : (
            <p className="text-[13px] text-[#9892b8] mt-2">No mentor assigned</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
