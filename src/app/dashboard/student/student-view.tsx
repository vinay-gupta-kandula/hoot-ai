'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChatBot } from '@/components/ui/chat-bot'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, Cell, ScatterChart, Scatter, ZAxis,
  ComposedChart, Line, Treemap, Funnel, FunnelChart, LabelList,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Target, Clock, RotateCcw, BookOpen,
  Award, Zap, BarChart3, Trophy,
  Activity, Layers, ArrowUpRight, ArrowDownRight, Sparkles, Flame,
  ChevronDown, ChevronUp, Calendar, Cpu,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Student {
  id: string
  name: string
  rollNo: string
  branch: string
  college: string
  technology: string
  gender: string
  mentorName: string
  poolNo?: number | null
}

interface Analytics {
  courseAccuracy: { subject: string; score: number; fullMark: number }[]
  moduleBreakdown: { name: string; score: number; attempts: number; duration: number; size: number }[]
  timeline: { date: string; count: number; avgAccuracy: number }[]
  peerComparison: { id: string; name: string; avgAccuracy: number; isMe: boolean }[]
  treemapData: { name: string; size: number; score: number }[]
  funnelData: { name: string; value: number; fill: string }[]
  scatterData: { x: number; y: number; z: number; name: string }[]
  bulletData: { subject: string; me: number; classAvg: number; target: number }[]
  sparklineData: number[]
  sankeyNodes: { name: string; index: number }[]
  sankeyLinks: { source: number; target: number; value: number }[]
  stats: {
    totalAssessments: number
    avgAccuracy: number
    totalDuration: number
    totalAttempts: number
    myRank: number
    totalPeers: number
    classAvg: number
    bestCourse: string
    bestScore: number
    worstCourse: string
    worstScore: number
  }
}

interface Props {
  student: Student
  analytics: Analytics
}

