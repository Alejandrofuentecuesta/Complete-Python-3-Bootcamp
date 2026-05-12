# Calorie Voice Tracker MVP

This repository now contains a Next.js App Router MVP for a voice-first calorie and exercise tracker. It is designed for ChatGPT narration, server-side extraction, Supabase persistence, and a mobile-first dashboard.

## Local setup
```bash
npm install
cp .env.example .env.local
npm run dev
```

Run the Supabase migration in `supabase/migrations/001_initial_schema.sql`, then set the Supabase and optional OpenAI keys in `.env.local`.

## Important files
- `app/page.tsx` and `components/Dashboard.tsx`: mobile-first MVP dashboard.
- `app/api/*`: API routes for natural language logging, meals, exercises, corrections, daily summary, and weekly summary.
- `lib/extraction.ts`: OpenAI JSON-schema extraction with heuristic fallback.
- `lib/nutrition.ts`: MVP food/exercise estimation layer.
- `lib/dayStore.ts`: Supabase persistence and aggregation.
- `supabase/migrations/001_initial_schema.sql`: Postgres schema and RLS policies.
- `docs/product-spec.md`: product specification and step-by-step build plan.
- `docs/file-structure.md`: implementation file map.
- `docs/openapi-gpt-actions.yaml`: Custom GPT Action schema.
- `docs/gpt-prompts.md`: Custom GPT behavior prompts.
