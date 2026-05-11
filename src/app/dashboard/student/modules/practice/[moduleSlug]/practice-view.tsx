'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, BookOpen, Clock, CheckCircle2, AlertCircle, 
  ChevronRight, Sparkles, Trophy, RotateCcw, Save
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'

interface Props {
  student: { id: string; mentor_id: string | null; name: string | null }
  moduleName: string
  moduleSlug: string
}

const MOCK_READING_CONTENT = {
  title: "The Future of AI in Education",
  text: "Artificial intelligence is revolutionizing the way we approach learning. By providing personalized feedback and adapting to individual student needs, AI tools can bridge the gap in educational accessibility. However, the human element remains irreplaceable. Mentors provide the emotional support and critical thinking guidance that algorithms cannot replicate...",
  questions: [
    {
      id: 1,
      question: "What is a primary benefit of AI in education mentioned in the text?",
      options: ["Replacing all teachers", "Personalized feedback", "Decreasing tuition costs", "Automated grading"],
      correct: 1
    },
    {
      id: 2,
      question: "What does the text say about the 'human element'?",
      options: ["It is irrelevant", "It is irreplaceable", "It is less efficient than AI", "It should be phased out"],
      correct: 1
    },
    {
      id: 3,
      question: "Which of these is NOT provided by algorithms according to the text?",
      options: ["Data analysis", "Personalized feedback", "Critical thinking guidance", "Accessibility"],
      correct: 2
    }
  ]
}

export function PracticeView({ student, moduleName, moduleSlug }: Props) {
  const router = useRouter()
  const supabase = createClient()
  
  const [step, setStep] = useState<'intro' | 'active' | 'complete'>('intro')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [startTime, setStartTime] = useState<number>(0)
  const [duration, setDuration] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  // Start timer when practice begins
  useEffect(() => {
    if (step === 'active') {
      setStartTime(Date.now())
    } else if (step === 'complete' && startTime > 0) {
      setDuration(Math.round((Date.now() - startTime) / 1000 / 60))
    }
  }, [step])

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = optionIndex
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < MOCK_READING_CONTENT.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setStep('complete')
    }
  }

  const calculateAccuracy = () => {
    const correctCount = answers.filter((ans, i) => ans === MOCK_READING_CONTENT.questions[i].correct).length
    return Math.round((correctCount / MOCK_READING_CONTENT.questions.length) * 100)
  }

  const saveResults = async () => {
    setIsSaving(true)
    const accuracy = calculateAccuracy()
    
    const { error } = await supabase
      .from('assessments')
      .insert({
        student_id: student.id,
        mentor_id: student.mentor_id,
        module_name: moduleName,
        course_name: "Communication Skills", // Fallback
        accuracy: accuracy,
        total_duration: Math.max(1, duration),
        attempt_count: 1,
        assessment_date: new Date().toISOString().split('T')[0]
      })

    if (error) {
      console.error("Error saving assessment:", error)
      alert("Failed to save results. But your score was: " + accuracy + "%")
    } else {
      router.push('/dashboard/student/modules')
    }
    setIsSaving(false)
  }

  if (step === 'intro') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fb] p-6">
        <Card className="w-full max-w-lg overflow-hidden border-0 shadow-2xl rounded-3xl">
          <div className="h-32 bg-gradient-to-br from-emerald-600 to-teal-500 p-8 flex items-end justify-between">
            <div className="text-white">
              <Badge className="bg-white/20 text-white border-0 mb-2">PRACTICE MODE</Badge>
              <h2 className="text-2xl font-black">{moduleName}</h2>
            </div>
            <BookOpen className="h-16 w-16 text-white/20" />
          </div>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Estimated Time</h4>
                  <p className="text-sm text-slate-500">Approx. 5-10 minutes</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Skill Builder</h4>
                  <p className="text-sm text-slate-500">This session will improve your Reading comprehension and logical deduction.</p>
                </div>
              </div>
              
              <Button 
                onClick={() => setStep('active')}
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-base"
              >
                Start Practice Session
              </Button>
              
              <Link href="/dashboard/student/modules" className="block text-center text-xs text-slate-400 hover:text-slate-600 underline">
                Maybe later
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'active') {
    const q = MOCK_READING_CONTENT.questions[currentQuestion]
    const progress = ((currentQuestion + 1) / MOCK_READING_CONTENT.questions.length) * 100

    return (
      <div className="min-h-screen bg-[#f8f9fb] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600">
                  <BookOpen className="h-5 w-5" />
               </div>
               <div>
                 <h2 className="text-xl font-black text-slate-900">{moduleName} Practice</h2>
                 <p className="text-xs text-slate-500">Question {currentQuestion + 1} of {MOCK_READING_CONTENT.questions.length}</p>
               </div>
            </div>
            <div className="w-48">
              <Progress value={progress} className="h-2 bg-slate-200" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* TEXT SIDE */}
            <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
               <CardHeader className="bg-slate-50 border-b border-slate-100">
                 <CardTitle className="text-sm font-bold text-slate-500 flex items-center gap-2">
                   <AlertCircle className="h-4 w-4" />
                   Reading Passage
                 </CardTitle>
               </CardHeader>
               <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{MOCK_READING_CONTENT.title}</h3>
                  <p className="text-slate-600 leading-relaxed italic border-l-4 border-emerald-500 pl-4 py-2 bg-emerald-50/30 rounded-r-xl">
                    "{MOCK_READING_CONTENT.text}"
                  </p>
               </CardContent>
            </Card>

            {/* QUESTION SIDE */}
            <div className="space-y-6">
               <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
                  <CardContent className="p-8">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">{q.question}</h3>
                    <div className="space-y-3">
                      {q.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleAnswer(i)}
                          className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                            answers[currentQuestion] === i 
                              ? 'border-emerald-500 bg-emerald-50 shadow-md ring-1 ring-emerald-500' 
                              : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <span className={`font-semibold ${answers[currentQuestion] === i ? 'text-emerald-700' : 'text-slate-600'}`}>{opt}</span>
                          <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            answers[currentQuestion] === i 
                              ? 'border-emerald-500 bg-emerald-500 text-white' 
                              : 'border-slate-200 group-hover:border-slate-300'
                          }`}>
                            {answers[currentQuestion] === i && <CheckCircle2 className="h-4 w-4" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
               </Card>
               
               <Button 
                 disabled={answers[currentQuestion] === undefined}
                 onClick={handleNext}
                 className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-base shadow-xl shadow-emerald-200 gap-2"
               >
                 {currentQuestion === MOCK_READING_CONTENT.questions.length - 1 ? 'Finish Practice' : 'Next Question'}
                 <ChevronRight className="h-5 w-5" />
               </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'complete') {
    const accuracy = calculateAccuracy()

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fb] p-6">
        <Card className="w-full max-w-md overflow-hidden border-0 shadow-2xl rounded-3xl animate-in zoom-in duration-300">
          <div className="p-12 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
               <Trophy className="h-12 w-12" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Great Job!</h2>
            <p className="text-slate-500 mb-8">You've completed the practice session for <span className="font-bold text-slate-700">{moduleName}</span>.</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accuracy</p>
                  <p className="text-2xl font-black text-emerald-600">{accuracy}%</p>
               </div>
               <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</p>
                  <p className="text-2xl font-black text-sky-600">{duration || '< 1'}m</p>
               </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={saveResults}
                disabled={isSaving}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 gap-2"
              >
                {isSaving ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSaving ? 'Saving...' : 'Record & Finish'}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setStep('intro')}
                className="w-full h-12 text-slate-500 rounded-2xl font-bold"
              >
                Retry Practice
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return null
}
