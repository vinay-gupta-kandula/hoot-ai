'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Send, X, Bot, User, Sparkles, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StudentContext, AnalyticsContext, buildSystemContext } from '@/lib/ai-context'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

interface ChatBotProps {
  student: StudentContext
  analytics: AnalyticsContext
}

const GRADIENT = 'linear-gradient(135deg, #15803d 0%, #22c55e 50%, #86efac 100%)'

export function ChatBot({ student, analytics }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hey ${student.name}! I'm Hoot AI. Ask me about your LSRW performance, weak areas, or how to improve your scores.`,
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const contextString = buildSystemContext(student, analytics)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const generateId = () => Math.random().toString(36).slice(2, 9)

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMsg: Message = { id: generateId(), role: 'user', content: text }
    const assistantMsg: Message = { id: generateId(), role: 'assistant', content: '', isStreaming: true }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages.filter((m) => m.id !== 'welcome'), userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          context: contextString,
        }),
      })

      if (!response.ok || !response.body) {
        throw new Error('Failed to get response')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullContent += chunk
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsg.id ? { ...m, content: fullContent } : m))
        )
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === assistantMsg.id ? { ...m, isStreaming: false } : m))
      )
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: 'Sorry, I had trouble connecting. Try again!', isStreaming: false }
            : m
        )
      )
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages, contextString])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hey ${student.name}! I'm Hoot AI. Ask me about your LSRW performance, weak areas, or how to improve your scores.`,
      },
    ])
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[100] flex h-14 w-14 items-center justify-center rounded-full shadow-xl shadow-emerald-200 transition-transform hover:scale-110 active:scale-95"
          style={{ background: GRADIENT }}
          aria-label="Open Hoot AI"
        >
          <Sparkles className="h-6 w-6 text-white" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[100] flex h-[560px] w-[380px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/50">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3" style={{ background: GRADIENT }}>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Hoot AI</p>
                <p className="text-[10px] text-white/80">Your learning mentor</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
                title="Clear chat"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
            <div className="flex flex-col gap-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      msg.role === 'user' ? 'bg-slate-200' : 'bg-emerald-100'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User className="h-3.5 w-3.5 text-slate-600" />
                    ) : (
                      <Bot className="h-3.5 w-3.5 text-emerald-600" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white'
                        : 'border border-slate-100 bg-slate-50 text-slate-700'
                    }`}
                  >
                    {msg.content}
                    {msg.isStreaming && (
                      <span className="ml-1 inline-block h-3 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    )}
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100">
                    <Bot className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <div className="flex items-center gap-1 rounded-2xl border border-slate-100 bg-slate-50 px-3.5 py-2.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
                    <span className="text-xs text-slate-400">Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 2 && (
            <div className="flex flex-wrap gap-2 border-t border-slate-50 px-4 py-2">
              {[
                'Where should I improve?',
                'My weakest LSRW skill?',
                'How do I rank?',
                'Best study strategy?',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion)
                    inputRef.current?.focus()
                  }}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-slate-100 px-3 py-3">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your performance..."
              className="h-10 flex-1 rounded-full border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="h-10 w-10 rounded-full bg-emerald-600 p-0 hover:bg-emerald-500 disabled:opacity-40"
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}