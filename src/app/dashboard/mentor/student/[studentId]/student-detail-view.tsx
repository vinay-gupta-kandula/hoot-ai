'use client'

import React from 'react'
import Link from 'next/link'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts'
import {
  ArrowLeft, Activity, Target, Clock, RotateCcw, BookOpen,
  BarChart3, TrendingUp, Calendar, Hash, User, GraduationCap,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Student {
  id: string
  name: string
  rollNo: string
  branch: string
  college: string
  technology: string
  gender: string
}

interface Analytics {
  courseAccuracy: { subject: string; score: number; fullMark: number }[]
  moduleAccuracy: { name: string; score: number; attempts: number; duration: number }[]
  timeline: { date: string; count: number }[]
  attemptDistribution: { name: string; count: number }[]
  stats: { totalAssessments: number; avgAccuracy: number; totalDuration: number; totalAttempts: number }
}

interface Props {
  student: Student
  analytics: Analytics
  mentorName: string
}

const COLORS = ['#15803d', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

function ProgressRing({ value, label, color }: { value: number; label: string; color: string }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-24 w-24">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} stroke="#f1f5f9" strokeWidth="8" fill="none" />
          <circle cx="50" cy="50" r={radius} stroke={color} strokeWidth="8" fill="none"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-slate-800">{value}%</span>
        </div>
      </div>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  )
}

export function StudentDetailView({ student, analytics, mentorName }: Props) {
  const topModules = analytics.moduleAccuracy.slice(0, 3)

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-800">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/mentor">
              <Button variant="ghost" size="sm" className="gap-2 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <GraduationCap className="h-3 w-3" />
            <span>{mentorName}</span>
          </div>
        </div>
      </nav>

      <div className="p-6 md:p-8">
        {/* Profile Header */}
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-2xl font-bold text-white shadow-lg shadow-emerald-200">
              {student.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{student.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="flex items-center gap-1"><Hash className="h-3 w-3" />{student.rollNo}</span>
                <span className="flex items-center gap-1"><User className="h-3 w-3" />{student.gender}</span>
                <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{student.branch}</span>
                <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{student.college}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── ROW 1: 4 Stat Cards ─── */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={<BookOpen className="h-5 w-5 text-white" />} label="Total Assessments" value={analytics.stats.totalAssessments} color="bg-emerald-600" />
          <StatCard icon={<Target className="h-5 w-5 text-emerald-700" />} label="Avg Accuracy" value={`${analytics.stats.avgAccuracy}%`} color="bg-white" />
          <StatCard icon={<Clock className="h-5 w-5 text-sky-700" />} label="Total Duration" value={`${analytics.stats.totalDuration}m`} color="bg-white" />
          <StatCard icon={<RotateCcw className="h-5 w-5 text-amber-700" />} label="Total Attempts" value={analytics.stats.totalAttempts} color="bg-white" />
        </div>

        {/* ─── ROW 2: Radar + Progress Rings ─── */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <ChartCard title="Course Skill Radar" icon={<Activity className="h-4 w-4 text-emerald-600" />} className="lg:col-span-2">
            <div className="h-[320px] w-full">
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

          <ChartCard title="Top Module Progress" icon={<Target className="h-4 w-4 text-emerald-600" />}>
            <div className="flex h-[320px] flex-col items-center justify-center gap-6">
              {topModules.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-6">
                  {topModules.map((m, i) => (
                    <ProgressRing key={m.name} value={m.score} label={m.name} color={COLORS[i % COLORS.length]} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No module data available.</p>
              )}
            </div>
          </ChartCard>
        </div>

        {/* ─── ROW 3: Module Bar + Attempt Dist ─── */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard title="Module Breakdown" icon={<BarChart3 className="h-4 w-4 text-sky-600" />}>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.moduleAccuracy} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} angle={-25} textAnchor="end" height={70} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]} fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Attempts by Module" icon={<RotateCcw className="h-4 w-4 text-rose-600" />}>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.attemptDistribution} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]} fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* ─── ROW 4: Timeline + Detail List ─── */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <ChartCard title="Activity Timeline" icon={<TrendingUp className="h-4 w-4 text-emerald-600" />} className="lg:col-span-2">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.timeline} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorStudent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#15803d" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                  <Area type="monotone" dataKey="count" stroke="#15803d" fillOpacity={1} fill="url(#colorStudent)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Module Details" icon={<Calendar className="h-4 w-4 text-amber-600" />}>
            <div className="flex h-[280px] flex-col gap-2 overflow-y-auto pr-1">
              {analytics.moduleAccuracy.map((m) => (
                <div key={m.name} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                  <div>
                    <p className="text-xs font-medium text-slate-700">{m.name}</p>
                    <p className="text-[10px] text-slate-400">{m.attempts} attempts · {m.duration}m</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${m.score >= 80 ? 'bg-emerald-100 text-emerald-700' : m.score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                    {m.score}%
                  </span>
                </div>
              ))}
              {analytics.moduleAccuracy.length === 0 && (
                <p className="py-8 text-center text-xs text-slate-400">No data.</p>
              )}
            </div>
          </ChartCard>
        </div>

        {/* ─── ROW 5: Recent Assessments Table ─── */}
        <ChartCard title="Recent Assessment Log" icon={<BookOpen className="h-4 w-4 text-emerald-600" />}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                  <th className="pb-3 pr-4 font-medium">Course</th>
                  <th className="pb-3 pr-4 font-medium">Module</th>
                  <th className="pb-3 pr-4 font-medium">Accuracy</th>
                  <th className="pb-3 pr-4 font-medium">Duration</th>
                  <th className="pb-3 pr-4 font-medium">Attempts</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {analytics.moduleAccuracy.slice(0, 8).map((m, i) => (
                  <tr key={`${m.name}-${i}`} className="border-b border-slate-50 text-slate-600">
                    <td className="py-3 pr-4">{analytics.courseAccuracy.find(c => c.subject === m.name)?.subject || '—'}</td>
                    <td className="py-3 pr-4 font-medium text-slate-700">{m.name}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${m.score >= 80 ? 'bg-emerald-100 text-emerald-700' : m.score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                        {m.score}%
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-400">{m.duration}m</td>
                    <td className="py-3 pr-4 text-slate-400">{m.attempts}</td>
                    <td className="py-3 text-slate-400">—</td>
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
      <CardContent className="flex items-center gap-4 p-6">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${isGreen ? 'bg-white/20' : 'bg-slate-100'}`}>
          {icon}
        </div>
        <div>
          <p className={`text-xs font-medium ${isGreen ? 'text-emerald-100' : 'text-slate-500'}`}>{label}</p>
          <p className={`text-2xl font-bold ${isGreen ? 'text-white' : 'text-slate-900'}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}