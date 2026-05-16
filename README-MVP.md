# Calorie Voice Tracker MVP

This repository contains a Next.js App Router MVP for a voice-first calorie and exercise tracker. The intended product experience is mobile-first: narrate your day in ChatGPT voice mode, let a Custom GPT Action send the structured log to this app, and open the dashboard from your phone to review the results.

## Fastest way to use it on your phone

1. Deploy the app to Vercel.
2. Create one Supabase Auth user and copy that user's UUID.
3. Set `GPT_ACTION_SHARED_SECRET` and `GPT_ACTION_USER_ID` in Vercel.
4. Add the Vercel app to your phone home screen.
5. Create a Custom GPT using `docs/gpt-prompts.md` and `docs/openapi-gpt-actions.yaml`.
6. In ChatGPT mobile voice mode, say: “Log today: coffee with milk, two slices of toast with avocado, chicken curry with rice, a banana, and 45 minutes of gym.”
7. Open the dashboard home-screen shortcut to review calories, macros, exercise, net balance, confidence, assumptions, and questions.

See `docs/mobile-workflow.md` for the full phone setup.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Run the Supabase migration in `supabase/migrations/001_initial_schema.sql`, then set the Supabase and optional OpenAI keys in `.env.local`.

## Important files

- `app/page.tsx` and `components/Dashboard.tsx`: mobile-first MVP dashboard.
- `app/manifest.ts` and `public/icon.svg`: installable home-screen web app metadata.
- `app/api/*`: API routes for natural language logging, meals, exercises, corrections, daily summary, and weekly summary.
- `lib/extraction.ts`: OpenAI JSON-schema extraction with heuristic fallback.
- `lib/nutrition.ts`: MVP food/exercise estimation layer.
- `lib/dayStore.ts`: Supabase persistence and aggregation.
- `lib/supabaseServer.ts`: Supabase server clients plus Bearer-token and GPT Action secret auth.
- `supabase/migrations/001_initial_schema.sql`: Postgres schema and RLS policies.
- `docs/product-spec.md`: product specification and step-by-step build plan.
- `docs/mobile-workflow.md`: practical mobile-first usage flow.
- `docs/file-structure.md`: implementation file map.
- `docs/openapi-gpt-actions.yaml`: Custom GPT Action schema.
- `docs/gpt-prompts.md`: Custom GPT behavior prompts.
