<img width="1645" height="1069" alt="Screenshot 2026-04-05 at 11 49 19 AM" src="https://github.com/user-attachments/assets/c7ce9a3a-983b-410e-9909-576fe2af49b9" />



# Keenan Carroll — Portfolio

Personal portfolio site built with Next.js, featuring an embedded AI chat powered by Claude.

## Tech Stack

- **Framework** — Next.js 14 (App Router)
- **Styling** — Tailwind CSS, Framer Motion
- **AI Chat** — Anthropic Claude (Haiku), streaming via ReadableStream
- **Language** — TypeScript

## Features

- Animated particle canvas background
- Streaming AI chat with markdown rendering and in-memory rate limiting
- Sections: Hero, About, Projects, Experience, Skills, Contact
- Custom cursor and glass-morphism UI

## Getting Started

1. Clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the env example and add your API key:
   ```bash
   cp .env.local.example .env.local
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |

## Deployment

Deployed on [Vercel](https://vercel.com). Add `ANTHROPIC_API_KEY` under **Settings → Environment Variables** in your Vercel project.
