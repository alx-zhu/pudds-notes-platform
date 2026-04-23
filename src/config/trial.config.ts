/**
 * Centralized domain configuration for trials.
 * All constants and derived types are defined here.
 * Components must import from this file — no hardcoded values.
 */

export const PROCESSING_TYPES = [
  {
    value: "shelftop",
    label: "Benchtop",
    color: "bg-sky-100 text-sky-800",
    activeClass: "data-[state=on]:bg-sky-100 data-[state=on]:text-sky-800 data-[state=on]:shadow-sm",
  },
  {
    value: "industrial",
    label: "Industrial",
    color: "bg-orange-100 text-orange-800",
    activeClass: "data-[state=on]:bg-orange-100 data-[state=on]:text-orange-800 data-[state=on]:shadow-sm",
  },
] as const;

export const FLAVORS = [
  {
    value: "chocolate",
    label: "Chocolate",
    color: "bg-amber-900 text-amber-50",
    activeClass: "data-[state=on]:bg-amber-900 data-[state=on]:text-amber-50 data-[state=on]:shadow-sm",
  },
  {
    value: "vanilla",
    label: "Vanilla",
    color: "bg-yellow-100 text-yellow-800",
    activeClass: "data-[state=on]:bg-yellow-100 data-[state=on]:text-yellow-800 data-[state=on]:shadow-sm",
  },
] as const;


export const SENSORY_MAX_SCORE = 5;

export const SENSORY_METRICS = [
  { key: "tasteRating", label: "Taste Rating", shortLabel: "Taste Rat.", max: 5, description: "Rate how much you liked the taste of the product." },
  { key: "sweetnessIntensity", label: "Sweetness Intensity", shortLabel: "Sweetness Int.", max: 5, description: "Rate how sweet the product was (references provided)." },
  { key: "sweetnessRating", label: "Sweetness Rating", shortLabel: "Sweetness Rat.", max: 5, description: "Rate how much you liked the sweetness of the product." },
  { key: "flavorIntensity", label: "Flavor Intensity", shortLabel: "Flavor Int.", max: 5, description: "Rate how intense the flavor of the product was (references provided)." },
  { key: "aftertasteIntensity", label: "Aftertaste Intensity", shortLabel: "Aftertaste", max: 5, description: "Rate how much of an aftertaste the product had (references provided)." },
  { key: "thicknessIntensity", label: "Thickness Intensity", shortLabel: "Thickness", max: 5, description: "Rate how thick the product was (references provided)." },
  { key: "textureIntensity", label: "Texture Intensity", shortLabel: "Texture Int.", max: 5, description: "Rate how smooth the product was (references provided)." },
  { key: "textureRating", label: "Texture Rating", shortLabel: "Texture Rat.", max: 5, description: "Rate how much you liked the texture of the product." },
  { key: "colorRating", label: "Color Rating", shortLabel: "Color Rat.", max: 5, fullWidth: true, description: "Rate how much you liked the color of the product." },
] as const;

const LIKENESS_OPTIONS = [
  { score: 1, label: "Dislike extremely" },
  { score: 2, label: "Dislike moderately" },
  { score: 3, label: "Neither like nor dislike" },
  { score: 4, label: "Like moderately" },
  { score: 5, label: "Like extremely" },
] as const;

export const SENSORY_SCORE_OPTIONS: Record<SensoryMetricKey, readonly { score: number; label: string }[]> = {
  tasteRating: LIKENESS_OPTIONS,
  sweetnessIntensity: [
    { score: 1, label: "Not sweet at all (Unsweetened plain Greek yogurt)" },
    { score: 2, label: "Slightly sweet (Regular vanilla yogurt)" },
    { score: 3, label: "Moderately sweet (Vanilla milkshake)" },
    { score: 4, label: "Very sweet (Ice cream)" },
    { score: 5, label: "Extremely sweet (Frosting/syrup)" },
  ],
  sweetnessRating: LIKENESS_OPTIONS,
  flavorIntensity: [
    { score: 1, label: "None (Plain milk)" },
    { score: 2, label: "Slight flavor (Light vanilla hint)" },
    { score: 3, label: "Moderate flavor (Standard vanilla yogurt)" },
    { score: 4, label: "Strong flavor (Pudding)" },
    { score: 5, label: "Extremely strong flavor (Cake batter ice cream, intense chocolate dessert)" },
  ],
  aftertasteIntensity: [
    { score: 1, label: "None" },
    { score: 2, label: "Slight" },
    { score: 3, label: "Moderate" },
    { score: 4, label: "Strong" },
    { score: 5, label: "Very strong" },
  ],
  thicknessIntensity: [
    { score: 1, label: "Very thin (Water)" },
    { score: 2, label: "Slightly thick (Kefir/drinkable yogurt)" },
    { score: 3, label: "Moderately thick (Classic spoonable yogurt)" },
    { score: 4, label: "Thick (Snack pack pudding)" },
    { score: 5, label: "Extremely thick (Very thick Greek yogurt/mousse/custard-like pudding)" },
  ],
  textureIntensity: [
    { score: 1, label: "Completely smooth (Heavy cream)" },
    { score: 2, label: "Slightly textured (Like lightly stirred yogurt)" },
    { score: 3, label: "Noticeable graininess (Like fine cornmeal)" },
    { score: 4, label: "Moderately gritty (Like protein shake sediment)" },
    { score: 5, label: "Very gritty/sandy (Like dry flour paste)" },
  ],
  textureRating: LIKENESS_OPTIONS,
  colorRating: LIKENESS_OPTIONS,
};

