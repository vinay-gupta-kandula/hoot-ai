"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, Target, BookOpen, Layers, Search, ChevronDown, ChevronRight } from "lucide-react";
import { SkillRadar } from "@/components/charts/radar-chart";
import type { SkillRadarData } from "@/components/charts/radar-chart";
import { AccuracyBarChart } from "@/components/charts/bar-chart";
import { DistributionPie } from "@/components/charts/pie-chart";
import { HeatmapGrid } from "@/components/charts/heatmap";
import { ProgressRing } from "@/components/charts/progress-ring";

/* ─── Types ─── */
interface MentorInfo {
  id: string;
  name: string;
  email: string;
  poolNo: number;
}

interface MentorStats {
  totalStudents: number;
  avgAccuracy: number;
  totalAssessments: number;
  activeModules: number;
}

interface ModuleData {
  name: string;
  accuracy: number;
  course: string;
  avgDuration: number;
  totalAttempts: number;
}

interface StudentRow {
  id: string;
  name: string;
  rollNo: string;
  branch: string;
  avgAccuracy: number;
  totalAssessments: number;
}

interface MentorDetailViewProps {
  mentor: MentorInfo;
  stats: MentorStats;
  courseAccuracy: SkillRadarData[];
  moduleAccuracy: ModuleData[];
  studentLeaderboard: StudentRow[];
  distributions: {
    branchDist: Record<string, number>;
    genderDist: Record<string, number>;
    techDist: Record<string, number>;
  };
  heatmap: { rows: string[]; cols: string[]; data: number[][] };
}

