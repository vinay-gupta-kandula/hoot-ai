'use client'

import React from 'react'
import Link from 'next/link'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ComposedChart, Line, Cell,
} from 'recharts'
import {
  ArrowLeft, Flame, Trophy, Target, Clock, BookOpen, Calendar,
  TrendingUp, Zap, Award, Star, Hash, Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface CohortData {
  week: string
  myAvg: number
  classAvg: number
  myDuration: number
  classDuration: number
  myCount: number
  classCount: number
}

interface Milestone {
  label: string
  reached: boolean
}

interface SlopeData {
  name: string
  first: number
  last: number
  improvement: number
}

interface Stats {
  totalAssessments: number
  avgAccuracy: number
  totalDuration: number
  totalAttempts: number
  maxStreak: number
  uniqueDays: number
}

interface Props {
  student: { id: string; name: string; rollNo: string }
  cohortData: CohortData[]
  milestones: Milestone[]
  slopeData: SlopeData[]
  stats: Stats
}

const GRADIENTS = [
  'linear-gradient(135deg, #15803d 0%, #22c55e 50%, #86efac 100%)',
  'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 50%, #7dd3fc 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fde68a 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 50%, #c4b5fd 100%)',
  'linear-gradient(135deg, #ef4444 0%, #f87171 50%, #fca5a5 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #22d3ee 50%, #a5f3fc 100%)',
]

const MILESTONE_ICONS = [Target, BookOpen, Award, Star, Flame, Zap, TrendingUp, Clock]

function getImprovementColor(val: number) {
  if (val >= 20) return '#15803d'
  if (val >= 0) return '#0ea5e9'
  if (val >= -20) return '#f59e0b'
  return '#ef4444'
}

export function StudentProgressView({ student, cohortData, milestones, slopeData, stats }: Props) {
  const reachedCount = milestones.filter((m) => m.reached).length
  const progressPercent = Math.round((reachedCount / milestones.length) * 100)

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-slate-800">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/student">
              <Button variant="ghost" size="sm" className="gap-2 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4" />
                Overview
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
              {student.name.charAt(0)}
            </div>
          </div>
        </div>
      </nav>

      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">Progress Tracker</h1>
          <p className="mt-1 text-slate-500">{student.name} · {student.rollNo}</p>
        </div>

        {/* ─── ROW 1: STREAK + STATS ─── */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StreakCard streak={stats.maxStreak} />
          <StatCard icon={<BookOpen className="h-5 w-5 text-emerald-700" />} label="Assessments" value={stats.totalAssessments} gradient="bg-white" />
          <StatCard icon={<Target className="h-5 w-5 text-sky-700" />} label="Avg Accuracy" value={`${stats.avgAccuracy}%`} gradient="bg-white" />
          <StatCard icon={<Calendar className="h-5 w-5 text-violet-700" />} label="Active Days" value={stats.uniqueDays} gradient="bg-white" />
        </div>

        {/* ─── ROW 2: COHORT COMPARISON ─── */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard title="Accuracy: You vs Class" icon={<Target className="h-4 w-4 text-emerald-600" />}>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={cohortData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="myGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#15803d" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="classGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} />
                  <Area type="monotone" dataKey="classAvg" stroke="#94a3b8" fill="url(#classGrad)" strokeWidth={2} strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="myAvg" stroke="#15803d" fill="url(#myGrad)" strokeWidth={3} />
                  <Line type="monotone" dataKey="myAvg" stroke="#15803d" strokeWidth={3} dot={{ fill: '#15803d', r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Duration: You vs Class" icon={<Clock className="h-4 w-4 text-sky-600" />}>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={cohortData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} />
                  <Bar dataKey="classDuration" radius={[6, 6, 0, 0]} fill="#e2e8f0" />
                  <Bar dataKey="myDuration" radius={[6, 6, 0, 0]} fill="#0ea5e9" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* ─── ROW 3: SLOPE GRAPH ─── */}
        <ChartCard title="Module Improvement (First vs Last Attempt)" icon={<TrendingUp className="h-4 w-4 text-violet-600" />} className="mb-8">
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={slopeData} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} />
                <Bar dataKey="first" radius={[0, 4, 4, 0]} fill="#e2e8f0" />
                <Bar dataKey="last" radius={[0, 4, 4, 0]}>
                  {slopeData.map((entry, i) => (
                    <Cell key={`sl-${i}`} fill={getImprovementColor(entry.improvement)} />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-slate-300" /> First Attempt</span>
            <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-emerald-500" /> Last Attempt (improved)</span>
            <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-amber-500" /> Last Attempt (declined)</span>
          </div>
        </ChartCard>

        {/* ─── ROW 4: MILESTONES ─── */}
        <ChartCard title="Milestones" icon={<Trophy className="h-4 w-4 text-amber-600" />} className="mb-8">
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700">{reachedCount} of {milestones.length} unlocked</span>
              <span className="font-bold text-emerald-600">{progressPercent}%</span>
            </div>
            <div className="mt-2 h-3 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%`, background: GRADIENTS[0], transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {milestones.map((m, i) => {
              const Icon = MILESTONE_ICONS[i % MILESTONE_ICONS.length]
              return (
                <div
                  key={m.label}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all ${
                    m.reached
                      ? 'border-emerald-200 bg-emerald-50 shadow-sm'
                      : 'border-slate-100 bg-white opacity-50'
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${m.reached ? 'bg-emerald-600' : 'bg-slate-200'}`}>
                    <Icon className={`h-5 w-5 ${m.reached ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                  <span className={`text-center text-[11px] font-semibold ${m.reached ? 'text-emerald-800' : 'text-slate-400'}`}>
                    {m.label}
                  </span>
                  {m.reached && (
                    <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-bold text-white">UNLOCKED</span>
                  )}
                </div>
              )
            })}
          </div>
        </ChartCard>

        {/* ─── ROW 5: COHORT TABLE ─── */}
        <ChartCard title="Weekly Cohort Breakdown" icon={<Calendar className="h-4 w-4 text-emerald-600" />}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs text-slate-400">
                  <th className="px-3 py-3 font-medium">Period</th>
                  <th className="px-3 py-3 font-medium">Your Avg</th>
                  <th className="px-3 py-3 font-medium">Class Avg</th>
                  <th className="px-3 py-3 font-medium">Gap</th>
                  <th className="px-3 py-3 font-medium">Your Time</th>
                  <th className="px-3 py-3 font-medium">Class Time</th>
                  <th className="px-3 py-3 font-medium">Your Count</th>
                  <th className="px-3 py-3 font-medium">Class Count</th>
                </tr>
              </thead>
              <tbody>
                {cohortData.map((c) => {
                  const gap = c.myAvg - c.classAvg
                  return (
                    <tr key={c.week} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-3 py-3 font-medium text-slate-700">{c.week}</td>
                      <td className="px-3 py-3 font-bold text-emerald-700">{c.myAvg}%</td>
                      <td className="px-3 py-3 text-slate-500">{c.classAvg}%</td>
                      <td className="px-3 py-3">
                        <span className={`text-xs font-bold ${gap >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {gap >= 0 ? '+' : ''}{gap.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-500">{c.myDuration}m</td>
                      <td className="px-3 py-3 text-slate-500">{c.classDuration}m</td>
                      <td className="px-3 py-3 text-slate-500">{c.myCount}</td>
                      <td className="px-3 py-3 text-slate-500">{c.classCount}</td>
                    </tr>
                  )
                })}
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
    <Card className={`overflow-hidden border-slate-100 bg-white shadow-sm ${className}`}>
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

function StatCard({ icon, label, value, gradient }: { icon: React.ReactNode; label: string; value: string | number; gradient: string }) {
  const isGreen = gradient !== 'bg-white'
  return (
    <Card className={`${gradient} border-0 shadow-sm`}>
      <CardContent className="flex items-center gap-4 p-6">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${isGreen ? 'bg-white/20' : 'bg-slate-100'}`}>
          {icon}
        </div>
        <div>
          <p className={`text-xs font-medium ${isGreen ? 'text-white/80' : 'text-slate-500'}`}>{label}</p>
          <p className={`text-2xl font-bold ${isGreen ? 'text-white' : 'text-slate-900'}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function StreakCard({ streak }: { streak: number }) {
  return (
    <Card className="overflow-hidden border-0 shadow-lg" style={{ background: GRADIENTS[2] }}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
            <Flame className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium text-amber-100">Best Streak</p>
            <p className="text-3xl font-black text-white">{streak} days</p>
          </div>
        </div>
        <div className="mt-3 flex gap-1">
          {Array.from({ length: Math.min(streak, 14) }).map((_, i) => (
            <div key={i} className="h-2 flex-1 rounded-full bg-white/30" />
          ))}
          {streak > 14 && <span className="text-xs text-white/70 ml-1">+{streak - 14} more</span>}
        </div>
      </CardContent>
    </Card>
  )
}