const COLORS = ['#15803d', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899']
const GRADIENTS = [
  'linear-gradient(135deg, #15803d 0%, #22c55e 50%, #86efac 100%)',
  'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 50%, #7dd3fc 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fde68a 100%)',
  'linear-gradient(135deg, #ef4444 0%, #f87171 50%, #fca5a5 100%)',
]

function getScoreColor(score: number) {
  if (score >= 80) return '#15803d'
  if (score >= 60) return '#0ea5e9'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

function getScoreBg(score: number) {
  if (score >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (score >= 60) return 'bg-sky-50 text-sky-700 border-sky-200'
  if (score >= 40) return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-rose-50 text-rose-700 border-rose-200'
}

// ─── CUSTOM GAUGE COMPONENT ───
function Speedometer({ value, label, size = 140 }: { value: number; label: string; size?: number }) {
  const radius = (size - 20) / 2
  const circumference = Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  const color = getScoreColor(value)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size / 2 + 10 }}>
        <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
          <defs>
            <linearGradient id={`gaugeGrad-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="33%" stopColor="#f59e0b" />
              <stop offset="66%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
          </defs>
          <path
            d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
            fill="none"
            stroke={`url(#gaugeGrad-${label})`}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={0}
            opacity={0.3}
          />
          <path
            d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          />
        </svg>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 text-center">
          <span className="text-2xl font-black" style={{ color }}>{value}%</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-slate-500">{label}</span>
    </div>
  )
}

// ─── SPARKLINE SVG ───
function Sparkline({ data, color = '#15803d', height = 40 }: { data: number[]; color?: string; height?: number }) {
  if (data.length < 2) return <div className="h-[40px] w-full" />
  const max = Math.max(...data, 100)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const width = 120
  const points = data.map((v, i) => {
    const x = data.length > 1 ? (i / (data.length - 1)) * width : 0
    const y = height - ((v - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${points} ${width},${height}`} fill="url(#sparkGrad)" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── CUSTOM BULLET CHART ───
function BulletChart({ data }: { data: { subject: string; me: number; classAvg: number; target: number }[] }) {
  return (
    <div className="flex flex-col gap-3">
      {data.map((d) => (
        <div key={d.subject} className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-xs font-medium text-slate-600">{d.subject}</span>
          <div className="relative h-6 flex-1 rounded-full bg-slate-100 overflow-hidden">
            {/* Background zones */}
            <div className="absolute inset-y-0 left-0 w-[40%] rounded-l-full bg-rose-100" />
            <div className="absolute inset-y-0 left-[40%] w-[30%] bg-amber-100" />
            <div className="absolute inset-y-0 left-[70%] w-[30%] rounded-r-full bg-emerald-100" />
            {/* Class average marker */}
            <div className="absolute top-0 bottom-0 w-0.5 bg-slate-400" style={{ left: `${d.classAvg}%` }} />
            {/* Target marker */}
            <div className="absolute top-0 bottom-0 w-0.5 bg-dashed border-l border-dashed border-slate-600" style={{ left: `${d.target}%` }} />
            {/* My bar */}
            <div
              className="absolute top-1 bottom-1 rounded-full bg-emerald-500 shadow-sm transition-all duration-700"
              style={{ width: `${Math.min(d.me, 100)}%`, transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            />
          </div>
          <span className="w-10 text-right text-xs font-bold text-emerald-700">{d.me}%</span>
        </div>
      ))}
    </div>
  )
}

// ─── CUSTOM SANKEY ───
function SimpleSankey({ nodes, links }: { nodes: { name: string; index: number }[]; links: { source: number; target: number; value: number }[] }) {
  if (nodes.length === 0) return <div className="h-[200px] flex items-center justify-center text-slate-400">No course-module data</div>

  const leftNodes = nodes.filter((n) => links.some((l) => l.source === n.index))
  const rightNodes = nodes.filter((n) => links.some((l) => l.target === n.index))
  
  const leftWidth = 120
  const rightWidth = 120
  const gap = 200
  const nodeHeight = 28
  const nodeGap = 12

  // Create lookup maps for Y positions
  const leftYMap: Record<number, number> = {}
  leftNodes.forEach((n, i) => { leftYMap[n.index] = i * (nodeHeight + nodeGap) + 10 })
  
  const rightYMap: Record<number, number> = {}
  rightNodes.forEach((n, i) => { rightYMap[n.index] = i * (nodeHeight + nodeGap) + 10 })

  return (
    <svg width="100%" height={Math.max(leftNodes.length, rightNodes.length) * (nodeHeight + nodeGap) + 20} viewBox={`0 0 ${leftWidth + gap + rightWidth} ${Math.max(leftNodes.length, rightNodes.length) * (nodeHeight + nodeGap) + 20}`}>
      {links.map((link, i) => {
        const sY = leftYMap[link.source]
        const tY = rightYMap[link.target]
        if (sY === undefined || tY === undefined) return null
        
        const path = `M ${leftWidth} ${sY + nodeHeight / 2} C ${leftWidth + gap / 2} ${sY + nodeHeight / 2}, ${leftWidth + gap / 2} ${tY + nodeHeight / 2}, ${leftWidth + gap} ${tY + nodeHeight / 2}`
        return (
          <path key={i} d={path} fill="none" stroke={COLORS[i % COLORS.length]} strokeWidth={Math.max(2, link.value * 3)} opacity={0.4} />
        )
      })}
      {leftNodes.map((node, i) => (
        <g key={`l-${i}`}>
          <rect x={0} y={i * (nodeHeight + nodeGap) + 10} width={leftWidth - 10} height={nodeHeight} rx={8} fill="#15803d" opacity={0.9} />
          <text x={10} y={i * (nodeHeight + nodeGap) + 10 + nodeHeight / 2 + 4} fill="white" fontSize={10} fontWeight={600}>{node.name}</text>
        </g>
      ))}
      {rightNodes.map((node, i) => (
        <g key={`r-${i}`}>
          <rect x={leftWidth + gap + 10} y={i * (nodeHeight + nodeGap) + 10} width={rightWidth - 10} height={nodeHeight} rx={8} fill="#0ea5e9" opacity={0.9} />
          <text x={leftWidth + gap + 20} y={i * (nodeHeight + nodeGap) + 10 + nodeHeight / 2 + 4} fill="white" fontSize={10} fontWeight={600}>{node.name}</text>
        </g>
      ))}
    </svg>
  )
}

export function StudentDashboardView({ student, analytics }: Props) {
  const [expandedModule, setExpandedModule] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'progress'>('overview')

  // const topModule = analytics.moduleBreakdown[0]
  const improvement = analytics.sparklineData.length >= 2
    ? analytics.sparklineData[analytics.sparklineData.length - 1] - analytics.sparklineData[0]
    : 0

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-slate-800">
      {/* ─── GLASS NAV ─── */}
      <nav className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl shadow-lg shadow-emerald-200" style={{ background: GRADIENTS[0] }}>
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">Hooter Loot</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${activeTab === 'overview' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              Overview
            </button>
            <Link href="/dashboard/student/modules">
              <button className="rounded-full px-4 py-1.5 text-xs font-semibold text-slate-500 transition-all hover:bg-slate-100">
                Modules
              </button>
            </Link>
            <Link href="/dashboard/student/progress">
              <button className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${activeTab === 'progress' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'text-slate-500 hover:bg-slate-100'}`}>
                Progress
              </button>
            </Link>
            <Link href="/dashboard/student/leaderboard">
              <button className="rounded-full px-4 py-1.5 text-xs font-semibold text-slate-500 transition-all hover:bg-slate-100 flex items-center gap-1.5">
                <Trophy className="h-3 w-3 text-amber-500" />
                Leaderboard
              </button>
            </Link>
            <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
              {student.name.charAt(0)}
            </div>
          </div>
        </div>
      </nav>

      <div className="p-6 md:p-8">
        {/* ─── HERO SECTION ─── */}
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge className="rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <Zap className="mr-1 h-3 w-3" />
                Pool {student.poolNo ?? '—'}
              </Badge>
              <span className="text-xs text-slate-400">· Mentor: {student.mentorName}</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">{student.name}</h1>
            <p className="mt-1 text-slate-500">{student.rollNo} · {student.branch} · {student.college}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs font-medium text-slate-400">Class Rank</span>
              <span className="text-3xl font-black text-emerald-600">#{analytics.stats.myRank}</span>
              <span className="text-[10px] text-slate-400">of {analytics.stats.totalPeers}</span>
            </div>
            <div className="h-12 w-px bg-slate-200" />
            <Speedometer value={analytics.stats.avgAccuracy} label="Overall Score" />
          </div>
        </div>

        {/* ─── ROW 1: 4 GLOSSY STAT CARDS WITH SPARKLINES ─── */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <GlossyCard
            icon={<Target className="h-5 w-5 text-white" />}
            label="Avg Accuracy"
            value={`${analytics.stats.avgAccuracy}%`}
            trend={improvement}
            gradient={GRADIENTS[0]}
            sparkline={<Sparkline data={analytics.sparklineData} color="#fff" />}
          />
          <GlossyCard
            icon={<BookOpen className="h-5 w-5 text-emerald-700" />}
            label="Assessments"
            value={analytics.stats.totalAssessments}
            gradient="bg-white"
            textColor="text-slate-900"
          />
          <GlossyCard
            icon={<Clock className="h-5 w-5 text-sky-700" />}
            label="Total Time"
            value={`${analytics.stats.totalDuration}m`}
            gradient="bg-white"
            textColor="text-slate-900"
          />
          <GlossyCard
            icon={<RotateCcw className="h-5 w-5 text-amber-700" />}
            label="Attempts"
            value={analytics.stats.totalAttempts}
            gradient="bg-white"
            textColor="text-slate-900"
          />
        </div>

        {/* ─── ROW 2: POLAR AREA + TREEMAP ─── */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Polar Area (rare!) */}
          <ChartCard title="Course Performance" icon={<Activity className="h-4 w-4 text-emerald-600" />} className="lg:col-span-2">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={analytics.courseAccuracy}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Radar name="Score" dataKey="score" stroke="#15803d" fill="#15803d" fillOpacity={0.25} strokeWidth={2.5} />
                  <Radar name="Target" dataKey="fullMark" stroke="#e2e8f0" fill="none" strokeDasharray="4 4" strokeWidth={1} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', color: '#1e293b', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Treemap (rare!) */}
          <ChartCard title="Module Weight Map" icon={<Layers className="h-4 w-4 text-sky-600" />} className="lg:col-span-3">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={analytics.treemapData}
                  dataKey="size"
                  aspectRatio={4 / 3}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  content={(props: any) => {
                    const { x, y, width, height, name, score } = props;
                    return (
                      <g>
                        <rect x={x} y={y} width={width} height={height} fill={getScoreColor(score || 0)} rx={8} opacity={0.85} />
                        {width > 60 && height > 40 && (
                          <>
                            <text x={x + 8} y={y + 18} fill="white" fontSize={11} fontWeight={700}>{name}</text>
                            <text x={x + 8} y={y + 34} fill="white" fontSize={14} fontWeight={900} opacity={0.9}>{score}%</text>
                          </>
                        )}
                      </g>
                    );
                  }}
                />
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* ─── ROW 3: FUNNEL + BUBBLE SCATTER ─── */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Funnel (rare!) */}
          <ChartCard title="Module Mastery Funnel" icon={<Flame className="h-4 w-4 text-orange-600" />}>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', color: '#1e293b', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} />
                  <Funnel dataKey="value" data={analytics.funnelData} isAnimationActive>
                    <LabelList position="inside" fill="#fff" stroke="none" dataKey="name" fontSize={11} fontWeight={700} />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Bubble Scatter (rare! 3D data) */}
          <ChartCard title="Accuracy vs Duration (bubble = attempts)" icon={<BarChart3 className="h-4 w-4 text-violet-600" />}>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" dataKey="x" name="Duration" unit="m" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis type="number" dataKey="y" name="Accuracy" unit="%" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <ZAxis type="number" dataKey="z" range={[60, 400]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', color: '#1e293b', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} />
                  <Scatter name="Modules" data={analytics.scatterData} fill="#8b5cf6">
                    {analytics.scatterData.map((_, i) => (
                      <Cell key={`sc-${i}`} fill={COLORS[i % COLORS.length]} fillOpacity={0.7} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* ─── ROW 4: BULLET CHART + SANKEY ─── */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Bullet Chart (rare!) */}
          <ChartCard title="You vs Class Average" icon={<Target className="h-4 w-4 text-rose-600" />}>
            <div className="h-[300px] w-full overflow-y-auto pr-2">
              <div className="mb-2 flex items-center gap-4 text-[10px] text-slate-400">
                <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-emerald-500" /> You</span>
                <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-slate-400" /> Class Avg</span>
                <span className="flex items-center gap-1"><div className="h-2 w-0.5 border-l border-dashed border-slate-600" /> Target</span>
              </div>
              <BulletChart data={analytics.bulletData} />
            </div>
          </ChartCard>

          {/* Sankey (rare!) */}
          <ChartCard title="Course → Module Flow" icon={<Layers className="h-4 w-4 text-cyan-600" />}>
            <div className="h-[300px] w-full overflow-x-auto">
              <SimpleSankey nodes={analytics.sankeyNodes} links={analytics.sankeyLinks} />
            </div>
          </ChartCard>
        </div>

        {/* ─── ROW 5: PEER COMPARISON + BEST/WORST ─── */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Peer ranking bar */}
          <ChartCard title="Pool Rankings" icon={<Award className="h-4 w-4 text-amber-600" />} className="lg:col-span-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.peerComparison.slice(0, 12)} layout="vertical" margin={{ top: 5, right: 20, left: 50, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', color: '#1e293b', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} />
                  <Bar dataKey="avgAccuracy" radius={[0, 8, 8, 0]}>
                    {analytics.peerComparison.slice(0, 12).map((entry, i) => (
                      <Cell key={`peer-${i}`} fill={entry.isMe ? '#15803d' : '#e2e8f0'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Best/Worst cards */}
          <div className="flex flex-col gap-4">
            <Card className="overflow-hidden border-0 shadow-lg" style={{ background: GRADIENTS[0] }}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-emerald-100">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-semibold">Best Course</span>
                </div>
                <p className="mt-1 text-2xl font-black text-white">{analytics.stats.bestCourse}</p>
                <p className="text-lg font-bold text-emerald-100">{analytics.stats.bestScore}%</p>
              </CardContent>
            </Card>
            <Card className="overflow-hidden border-0 shadow-lg" style={{ background: GRADIENTS[3] }}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-rose-100">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-xs font-semibold">Needs Work</span>
                </div>
                <p className="mt-1 text-2xl font-black text-white">{analytics.stats.worstCourse}</p>
                <p className="text-lg font-bold text-rose-100">{analytics.stats.worstScore}%</p>
              </CardContent>
            </Card>
            <Card className="border-slate-100 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-slate-400">
                  <Target className="h-4 w-4" />
                  <span className="text-xs font-semibold">Class Average</span>
                </div>
                <p className="mt-1 text-2xl font-black text-slate-900">{analytics.stats.classAvg}%</p>
                <p className="text-xs text-slate-400">Pool-wide average</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ─── ROW 6: INTERACTIVE MODULE CARDS ─── */}
        <ChartCard title="Module Breakdown" icon={<Cpu className="h-4 w-4 text-indigo-600" />} className="mb-8">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {analytics.moduleBreakdown.map((m) => (
              <div
                key={m.name}
                className="group cursor-pointer rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-lg hover:scale-[1.02]"
                style={{ transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                onClick={() => setExpandedModule(expandedModule === m.name ? null : m.name)}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800">{m.name}</p>
                  {expandedModule === m.name ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <span className="text-2xl font-black" style={{ color: getScoreColor(m.score) }}>{m.score}%</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getScoreBg(m.score)}`}>
                    {m.attempts} tries
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${m.score}%`, background: GRADIENTS[0], transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                  />
                </div>
                {expandedModule === m.name && (
                  <div className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <div className="flex justify-between"><span>Duration</span><span className="font-medium text-slate-700">{m.duration}m</span></div>
                    <div className="flex justify-between"><span>Attempts</span><span className="font-medium text-slate-700">{m.attempts}</span></div>
                    <div className="flex justify-between"><span>Weight</span><span className="font-medium text-slate-700">{m.size}</span></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ChartCard>

        {/* ─── ROW 7: TIMELINE ─── */}
        <ChartCard title="Performance Timeline" icon={<Calendar className="h-4 w-4 text-emerald-600" />}>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={analytics.timeline} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15803d" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', color: '#1e293b', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }} />
                <Bar yAxisId="left" dataKey="count" radius={[6, 6, 0, 0]} fill="#e2e8f0" />
                <Area yAxisId="right" type="monotone" dataKey="avgAccuracy" stroke="#15803d" fill="url(#areaGrad)" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="avgAccuracy" stroke="#15803d" strokeWidth={3} dot={{ fill: '#15803d', r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
      <ChatBot
        student={{
          name: student.name,
          rollNo: student.rollNo,
          branch: student.branch,
          college: student.college,
          technology: student.technology,
          gender: student.gender,
          mentorName: student.mentorName,
          poolNo: student.poolNo,
        }}
        analytics={{
          totalAssessments: analytics.stats.totalAssessments,
          avgAccuracy: analytics.stats.avgAccuracy,
          totalDuration: analytics.stats.totalDuration,
          totalAttempts: analytics.stats.totalAttempts,
          myRank: analytics.stats.myRank,
          totalPeers: analytics.stats.totalPeers,
          classAvg: analytics.stats.classAvg,
          bestCourse: analytics.stats.bestCourse,
          bestScore: analytics.stats.bestScore,
          worstCourse: analytics.stats.worstCourse,
          worstScore: analytics.stats.worstScore,
          courseAccuracy: analytics.courseAccuracy,
          moduleBreakdown: analytics.moduleBreakdown,
        }}
      />
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

function GlossyCard({ icon, label, value, trend, gradient, textColor = 'text-white', sparkline }: {
  icon: React.ReactNode; label: string; value: string | number; trend?: number; gradient: string; textColor?: string; sparkline?: React.ReactNode
}) {
  const isGreen = gradient !== 'bg-white'
  return (
    <Card className="overflow-hidden border-0 shadow-lg" style={isGreen ? { background: gradient } : undefined}>
      <CardContent className={`p-5 ${isGreen ? '' : 'bg-white'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isGreen ? 'bg-white/20' : 'bg-slate-100'}`}>
              {icon}
            </div>
            <div>
              <p className={`text-[11px] font-medium ${isGreen ? 'text-white/80' : 'text-slate-500'}`}>{label}</p>
              <p className={`text-2xl font-black ${isGreen ? 'text-white' : textColor}`}>{value}</p>
              {trend !== undefined && (
                <div className={`flex items-center gap-1 text-[10px] font-semibold ${trend >= 0 ? 'text-emerald-200' : 'text-rose-200'}`}>
                  {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(trend).toFixed(1)}% vs start
                </div>
              )}
            </div>
          </div>
          {sparkline && <div className="w-16 opacity-80">{sparkline}</div>}
        </div>
      </CardContent>
    </Card>
  )
}