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

export const SENSORY_CATEGORIES = [
  {
    key: "thermo-24h",
    label: "Thermomix — 24 Hours",
    shortLabel: "Thermo 24h",
    tinyLabel: "T 24h",
  },
  {
    key: "thermo-3d",
    label: "Thermomix — 3 Days",
    shortLabel: "Thermo 3d",
    tinyLabel: "T 3d",
  },
  {
    key: "press-24h",
    label: "Pressure Cook — 24 Hours",
    shortLabel: "Press 24h",
    tinyLabel: "P 24h",
  },
  {
    key: "press-3d",
    label: "Pressure Cook — 3 Days",
    shortLabel: "Press 3d",
    tinyLabel: "P 3d",
  },
] as const;

export const SENSORY_METRICS = [
  { key: "tasteRating", label: "Taste Rating", shortLabel: "Taste", max: 5, description: "On a scale from 1-5, rate how much you liked the taste of the product." },
  { key: "sweetnessIntensity", label: "Sweetness Intensity", shortLabel: "Sweet. Int.", max: 5, description: "On a scale from 1-5, rate how sweet the product was. (References provided)" },
  { key: "sweetnessRating", label: "Sweetness Rating", shortLabel: "Sweet. Rat.", max: 5, description: "On a scale from 1-5, rate how much you liked the sweetness of the product." },
  { key: "flavorIntensity", label: "Flavor Intensity", shortLabel: "Flavor Int.", max: 5, description: "On a scale from 1-5, rate how intense the flavor of the product was. (References provided)" },
  { key: "aftertasteIntensity", label: "Aftertaste Intensity", shortLabel: "Aftertaste", max: 5, description: "On a scale from 1-5, rate how much of an aftertaste the product had. (References provided)" },
  { key: "thicknessIntensity", label: "Thickness Intensity", shortLabel: "Thickness", max: 5, description: "On a scale from 1-5, rate how thick the product was. (References provided)" },
  { key: "textureIntensity", label: "Texture Intensity", shortLabel: "Texture Int.", max: 6, description: "On a scale from 1-6, rate how smooth the product was. (References provided)" },
  { key: "textureRating", label: "Texture Rating", shortLabel: "Texture Rat.", max: 5, description: "On a scale from 1-5, rate how much you liked the texture of the product." },
  { key: "colorRating", label: "Color Rating", shortLabel: "Color", max: 5, fullWidth: true, description: "On a scale from 1-5, rate how much you liked the color." },
] as const;

export const PHOTO_ROWS = ["Thermo-mix", "Pressure Cook"] as const;
export const PHOTO_COLUMNS = ["24 Hours", "3 Days"] as const;

export const PHOTO_GRID_CELLS = [
  { key: "thermo24h", row: "Thermo-mix", col: "24 Hours" },
  { key: "thermo3d", row: "Thermo-mix", col: "3 Days" },
  { key: "press24h", row: "Pressure Cook", col: "24 Hours" },
  { key: "press3d", row: "Pressure Cook", col: "3 Days" },
] as const;

// Derived types (consumed by types/trial.ts)
export type ProcessingType = (typeof PROCESSING_TYPES)[number]["value"];
export type Flavor = (typeof FLAVORS)[number]["value"];
export type SensoryCategory = (typeof SENSORY_CATEGORIES)[number]["key"];
export type SensoryMetricKey = (typeof SENSORY_METRICS)[number]["key"];
export type PhotoSlot = (typeof PHOTO_GRID_CELLS)[number]["key"];