/* ─── Color helpers ─── */
const BRANCH_COLORS: Record<string, string> = {
  CSE: "#8b7cf6", AIML: "#6457d4", ECE: "#3b82f6", DS: "#1dbf8a",
  IT: "#f4657e", IOT: "#f59e0b",
};
const GENDER_COLORS: Record<string, string> = { MALE: "#6457d4", FEMALE: "#f4657e" };
const TECH_COLORS: Record<string, string> = {
  AWS: "#f59e0b", "DATA ANALYTICS": "#3b82f6", FLUTTER: "#1dbf8a",
  "FULL STACK": "#8b7cf6", SERVICENOW: "#f4657e", VLSI: "#6457d4",
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const accColor = (v: number) => (v >= 80 ? "text-[#1dbf8a]" : v >= 60 ? "text-[#f59e0b]" : "text-[#f4657e]");

/* ─── Stat Mini Card ─── */
function MiniStat({ label, value, icon, accent }: { label: string; value: string | number; icon: React.ReactNode; accent?: boolean }) {
  return (
    <div
      className="rounded-[16px] p-4 relative overflow-hidden"
      style={accent
        ? { background: "linear-gradient(135deg,#6457d4,#8b7cf6)", minHeight: 100 }
        : { background: "#fff", border: "1px solid rgba(139,124,246,0.1)", minHeight: 100 }
      }
    >
      <p className={`text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${accent ? "text-white/70" : "text-[#9892b8]"}`}>{label}</p>
      <p className={`text-[28px] font-bold tracking-tight leading-none ${accent ? "text-white" : "text-[#1a0f3c]"}`}>{value}</p>
      <div className={`absolute top-3 right-3 w-8 h-8 rounded-[8px] flex items-center justify-center ${accent ? "bg-white/15" : "bg-[#f3f0ff]"}`}>
        <span className={accent ? "text-white" : "text-[#6457d4]"}>{icon}</span>
      </div>
    </div>
  );
}

/* ─── Component ─── */
export function MentorDetailView({
  mentor, stats, courseAccuracy, moduleAccuracy, studentLeaderboard, distributions, heatmap,
}: MentorDetailViewProps) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"accuracy" | "name">("accuracy");

  const filtered = studentLeaderboard
    .filter(s => s.name.toLowerCase().includes(query.toLowerCase()) || s.rollNo.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => sortBy === "accuracy" ? b.avgAccuracy - a.avgAccuracy : a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: "#f5f3ff", fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── Header ── */}
      <Link
        href="/dashboard/main-mentor"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#6457d4] hover:text-[#4a3ab5] transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Overview
      </Link>

      <div className="flex items-start gap-4 mb-7">
        <div
          className="w-16 h-16 rounded-[16px] flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#6457d4,#8b7cf6)" }}
        >
          {initials(mentor.name)}
        </div>
        <div>
          <h1 className="text-[26px] font-semibold text-[#1a0f3c] tracking-tight leading-tight">{mentor.name}</h1>
          <p className="text-[13px] text-[#9892b8] mt-0.5">{mentor.email}</p>
          <Badge className="mt-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border-0" style={{ background: "#f3f0ff", color: "#6457d4" }}>
            Pool #{mentor.poolNo}
          </Badge>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-7">
        <MiniStat label="Students" value={stats.totalStudents} icon={<Users className="w-4 h-4" />} accent />
        <MiniStat label="Avg Accuracy" value={`${stats.avgAccuracy}%`} icon={<Target className="w-4 h-4" />} />
        <MiniStat label="Assessments" value={stats.totalAssessments.toLocaleString()} icon={<BookOpen className="w-4 h-4" />} />
        <MiniStat label="Active Modules" value={stats.activeModules} icon={<Layers className="w-4 h-4" />} />
      </div>

      {/* ── Section 1: Radar + Module Bars (2-col) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <Card className="border-0 shadow-lg shadow-[#8b7cf610]" style={{ borderRadius: 20, background: "#fff" }}>
          <CardHeader className="px-[22px] pt-4 pb-0">
            <span className="text-[13px] font-semibold text-[#1a0f3c]">Course Skill Radar</span>
            <p className="text-[11px] text-[#9892b8] mt-0.5">Avg accuracy across Listening, Reading, Speaking, Writing</p>
          </CardHeader>
          <CardContent className="px-[22px] pb-4">
            <SkillRadar data={courseAccuracy} height={280} />
            {/* Progress rings row */}
            <div className="flex justify-center gap-6 mt-2">
              {courseAccuracy.map(c => (
                <ProgressRing key={c.subject} value={c.score} label={c.subject} size={70} strokeWidth={5} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-[#8b7cf610]" style={{ borderRadius: 20, background: "#fff" }}>
          <CardHeader className="px-[22px] pt-4 pb-0">
            <span className="text-[13px] font-semibold text-[#1a0f3c]">Module Performance</span>
            <p className="text-[11px] text-[#9892b8] mt-0.5">{moduleAccuracy.length} modules ranked by accuracy</p>
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

      {/* ── Section 2: Module Detail Table ── */}
      <Card className="border-0 shadow-lg shadow-[#8b7cf610] mb-5" style={{ borderRadius: 20, background: "#fff" }}>
        <CardHeader className="px-[22px] pt-4 pb-0">
          <span className="text-[13px] font-semibold text-[#1a0f3c]">Module Details</span>
        </CardHeader>
        <CardContent className="px-[22px] pb-4 overflow-x-auto">
          <table className="w-full mt-3" style={{ fontFamily: "'DM Sans'" }}>
            <thead>
              <tr className="text-[10px] font-semibold text-[#9892b8] uppercase tracking-wider">
                <th className="text-left py-2 px-2">Module</th>
                <th className="text-left py-2 px-2">Course</th>
                <th className="text-right py-2 px-2">Accuracy</th>
                <th className="text-right py-2 px-2">Avg Duration</th>
                <th className="text-right py-2 px-2">Total Attempts</th>
              </tr>
            </thead>
            <tbody>
              {moduleAccuracy.map((m, i) => (
                <tr key={i} className="border-t border-[#8b7cf60a] hover:bg-[#f5f3ff] transition-colors">
                  <td className="py-2.5 px-2 text-[12.5px] font-medium text-[#1a0f3c]">{m.name}</td>
                  <td className="py-2.5 px-2">
                    <Badge className="text-[10px] px-2 py-0 rounded-full border-0 bg-[#f3f0ff] text-[#6457d4]">{m.course}</Badge>
                  </td>
                  <td className={`py-2.5 px-2 text-right text-[12.5px] font-bold ${accColor(m.accuracy)}`} style={{ fontFamily: "'DM Mono', monospace" }}>
                    {m.accuracy.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-2 text-right text-[12px] text-[#9892b8]" style={{ fontFamily: "'DM Mono', monospace" }}>
                    {m.avgDuration}s
                  </td>
                  <td className="py-2.5 px-2 text-right text-[12px] text-[#9892b8]" style={{ fontFamily: "'DM Mono', monospace" }}>
                    {m.totalAttempts.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ── Section 3: Student Leaderboard ── */}
      <Card className="border-0 shadow-lg shadow-[#8b7cf610] mb-5" style={{ borderRadius: 20, background: "#fff" }}>
        <CardHeader className="px-[22px] pt-4 pb-0 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[13px] font-semibold text-[#1a0f3c]">Student Leaderboard</span>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "#f3f0ff", color: "#6457d4", border: "1px solid #c4b8f9" }}>
              {filtered.length} students
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortBy(sortBy === "accuracy" ? "name" : "accuracy")}
              className="text-[11px] font-medium text-[#6457d4] bg-[#f3f0ff] px-3 py-1.5 rounded-[10px] hover:bg-[#e4deff] transition-colors"
            >
              Sort: {sortBy === "accuracy" ? "↓ Accuracy" : "↓ Name"}
            </button>
            <div className="flex items-center rounded-[12px] px-3 py-1.5" style={{ background: "#f5f3ff", border: "1px solid #e4deff" }}>
              <Search className="w-3.5 h-3.5 text-[#9892b8] mr-2" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search…"
                className="border-0 bg-transparent shadow-none p-0 h-auto text-[12px] text-[#1a0f3c] placeholder:text-[#9892b8] focus-visible:ring-0 w-32"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-[22px] pb-4 overflow-x-auto">
          <table className="w-full mt-3">
            <thead>
              <tr className="text-[10px] font-semibold text-[#9892b8] uppercase tracking-wider">
                <th className="text-left py-2 px-2">#</th>
                <th className="text-left py-2 px-2">Student</th>
                <th className="text-left py-2 px-2">Roll No</th>
                <th className="text-left py-2 px-2">Branch</th>
                <th className="text-right py-2 px-2">Avg Accuracy</th>
                <th className="text-right py-2 px-2">Assessments</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} className="border-t border-[#8b7cf60a] hover:bg-[#f5f3ff] transition-colors">
                  <td className="py-2.5 px-2 text-[11px] text-[#9892b8]" style={{ fontFamily: "'DM Mono', monospace" }}>
                    {String(i + 1).padStart(2, "0")}
                  </td>
                  <td className="py-2.5 px-2">
                    <Link
                      href={`/dashboard/main-mentor/student/${s.id}`}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <div
                        className="w-7 h-7 rounded-[8px] flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0"
                        style={{ background: `linear-gradient(135deg,${BRANCH_COLORS[s.branch] || "#8b7cf6"},#6457d4)` }}
                      >
                        {initials(s.name)}
                      </div>
                      <span className="text-[12.5px] font-medium text-[#1a0f3c]">{s.name}</span>
                    </Link>
                  </td>
                  <td className="py-2.5 px-2 text-[11px] text-[#9892b8]" style={{ fontFamily: "'DM Mono', monospace" }}>{s.rollNo}</td>
                  <td className="py-2.5 px-2">
                    <Badge className="text-[10px] px-1.5 py-0 rounded-full border-0 bg-[#f3f0ff] text-[#6457d4]">{s.branch}</Badge>
                  </td>
                  <td className={`py-2.5 px-2 text-right text-[12.5px] font-bold ${accColor(s.avgAccuracy)}`} style={{ fontFamily: "'DM Mono', monospace" }}>
                    {s.avgAccuracy.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-2 text-right text-[12px] text-[#9892b8]">{s.totalAssessments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ── Section 4: Distribution Pies ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <Card className="border-0 shadow-lg shadow-[#8b7cf610]" style={{ borderRadius: 20, background: "#fff" }}>
          <CardHeader className="px-[22px] pt-4 pb-0"><span className="text-[13px] font-semibold text-[#1a0f3c]">Branch Split</span></CardHeader>
          <CardContent className="px-[22px] pb-4">
            <DistributionPie data={Object.entries(distributions.branchDist).map(([name, value]) => ({ name, value, color: BRANCH_COLORS[name] || "#9892b8" }))} height={200} />
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg shadow-[#8b7cf610]" style={{ borderRadius: 20, background: "#fff" }}>
          <CardHeader className="px-[22px] pt-4 pb-0"><span className="text-[13px] font-semibold text-[#1a0f3c]">Gender Split</span></CardHeader>
          <CardContent className="px-[22px] pb-4">
            <DistributionPie data={Object.entries(distributions.genderDist).map(([name, value]) => ({ name, value, color: GENDER_COLORS[name] || "#9892b8" }))} height={200} />
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg shadow-[#8b7cf610]" style={{ borderRadius: 20, background: "#fff" }}>
          <CardHeader className="px-[22px] pt-4 pb-0"><span className="text-[13px] font-semibold text-[#1a0f3c]">Technology Split</span></CardHeader>
          <CardContent className="px-[22px] pb-4">
            <DistributionPie data={Object.entries(distributions.techDist).map(([name, value]) => ({ name, value, color: TECH_COLORS[name] || "#9892b8" }))} height={200} />
          </CardContent>
        </Card>
      </div>

      {/* ── Section 5: Student × Course Heatmap ── */}
      <Card className="border-0 shadow-lg shadow-[#8b7cf610] mb-5" style={{ borderRadius: 20, background: "#fff" }}>
        <CardHeader className="px-[22px] pt-4 pb-0">
          <span className="text-[13px] font-semibold text-[#1a0f3c]">Student × Course Heatmap</span>
          <p className="text-[11px] text-[#9892b8] mt-0.5">Per-student accuracy across all 4 courses</p>
        </CardHeader>
        <CardContent className="px-[22px] pb-4 pt-3">
          <HeatmapGrid rows={heatmap.rows} cols={heatmap.cols} data={heatmap.data} />
        </CardContent>
      </Card>
    </div>
  );
}
