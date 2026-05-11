// src/lib/ai-context.ts
// Builds structured context from student analytics for the LLM

export interface StudentContext {
  name: string
  rollNo: string
  branch: string
  college: string
  technology: string
  gender: string
  mentorName: string
  poolNo?: number | null | undefined
}

export interface AnalyticsContext {
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
  courseAccuracy: { subject: string; score: number }[]
  moduleBreakdown: { name: string; score: number; attempts: number; duration: number }[]
}

export function buildSystemContext(student: StudentContext, analytics: AnalyticsContext): string {
  const topModules = analytics.moduleBreakdown.slice(0, 5)
  const weakModules = [...analytics.moduleBreakdown].sort((a, b) => a.score - b.score).slice(0, 3)

  return `
## STUDENT PROFILE
- Name: ${student.name}
- Roll No: ${student.rollNo}
- Branch: ${student.branch}
- College: ${student.college}
- Technology: ${student.technology}
- Gender: ${student.gender}
- Mentor: ${student.mentorName}
- Pool: ${student.poolNo ?? 'N/A'}

## OVERALL STATS
- Total Assessments: ${analytics.totalAssessments}
- Average Accuracy: ${analytics.avgAccuracy}%
- Class Average: ${analytics.classAvg}%
- Pool Rank: #${analytics.myRank} of ${analytics.totalPeers}
- Total Study Time: ${analytics.totalDuration} minutes
- Total Attempts: ${analytics.totalAttempts}

## COURSE BREAKDOWN
${analytics.courseAccuracy.map((c) => `- ${c.subject}: ${c.score}%`).join('\n')}

## TOP PERFORMING MODULES
${topModules.map((m) => `- ${m.name}: ${m.score}% (${m.attempts} attempts, ${m.duration}m)`).join('\n')}

## WEAKEST MODULES (NEEDS IMPROVEMENT)
${weakModules.map((m) => `- ${m.name}: ${m.score}% (${m.attempts} attempts, ${m.duration}m)`).join('\n')}

## BEST & WORST
- Best Course: ${analytics.bestCourse} (${analytics.bestScore}%)
- Needs Work: ${analytics.worstCourse} (${analytics.worstScore}%)
`.trim()
}