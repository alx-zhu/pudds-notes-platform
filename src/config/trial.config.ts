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

export type ProcessingType = (typeof PROCESSING_TYPES)[number]["value"];
export type Flavor = (typeof FLAVORS)[number]["value"];
