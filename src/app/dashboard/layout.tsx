import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from './logout-button'
import { GraduationCap } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen" style={{ background: '#f5f3ff' }}>
      {/* ── Top Navbar ── */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-md border-b"
        style={{
          background: 'rgba(255,255,255,0.85)',
          borderColor: 'rgba(139,124,246,0.08)',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Left: Brand */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#6457d4,#8b7cf6)' }}
              >
                <GraduationCap className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-[15px] font-semibold text-[#1a0f3c] tracking-tight">
                The Hooter Loot
              </span>
            </div>

            {/* Right: Email + Logout */}
            <div className="flex items-center gap-3">
              {user?.email && (
                <span
                  className="text-[12px] font-medium text-[#9892b8] hidden sm:inline-block px-2.5 py-1 rounded-[8px]"
                  style={{ background: '#f5f3ff', border: '1px solid #e4deff' }}
                >
                  {user.email}
                </span>
              )}
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* ── Page Content ── */}
      <main>{children}</main>
    </div>
  )
}
