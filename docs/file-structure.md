# File structure

```text
app/
  api/
    day/route.ts                  # GET daily dashboard payload
    entries/[id]/route.ts          # PATCH entry corrections/deletes
    exercises/route.ts             # POST structured exercise logs
    log-natural-language/route.ts  # POST raw narration for extraction + persistence
    meals/route.ts                 # POST structured meal logs
    weekly-summary/route.ts        # GET seven-day summary
  globals.css                      # Tailwind theme tokens
  layout.tsx                       # App shell and metadata
  page.tsx                         # Dashboard page
components/
  Dashboard.tsx                    # Mobile-first dashboard UI
lib/
  dayStore.ts                      # Supabase persistence and summary aggregation
  extraction.ts                    # OpenAI JSON schema extraction + heuristic fallback
  nutrition.ts                     # MVP nutrition/exercise estimates
  schemas.ts                       # Zod validation schemas
  supabaseServer.ts                # Server-side Supabase clients and auth helper
  types.ts                         # Shared dashboard/domain types
  utils.ts                         # Formatting/date helpers
docs/
  product-spec.md                  # Product spec and step-by-step build plan
  file-structure.md                # This map
  gpt-prompts.md                   # Custom GPT behavior prompts
  openapi-gpt-actions.yaml         # Custom GPT Action OpenAPI schema
supabase/
  migrations/001_initial_schema.sql # Postgres tables, indexes, and RLS
```