export const SENSORY_METRIC_GROUPS = [
  {
    label: "Taste & Flavor",
    keys: [
      "tasteRating",
      "sweetnessIntensity",
      "sweetnessRating",
      "flavorIntensity",
      "aftertasteIntensity",
    ] as SensoryMetricKey[],
  },
  {
    label: "Texture",
    keys: [
      "thicknessIntensity",
      "textureIntensity",
      "textureRating",
    ] as SensoryMetricKey[],
  },
  {
    label: "Appearance",
    keys: ["colorRating"] as SensoryMetricKey[],
  },
];

export const EVAL_COLORS = [
  "hsl(217, 91%, 60%)", // blue
  "hsl(142, 71%, 45%)", // green
  "hsl(25, 95%, 55%)",  // orange
  "hsl(280, 87%, 65%)", // purple
  "hsl(340, 82%, 60%)", // rose
  "hsl(190, 85%, 45%)", // cyan
];

export const INGREDIENT_CHART_COLORS = [
  "#60a5fa", // blue-400
  "#f59e0b", // amber-400
  "#34d399", // emerald-400
  "#a78bfa", // violet-400
  "#f87171", // rose-400
  "#22d3ee", // cyan-400
  "#fb923c", // orange-400
  "#4ade80", // green-400
];

/**
 * Ideal target values for each sensory metric.
 * Scores are calculated based on distance from these ideals.
 */
export const SENSORY_IDEAL_SCORES: Record<SensoryMetricKey, number> = {
  tasteRating: 5,
  sweetnessIntensity: 3.5,
  sweetnessRating: 5,
  flavorIntensity: 4,
  aftertasteIntensity: 1,
  thicknessIntensity: 3,
  textureIntensity: 1,
  textureRating: 5,
  colorRating: 5,
};

/**
 * Score category groupings with the metric keys that compose each score.
 * Maps to the three scored dimensions + overall.
 */
export const SENSORY_SCORE_CATEGORIES = [
  {
    key: "taste" as const,
    label: "Taste",
    metricKeys: [
      "tasteRating",
      "sweetnessIntensity",
      "sweetnessRating",
      "flavorIntensity",
      "aftertasteIntensity",
    ] as SensoryMetricKey[],
  },
  {
    key: "texture" as const,
    label: "Texture",
    metricKeys: [
      "thicknessIntensity",
      "textureIntensity",
      "textureRating",
    ] as SensoryMetricKey[],
  },
  {
    key: "color" as const,
    label: "Color",
    metricKeys: ["colorRating"] as SensoryMetricKey[],
  },
] as const;

export type ScoreCategoryKey = (typeof SENSORY_SCORE_CATEGORIES)[number]["key"];

export interface ScoreCategoryStyle {
  bar: string;
  number: string;
  activeClass: string;
  chip: string;
}

export const SENSORY_CATEGORY_STYLES: Record<ScoreCategoryKey, ScoreCategoryStyle> = {
  taste: {
    bar: "bg-emerald-500",
    number: "text-emerald-700 dark:text-emerald-400",
    activeClass: "data-[state=on]:bg-emerald-600 data-[state=on]:text-white data-[state=on]:shadow-sm",
    chip: "bg-emerald-100 text-emerald-800",
  },
  texture: {
    bar: "bg-blue-500",
    number: "text-blue-700 dark:text-blue-400",
    activeClass: "data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=on]:shadow-sm",
    chip: "bg-blue-100 text-blue-800",
  },
  color: {
    bar: "bg-amber-500",
    number: "text-amber-700 dark:text-amber-400",
    activeClass: "data-[state=on]:bg-amber-600 data-[state=on]:text-white data-[state=on]:shadow-sm",
    chip: "bg-amber-100 text-amber-800",
  },
};

export const SENSORY_CHART_COLORS = {
  otherAvg: "hsl(220, 14%, 70%)",
  grid: "#e8e8ec",
  tick: "#8c8c96",
  cursor: "rgba(0, 0, 0, 0.1)",
} as const;

export const STORAGE_TIME_PRESETS = [
  { label: "Immediate", minutes: 0 },
  { label: "24 hrs", minutes: 1440 },
  { label: "3 days", minutes: 4320 },
] as const;

// Derived types (consumed by types/trial.ts)
export type ProcessingType = (typeof PROCESSING_TYPES)[number]["value"];
export type Flavor = (typeof FLAVORS)[number]["value"];
export type SensoryMetricKey = (typeof SENSORY_METRICS)[number]["key"];
export type SensoryMetric = (typeof SENSORY_METRICS)[number];

// O(1) lookup from metric key → global index in SENSORY_METRICS
export const SENSORY_METRIC_INDEX: ReadonlyMap<SensoryMetricKey, number> = new Map(
  SENSORY_METRICS.map((m, i) => [m.key, i]),
);
