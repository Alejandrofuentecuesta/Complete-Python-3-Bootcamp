export type MacroTotals = {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
};

export type ConfidenceLevel = "low" | "medium" | "high";

export type FoodItem = {
  id?: string;
  name: string;
  portionDescription: string;
  grams?: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  confidence: number;
  assumptions: string[];
};

export type Meal = {
  id?: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack" | "unknown";
  eatenAt?: string;
  title: string;
  confidence: number;
  assumptions: string[];
  items: FoodItem[];
};

export type Exercise = {
  id?: string;
  activity: string;
  durationMinutes: number;
  intensity: "light" | "moderate" | "vigorous" | "unknown";
  caloriesBurned: number;
  confidence: number;
  assumptions: string[];
};

export type DaySummary = {
  date: string;
  consumed: MacroTotals;
  burned: number;
  netCalories: number;
  confidence: number;
  meals: Meal[];
  exercises: Exercise[];
  questions: string[];
};

export type WeeklySummary = {
  startDate: string;
  endDate: string;
  days: DaySummary[];
  totals: {
    consumedCalories: number;
    burnedCalories: number;
    netCalories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
  };
};
