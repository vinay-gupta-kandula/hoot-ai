'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { GraduationCap, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: 'linear-gradient(135deg, #ede9fe 0%, #f5f3ff 40%, #e0e7ff 100%)',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Decorative blobs */}
      <div
        className="fixed top-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #8b7cf6, transparent)' }}
      />
      <div
        className="fixed bottom-[-100px] right-[-100px] w-[350px] h-[350px] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6457d4, transparent)' }}
      />

      <Card
        className="w-full max-w-[420px] border-0 shadow-2xl shadow-[#8b7cf620] relative z-10"
        style={{ borderRadius: 24, background: '#ffffff' }}
      >
        <CardHeader className="pt-8 pb-0 px-8 text-center">
          {/* Brand */}
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <div
              className="w-10 h-10 rounded-[12px] flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#6457d4,#8b7cf6)' }}
            >
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-[17px] font-semibold text-[#1a0f3c] tracking-tight">
              The Hooter Loot
            </span>
          </div>

          <h1 className="text-[24px] font-semibold text-[#1a0f3c] tracking-tight">
            Welcome Back
          </h1>
          <p className="text-[13px] text-[#9892b8] mt-1">
            Sign in to your account to continue
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-8 pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label
                htmlFor="login-email"
                className="text-[12px] font-semibold text-[#4a4270] uppercase tracking-wide"
              >
                Email
              </Label>
              <div
                className="flex items-center gap-2.5 rounded-[14px] px-3.5"
                style={{ background: '#f5f3ff', border: '1px solid #e4deff' }}
              >
                <Mail className="w-4 h-4 text-[#9892b8] shrink-0" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-0 bg-transparent shadow-none p-0 h-11 text-[13.5px] text-[#1a0f3c] placeholder:text-[#9892b8] focus-visible:ring-0"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="login-password"
                className="text-[12px] font-semibold text-[#4a4270] uppercase tracking-wide"
              >
                Password
              </Label>
              <div
                className="flex items-center gap-2.5 rounded-[14px] px-3.5"
                style={{ background: '#f5f3ff', border: '1px solid #e4deff' }}
              >
                <Lock className="w-4 h-4 text-[#9892b8] shrink-0" />
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-0 bg-transparent shadow-none p-0 h-11 text-[13.5px] text-[#1a0f3c] placeholder:text-[#9892b8] focus-visible:ring-0"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-[12.5px] text-[#d63a5a] font-medium bg-[#fff1f3] rounded-[10px] px-3.5 py-2.5">
                {error}
              </p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 rounded-[14px] text-[14px] font-semibold text-white border-0 mt-2 hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg,#6457d4,#8b7cf6)' }}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}