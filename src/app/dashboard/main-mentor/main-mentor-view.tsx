// app/dashboard/main-mentor/page.tsx
// Props-driven: pass MainMentorPageProps from a server component or layout

"use client";

import { useState, useTransition } from "react";
import toast, { Toaster } from "react-hot-toast";
import { assignMentor, removeMentor } from "./actions";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Users,
    UserCheck,
    BookOpen,
    TrendingUp,
    RefreshCw,
    GraduationCap,
    X,
} from "lucide-react";
import { SkillRadar } from "@/components/charts/radar-chart";
import type { SkillRadarData } from "@/components/charts/radar-chart";
import { AccuracyBarChart } from "@/components/charts/bar-chart";
import type { AccuracyBarData } from "@/components/charts/bar-chart";
import { DistributionPie } from "@/components/charts/pie-chart";
import type { PieData } from "@/components/charts/pie-chart";
import { HeatmapGrid } from "@/components/charts/heatmap";

/* ─── Types ─────────────────────────────────────────── */
export interface MentorSummary {
    id: string;
    name: string;
    department: "CSE" | "ECE" | "Mech" | "Civil" | "IT";
    email: string;
    studentCount: number;
}

export interface StudentWithMentor {
    id: string;
    name: string;
    rollNo: string;
    branch: "CSE" | "ECE" | "Mech" | "Civil" | "IT";
    mentorId: string | null;
    mentorName: string | null;
}

export interface MentorOption {
    id: string;
    name: string;
}

export interface AnalyticsData {
    branchDist: Record<string, number>;
    genderDist: Record<string, number>;
    techDist: Record<string, number>;
    collegeDist: Record<string, number>;
    courseAccuracy: SkillRadarData[];
    moduleAccuracy: AccuracyBarData[];
    collegeAccuracy: AccuracyBarData[];
    heatmapRows: string[];
    heatmapCols: string[];
    heatmapData: number[][];
}

export interface MainMentorPageProps {
    stats: {
        totalStudents: number;
        totalMentors: number;
        branches: number;
        avgCgpa: number;
    };
    mentors: MentorSummary[];
    allStudents: StudentWithMentor[];
    mentorOptions: MentorOption[];
    analytics?: AnalyticsData;
}

/* ─── Pie color palettes ─────────────────────────────── */
const BRANCH_COLORS: Record<string, string> = {
    CSE: "#8b7cf6", AIML: "#6457d4", ECE: "#3b82f6", DS: "#1dbf8a",
    IT: "#f4657e", IOT: "#f59e0b", Mech: "#d47c0a", Civil: "#0d8a62",
};
const GENDER_COLORS: Record<string, string> = { MALE: "#6457d4", FEMALE: "#f4657e" };
const TECH_COLORS: Record<string, string> = {
    AWS: "#f59e0b", "DATA ANALYTICS": "#3b82f6", FLUTTER: "#1dbf8a",
    "FULL STACK": "#8b7cf6", SERVICENOW: "#f4657e", VLSI: "#6457d4",
};

/* ─── Branch colour map ──────────────────────────────── */
const branchStyle: Record<string, { bg: string; text: string; avatarFrom: string; avatarTo: string; dot: string }> = {
    CSE: { bg: "bg-[#f3f0ff]", text: "text-[#6457d4]", avatarFrom: "#8b7cf6", avatarTo: "#6457d4", dot: "bg-[#8b7cf6]" },
    ECE: { bg: "bg-[#eef6ff]", text: "text-[#2563eb]", avatarFrom: "#3b82f6", avatarTo: "#1d4ed8", dot: "bg-[#3b82f6]" },
    Mech: { bg: "bg-[#fffbeb]", text: "text-[#d47c0a]", avatarFrom: "#f59e0b", avatarTo: "#d47c0a", dot: "bg-[#f59e0b]" },
    Civil: { bg: "bg-[#e8fdf5]", text: "text-[#0d8a62]", avatarFrom: "#1dbf8a", avatarTo: "#0d8a62", dot: "bg-[#1dbf8a]" },
    IT: { bg: "bg-[#fff1f3]", text: "text-[#d63a5a]", avatarFrom: "#f4657e", avatarTo: "#d63a5a", dot: "bg-[#f4657e]" },
};

