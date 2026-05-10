"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, GraduationCap, BookOpen, User } from "lucide-react";
import { SkillRadar } from "@/components/charts/radar-chart";
import type { SkillRadarData } from "@/components/charts/radar-chart";
import { AccuracyBarChart } from "@/components/charts/bar-chart";
import type { AccuracyBarData } from "@/components/charts/bar-chart";
import { ProgressRing } from "@/components/charts/progress-ring";

/* ─── Types ─────────────────────────────────────────── */
export interface StudentPageProps {
    student: {
        name: string;
        rollNo: string;
        branch: "CSE" | "ECE" | "Mech" | "Civil" | "IT";
        year: string;
        cgpa: number;
        email: string;
    };
    mentor: {
        name: string;
        department: string;
        email: string;
    };
    analytics?: {
        courseAccuracy: SkillRadarData[];
        moduleAccuracy: (AccuracyBarData & { course: string; avgDuration: number; totalAttempts: number; date: string })[];
    };
}

/* ─── Branch colour map ──────────────────────────────── */
const branchStyle: Record<string, { bg: string; text: string; dot: string }> = {
    CSE: { bg: "bg-[#f3f0ff]", text: "text-[#6457d4]", dot: "bg-[#8b7cf6]" },
    ECE: { bg: "bg-[#eef6ff]", text: "text-[#2563eb]", dot: "bg-[#3b82f6]" },
    Mech: { bg: "bg-[#fffbeb]", text: "text-[#d47c0a]", dot: "bg-[#f59e0b]" },
    Civil: { bg: "bg-[#e8fdf5]", text: "text-[#0d8a62]", dot: "bg-[#1dbf8a]" },
    IT: { bg: "bg-[#fff1f3]", text: "text-[#d63a5a]", dot: "bg-[#f4657e]" },
};

const cgpaColour = (cgpa: number) => {
    if (cgpa >= 9) return "text-[#0d8a62]";
    if (cgpa >= 8) return "text-[#6457d4]";
    return "text-[#9892b8]";
};

