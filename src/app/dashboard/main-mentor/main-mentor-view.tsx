'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, AreaChart, Area,
} from 'recharts'
import {
  Users, BookOpen, Target, TrendingUp, Clock, RotateCcw, Search,
  LayoutDashboard, Activity, BarChart3, PieChart as PieIcon, Layers,
  GraduationCap, Mail, ChevronRight, AlertTriangle, Award, Hash,
  Building2, Cpu, UserCheck, ArrowRight, Bell,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface MentorStat {
  id: string
  name: string
  poolNo: number | null
  studentCount: number
  avgAccuracy: number
  totalDuration: number
  totalAttempts: number
}

interface StudentStat {
  id: string
  name: string
  rollNo: string
  mentorId: string
  mentorName: string
  branch: string
  college: string
  technology: string
  gender: string
  avgAccuracy: number
}

interface MainMentor {
  id: string
  name: string
  email: string
}

interface Analytics {
  mentorLeaderboard: MentorStat[]
  poolComparison: { pool: string; avgAccuracy: number; mentorCount: number; studentCount: number }[]
  techDistribution: { name: string; count: number }[]
  collegeDistribution: { name: string; count: number }[]
  genderDistribution: { gender: string; count: number }[]
  branchDistribution: { branch: string; count: number }[]
  courseAccuracy: { subject: string; score: number; fullMark: number }[]
  moduleAccuracy: { name: string; score: number }[]
  accuracyDistribution: { range: string; count: number }[]
  trendData: { date: string; count: number }[]
  topStudents: StudentStat[]
  atRiskStudents: StudentStat[]
  heatmap: { rows: string[]; cols: string[]; data: number[][] }
  stats: {
    totalMentors: number
    totalStudents: number
    totalAssessments: number
    overallAvgAccuracy: number
    totalDuration: number
    totalAttempts: number
  }
}

interface Props {
  mainMentor: MainMentor
  mentors: MentorStat[]
  students: StudentStat[]
  analytics: Analytics
}

const COLORS = ['#15803d', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899']

function getHeatmapColor(value: number) {
  const ratio = Math.min(Math.max(value / 100, 0), 1)
  const r = Math.round(220 + (21 - 220) * ratio)
  const g = Math.round(230 + (128 - 230) * ratio)
  const b = Math.round(220 + (61 - 220) * ratio)
  return `rgb(${r}, ${g}, ${b})`
}

export function MainMentorDashboardView({ mainMentor, mentors, students, analytics }: Props) {
  const [search, setSearch] = useState('')
  const [studentSearch, setStudentSearch] = useState('')
  const [reassigningId, setReassigningId] = useState<string | null>(null)
  const [newMentorId, setNewMentorId] = useState('')
  const [saving, setSaving] = useState(false)

  const filteredMentors = useMemo(() => {
    return mentors.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
  }, [mentors, search])

  const filteredStudents = useMemo(() => {
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.mentorName.toLowerCase().includes(studentSearch.toLowerCase())
    )
  }, [students, studentSearch])

  const handleReassign = async (studentId: string) => {
    if (!newMentorId) return
    setSaving(true)
    const { error } = await supabase.from('students').update({ mentor_id: newMentorId }).eq('id', studentId)
    if (!error) {
      setReassigningId(null)
      setNewMentorId('')
      window.location.reload()
    }
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-800">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">Hooter Loot</span>
            <span className="hidden text-sm text-slate-300 sm:inline">|</span>
            <span className="hidden text-sm text-slate-500 sm:inline">Command Center</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden w-64 sm:block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input placeholder="Global search..." className="h-9 rounded-full border-slate-200 bg-slate-100 pl-9 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500" />
            </div>
            <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100">
              <Bell className="h-5 w-5" />
              {analytics.atRiskStudents.length > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
              )}
            </button>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
              <div className="h-7 w-7 rounded-full bg-emerald-600" />
              <span className="text-xs font-medium text-slate-700">{mainMentor.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Command Center</h1>
            <p className="mt-1 text-slate-500">Organization-wide intelligence across all pools</p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-6 py-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 shadow-lg shadow-emerald-200">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-900">{mainMentor.name}</p>
              <div className="flex items-center gap-2 text-xs text-emerald-700">
                <Mail className="h-3 w-3" />
                <span>{mainMentor.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── ROW 1: 6 Big Stats ─── */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard icon={<Users className="h-5 w-5 text-white" />} label="Mentors" value={analytics.stats.totalMentors} color="bg-emerald-600" />
          <StatCard icon={<BookOpen className="h-5 w-5 text-emerald-700" />} label="Students" value={analytics.stats.totalStudents} color="bg-white" />
          <StatCard icon={<Target className="h-5 w-5 text-sky-700" />} label="Assessments" value={analytics.stats.totalAssessments} color="bg-white" />
          <StatCard icon={<TrendingUp className="h-5 w-5 text-amber-700" />} label="Avg Accuracy" value={`${analytics.stats.overallAvgAccuracy}%`} color="bg-white" />
          <StatCard icon={<Clock className="h-5 w-5 text-violet-700" />} label="Total Duration" value={`${analytics.stats.totalDuration}m`} color="bg-white" />
          <StatCard icon={<RotateCcw className="h-5 w-5 text-rose-700" />} label="Total Attempts" value={analytics.stats.totalAttempts} color="bg-white" />
        </div>

        {/* ─── ROW 2: Mentor Leaderboard + Pool Comparison ─── */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard title="Mentor Leaderboard" icon={<Award className="h-4 w-4 text-amber-600" />}>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.mentorLeaderboard.slice(0, 12)} layout="vertical" margin={{ top: 5, right: 20, left: 50, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                  <Bar dataKey="avgAccuracy" radius={[0, 8, 8, 0]}>
                    {analytics.mentorLeaderboard.slice(0, 12).map((_, i) => (
                      <Cell key={`ml-${i}`} fill={i === 0 ? '#f59e0b' : i < 3 ? '#15803d' : '#0ea5e9'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Pool Comparison" icon={<Layers className="h-4 w-4 text-sky-600" />}>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.poolComparison} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="pool" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                  <Bar dataKey="avgAccuracy" radius={[8, 8, 0, 0]} fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap gap-4">
              {analytics.poolComparison.map((p) => (
                <div key={p.pool} className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{p.pool}</span>
                  <span>· {p.mentorCount} mentors</span>
                  <span>· {p.studentCount} students</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* ─── ROW 3: Tech Pie + College Donut + Gender Pie ─── */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <ChartCard title="Technology Distribution" icon={<Cpu className="h-4 w-4 text-cyan-600" />}>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analytics.techDistribution} cx="50%" cy="50%" outerRadius={90} dataKey="count" nameKey="name" label={({ name, value }) => `${name}: ${value}`}>
                    {analytics.techDistribution.map((_, i) => (
                      <Cell key={`tech-${i}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="College Distribution" icon={<Building2 className="h-4 w-4 text-violet-600" />}>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analytics.collegeDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="count" nameKey="name">
                    {analytics.collegeDistribution.map((_, i) => (
                      <Cell key={`col-${i}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {analytics.collegeDistribution.slice(0, 5).map((c, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[10px] text-slate-500">{c.name}</span>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Gender Split" icon={<Users className="h-4 w-4 text-pink-600" />}>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analytics.genderDistribution} cx="50%" cy="50%" outerRadius={90} dataKey="count" nameKey="gender" label={({ name, value }) => `${name}: ${value}`}>
                    {analytics.genderDistribution.map((_, i) => (
                      <Cell key={`gen-${i}`} fill={['#15803d', '#ec4899', '#94a3b8'][i % 3]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* ─── ROW 4: Branch Bar + Course Radar + Module Bar ─── */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <ChartCard title="Branch Distribution" icon={<Layers className="h-4 w-4 text-orange-600" />}>
            <div className="h-[280px] w-full">
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

          <ChartCard title="Course Accuracy (All Pools)" icon={<Activity className="h-4 w-4 text-emerald-600" />}>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={analytics.courseAccuracy}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Radar name="Accuracy" dataKey="score" stroke="#15803d" fill="#15803d" fillOpacity={0.15} strokeWidth={2} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Module Performance (All Pools)" icon={<BarChart3 className="h-4 w-4 text-sky-600" />}>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.moduleAccuracy} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 9 }} angle={-25} textAnchor="end" height={60} />
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

        {/* ─── ROW 5: Accuracy Dist + Timeline + Top Students ─── */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <ChartCard title="Student Accuracy Distribution" icon={<PieIcon className="h-4 w-4 text-rose-600" />}>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analytics.accuracyDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="count" nameKey="range">
                    {analytics.accuracyDistribution.map((_, i) => (
                      <Cell key={`ad-${i}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {analytics.accuracyDistribution.map((d, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[10px] text-slate-500">{d.range}% ({d.count})</span>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Assessment Timeline" icon={<TrendingUp className="h-4 w-4 text-emerald-600" />} className="lg:col-span-2">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#15803d" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                  <Area type="monotone" dataKey="count" stroke="#15803d" fillOpacity={1} fill="url(#colorMain)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* ─── ROW 6: Top Students + At-Risk Students ─── */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard title="Top Performers (All Pools)" icon={<Award className="h-4 w-4 text-amber-600" />}>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topStudents} layout="vertical" margin={{ top: 5, right: 20, left: 50, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                  <Bar dataKey="avgAccuracy" radius={[0, 8, 8, 0]} fill="#15803d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="At-Risk Students (Below 45%)" icon={<AlertTriangle className="h-4 w-4 text-rose-600" />}>
            <div className="flex h-[300px] flex-col gap-2 overflow-y-auto pr-1">
              {analytics.atRiskStudents.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-slate-400">No at-risk students. Great job!</p>
                </div>
              ) : (
                analytics.atRiskStudents.map((s) => (
                  <Link key={s.id} href={`/dashboard/main-mentor/student/${s.id}`}>
                    <div className="flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50/50 px-4 py-3 transition-colors hover:bg-rose-50">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                        <p className="text-[10px] text-slate-500">{s.rollNo} · {s.mentorName} · {s.branch}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                          {s.avgAccuracy}%
                        </span>
                        <ChevronRight className="h-4 w-4 text-rose-300" />
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </ChartCard>
        </div>

        {/* ─── ROW 7: Cross-Pool Heatmap ─── */}
        <ChartCard title="Cross-Pool Student × Module Heatmap" icon={<Layers className="h-4 w-4 text-indigo-600" />} className="mb-8">
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="grid" style={{ gridTemplateColumns: `160px repeat(${analytics.heatmap.cols.length}, minmax(70px, 1fr))` }}>
                <div className="p-2 text-xs font-semibold text-slate-400">Student</div>
                {analytics.heatmap.cols.map((col, ci) => (
                  <div key={`hh-${col}-${ci}`} className="p-2 text-center text-[10px] font-medium text-slate-500">{col}</div>
                ))}
              </div>
              {analytics.heatmap.rows.map((row, ri) => (
                <div key={`hr-${row}-${ri}`} className="grid" style={{ gridTemplateColumns: `160px repeat(${analytics.heatmap.cols.length}, minmax(70px, 1fr))` }}>
                  <div className="flex items-center p-2 text-xs font-medium text-slate-700 truncate" title={row}>{row}</div>
                  {analytics.heatmap.data[ri]?.map((val, ci) => (
                    <div key={`hc-${row}-${ri}-${ci}`} className="m-0.5 flex items-center justify-center rounded-md py-2 text-[10px] font-bold text-slate-800" style={{ backgroundColor: getHeatmapColor(val) }} title={`${row} · ${analytics.heatmap.cols[ci]}: ${val}%`}>
                      {val > 0 ? val.toFixed(1) : '-'}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* ─── ROW 8: Mentor Cards ─── */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Mentor Directory</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input placeholder="Filter mentors..." className="rounded-full border-slate-200 bg-white pl-9 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMentors.map((m) => (
              <Link key={m.id} href={`/dashboard/main-mentor/mentor/${m.id}`}>
                <Card className="group cursor-pointer border-slate-100 bg-white shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                        <UserCheck className="h-5 w-5 text-emerald-600" />
                      </div>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                        Pool {m.poolNo ?? '—'}
                      </Badge>
                    </div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">{m.name}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                        <p className="text-slate-400">Students</p>
                        <p className="font-semibold text-slate-700">{m.studentCount}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                        <p className="text-slate-400">Accuracy</p>
                        <p className="font-semibold text-slate-700">{m.avgAccuracy}%</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                        <p className="text-slate-400">Duration</p>
                        <p className="font-semibold text-slate-700">{m.totalDuration}m</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                        <p className="text-slate-400">Attempts</p>
                        <p className="font-semibold text-slate-700">{m.totalAttempts}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-600">
                      <span>View Details</span>
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* ─── ROW 9: Student Assignment Control ─── */}
        <ChartCard title="Student Assignment Control" icon={<UserCheck className="h-4 w-4 text-emerald-600" />}>
          <div className="mb-4 relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Search students..." className="rounded-full border-slate-200 bg-white pl-9 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs text-slate-400">
                  <th className="px-3 py-3 font-medium">Roll No</th>
                  <th className="px-3 py-3 font-medium">Name</th>
                  <th className="px-3 py-3 font-medium">Current Mentor</th>
                  <th className="px-3 py-3 font-medium">Branch</th>
                  <th className="px-3 py-3 font-medium">Accuracy</th>
                  <th className="px-3 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.slice(0, 20).map((s) => (
                  <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-3 py-3 font-mono text-xs text-slate-500"><Hash className="inline h-3 w-3 mr-1" />{s.rollNo}</td>
                    <td className="px-3 py-3 font-medium text-slate-800">{s.name}</td>
                    <td className="px-3 py-3">
                      {reassigningId === s.id ? (
                        <select
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
                          value={newMentorId}
                          onChange={(e) => setNewMentorId(e.target.value)}
                        >
                          <option value="">Select mentor...</option>
                          {mentors.map((m) => (
                            <option key={m.id} value={m.id}>{m.name} (Pool {m.poolNo ?? '—'})</option>
                          ))}
                        </select>
                      ) : (
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">{s.mentorName}</Badge>
                      )}
                    </td>
                    <td className="px-3 py-3 text-slate-500">{s.branch}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${s.avgAccuracy >= 80 ? 'bg-emerald-100 text-emerald-700' : s.avgAccuracy >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                        {s.avgAccuracy}%
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      {reassigningId === s.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" className="h-7 text-slate-400 hover:text-slate-700" onClick={() => { setReassigningId(null); setNewMentorId('') }} disabled={saving}>
                            Cancel
                          </Button>
                          <Button size="sm" className="h-7 bg-emerald-600 text-xs hover:bg-emerald-500" onClick={() => handleReassign(s.id)} disabled={saving || !newMentorId}>
                            {saving ? 'Saving...' : 'Confirm'}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/main-mentor/student/${s.id}`}>
                            <Button size="sm" variant="ghost" className="h-7 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50">
                              View
                            </Button>
                          </Link>
                          <Button size="sm" variant="ghost" className="h-7 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50" onClick={() => { setReassigningId(s.id); setNewMentorId(s.mentorId) }}>
                            Reassign
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  const isGreen = color === 'bg-emerald-600'
  return (
    <Card className={`${color} border-0 shadow-sm`}>
      <CardContent className="flex items-center gap-3 p-5">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isGreen ? 'bg-white/20' : 'bg-slate-100'}`}>
          {icon}
        </div>
        <div>
          <p className={`text-[11px] font-medium ${isGreen ? 'text-emerald-100' : 'text-slate-500'}`}>{label}</p>
          <p className={`text-xl font-bold ${isGreen ? 'text-white' : 'text-slate-900'}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}