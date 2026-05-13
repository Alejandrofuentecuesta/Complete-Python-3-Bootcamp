"use client";

import { Activity, Beef, Flame, MessageSquareText, Mic, PencilLine, Plus, Smartphone, Sparkles, Utensils } from "lucide-react";
import { useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { confidenceLabel } from "@/lib/utils";
import type { DaySummary, WeeklySummary } from "@/lib/types";

const demoDay: DaySummary = {
  date: new Date().toISOString().slice(0, 10),
  consumed: { calories: 1050, proteinGrams: 48, carbsGrams: 132, fatGrams: 36 },
  burned: 310,
  netCalories: 740,
  confidence: 0.67,
  questions: ["Was the chicken curry homemade or restaurant-sized?"],
  meals: [
    { mealType: "breakfast", title: "Coffee, toast and avocado", confidence: 0.68, assumptions: ["Assumed two standard toast slices."], items: [
      { name: "coffee with milk", portionDescription: "1 cup", calories: 35, proteinGrams: 2, carbsGrams: 4, fatGrams: 1.5, confidence: 0.72, assumptions: [] },
      { name: "toast with avocado", portionDescription: "2 slices + 1/2 avocado", calories: 300, proteinGrams: 7, carbsGrams: 38, fatGrams: 13, confidence: 0.62, assumptions: [] }
    ]},
    { mealType: "dinner", title: "Chicken curry with rice", confidence: 0.62, assumptions: ["Used standard bowl estimates."], items: [
      { name: "chicken curry", portionDescription: "1 bowl", calories: 430, proteinGrams: 32, carbsGrams: 18, fatGrams: 24, confidence: 0.6, assumptions: [] },
      { name: "rice", portionDescription: "1 cup cooked", calories: 205, proteinGrams: 4, carbsGrams: 45, fatGrams: 0.4, confidence: 0.66, assumptions: [] },
      { name: "banana", portionDescription: "1 medium", calories: 105, proteinGrams: 1, carbsGrams: 27, fatGrams: 0.4, confidence: 0.8, assumptions: [] }
    ]}
  ],
  exercises: [{ activity: "gym", durationMinutes: 45, intensity: "unknown", caloriesBurned: 310, confidence: 0.62, assumptions: ["Assumed moderate intensity and 75kg body weight."] }]
};

const demoWeek: WeeklySummary = {
  startDate: demoDay.date,
  endDate: demoDay.date,
  days: Array.from({ length: 7 }, (_, index) => ({ ...demoDay, date: `D${index + 1}`, netCalories: [420, 900, 620, 1200, 740, 510, 680][index] })),
  totals: { consumedCalories: 7350, burnedCalories: 2170, netCalories: 5180, proteinGrams: 336, carbsGrams: 924, fatGrams: 252 }
};

export function Dashboard() {
  const [text, setText] = useState("Today I had a coffee with milk, two slices of toast with avocado, chicken curry with rice, a banana, and I did 45 minutes of gym.");
  const [day, setDay] = useState<DaySummary>(demoDay);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const chartData = useMemo(() => demoWeek.days.map((item) => ({ date: item.date.slice(5), net: item.netCalories })), []);

  async function submitLog() {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/log-natural-language", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text, date: day.date, source: "web" }) });
      if (response.ok) {
        const payload = await response.json();
        setDay(payload.summary);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Mobile voice-first calorie tracking</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">Today&apos;s balance</h1>
        </div>
        <div className="rounded-full bg-card px-3 py-2 text-xs font-semibold shadow-soft">MVP</div>
      </header>

      <section className="rounded-3xl border bg-card p-4 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-emerald-50 p-3 text-primary"><Smartphone className="h-5 w-5" /></div>
          <div>
            <h2 className="font-semibold">Designed for your phone</h2>
            <p className="mt-1 text-sm text-muted-foreground">Open ChatGPT mobile, use voice mode to narrate your day, let the GPT Action save it here, then review this dashboard from your home-screen shortcut.</p>
          </div>
        </div>
        <div className="mt-3 grid gap-2 text-xs font-medium text-muted-foreground sm:grid-cols-3">
          <span className="rounded-full bg-muted px-3 py-2"><Mic className="mr-1 inline h-3 w-3" />Narrate in ChatGPT</span>
          <span className="rounded-full bg-muted px-3 py-2">GPT Action logs it</span>
          <span className="rounded-full bg-muted px-3 py-2">Review dashboard</span>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-slate-900 p-6 text-white shadow-soft">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-emerald-100">Net calories</p>
              <p className="mt-2 text-6xl font-black tracking-tight">{day.netCalories}</p>
            </div>
            <Flame className="h-9 w-9 text-amber-200" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <Metric label="Consumed" value={`${day.consumed.calories} kcal`} />
            <Metric label="Exercise" value={`-${day.burned} kcal`} />
          </div>
          <p className="mt-5 rounded-full bg-white/15 px-4 py-2 text-sm">Confidence: {confidenceLabel(day.confidence)} ({Math.round(day.confidence * 100)}%)</p>
        </div>

        <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
          <Macro icon={<Beef />} label="Protein" value={`${day.consumed.proteinGrams}g`} />
          <Macro icon={<Utensils />} label="Carbs" value={`${day.consumed.carbsGrams}g`} />
          <Macro icon={<Sparkles />} label="Fat" value={`${day.consumed.fatGrams}g`} />
        </div>
      </section>

      <section className="rounded-3xl bg-card p-4 shadow-soft">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Weekly trend</h2>
          <span className="text-xs text-muted-foreground">net kcal/day</span>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
              <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="net" stroke="#059669" fill="#a7f3d0" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Timeline title="Meals" icon={<Utensils className="h-5 w-5" />}>
          {day.meals.map((meal, index) => (
            <article key={`${meal.title}-${index}`} className="rounded-2xl border bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold capitalize">{meal.mealType}: {meal.title}</h3>
                <Confidence score={meal.confidence} />
              </div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {meal.items.map((item) => <li key={`${meal.title}-${item.name}`} className="flex justify-between gap-3"><span>{item.name} · {item.portionDescription}</span><span>{item.calories} kcal</span></li>)}
              </ul>
              <CorrectionButtons />
            </article>
          ))}
        </Timeline>

        <Timeline title="Exercise" icon={<Activity className="h-5 w-5" />}>
          {day.exercises.map((exercise, index) => (
            <article key={`${exercise.activity}-${index}`} className="rounded-2xl border bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold capitalize">{exercise.activity}</h3>
                <Confidence score={exercise.confidence} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{exercise.durationMinutes} minutes · {exercise.caloriesBurned} kcal burned · {exercise.intensity}</p>
              <CorrectionButtons />
            </article>
          ))}
        </Timeline>
      </section>

      <section className="rounded-3xl bg-card p-4 shadow-soft">
        <div className="flex items-center gap-2"><MessageSquareText className="h-5 w-5 text-primary" /><h2 className="font-semibold">Raw input for voice transcript testing</h2></div>
        <textarea className="mt-3 min-h-28 w-full rounded-2xl border bg-background p-3 text-sm outline-none ring-primary/20 focus:ring-4" value={text} onChange={(event) => setText(event.target.value)} />
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={submitLog} disabled={isSubmitting} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">{isSubmitting ? "Parsing..." : "Parse and log"}</button>
          {day.questions.map((question) => <span key={question} className="rounded-full bg-accent px-3 py-2 text-xs text-accent-foreground">Question: {question}</span>)}
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-white/10 p-3"><p className="text-xs text-emerald-100">{label}</p><p className="text-lg font-bold">{value}</p></div>;
}

function Macro({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-3xl bg-card p-4 shadow-soft"><div className="mb-3 text-primary [&>svg]:h-5 [&>svg]:w-5">{icon}</div><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-bold">{value}</p></div>;
}

function Timeline({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <div className="rounded-3xl bg-card p-4 shadow-soft"><div className="mb-4 flex items-center gap-2 text-primary">{icon}<h2 className="font-semibold text-foreground">{title}</h2></div><div className="space-y-3">{children}</div></div>;
}

function Confidence({ score }: { score: number }) {
  return <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">{Math.round(score * 100)}%</span>;
}

function CorrectionButtons() {
  return <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar"><button className="rounded-full border px-3 py-1.5 text-xs"><PencilLine className="mr-1 inline h-3 w-3" />Correct</button><button className="rounded-full border px-3 py-1.5 text-xs"><Plus className="mr-1 inline h-3 w-3" />Add note</button></div>;
}
