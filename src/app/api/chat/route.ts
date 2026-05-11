// src/app/api/chat/route.ts
// Streaming chat API with strict guardrails - Gemini Edition
import { streamText } from 'ai'
import { google } from '@ai-sdk/google'
import { HOOT_AI_SYSTEM_PROMPT, NPC_RESPONSE } from '@/lib/ai-prompts'

// Off-topic keywords to catch early (unrelated to academic performance)
const OFF_TOPIC_PATTERNS = [
    /weather/i, /news/i, /politic/i, /election/i, /war/i,
    /joke/i, /funny/i, /poem/i, /story/i, /write.*essay/i,
    /recipe/i, /cook/i, /food/i, /movie/i, /song/i,
    /who.*president/i, /capital.*of/i, /population.*of/i,
    /translate.*to/i, /meaning.*of.*word/i, /synonym/i,
    /stock/i, /crypto/i, /bitcoin/i, /invest/i,
]

function isOffTopic(message: string): boolean {
    return OFF_TOPIC_PATTERNS.some((pattern) => pattern.test(message))
}

export async function POST(req: Request) {
    try {
        const { messages, context }: { messages: any[]; context: string } = await req.json()
        const lastMessage = messages[messages.length - 1]?.content || ''

        // Guardrail: immediate NPC response for off-topic
        if (isOffTopic(lastMessage)) {
            return new Response(NPC_RESPONSE, {
                headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            })
        }

        const systemMessage = `${HOOT_AI_SYSTEM_PROMPT}\n\n## CURRENT STUDENT CONTEXT\n${context}\n\nUse ONLY the data above. Do not hallucinate.`

        const result = streamText({
            model: google('gemini-flash-latest'),
            system: systemMessage,
            messages: messages,
            temperature: 0.3,
            maxOutputTokens: 400,
        })

        // Using toTextStreamResponse ensures compatibility with your frontend's raw text decoding
        return result.toTextStreamResponse()
    } catch (err) {
        return new Response(
            JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
    }
}