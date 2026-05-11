'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, ComposedChart,
} from 'recharts'
import {
  ArrowLeft, Activity, TrendingUp, TrendingDown, Minus, Clock,
  RotateCcw, Target, Hash, Zap, ChevronDown, ChevronUp, BarChart3,
  Calendar, Award, Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ModuleDetail {
  name: string
  course: string
  avgAccuracy: number
  bestScore: number
  worstScore: number
  totalAttempts: number
  totalDuration: number
  trend: 'up' | 'down' | 'flat'
  attemptHistory: { date: string; score: number; duration: number; attempt: number }[]
}

interface Props {
  student: { id: string; name: string; rollNo: string }
  modules: ModuleDetail[]
}

const GRADIENTS = [
  'linear-gradient(135deg, #15803d 0%, #22c55e 50%, #86efac 100%)',
  'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 50%, #7dd3fc 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fde68a 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 50%, #c4b5fd 100%)',
]

function getScoreColor(score: number) {
  if (score >= 80) return '#15803d'
  if (score >= 60) return '#0ea5e9'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  if (trend === 'up') return <TrendingUp className="h-4 w-4 text-emerald-500" />
  if (trend === 'down') return <TrendingDown className="h-4 w-4 text-rose-500" />
  return <Minus className="h-4 w-4 text-slate-400" />
}

export function StudentModulesView({ student, modules }: Props) {
  const [expandedModule, setExpandedModule] = useState<string | null>(modules[0]?.name || null)
  const [selectedModule, setSelectedModule] = useState<ModuleDetail>(modules[0])

  const handleModuleClick = (m: ModuleDetail) => {
    setSelectedModule(m)
    setExpandedModule(expandedModule === m.name ? null : m.name)
  }

  // Small multiples data preparation
  const smallMultiples = modules.slice(0, 6)

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
          <h1 className="text-3xl font-black text-slate-900">Module Deep Dive</h1>
          <p className="mt-1 text-slate-500">{student.name} · {student.rollNo}</p>
        </div>

        {/* ─── ROW 1: MODULE CAROUSEL CARDS ─── */}
        <div className="mb-8 flex gap-4 overflow-x-auto pb-2">
          {modules.map((m, i) => (
            <button
              key={m.name}
              onClick={() => handleModuleClick(m)}
              className={`group relative min-w-[200px] flex-1 rounded-2xl p-5 text-left transition-all hover:scale-[1.02] ${
                selectedModule.name === m.name
                  ? 'shadow-xl ring-2 ring-emerald-400'
                  : 'shadow-sm hover:shadow-md'
              }`}
              style={{
                background: selectedModule.name === m.name ? GRADIENTS[i % GRADIENTS.length] : 'white',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${selectedModule.name === m.name ? 'text-white/80' : 'text-slate-400'}`}>
                  {m.course}
                </span>
                <TrendIcon trend={m.trend} />
              </div>
              <p className={`mt-1 text-lg font-bold ${selectedModule.name === m.name ? 'text-white' : 'text-slate-800'}`}>
                {m.name}
              </p>
              <div className="mt-3 flex items-end justify-between">
                <span className={`text-3xl font-black ${selectedModule.name === m.name ? 'text-white' : ''}`} style={{ color: selectedModule.name === m.name ? 'white' : getScoreColor(m.avgAccuracy) }}>
                  {m.avgAccuracy}%
                </span>
                <span className={`text-[10px] font-medium ${selectedModule.name === m.name ? 'text-white/70' : 'text-slate-400'}`}>
                  {m.totalAttempts} attempts
                </span>
              </div>
              <div className="mt-2 h-1 w-full rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white/90 transition-all duration-700"
                  style={{ width: `${m.avgAccuracy}%` }}
                />
              </div>
            </button>
          ))}
        </div>

        {/* ─── ROW 2: SELECTED MODULE DETAIL ─── */}
        {selectedModule && (
          <>
            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Mini radar for selected module vs best possible */}
              <ChartCard 
                title="Module Radar" 
                icon={<Activity className="h-4 w-4 text-emerald-600" />}
                footer={
                  <Link href={`/dashboard/student/modules/practice/${selectedModule.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 h-11 text-sm font-bold shadow-lg shadow-emerald-200">
                      <Sparkles className="h-4 w-4" />
                      Launch Practice Session
                    </Button>
                  </Link>
                }
              >
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={[
                      { metric: 'Accuracy', you: selectedModule.avgAccuracy, best: selectedModule.bestScore },
                      { metric: 'Speed', you: Math.min(100, selectedModule.totalDuration > 0 ? 100 - (selectedModule.totalDuration / 10) : 50), best: 80 },
                      { metric: 'Consistency', you: selectedModule.bestScore - selectedModule.worstScore < 20 ? 80 : 40, best: 90 },
                      { metric: 'Attempts', you: Math.min(100, selectedModule.totalAttempts * 10), best: 60 },
                      { metric: 'Best Score', you: selectedModule.bestScore, best: 100 },
                    ]}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <Radar name="You" dataKey="you" stroke="#15803d" fill="#15803d" fillOpacity={0.2} strokeWidth={2} />
                      <Radar name="Best" dataKey="best" stroke="#e2e8f0" fill="none" strokeDasharray="4 4" strokeWidth={1} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              {/* Attempt history area */}
              <ChartCard title="Score History" icon={<BarChart3 className="h-4 w-4 text-sky-600" />} className="lg:col-span-2">
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={selectedModule.attemptHistory} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="modArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} />
                      <Bar dataKey="score" radius={[6, 6, 0, 0]} fill="#e2e8f0" />
                      <Area type="monotone" dataKey="score" stroke="#0ea5e9" fill="url(#modArea)" strokeWidth={2} />
                      <Line type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={3} dot={{ fill: '#0ea5e9', r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>

            {/* Module stats grid */}
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatPill icon={<Target className="h-4 w-4" />} label="Best Score" value={`${selectedModule.bestScore}%`} color="text-emerald-600" bg="bg-emerald-50" />
              <StatPill icon={<TrendingDown className="h-4 w-4" />} label="Worst Score" value={`${selectedModule.worstScore}%`} color="text-rose-600" bg="bg-rose-50" />
              <StatPill icon={<RotateCcw className="h-4 w-4" />} label="Total Attempts" value={selectedModule.totalAttempts} color="text-amber-600" bg="bg-amber-50" />
              <StatPill icon={<Clock className="h-4 w-4" />} label="Total Time" value={`${selectedModule.totalDuration}m`} color="text-sky-600" bg="bg-sky-50" />
            </div>
          </>
        )}

        {/* ─── ROW 3: SMALL MULTIPLES ─── */}
        <ChartCard title="All Modules — Mini Trends" icon={<Zap className="h-4 w-4 text-violet-600" />} className="mb-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {smallMultiples.map((m) => (
              <div key={m.name} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold text-slate-700 truncate">{m.name}</p>
                <p className="text-xl font-black" style={{ color: getScoreColor(m.avgAccuracy) }}>{m.avgAccuracy}%</p>
                <div className="mt-2 h-[60px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={m.attemptHistory}>
                      <defs>
                        <linearGradient id={`sm-${m.name}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={getScoreColor(m.avgAccuracy)} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={getScoreColor(m.avgAccuracy)} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="score" stroke={getScoreColor(m.avgAccuracy)} fill={`url(#sm-${m.name})`} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* ─── ROW 4: ALL MODULES TABLE ─── */}
        <ChartCard title="Complete Module Log" icon={<Calendar className="h-4 w-4 text-emerald-600" />}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs text-slate-400">
                  <th className="px-3 py-3 font-medium">Module</th>
                  <th className="px-3 py-3 font-medium">Course</th>
                  <th className="px-3 py-3 font-medium">Avg</th>
                  <th className="px-3 py-3 font-medium">Best</th>
                  <th className="px-3 py-3 font-medium">Worst</th>
                  <th className="px-3 py-3 font-medium">Trend</th>
                  <th className="px-3 py-3 font-medium">Attempts</th>
                  <th className="px-3 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((m) => (
                  <tr key={m.name} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-3 py-3 font-medium text-slate-800">{m.name}</td>
                    <td className="px-3 py-3 text-slate-500">{m.course}</td>
                    <td className="px-3 py-3">
                      <span className="font-bold" style={{ color: getScoreColor(m.avgAccuracy) }}>{m.avgAccuracy}%</span>
                    </td>
                    <td className="px-3 py-3 text-emerald-600 font-semibold">{m.bestScore}%</td>
                    <td className="px-3 py-3 text-rose-600 font-semibold">{m.worstScore}%</td>
                    <td className="px-3 py-3"><TrendIcon trend={m.trend} /></td>
                    <td className="px-3 py-3 text-slate-500">{m.totalAttempts}</td>
                    <td className="px-3 py-3 text-slate-500">{m.totalDuration}m</td>
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

function ChartCard({ children, title, icon, footer, className = '' }: { children: React.ReactNode; title: string; icon: React.ReactNode; footer?: React.ReactNode; className?: string }) {
  return (
    <Card className={`flex flex-col overflow-hidden border-slate-100 bg-white shadow-sm ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">{children}</CardContent>
      {footer && (
        <div className="border-t border-slate-50 bg-slate-50/30 p-4">
          {footer}
        </div>
      )}
    </Card>
  )
}

function StatPill({ icon, label, value, color, bg }: { icon: React.ReactNode; label: string; value: string | number; color: string; bg: string }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl ${bg} p-4`}>
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-medium text-slate-500">{label}</p>
        <p className={`text-xl font-black ${color}`}>{value}</p>
      </div>
    </div>
  )
}