'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import {
  Search, ArrowLeft, Save, RotateCcw, GraduationCap, Hash, User,
  Building2, Cpu, CheckCircle2, AlertCircle, Pencil, Bell,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Student {
  id: string
  name: string
  rollNo: string
  branch: string
  college: string
  technology: string
  gender: string
}

interface Props {
  students: Student[]
  mentorName: string
}

const BRANCHES = ['CSE', 'ECE', 'Mech', 'Civil', 'IT']
const GENDERS = ['MALE', 'FEMALE', 'UNKNOWN']

export function StudentsTableView({ students: initialStudents, mentorName }: Props) {
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Student>>({})
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const filtered = useMemo(() => {
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(search.toLowerCase()) ||
        s.branch.toLowerCase().includes(search.toLowerCase())
    )
  }, [students, search])

  const startEdit = (s: Student) => {
    setEditingId(s.id)
    setEditForm({
      branch: s.branch,
      college: s.college,
      technology: s.technology,
      gender: s.gender,
    })
    setToast(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
    setToast(null)
  }

  const saveEdit = async (id: string) => {
    setSaving(true)
    setToast(null)

    const { error } = await supabase
      .from('students')
      .update({
        branch: editForm.branch,
        college: editForm.college,
        technology: editForm.technology,
        gender: editForm.gender,
      })
      .eq('id', id)

    if (error) {
      setToast({ type: 'error', message: error.message })
    } else {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, branch: editForm.branch || s.branch, college: editForm.college || s.college, technology: editForm.technology || s.technology, gender: editForm.gender || s.gender }
            : s
        )
      )
      setToast({ type: 'success', message: 'Student updated successfully.' })
      setEditingId(null)
      setEditForm({})
    }
    setSaving(false)
  }

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
          <div className="flex items-center gap-4">
            <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <GraduationCap className="h-3 w-3" />
              <span>{mentorName}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-6 md:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Student Roster</h1>
            <p className="mt-1 text-sm text-slate-500">Edit non-critical info. Name and Roll No are locked.</p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, roll no, or branch..."
              className="rounded-full border-slate-200 bg-white pl-10 text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {toast && (
          <div className={`mb-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${toast.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
            {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {toast.message}
          </div>
        )}

        <Card className="border-slate-100 bg-white shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs text-slate-400">
                    <th className="px-4 py-3 font-medium">Roll No</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Branch</th>
                    <th className="px-4 py-3 font-medium">College</th>
                    <th className="px-4 py-3 font-medium">Technology</th>
                    <th className="px-4 py-3 font-medium">Gender</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => {
                    const isEditing = editingId === s.id
                    return (
                      <tr key={s.id} className="border-b border-slate-50 transition-colors hover:bg-slate-50/50">
                        {/* Roll No — LOCKED */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Hash className="h-3 w-3" />
                            <span className="font-mono text-xs">{s.rollNo}</span>
                          </div>
                        </td>

                        {/* Name — LOCKED */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            <span className="font-medium text-slate-800">{s.name}</span>
                          </div>
                        </td>

                        {/* Branch — EDITABLE */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <select
                              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              value={editForm.branch || s.branch}
                              onChange={(e) => setEditForm((p) => ({ ...p, branch: e.target.value }))}
                            >
                              {BRANCHES.map((b) => (
                                <option key={b} value={b}>{b}</option>
                              ))}
                            </select>
                          ) : (
                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100">{s.branch}</Badge>
                          )}
                        </td>

                        {/* College — EDITABLE */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <Building2 className="h-3 w-3 text-slate-400" />
                              <Input
                                className="h-8 w-32 rounded-lg border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus-visible:ring-emerald-500"
                                value={editForm.college || ''}
                                onChange={(e) => setEditForm((p) => ({ ...p, college: e.target.value }))}
                                placeholder="College"
                              />
                            </div>
                          ) : (
                            <span className="text-slate-500">{s.college || '—'}</span>
                          )}
                        </td>

                        {/* Technology — EDITABLE */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <Cpu className="h-3 w-3 text-slate-400" />
                              <Input
                                className="h-8 w-32 rounded-lg border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus-visible:ring-emerald-500"
                                value={editForm.technology || ''}
                                onChange={(e) => setEditForm((p) => ({ ...p, technology: e.target.value }))}
                                placeholder="Technology"
                              />
                            </div>
                          ) : (
                            <span className="text-slate-500">{s.technology || '—'}</span>
                          )}
                        </td>

                        {/* Gender — EDITABLE */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <select
                              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              value={editForm.gender || s.gender}
                              onChange={(e) => setEditForm((p) => ({ ...p, gender: e.target.value }))}
                            >
                              {GENDERS.map((g) => (
                                <option key={g} value={g}>{g}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`text-xs font-medium ${s.gender === 'MALE' ? 'text-sky-600' : s.gender === 'FEMALE' ? 'text-pink-600' : 'text-slate-400'}`}>
                              {s.gender}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full p-0 text-slate-400 hover:bg-slate-100 hover:text-slate-700" onClick={cancelEdit} disabled={saving}>
                                <RotateCcw className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="sm" className="h-8 gap-1 rounded-full bg-emerald-600 px-4 text-xs hover:bg-emerald-500" onClick={() => saveEdit(s.id)} disabled={saving}>
                                <Save className="h-3.5 w-3.5" />
                                {saving ? 'Saving...' : 'Save'}
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="ghost" className="h-8 gap-1 rounded-full text-slate-500 hover:bg-emerald-50 hover:text-emerald-700" onClick={() => startEdit(s)}>
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                        No students found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}