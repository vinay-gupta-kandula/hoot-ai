'use client'

import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { signOut } from './actions'

export function LogoutButton() {
  return (
    <form action={signOut}>
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="text-[13px] font-medium text-[#9892b8] hover:text-[#6457d4] hover:bg-[#f3f0ff] rounded-[10px] h-8 px-3 gap-1.5 transition-colors"
      >
        <LogOut className="w-3.5 h-3.5" />
        Logout
      </Button>
    </form>
  )
}
