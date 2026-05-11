import { cn } from './utils'

describe('cn utility', () => {
  it('should merge classes correctly', () => {
    expect(cn('bg-red-500', 'p-4')).toBe('bg-red-500 p-4')
  })

  it('should handle tailwind conflicts', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })

  it('should handle conditional classes', () => {
    expect(cn('p-4', true && 'bg-blue-500', false && 'text-white')).toBe('p-4 bg-blue-500')
  })

  it('should handle undefined and null', () => {
    expect(cn('p-4', undefined, null, 'bg-red-500')).toBe('p-4 bg-red-500')
  })
})
