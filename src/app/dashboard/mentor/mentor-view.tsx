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
  PieChart as PieIcon, Layers,
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

const GRADIENT = 'linear-gradient(135deg, #6457d4, #8b7cf6)'
const GRADIENT2 = 'linear-gradient(135deg, #d946ef, #8b5cf6)'

function getHeatmapColor(value: number) {
  const ratio = Math.min(Math.max(value / 100, 0), 1)
  const r = Math.round(239 + (75 - 239) * ratio)
  const g = Math.round(68 + (192 - 68) * ratio)
  const b = Math.round(68 + (192 - 68) * ratio)
  return `rgb(${r}, ${g}, ${b})`
}

const COLORS = ['#8b7cf6', '#d946ef', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f97316']

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
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-[#0a0a0f]/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: GRADIENT }}>
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Hooter Loot</span>
            <span className="hidden text-sm text-slate-500 sm:inline">|</span>
            <span className="hidden text-sm text-slate-400 sm:inline">Mentor Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/mentor/students">
              <Button variant="ghost" size="sm" className="gap-2 text-slate-400 hover:text-white hover:bg-slate-800">
                <Table2 className="h-4 w-4" />
                <span className="hidden sm:inline">Student Roster</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5">
              <div className="h-6 w-6 rounded-full" style={{ background: GRADIENT }} />
              <span className="text-xs font-medium text-slate-300">{mentor.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Pool Overview</h1>
            <p className="mt-1 text-slate-400">Real-time analytics for Pool #{mentor.poolNo ?? '—'}</p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl px-6 py-4 shadow-2xl shadow-indigo-500/10" style={{ background: GRADIENT }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/90">{mentor.name}</p>
              <div className="flex items-center gap-2 text-xs text-white/80">
                <Mail className="h-3 w-3" />
                <span>{mentor.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── ROW 1: 4 Stat Cards ─── */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<Users className="h-5 w-5 text-indigo-400" />} label="Total Students" value={analytics.stats.totalStudents} />
          <StatCard icon={<BookOpen className="h-5 w-5 text-emerald-400" />} label="Assessments" value={analytics.stats.totalAssessments} />
          <StatCard icon={<Target className="h-5 w-5 text-rose-400" />} label="Pool Avg Accuracy" value={`${analytics.stats.poolAvgAccuracy}%`} />
          <StatCard icon={<TrendingUp className="h-5 w-5 text-amber-400" />} label="Top Performer" value={topStudent ? topStudent.name.split(' ')[0] : 'N/A'} sub={topStudent ? `${topStudent.accuracy}%` : ''} />
        </div>

        {/* ─── ROW 2: Radar + Module Bar ─── */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 1. Course Radar */}
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-200">
                <Activity className="h-4 w-4 text-indigo-400" />
                Course Accuracy Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={analytics.courseAccuracy}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Radar name="Accuracy" dataKey="score" stroke="#8b7cf6" fill="#8b7cf6" fillOpacity={0.35} strokeWidth={2} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 2. Module Performance Bar */}
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-200">
                <BarChart3 className="h-4 w-4 text-emerald-400" />
                Module Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.moduleAccuracy} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }} />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                      {analytics.moduleAccuracy.map((_, i) => (
                        <Cell key={`mod-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── ROW 3: Student Ranking + Accuracy Distribution ─── */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 3. Student Ranking (takes 2 cols) */}
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-200">
                <TrendingUp className="h-4 w-4 text-amber-400" />
                Top Students by Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.studentRanking} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }} />
                    <Bar dataKey="accuracy" radius={[0, 6, 6, 0]}>
                      {analytics.studentRanking.map((_, index) => (
                        <Cell key={`rank-${index}`} fill={index === 0 ? '#f59e0b' : index < 3 ? '#8b7cf6' : '#6457d4'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 4. Accuracy Distribution Donut */}
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-200">
                <PieIcon className="h-4 w-4 text-rose-400" />
                Accuracy Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics.accuracyDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="count" nameKey="range">
                      {analytics.accuracyDistribution.map((_, i) => (
                        <Cell key={`dist-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-3">
                {analytics.accuracyDistribution.map((d, i) => (
                  <div key={`leg-${i}`} className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] text-slate-400">{d.range}% ({d.count})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── ROW 4: Gender Pie + Branch Bar + Trend Line ─── */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 5. Gender Distribution */}
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-200">
                <Users className="h-4 w-4 text-cyan-400" />
                Gender Split
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analytics.genderDistribution} cx="50%" cy="50%" outerRadius={85} dataKey="count" nameKey="gender" label={({ name, value }) => `${name}: ${value}`}>
                      {analytics.genderDistribution.map((_, i) => (
                        <Cell key={`gen-${i}`} fill={['#8b7cf6', '#d946ef', '#64748b'][i % 3]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 6. Branch Distribution */}
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-200">
                <Layers className="h-4 w-4 text-orange-400" />
                Branch Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.branchDistribution} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="branch" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 7. Trend Line Chart */}
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-slate-200">
                <Activity className="h-4 w-4 text-emerald-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }} />
                    <Area type="monotone" dataKey="count" stroke="#10b981" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── ROW 5: Heatmap (full width) ─── */}
        <Card className="mb-8 border-slate-800 bg-slate-900/60 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg text-slate-200">
              <Layers className="h-4 w-4 text-indigo-400" />
              Student × Module Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                <div className="grid" style={{ gridTemplateColumns: `150px repeat(${analytics.heatmap.cols.length}, minmax(70px, 1fr))` }}>
                  <div className="p-2 text-xs font-semibold text-slate-500">Student</div>
                  {analytics.heatmap.cols.map((col, ci) => (
                    <div key={`h-${col}-${ci}`} className="p-2 text-center text-[10px] font-medium text-slate-400">{col}</div>
                  ))}
                </div>
                {analytics.heatmap.rows.map((row, ri) => (
                  <div key={`${row}-${ri}`} className="grid" style={{ gridTemplateColumns: `150px repeat(${analytics.heatmap.cols.length}, minmax(70px, 1fr))` }}>
                    <div className="flex items-center p-2 text-xs font-medium text-slate-300 truncate" title={row}>{row}</div>
                    {analytics.heatmap.data[ri]?.map((val, ci) => (
                      <div key={`${row}-${ri}-${ci}`} className="m-0.5 flex items-center justify-center rounded-md py-2 text-[10px] font-bold text-white/90" style={{ backgroundColor: getHeatmapColor(val) }} title={`${row} • ${analytics.heatmap.cols[ci]}: ${val}%`}>
                        {val > 0 ? val.toFixed(1) : '-'}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── ROW 6: Quick Student List with links to detail ─── */}
        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur">
          <CardHeader className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-lg text-slate-200">
              <Users className="h-4 w-4 text-indigo-400" />
              Quick Access — Click a student to view their dashboard
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input placeholder="Search by name or roll no..." className="border-slate-700 bg-slate-950 pl-9 text-slate-200 placeholder:text-slate-600 focus-visible:ring-indigo-500" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredStudents.slice(0, 16).map((s) => (
                <Link key={s.id} href={`/dashboard/mentor/student/${s.id}`} className="group">
                  <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-4 transition-all hover:border-indigo-500/50 hover:bg-slate-900">
                    <div>
                      <p className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.rollNo} · {s.branch}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${s.cgpa >= 80 ? 'bg-emerald-500/15 text-emerald-400' : s.cgpa >= 50 ? 'bg-amber-500/15 text-amber-400' : 'bg-rose-500/15 text-rose-400'}`}>
                        {s.cgpa}%
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {filteredStudents.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">No students found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <Card className="border-slate-800 bg-slate-900/60 backdrop-blur">
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800">{icon}</div>
        <div>
          <p className="text-xs font-medium text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {sub && <p className="text-xs text-slate-500">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}