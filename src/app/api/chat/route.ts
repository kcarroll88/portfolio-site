import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { KEENAN_SYSTEM_PROMPT } from '@/lib/keenan-context';

export const runtime = 'nodejs';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const LIMIT = 10;
const WINDOW = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW });
    return false;
  }
  if (entry.count >= LIMIT) return true;
  entry.count++;
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1';
  if (isRateLimited(ip)) {
    return new Response('Rate limit exceeded. Please wait a minute before trying again.', { status: 429 });
  }

  const { messages } = await req.json();

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      "I'm not connected to a live API yet — add your ANTHROPIC_API_KEY to .env.local to enable the chat.",
      { status: 200 }
    );
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = client.messages.stream({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: KEENAN_SYSTEM_PROMPT,
          messages,
        });

        for await (const event of response) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'An error occurred.';
        controller.enqueue(encoder.encode(`Error: ${msg}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  });
}
