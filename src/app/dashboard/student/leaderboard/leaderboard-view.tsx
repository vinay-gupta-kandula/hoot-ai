'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Trophy, Medal, Target, User, Building2, Hash, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Ranking {
  id: string
  name: string
  rollNo: string
  college: string
  avgAccuracy: number
  isMe: boolean
}

interface Props {
  rankings: Ranking[]
}

const GRADIENTS = [
  'linear-gradient(135deg, #15803d 0%, #22c55e 50%, #86efac 100%)',
  'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 50%, #7dd3fc 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fde68a 100%)',
]

export function LeaderboardView({ rankings }: Props) {
  const topThree = rankings.slice(0, 3)
  const others = rankings.slice(3)

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-slate-800">
      {/* ─── GLASS NAV ─── */}
      <nav className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/student">
              <Button variant="ghost" size="sm" className="gap-2 rounded-full text-slate-600 hover:bg-slate-100">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Pool Leaderboard
            </span>
          </div>
        </div>
      </nav>

      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        {/* ─── PODIUM SECTION ─── */}
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:items-end">
          {/* 2nd Place */}
          {topThree[1] && (
            <PodiumCard 
              ranking={topThree[1]} 
              rank={2} 
              icon={<Medal className="h-8 w-8 text-slate-300" />} 
              gradient={GRADIENTS[1]} 
              delay="delay-100"
            />
          )}
          
          {/* 1st Place */}
          {topThree[0] && (
            <PodiumCard 
              ranking={topThree[0]} 
              rank={1} 
              icon={<Trophy className="h-12 w-12 text-amber-400" />} 
              gradient={GRADIENTS[0]} 
              large
            />
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <PodiumCard 
              ranking={topThree[2]} 
              rank={3} 
              icon={<Medal className="h-8 w-8 text-amber-600" />} 
              gradient={GRADIENTS[2]} 
              delay="delay-200"
            />
          )}
        </div>

        {/* ─── FULL RANKING TABLE ─── */}
        <Card className="border-slate-100 bg-white shadow-xl shadow-slate-200/50 overflow-hidden rounded-3xl">
          <CardHeader className="border-b border-slate-50 bg-slate-50/50 px-6 py-4">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-600" />
              Detailed Rankings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs text-slate-400 font-bold uppercase tracking-wider">
                    <th className="px-6 py-4 w-16">Rank</th>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">College</th>
                    <th className="px-6 py-4 text-right">Avg Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rankings.map((s, i) => (
                    <tr 
                      key={s.id} 
                      className={`transition-colors hover:bg-slate-50/80 ${s.isMe ? 'bg-emerald-50/50' : ''}`}
                    >
                      <td className="px-6 py-4 font-black text-slate-400">
                        #{i + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold ${s.isMe ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{s.name}</span>
                              {s.isMe && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 text-[10px]">YOU</Badge>}
                            </div>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                              <Hash className="h-2.5 w-2.5" />
                              {s.rollNo}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-slate-300" />
                          {s.college}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-lg font-black ${s.avgAccuracy >= 80 ? 'text-emerald-600' : s.avgAccuracy >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                          {s.avgAccuracy}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PodiumCard({ ranking, rank, icon, gradient, large, delay }: { ranking: Ranking; rank: number; icon: React.ReactNode; gradient: string; large?: boolean; delay?: string }) {
  return (
    <Card 
      className={`relative overflow-hidden border-0 shadow-2xl transition-all duration-700 animate-in fade-in slide-in-from-bottom-8 ${delay} ${large ? 'md:-translate-y-4 scale-105' : ''}`}
      style={{ background: gradient }}
    >
      <CardContent className="p-6 text-white flex flex-col items-center text-center">
        <div className="absolute top-2 right-2 opacity-20">
          <Sparkles className="h-12 w-12" />
        </div>
        <div className="mb-4 flex h-20 items-center justify-center">
          {icon}
        </div>
        <div className="mb-1 flex items-center justify-center rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
          Rank #{rank}
        </div>
        <h3 className={`font-black tracking-tight ${large ? 'text-2xl' : 'text-xl'}`}>{ranking.name}</h3>
        <p className="text-xs text-white/70 mb-4 opacity-80">{ranking.college}</p>
        <div className="flex flex-col items-center">
          <span className="text-xs font-medium text-white/60 uppercase">Accuracy</span>
          <span className={`${large ? 'text-4xl' : 'text-3xl'} font-black`}>{ranking.avgAccuracy}%</span>
        </div>
        {ranking.isMe && (
          <div className="mt-4 rounded-full bg-white px-4 py-1 text-[10px] font-black text-slate-900 shadow-lg">
            IT'S YOU! ⚡️
          </div>
        )}
      </CardContent>
    </Card>
  )
}
