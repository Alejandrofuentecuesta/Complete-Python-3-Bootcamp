# Publish as an independent GitHub project

This app is intentionally self-contained in the `calorie-voice-tracker/` folder so it can become its own GitHub repository instead of living inside the Python bootcamp repository.

## Option A: create a new GitHub repo from this folder

From the parent folder that contains `calorie-voice-tracker/`:

```bash
cd calorie-voice-tracker
git init
git add .
git commit -m "Initial calorie voice tracker MVP"
git branch -M main
git remote add origin git@github.com:YOUR_USER/calorie-voice-tracker.git
git push -u origin main
```

Use the HTTPS remote instead if you do not use SSH:

```bash
git remote add origin https://github.com/YOUR_USER/calorie-voice-tracker.git
```

## Option B: use GitHub CLI

If GitHub CLI is installed and authenticated:

```bash
cd calorie-voice-tracker
git init
git add .
git commit -m "Initial calorie voice tracker MVP"
gh repo create calorie-voice-tracker --private --source=. --remote=origin --push
```

Change `--private` to `--public` if you want a public repository.

## After pushing

1. Create a Supabase project.
2. Run `supabase/migrations/001_initial_schema.sql`.
3. Deploy the new GitHub repository to Vercel.
4. Set the environment variables from `.env.example` in Vercel.
5. Configure the Custom GPT Action with `docs/openapi-gpt-actions.yaml`.
