// src/types/types.ts

export interface StudentRow {
  id: string
  name: string | null
  roll_no: string | null
  email?: string | null
  branch: string | null
  college: string | null
  technology: string | null
  gender: string | null
  mentor_id: string | null
  created_at: string
}

export interface MentorRow {
  id: string
  name: string | null
  email: string | null
  pool_no: number | null
  main_mentor_id?: string | null
  created_at?: string
  students?: StudentRow[] | null
}

export interface MainMentorRow {
  id: string
  name: string | null
  email: string | null
  created_at: string
}

export interface AssessmentRow {
  id: string
  student_id: string | null
  mentor_id: string | null
  module_name: string | null
  course_name: string | null
  accuracy: number | null
  total_duration: number | null
  attempt_count: number | null
  assessment_date: string | null
  created_at: string
}

// UI / Domain Types
export interface StudentContext {
  name: string
  rollNo: string
  branch: string
  college: string
  technology: string
  gender: string
  mentorName: string
  poolNo?: number | null
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
