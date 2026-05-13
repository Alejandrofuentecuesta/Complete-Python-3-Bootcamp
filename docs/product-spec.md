# Personal Calorie and Exercise Tracker MVP

## Product goal
Create the lowest-friction web app for daily calorie and exercise tracking. The preferred workflow is voice narration in ChatGPT, structured extraction by an LLM, and API submission into a mobile-first dashboard.

## Target MVP workflow
1. User opens ChatGPT voice mode on a phone.
2. User narrates meals, snacks, drinks, workouts, and corrections.
3. ChatGPT extracts structured JSON with assumptions, confidence, and clarification questions.
4. ChatGPT calls the app API through a Custom GPT Action using a simple single-user secret for the MVP.
5. User opens a home-screen web dashboard on the phone to review daily consumed calories, exercise burn, net calories, macros, meals, workouts, and uncertainty.

## Core screens
- Daily dashboard: net calories hero card, consumed/burned split, protein/carbs/fat cards, confidence indicator.
- Meal timeline: meal type, items, portions, calories, macros, assumptions, correction affordances.
- Exercise timeline: activity, duration, intensity, burn estimate, assumptions.
- Weekly trend: seven-day net calorie trend.
- Raw input test box: paste or dictate a transcript while developing GPT Actions.

## MVP assumptions
- Supabase Auth is the identity layer in production.
- API routes accept a Supabase JWT bearer token, Supabase SSR session cookie, or the MVP `x-gpt-action-secret` header for Custom GPT Actions.
- `GPT_ACTION_USER_ID` maps the single-user GPT Action flow to one Supabase user; `DEV_USER_ID` exists only for local smoke testing.
- Nutrition estimates start with a local catalog and fallback estimates; provider adapters can later call USDA FoodData Central, Open Food Facts, or Edamam.
- OpenAI extraction is server-side only and optional; without `OPENAI_API_KEY`, the app uses keyword heuristics for local development.

## Data model
- `profiles`: user metadata linked to `auth.users`.
- `daily_logs`: one row per user/date.
- `raw_inputs`: preserved transcripts plus extraction payloads.
- `meals`: grouped food events with confidence and assumptions.
- `food_items`: normalized line items with portions, calories, and macros.
- `exercises`: workout/cardio/activity logs with calories burned.
- `nutrition_estimates`: estimate provenance for future provider adapters.
- `correction_history`: audit trail for edits and deletes.

## API surface
- `POST /api/log-natural-language`: parse and store narrated logs.
- `POST /api/meals`: manually create structured meal entries.
- `POST /api/exercises`: manually create workout entries.
- `PATCH /api/entries/:id`: update or delete meals, food items, or exercises.
- `GET /api/day?date=YYYY-MM-DD`: retrieve a daily dashboard payload.
- `GET /api/weekly-summary?startDate=YYYY-MM-DD`: retrieve a seven-day summary.

## Build plan
1. Create Next.js App Router project with TypeScript and Tailwind CSS.
2. Add Supabase server clients, auth helper, and Zod request schemas.
3. Add Supabase SQL migration with RLS policies for user-owned rows.
4. Implement natural language extraction with OpenAI JSON Schema and local fallback.
5. Implement MVP nutrition/exercise estimation catalog with replaceable provider boundary.
6. Implement API routes and day/weekly aggregation helpers.
7. Build mobile-first dashboard and raw transcript testing UI.
8. Add GPT Action OpenAPI schema, GPT behavior prompts, and a practical mobile workflow guide.
9. Deploy to Vercel with Supabase, GPT Action secret, and optional OpenAI environment variables.
10. Iterate on corrections, provider integrations, and production auth UX.

## Vercel deployment
1. Create a Supabase project and run `supabase/migrations/001_initial_schema.sql` in the SQL editor or through Supabase CLI.
2. Create a Vercel project connected to this repository.
3. Add environment variables from `.env.example` in Vercel Project Settings, including `GPT_ACTION_SHARED_SECRET` and `GPT_ACTION_USER_ID` for the mobile ChatGPT flow.
4. Set `NEXT_PUBLIC_APP_URL` to the Vercel production URL.
5. Deploy, add the dashboard to your phone home screen, verify `/api/day` with the GPT Action secret, and then configure the Custom GPT Action schema.
