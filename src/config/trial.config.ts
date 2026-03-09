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
  },
  {
    key: "thermo-3d",
    label: "Thermomix — 3 Days",
    shortLabel: "Thermo 3d",
  },
  {
    key: "press-24h",
    label: "Pressure Cook — 24 Hours",
    shortLabel: "Press 24h",
  },
  {
    key: "press-3d",
    label: "Pressure Cook — 3 Days",
    shortLabel: "Press 3d",
  },
] as const;

export const SENSORY_METRICS = [
  { key: "tasteLikeness", label: "Taste Likeness", max: 5 },
  { key: "sweetnessIntensity", label: "Sweetness Intensity", max: 5 },
  { key: "sweetnessLikeness", label: "Sweetness Likeness", max: 5 },
  { key: "flavorIntensity", label: "Flavor Intensity", max: 5 },
  { key: "aftertasteIntensity", label: "Aftertaste Intensity", max: 5 },
  { key: "thicknessIntensity", label: "Thickness Intensity", max: 5 },
  { key: "textureIntensity", label: "Texture Intensity", max: 6 },
  { key: "textureLikeness", label: "Texture Likeness", max: 5 },
  { key: "colorLikeness", label: "Color Likeness", max: 5, fullWidth: true },
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