const loadColour = (count: number, avg: number) => {
    if (count > avg * 1.2) return { bg: "#fff1f3", text: "#d63a5a", label: "High" };
    if (count < avg * 0.8) return { bg: "#fffbeb", text: "#d47c0a", label: "Low" };
    return { bg: "#e8fdf5", text: "#0d8a62", label: "Normal" };
};

function initials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

/* ─── Stat Card ─────────────────────────────────────── */
interface StatCardProps {
    label: string;
    value: string | number;
    sub: string;
    icon: React.ReactNode;
    featured?: boolean;
    iconBg?: string;
    iconColor?: string;
}

function StatCard({ label, value, sub, icon, featured, iconBg, iconColor }: StatCardProps) {
    if (featured) {
        return (
            <div
                className="relative rounded-[18px] p-[18px] overflow-hidden"
                style={{ background: "linear-gradient(135deg,#6457d4,#8b7cf6)", minHeight: 120 }}
            >
                {/* Subtle radial glow top-right */}
                <div
                    className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 pointer-events-none"
                    style={{ background: "radial-gradient(circle,#fff,transparent)", transform: "translate(30%,-30%)" }}
                />
                <p className="text-[11.5px] font-medium text-white/70 uppercase tracking-[0.3px] mb-2.5">{label}</p>
                <p className="text-[32px] font-semibold text-white tracking-[-1px] leading-none">{value}</p>
                <p className="text-[11.5px] text-white/70 mt-1.5 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-white/90" />
                    <span className="text-white/90 font-medium">{sub}</span>
                </p>
                <div
                    className="absolute top-4 right-4 w-9 h-9 rounded-[10px] flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.15)" }}
                >
                    <span className="text-white">{icon}</span>
                </div>
            </div>
        );
    }

    return (
        <div
            className="relative rounded-[18px] p-[18px] overflow-hidden"
            style={{ background: "#ffffff", border: "1px solid rgba(139,124,246,0.1)", minHeight: 120 }}
        >
            <p className="text-[11.5px] font-medium text-[#9892b8] uppercase tracking-[0.3px] mb-2.5">{label}</p>
            <p className="text-[32px] font-semibold text-[#1a0f3c] tracking-[-1px] leading-none">{value}</p>
            <p className="text-[11.5px] text-[#9892b8] mt-1.5">{sub}</p>
            <div
                className="absolute top-4 right-4 w-9 h-9 rounded-[10px] flex items-center justify-center"
                style={{ background: iconBg ?? "#f3f0ff" }}
            >
                <span style={{ color: iconColor ?? "#6457d4" }}>{icon}</span>
            </div>
        </div>
    );
}

