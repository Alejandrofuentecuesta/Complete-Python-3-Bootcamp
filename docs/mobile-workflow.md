# Mobile-first usage workflow

This MVP is meant to feel easy from a phone. The primary user journey is not manual data entry in the app; it is:

1. Open ChatGPT on your phone.
2. Start voice mode.
3. Say what you ate and what exercise you did.
4. Let the Custom GPT Action call this app's API.
5. Open the web dashboard from your phone home screen to review calories, macros, workouts, assumptions, and uncertainty.

## Recommended MVP setup for one personal user

For the fastest single-user MVP, use a shared GPT Action secret instead of building a full mobile login flow first.

1. Create one Supabase Auth user for yourself.
2. Copy that user's UUID.
3. Set these environment variables locally and in Vercel:

```env
GPT_ACTION_SHARED_SECRET=make-this-a-long-random-secret
GPT_ACTION_USER_ID=your-supabase-auth-user-uuid
```

When a Custom GPT Action sends the `x-gpt-action-secret` header with the same value, the API writes logs for `GPT_ACTION_USER_ID`. This keeps the MVP low-friction while preserving a clear path to real Supabase Auth later.

## Phone setup

### Dashboard
1. Deploy the app to Vercel.
2. Open the Vercel URL on your phone.
3. Add it to your home screen:
   - iPhone Safari: Share → Add to Home Screen.
   - Android Chrome: three-dot menu → Add to Home screen.
4. Use the dashboard mainly for review and corrections.

### ChatGPT
1. Create a Custom GPT.
2. Paste the prompt from `docs/gpt-prompts.md`.
3. Add the OpenAPI schema from `docs/openapi-gpt-actions.yaml`.
4. Replace `https://YOUR-VERCEL-DOMAIN.vercel.app` with your Vercel URL.
5. Configure API key authentication so ChatGPT sends your secret in the `x-gpt-action-secret` header.

## Daily usage script

Say something like this in ChatGPT voice mode:

> Log today: coffee with milk, two slices of toast with avocado, chicken curry with rice, a banana, and 45 minutes of gym.

For corrections later:

> Change the rice to 150 grams cooked.

> Remove the banana.

> That meal was dinner, not lunch.

The GPT should call the API, then tell you the updated calories, macros, exercise burn, net calories, and any important assumptions.
