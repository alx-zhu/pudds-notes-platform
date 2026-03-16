/**
 * Centralized domain configuration for trials.
 * All constants and derived types are defined here.
 * Components must import from this file — no hardcoded values.
 */

export const PROCESSING_TYPES = [
  {
    value: "shelftop",
    label: "Shelftop",
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

export const THERMAL_PROCESSING_TYPES = [
  { value: "thermomix", label: "Thermomix" },
  { value: "pressure-cook", label: "Pressure Cook" },
] as const;

export const STORAGE_TIMES = [
  { value: "immediate", label: "Immediate" },
  { value: "24h", label: "24 Hours" },
  { value: "3d", label: "3 Days" },
] as const;

export const SENSORY_METRICS = [
  { key: "tasteRating", label: "Taste Rating", max: 5, description: "On a scale from 1-5, rate how much you liked the taste of the product." },
  { key: "sweetnessIntensity", label: "Sweetness Intensity", max: 5, description: "On a scale from 1-5, rate how sweet the product was. (References provided)" },
  { key: "sweetnessRating", label: "Sweetness Rating", max: 5, description: "On a scale from 1-5, rate how much you liked the sweetness of the product." },
  { key: "flavorIntensity", label: "Flavor Intensity", max: 5, description: "On a scale from 1-5, rate how intense the flavor of the product was. (References provided)" },
  { key: "aftertasteIntensity", label: "Aftertaste Intensity", max: 5, description: "On a scale from 1-5, rate how much of an aftertaste the product had. (References provided)" },
  { key: "thicknessIntensity", label: "Thickness Intensity", max: 5, description: "On a scale from 1-5, rate how thick the product was. (References provided)" },
  { key: "textureIntensity", label: "Texture Intensity", max: 6, description: "On a scale from 1-6, rate how smooth the product was. (References provided)" },
  { key: "textureRating", label: "Texture Rating", max: 5, description: "On a scale from 1-5, rate how much you liked the texture of the product." },
  { key: "colorRating", label: "Color Rating", max: 5, fullWidth: true, description: "On a scale from 1-5, rate how much you liked the color." },
] as const;

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

// Derived types (consumed by types/trial.ts)
export type ProcessingType = (typeof PROCESSING_TYPES)[number]["value"];
export type Flavor = (typeof FLAVORS)[number]["value"];
export type ThermalProcessingType = (typeof THERMAL_PROCESSING_TYPES)[number]["value"];
export type StorageTime = (typeof STORAGE_TIMES)[number]["value"];
export type SensoryMetricKey = (typeof SENSORY_METRICS)[number]["key"];
