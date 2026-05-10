'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    PieChart, Pie, LineChart, Line, AreaChart, Area,
} from 'recharts'
import {
    Users, BookOpen, Target, TrendingUp, Search, GraduationCap, Mail,
    Hash, LayoutDashboard, Table2, ChevronRight, Activity, BarChart3,
    PieChart as PieIcon, Layers, Bell,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export interface Student {
    id: string
    name: string
    rollNo: string
    branch: 'CSE' | 'ECE' | 'Mech' | 'Civil' | 'IT'
    college: string
    technology: string
    gender: 'MALE' | 'FEMALE' | 'UNKNOWN'
    year: string
    cgpa: number
}

interface Mentor {
    id: string
    name: string
    department: string
    email: string
    poolNo?: number | null
}

interface Analytics {
    courseAccuracy: { subject: string; score: number; fullMark: number }[]
    moduleAccuracy: { name: string; score: number }[]
    studentRanking: { name: string; accuracy: number; rollNo: string; id: string }[]
    accuracyDistribution: { range: string; count: number }[]
    genderDistribution: { gender: string; count: number }[]
    branchDistribution: { branch: string; count: number }[]
    heatmap: { rows: string[]; cols: string[]; data: number[][] }
    trendData: { date: string; count: number }[]
    stats: { totalStudents: number; totalAssessments: number; poolAvgAccuracy: number }
}

interface Props {
    mentor: Mentor
    students: Student[]
    analytics: Analytics
}

function getHeatmapColor(value: number) {
    const ratio = Math.min(Math.max(value / 100, 0), 1)
    const r = Math.round(220 + (21 - 220) * ratio)
    const g = Math.round(230 + (128 - 230) * ratio)
    const b = Math.round(220 + (61 - 220) * ratio)
    return `rgb(${r}, ${g}, ${b})`
}

const COLORS = ['#15803d', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316']
const LIGHT_COLORS = ['#dcfce7', '#e0f2fe', '#fef3c7', '#fee2e2', '#ede9fe', '#ccfbf1', '#ffedd5']

export function MentorDashboardView({ mentor, students, analytics }: Props) {
    const [search, setSearch] = useState('')

    const filteredStudents = useMemo(() => {
        return students.filter(
            (s) =>
                s.name.toLowerCase().includes(search.toLowerCase()) ||
                s.rollNo.toLowerCase().includes(search.toLowerCase())
        )
    }, [students, search])

    const topStudent = analytics.studentRanking[0]

    return (
        <div className="min-h-screen bg-[#f6f7f9] text-slate-800">
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
                <div className="flex h-16 items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600">
                            <LayoutDashboard className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-slate-900">Hooter Loot</span>
                        <span className="hidden text-sm text-slate-300 sm:inline">|</span>
                        <span className="hidden text-sm text-slate-500 sm:inline">Mentor Portal</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden w-64 sm:block">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search anything..."
                                className="h-9 rounded-full border-slate-200 bg-slate-100 pl-9 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500"
                            />
                        </div>
                        <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100">
                            <Bell className="h-5 w-5" />
                            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
                        </button>
                        <Link href="/dashboard/mentor/students">
                            <Button variant="outline" size="sm" className="gap-2 rounded-full border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700">
                                <Table2 className="h-4 w-4" />
                                <span className="hidden sm:inline">Roster</span>
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                            <div className="h-7 w-7 rounded-full bg-emerald-600" />
                            <span className="text-xs font-medium text-slate-700">{mentor.name}</span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="p-6 md:p-8">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pool Overview</h1>
                        <p className="mt-1 text-slate-500">Real-time analytics for Pool #{mentor.poolNo ?? '—'}</p>
                    </div>
                    <div className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-6 py-4 shadow-sm">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 shadow-lg shadow-emerald-200">
                            <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-emerald-900">{mentor.name}</p>
                            <div className="flex items-center gap-2 text-xs text-emerald-700">
                                <Mail className="h-3 w-3" />
                                <span>{mentor.email}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── ROW 1: 4 Stat Cards ─── */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard icon={<Users className="h-5 w-5 text-white" />} label="Total Students" value={analytics.stats.totalStudents} color="bg-emerald-600" />
                    <StatCard icon={<BookOpen className="h-5 w-5 text-emerald-700" />} label="Assessments" value={analytics.stats.totalAssessments} color="bg-white" textColor="text-slate-900" subColor="text-slate-500" />
                    <StatCard icon={<Target className="h-5 w-5 text-sky-700" />} label="Pool Avg Accuracy" value={`${analytics.stats.poolAvgAccuracy}%`} color="bg-white" textColor="text-slate-900" subColor="text-slate-500" />
                    <StatCard icon={<TrendingUp className="h-5 w-5 text-amber-700" />} label="Top Performer" value={topStudent ? topStudent.name.split(' ')[0] : 'N/A'} sub={topStudent ? `${topStudent.accuracy}%` : ''} color="bg-white" textColor="text-slate-900" subColor="text-slate-500" />
                </div>

                {/* ─── ROW 2: Radar + Module Bar ─── */}
                <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <ChartCard title="Course Accuracy Profile" icon={<Activity className="h-4 w-4 text-emerald-600" />}>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={analytics.courseAccuracy}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Radar name="Accuracy" dataKey="score" stroke="#15803d" fill="#15803d" fillOpacity={0.15} strokeWidth={2} />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>

                    <ChartCard title="Module Performance" icon={<BarChart3 className="h-4 w-4 text-sky-600" />}>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics.moduleAccuracy} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                                    <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                                    <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                                        {analytics.moduleAccuracy.map((_, i) => (
                                            <Cell key={`mod-${i}`} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                </div>

                {/* ─── ROW 3: Student Ranking + Accuracy Distribution ─── */}
                <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <ChartCard title="Top Students by Accuracy" icon={<TrendingUp className="h-4 w-4 text-amber-600" />} className="lg:col-span-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics.studentRanking} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                    <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                                    <Bar dataKey="accuracy" radius={[0, 8, 8, 0]}>
                                        {analytics.studentRanking.map((_, index) => (
                                            <Cell key={`rank-${index}`} fill={index === 0 ? '#f59e0b' : index < 3 ? '#15803d' : '#0ea5e9'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>

                    <ChartCard title="Accuracy Distribution" icon={<PieIcon className="h-4 w-4 text-rose-600" />}>
                        <div className="h-[260px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={analytics.accuracyDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="count" nameKey="range">
                                        {analytics.accuracyDistribution.map((_, i) => (
                                            <Cell key={`dist-${i}`} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-2 flex flex-wrap justify-center gap-3">
                            {analytics.accuracyDistribution.map((d, i) => (
                                <div key={`leg-${i}`} className="flex items-center gap-1.5">
                                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-[10px] text-slate-500">{d.range}% ({d.count})</span>
                                </div>
                            ))}
                        </div>
                    </ChartCard>
                </div>

                {/* ─── ROW 4: Gender Pie + Branch Bar + Trend Line ─── */}
                <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <ChartCard title="Gender Split" icon={<Users className="h-4 w-4 text-violet-600" />}>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={analytics.genderDistribution} cx="50%" cy="50%" outerRadius={85} dataKey="count" nameKey="gender" label={({ name, value }) => `${name}: ${value}`}>
                                        {analytics.genderDistribution.map((_, i) => (
                                            <Cell key={`gen-${i}`} fill={['#15803d', '#d946ef', '#94a3b8'][i % 3]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>

                    <ChartCard title="Branch Distribution" icon={<Layers className="h-4 w-4 text-orange-600" />}>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics.branchDistribution} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="branch" tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                                    <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#f59e0b" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>

                    <ChartCard title="Recent Activity" icon={<Activity className="h-4 w-4 text-emerald-600" />}>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics.trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#15803d" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                                    <Area type="monotone" dataKey="count" stroke="#15803d" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                </div>

                {/* ─── ROW 5: Heatmap (full width) ─── */}
                <ChartCard title="Student × Module Heatmap" icon={<Layers className="h-4 w-4 text-emerald-600" />} className="mb-8">
                    <div className="overflow-x-auto">
                        <div className="min-w-[700px]">
                            <div className="grid" style={{ gridTemplateColumns: `150px repeat(${analytics.heatmap.cols.length}, minmax(70px, 1fr))` }}>
                                <div className="p-2 text-xs font-semibold text-slate-400">Student</div>
                                {analytics.heatmap.cols.map((col, ci) => (
                                    <div key={`h-${col}-${ci}`} className="p-2 text-center text-[10px] font-medium text-slate-500">{col}</div>
                                ))}
                            </div>
                            {analytics.heatmap.rows.map((row, ri) => (
                                <div key={`${row}-${ri}`} className="grid" style={{ gridTemplateColumns: `150px repeat(${analytics.heatmap.cols.length}, minmax(70px, 1fr))` }}>
                                    <div className="flex items-center p-2 text-xs font-medium text-slate-700 truncate" title={row}>{row}</div>
                                    {analytics.heatmap.data[ri]?.map((val, ci) => (
                                        <div key={`${row}-${ri}-${ci}`} className="m-0.5 flex items-center justify-center rounded-md py-2 text-[10px] font-bold text-slate-800" style={{ backgroundColor: getHeatmapColor(val) }} title={`${row} • ${analytics.heatmap.cols[ci]}: ${val}%`}>
                                            {val > 0 ? val.toFixed(1) : '-'}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </ChartCard>

                {/* ─── ROW 6: Quick Student List ─── */}
                <ChartCard title="Quick Access — Click a student to view their dashboard" icon={<Users className="h-4 w-4 text-emerald-600" />}>
                    <div className="relative mb-4 w-full sm:w-80">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search by name or roll no..." className="rounded-full border-slate-200 bg-white pl-9 text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredStudents.slice(0, 16).map((s) => (
                            <Link key={s.id} href={`/dashboard/mentor/student/${s.id}`} className="group">
                                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700">{s.name}</p>
                                        <p className="text-xs text-slate-400">{s.rollNo} · {s.branch}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${s.cgpa >= 80 ? 'bg-emerald-100 text-emerald-700' : s.cgpa >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {s.cgpa}%
                                        </span>
                                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    {filteredStudents.length === 0 && (
                        <p className="py-8 text-center text-sm text-slate-400">No students found.</p>
                    )}
                </ChartCard>
            </div>
        </div>
    )
}

function ChartCard({ children, title, icon, className = '' }: { children: React.ReactNode; title: string; icon: React.ReactNode; className?: string }) {
    return (
        <Card className={`border-slate-100 bg-white shadow-sm ${className}`}>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
                    {icon}
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    )
}

function StatCard({ icon, label, value, sub, color, textColor = 'text-white', subColor = 'text-white/80' }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string; textColor?: string; subColor?: string }) {
    return (
        <Card className={`${color} border-0 shadow-sm`}>
            <CardContent className="flex items-center gap-4 p-6">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color === 'bg-emerald-600' ? 'bg-white/20' : 'bg-slate-100'}`}>
                    {icon}
                </div>
                <div>
                    <p className={`text-xs font-medium ${color === 'bg-emerald-600' ? 'text-emerald-100' : 'text-slate-500'}`}>{label}</p>
                    <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
                    {sub && <p className={`text-xs ${subColor}`}>{sub}</p>}
                </div>
            </CardContent>
        </Card>
    )
}