/* ─── Component ──────────────────────────────────────── */
export function StudentDashboardView({ student, mentor, analytics }: StudentPageProps) {
    const branch = branchStyle[student.branch] ?? branchStyle.CSE;

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-start p-6 pt-10 pb-24"
            style={{ background: "#f5f3ff", fontFamily: "'DM Sans', sans-serif" }}
        >
            {/* ── Card ── */}
            <Card
                className="w-full max-w-md border-0 shadow-xl shadow-[#8b7cf620]"
                style={{ borderRadius: 24, background: "#ffffff" }}
            >
                {/* Purple gradient header strip */}
                <div
                    className="h-28 w-full"
                    style={{
                        borderRadius: "24px 24px 0 0",
                        background: "linear-gradient(135deg, #2d1f7a 0%, #6457d4 60%, #8b7cf6 100%)",
                    }}
                />

                <CardHeader className="pt-0 px-[22px] -mt-10 pb-0">
                    {/* Avatar */}
                    <div className="flex items-end gap-4">
                        <div
                            className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-white text-2xl font-semibold shadow-lg"
                            style={{ background: "linear-gradient(135deg,#6457d4,#8b7cf6)", border: "3px solid #fff" }}
                        >
                            {student.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>

                        <div className="mb-1 flex-1">
                            {/* Branch badge */}
                            <span
                                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${branch.bg} ${branch.text}`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${branch.dot}`} />
                                {student.branch}
                            </span>
                        </div>
                    </div>

                    {/* Name row */}
                    <div className="mt-3">
                        <h1 className="text-[22px] font-semibold text-[#1a0f3c] tracking-tight leading-tight">
                            {student.name}
                        </h1>
                        <p
                            className="text-xs text-[#9892b8] mt-0.5"
                            style={{ fontFamily: "'DM Mono', monospace" }}
                        >
                            {student.rollNo}
                        </p>
                    </div>
                </CardHeader>

                <CardContent className="px-[22px] pb-[22px] mt-5 space-y-4">
                    {/* Info pills row */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { icon: <BookOpen className="w-3.5 h-3.5" />, label: "Year", value: student.year },
                            {
                                icon: <GraduationCap className="w-3.5 h-3.5" />,
                                label: "CGPA",
                                value: (
                                    <span className={`font-semibold ${cgpaColour(student.cgpa)}`}>
                                        {student.cgpa.toFixed(1)}
                                    </span>
                                ),
                            },
                            { icon: <User className="w-3.5 h-3.5" />, label: "Email", value: student.email.split("@")[0] },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="flex flex-col items-center gap-1 rounded-[14px] py-3 px-2 text-center"
                                style={{ background: "#f5f3ff" }}
                            >
                                <span className="text-[#8b7cf6]">{item.icon}</span>
                                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#9892b8]">
                                    {item.label}
                                </span>
                                <span className="text-[13px] font-medium text-[#1a0f3c]">{item.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-[#8b7cf610]" />

                    {/* Assigned mentor card */}
                    <div>
                        <p className="text-[11px] uppercase tracking-wider font-semibold text-[#9892b8] mb-2.5">
                            Assigned Mentor
                        </p>
                        <div
                            className="flex items-center gap-3 rounded-[16px] p-3.5"
                            style={{ background: "#f5f3ff", border: "1px solid #e4deff" }}
                        >
                            {/* Mentor avatar */}
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                                style={{ background: "linear-gradient(135deg,#8b7cf6,#6457d4)" }}
                            >
                                {mentor.name.split(" ").filter((_, i) => i > 0).map((n) => n[0]).join("").slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[13.5px] font-semibold text-[#1a0f3c] truncate">{mentor.name}</p>
                                <p className="text-[12px] text-[#9892b8] truncate">{mentor.department} · {mentor.email}</p>
                            </div>

                            <Badge
                                className="ml-auto text-[10px] font-semibold shrink-0"
                                style={{ background: "#e4deff", color: "#6457d4", borderRadius: 8, border: "none" }}
                            >
                                Mentor
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ══════════════════════════════════════════════════ */}
            {/* ── MY PERFORMANCE SECTION ──                      */}
            {/* ══════════════════════════════════════════════════ */}
            {analytics && (
                <div className="w-full max-w-md mt-6">
                    <div className="mb-4">
                        <h2 className="text-[20px] font-semibold text-[#1a0f3c] tracking-tight">My Performance</h2>
                        <p className="text-[12px] text-[#9892b8] mt-0.5">Your skill breakdown across courses</p>
                    </div>

                    <Card className="border-0 shadow-xl shadow-[#8b7cf620] mb-5" style={{ borderRadius: 24, background: "#ffffff" }}>
                        <CardHeader className="px-6 pt-5 pb-0">
                            <span className="text-[13px] font-semibold text-[#1a0f3c]">Course Skill Radar</span>
                        </CardHeader>
                        <CardContent className="px-6 pb-5 pt-2">
                            <SkillRadar data={analytics.courseAccuracy} height={260} />
                            
                            <div className="flex justify-center gap-4 mt-2">
                                {analytics.courseAccuracy.map((c) => (
                                    <ProgressRing key={c.subject} value={c.score} label={c.subject} size={60} strokeWidth={4} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl shadow-[#8b7cf620] mb-5" style={{ borderRadius: 24, background: "#ffffff" }}>
                        <CardHeader className="px-6 pt-5 pb-0">
                            <span className="text-[13px] font-semibold text-[#1a0f3c]">Module Breakdown</span>
                            <p className="text-[11px] text-[#9892b8] mt-0.5">Performance across all assessed modules</p>
                        </CardHeader>
                        <CardContent className="px-6 pb-5">
                            <AccuracyBarChart data={analytics.moduleAccuracy} height={350} layout="vertical" colorScale />
                            
                            <div className="mt-5 border-t border-[#8b7cf610] pt-4">
                                <div className="space-y-3">
                                    {analytics.moduleAccuracy.slice(0, 3).map((m, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[12.5px] font-medium text-[#1a0f3c] leading-tight">{m.name}</p>
                                                <p className="text-[10px] text-[#9892b8]">{m.course} · {m.totalAttempts} attempts</p>
                                            </div>
                                            <span className={`text-[12.5px] font-bold ${cgpaColour(m.accuracy / 10)}`} style={{ fontFamily: "'DM Mono', monospace" }}>
                                                {m.accuracy.toFixed(1)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ── Floating Chat Button ── */}
            <Button
                className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl shadow-lg shadow-[#6457d440] flex items-center justify-center p-0 hover:scale-105 transition-transform"
                style={{ background: "linear-gradient(135deg,#6457d4,#8b7cf6)", border: "none" }}
                aria-label="Open chat"
            >
                <MessageCircle className="w-6 h-6 text-white" />
            </Button>
        </div>
    );
}