/* ─── Re-assign Dialog ───────────────────────────────── */
function ReAssignDialog({ mentorName, onConfirm }: { mentorName: string; onConfirm: () => void }) {
    return (
        <Dialog>
            <DialogTrigger render={
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-[11.5px] font-medium text-[#6457d4] rounded-[10px] h-7 px-3 border border-[#8b7cf640] hover:bg-[#f3f0ff] hover:border-[#8b7cf6] transition-colors"
                >
                    <RefreshCw className="w-3 h-3 mr-1.5" />
                    Re-assign
                </Button>
            } />
            <DialogContent
                className="rounded-[20px] border border-[#e4deff] shadow-xl shadow-[#8b7cf620]"
                style={{ fontFamily: "'DM Sans', sans-serif", background: "#fff" }}
            >
                <DialogHeader>
                    <DialogTitle className="text-[17px] font-semibold text-[#1a0f3c]">Re-assign Mentor</DialogTitle>
                    <DialogDescription className="text-[13px] text-[#9892b8]">
                        You are about to re-assign students from <span className="font-medium text-[#4a4270]">{mentorName}</span>. This will open the student assignment flow.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 mt-2">
                    <Button
                        variant="outline"
                        className="rounded-[12px] text-[13px] border-[#e4deff] text-[#4a4270] hover:bg-[#f5f3ff]"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className="rounded-[12px] text-[13px] text-white border-0"
                        style={{ background: "linear-gradient(135deg,#6457d4,#8b7cf6)" }}
                    >
                        Continue
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/* ─── Main Component ─────────────────────────────────── */
export function MainMentorDashboardView({ stats, mentors, allStudents, mentorOptions, analytics }: MainMentorPageProps) {
    const [mentorList, setMentorList] = useState(mentors);
    const [isPending, startTransition] = useTransition();
    const avgLoad = Math.round(stats.totalStudents / (stats.totalMentors || 1));

    const handleReAssign = (id: string) => {
        console.log("Re-assign mentor:", id);
    };

    const handleAssign = (studentId: string, mentorId: string) => {
        startTransition(async () => {
            const result = await assignMentor(studentId, mentorId);
            if (result.success) {
                toast.success("Mentor assigned successfully");
            } else {
                toast.error(result.error || "Failed to assign mentor");
            }
        });
    };

    const handleRemove = (studentId: string) => {
        startTransition(async () => {
            const result = await removeMentor(studentId);
            if (result.success) {
                toast.success("Mentor removed successfully");
            } else {
                toast.error(result.error || "Failed to remove mentor");
            }
        });
    };

    return (
        <div
            className="min-h-screen p-6 md:p-10"
            style={{ background: "#f5f3ff", fontFamily: "'DM Sans', sans-serif" }}
        >
            {/* ── Page header ── */}
            <div className="mb-7 flex items-end justify-between flex-wrap gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div
                            className="w-7 h-7 rounded-[9px] flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg,#6457d4,#8b7cf6)" }}
                        >
                            <GraduationCap className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[12px] font-semibold text-[#8b7cf6] uppercase tracking-wider">
                            MentorOS
                        </span>
                    </div>
                    <h1 className="text-[26px] font-semibold text-[#1a0f3c] tracking-tight leading-tight">
                        Program Overview
                    </h1>
                    <p className="text-[13px] text-[#9892b8] mt-0.5">Sem 2 · 2025–26</p>
                </div>

                <Button
                    className="rounded-[12px] text-[13.5px] font-medium text-white border-0 px-5 h-10"
                    style={{ background: "linear-gradient(135deg,#6457d4,#8b7cf6)" }}
                >
                    + Add Mentor
                </Button>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-7">
                <StatCard
                    label="Total Students"
                    value={stats.totalStudents}
                    sub="+12 this semester"
                    icon={<Users className="w-[18px] h-[18px]" />}
                    featured
                />
                <StatCard
                    label="Total Mentors"
                    value={stats.totalMentors}
                    sub="Active this semester"
                    icon={<UserCheck className="w-[18px] h-[18px]" />}
                    iconBg="#f3f0ff"
                    iconColor="#6457d4"
                />
                <StatCard
                    label="Branches"
                    value={stats.branches}
                    sub="Departments covered"
                    icon={<BookOpen className="w-[18px] h-[18px]" />}
                    iconBg="#fff1f3"
                    iconColor="#d63a5a"
                />
                <StatCard
                    label="Avg. CGPA"
                    value={stats.avgCgpa.toFixed(1)}
                    sub="↑ 0.2 from last sem"
                    icon={<TrendingUp className="w-[18px] h-[18px]" />}
                    iconBg="#e8fdf5"
                    iconColor="#0d8a62"
                />
            </div>

            {/* ── Mentor List Card ── */}
            <Card
                className="border-0 shadow-lg shadow-[#8b7cf610]"
                style={{ borderRadius: 20, background: "#ffffff" }}
            >
                <CardHeader
                    className="px-[22px] pt-5 flex flex-row items-center justify-between border-b border-[#8b7cf608]"
                    style={{ paddingBottom: 14 }}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-[14.5px] font-semibold text-[#1a0f3c]">All Mentors</span>
                        <span
                            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                            style={{ background: "#f3f0ff", color: "#6457d4", border: "1px solid #c4b8f9" }}
                        >
                            {mentors.length} mentors
                        </span>
                    </div>
                    <p className="text-[12px] text-[#9892b8]">
                        Avg load: <span className="font-semibold text-[#4a4270]">{avgLoad} students</span>
                    </p>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="divide-y divide-[#8b7cf608]">
                        {mentorList.map((mentor) => {
                            const br = branchStyle[mentor.department] ?? branchStyle.CSE;
                            const load = loadColour(mentor.studentCount, avgLoad);

                            return (
                                <div
                                    key={mentor.id}
                                    className="flex items-center gap-4 px-[22px] py-[14px] hover:bg-[#f5f3ff] transition-colors group"
                                >
                                    {/* Gradient avatar */}
                                    <div
                                        className="w-10 h-10 rounded-[12px] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                                        style={{ background: `linear-gradient(135deg,${br.avatarFrom},${br.avatarTo})` }}
                                    >
                                        {initials(mentor.name)}
                                    </div>

                                    {/* Name + dept */}
                                    <div className="min-w-0 flex-1">
                                        <Link href={`/dashboard/main-mentor/mentor/${mentor.id}`} className="hover:underline">
                                            <p className="text-[13.5px] font-semibold text-[#1a0f3c] truncate">{mentor.name}</p>
                                        </Link>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Badge
                                                className={`text-[10.5px] font-medium px-2 py-0 rounded-full border-0 inline-flex items-center gap-1 ${br.bg} ${br.text}`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${br.dot}`} />
                                                {mentor.department}
                                            </Badge>
                                            <span className="text-[11px] text-[#9892b8]">{mentor.email}</span>
                                        </div>
                                    </div>

                                    {/* Student count pill */}
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="text-right hidden sm:block">
                                            <span
                                                className="text-[12px] font-semibold px-2.5 py-1 rounded-[9px]"
                                                style={{ background: "#f3f0ff", color: "#6457d4" }}
                                            >
                                                {mentor.studentCount} students
                                            </span>
                                            <div className="mt-1 flex justify-end">
                                                <span
                                                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                                    style={{ background: load.bg, color: load.text }}
                                                >
                                                    {load.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Re-assign */}
                                        <ReAssignDialog
                                            mentorName={mentor.name}
                                            onConfirm={() => handleReAssign(mentor.id)}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="px-[22px] py-3.5 border-t border-[#8b7cf608] flex items-center justify-between">
                        <span className="text-[12px] text-[#9892b8]">
                            {mentors.length} mentors · {stats.totalStudents} students total
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-[12px] text-[#9892b8] hover:text-[#6457d4] hover:bg-[#f3f0ff] rounded-[10px] h-7 px-3"
                        >
                            Export roster
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* ── All Students Assignment Table ── */}
            <Card
                className="border-0 shadow-lg shadow-[#8b7cf610] mt-7"
                style={{ borderRadius: 20, background: "#ffffff" }}
            >
                <CardHeader
                    className="px-[22px] pt-5 flex flex-row items-center justify-between border-b border-[#8b7cf608]"
                    style={{ paddingBottom: 14 }}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-[14.5px] font-semibold text-[#1a0f3c]">Student ↔ Mentor Assignment</span>
                        <span
                            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                            style={{ background: "#f3f0ff", color: "#6457d4", border: "1px solid #c4b8f9" }}
                        >
                            {allStudents.length} students
                        </span>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="divide-y divide-[#8b7cf608]">
                        {allStudents.map((student) => {
                            const br = branchStyle[student.branch] ?? branchStyle.CSE;
                            return (
                                <div
                                    key={student.id}
                                    className="flex items-center gap-4 px-[22px] py-[14px] hover:bg-[#f5f3ff] transition-colors"
                                >
                                    {/* Student avatar */}
                                    <div
                                        className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0"
                                        style={{ background: `linear-gradient(135deg,${br.avatarFrom},${br.avatarTo})` }}
                                    >
                                        {initials(student.name)}
                                    </div>

                                    {/* Name + Roll + Branch */}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[13.5px] font-semibold text-[#1a0f3c] truncate">{student.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[11px] text-[#9892b8]" style={{ fontFamily: "'DM Mono', monospace" }}>
                                                {student.rollNo}
                                            </span>
                                            <Badge
                                                className={`text-[10px] font-medium px-1.5 py-0 rounded-full border-0 inline-flex items-center gap-1 ${br.bg} ${br.text}`}
                                            >
                                                <span className={`w-1 h-1 rounded-full ${br.dot}`} />
                                                {student.branch}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Mentor Assignment */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Select
                                            value={student.mentorId || ""}
                                            onValueChange={(value) => handleAssign(student.id, value)}
                                            disabled={isPending}
                                        >
                                            <SelectTrigger
                                                className="w-[180px] h-8 rounded-[10px] text-[12px] border-[#e4deff] bg-[#f5f3ff] text-[#4a4270] focus:ring-[#8b7cf6]"
                                            >
                                                <SelectValue placeholder="Assign mentor…" />
                                            </SelectTrigger>
                                            <SelectContent
                                                className="rounded-[12px] border-[#e4deff]"
                                                style={{ fontFamily: "'DM Sans', sans-serif" }}
                                            >
                                                {mentorOptions.map((m) => (
                                                    <SelectItem
                                                        key={m.id}
                                                        value={m.id}
                                                        className="text-[12px] text-[#1a0f3c] rounded-[8px]"
                                                    >
                                                        {m.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        {/* Remove button (only when assigned) */}
                                        {student.mentorId && (
                                            <button
                                                onClick={() => handleRemove(student.id)}
                                                disabled={isPending}
                                                className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[#d63a5a] bg-[#fff1f3] hover:bg-[#ffe0e5] transition-colors disabled:opacity-50"
                                                title="Remove mentor"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="px-[22px] py-3.5 border-t border-[#8b7cf608] flex items-center">
                        <span className="text-[12px] text-[#9892b8]">
                            {allStudents.filter(s => s.mentorId).length} of {allStudents.length} students assigned
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* ══════════════════════════════════════════════════ */}
            {/* ── PROGRAM ANALYTICS ──                           */}
            {/* ══════════════════════════════════════════════════ */}
            {analytics && (
                <>
                    {/* Section header */}
                    <div className="mt-10 mb-5">
                        <h2 className="text-[22px] font-semibold text-[#1a0f3c] tracking-tight">Program Analytics</h2>
                        <p className="text-[13px] text-[#9892b8] mt-0.5">Deep insights across all students, mentors, and assessments</p>
                    </div>

                    {/* Row 1 — Distribution Pie Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                        {/* Branch Distribution */}
                        <Card className="border-0 shadow-lg shadow-[#8b7cf610]" style={{ borderRadius: 20, background: "#fff" }}>
                            <CardHeader className="px-[22px] pt-4 pb-0">
                                <span className="text-[13px] font-semibold text-[#1a0f3c]">Branch Distribution</span>
                            </CardHeader>
                            <CardContent className="px-[22px] pb-4">
                                <DistributionPie
                                    data={Object.entries(analytics.branchDist).map(([name, value]) => ({
                                        name, value, color: BRANCH_COLORS[name] || "#9892b8",
                                    }))}
                                    height={220}
                                />
                            </CardContent>
                        </Card>

                        {/* Gender Distribution */}
                        <Card className="border-0 shadow-lg shadow-[#8b7cf610]" style={{ borderRadius: 20, background: "#fff" }}>
                            <CardHeader className="px-[22px] pt-4 pb-0">
                                <span className="text-[13px] font-semibold text-[#1a0f3c]">Gender Distribution</span>
                            </CardHeader>
                            <CardContent className="px-[22px] pb-4">
                                <DistributionPie
                                    data={Object.entries(analytics.genderDist).map(([name, value]) => ({
                                        name, value, color: GENDER_COLORS[name] || "#9892b8",
                                    }))}
                                    height={220}
                                />
                            </CardContent>
                        </Card>

                        {/* Technology Distribution */}
                        <Card className="border-0 shadow-lg shadow-[#8b7cf610]" style={{ borderRadius: 20, background: "#fff" }}>
                            <CardHeader className="px-[22px] pt-4 pb-0">
                                <span className="text-[13px] font-semibold text-[#1a0f3c]">Technology Distribution</span>
                            </CardHeader>
                            <CardContent className="px-[22px] pb-4">
                                <DistributionPie
                                    data={Object.entries(analytics.techDist).map(([name, value]) => ({
                                        name, value, color: TECH_COLORS[name] || "#9892b8",
                                    }))}
                                    height={220}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Row 2 — Course Radar + College Bar (2-column) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
                        {/* Course Performance Radar */}
                        <Card className="border-0 shadow-lg shadow-[#8b7cf610]" style={{ borderRadius: 20, background: "#fff" }}>
                            <CardHeader className="px-[22px] pt-4 pb-0">
                                <span className="text-[13px] font-semibold text-[#1a0f3c]">Course Performance — Radar</span>
                                <p className="text-[11px] text-[#9892b8] mt-0.5">Average accuracy across 4 courses</p>
                            </CardHeader>
                            <CardContent className="px-[22px] pb-4">
                                <SkillRadar data={analytics.courseAccuracy} height={280} />
                            </CardContent>
                        </Card>

                        {/* College Comparison Bar */}
                        <Card className="border-0 shadow-lg shadow-[#8b7cf610]" style={{ borderRadius: 20, background: "#fff" }}>
                            <CardHeader className="px-[22px] pt-4 pb-0">
                                <span className="text-[13px] font-semibold text-[#1a0f3c]">College Comparison</span>
                                <p className="text-[11px] text-[#9892b8] mt-0.5">Average accuracy by college</p>
                            </CardHeader>
                            <CardContent className="px-[22px] pb-4">
                                <AccuracyBarChart data={analytics.collegeAccuracy} height={280} colorScale />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Row 3 — Module Performance Bars (full width) */}
                    <Card className="border-0 shadow-lg shadow-[#8b7cf610] mb-5" style={{ borderRadius: 20, background: "#fff" }}>
                        <CardHeader className="px-[22px] pt-4 pb-0">
                            <span className="text-[13px] font-semibold text-[#1a0f3c]">Module Performance Ranking</span>
                            <p className="text-[11px] text-[#9892b8] mt-0.5">All 16 modules ranked by average accuracy</p>
                        </CardHeader>
                        <CardContent className="px-[22px] pb-4">
                            <AccuracyBarChart
                                data={analytics.moduleAccuracy}
                                height={500}
                                layout="vertical"
                                colorScale
                            />
                        </CardContent>
                    </Card>

                    {/* Row 4 — Mentor × Course Heatmap (full width) */}
                    <Card className="border-0 shadow-lg shadow-[#8b7cf610] mb-5" style={{ borderRadius: 20, background: "#fff" }}>
                        <CardHeader className="px-[22px] pt-4 pb-0">
                            <span className="text-[13px] font-semibold text-[#1a0f3c]">Mentor × Course Heatmap</span>
                            <p className="text-[11px] text-[#9892b8] mt-0.5">Average accuracy per mentor per course — color intensity shows performance</p>
                        </CardHeader>
                        <CardContent className="px-[22px] pb-4 pt-3">
                            <HeatmapGrid
                                rows={analytics.heatmapRows}
                                cols={analytics.heatmapCols}
                                data={analytics.heatmapData}
                            />
                        </CardContent>
                    </Card>
                </>
            )}

            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        borderRadius: '12px',
                        background: '#1a0f3c',
                        color: '#fff',
                        fontSize: '13px',
                        fontFamily: "'DM Sans', sans-serif",
                    },
                }}
            />
        </div>
    );
}