<img width="1473" height="893" alt="Screenshot 2026-04-05 at 11 49 57 AM" src="https://github.com/user-attachments/assets/16009e55-572e-4a9d-8699-290c06e90cd3" />



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
