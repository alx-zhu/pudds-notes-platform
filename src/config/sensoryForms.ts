import type { ProcessingType } from "@/config/trial.config";

export const SCORE_CATEGORIES = [
  { key: "taste", label: "Taste", formGroupLabel: "Taste & Flavor" },
  { key: "texture", label: "Texture", formGroupLabel: "Texture" },
  { key: "color", label: "Color", formGroupLabel: "Appearance" },
] as const;

export type ScoreCategoryKey = (typeof SCORE_CATEGORIES)[number]["key"];

export interface ScoreCategoryStyle {
  bar: string;
  number: string;
  activeClass: string;
  chip: string;
}

export const SENSORY_CATEGORY_STYLES: Record<
  ScoreCategoryKey,
  ScoreCategoryStyle
> = {
  taste: {
    bar: "bg-emerald-500",
    number: "text-emerald-700 dark:text-emerald-400",
    activeClass:
      "data-[state=on]:bg-emerald-600 data-[state=on]:text-white data-[state=on]:shadow-sm",
    chip: "bg-emerald-100 text-emerald-800",
  },
  texture: {
    bar: "bg-blue-500",
    number: "text-blue-700 dark:text-blue-400",
    activeClass:
      "data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=on]:shadow-sm",
    chip: "bg-blue-100 text-blue-800",
  },
  color: {
    bar: "bg-amber-500",
    number: "text-amber-700 dark:text-amber-400",
    activeClass:
      "data-[state=on]:bg-amber-600 data-[state=on]:text-white data-[state=on]:shadow-sm",
    chip: "bg-amber-100 text-amber-800",
  },
};

interface ScoreLabel {
  readonly score: number;
  readonly label: string;
}

export interface SensoryMetricConfig {
  label: string;
  shortLabel: string;
  max: number;
  ideal: number;
  category: ScoreCategoryKey;
  description: string;
  scoreLabels: readonly ScoreLabel[];
  fullWidth?: boolean;
}

const LIKENESS_LABELS = [
  { score: 1, label: "Dislike extremely" },
  { score: 2, label: "Dislike moderately" },
  { score: 3, label: "Neither like nor dislike" },
  { score: 4, label: "Like moderately" },
  { score: 5, label: "Like extremely" },
] as const;

export const SENSORY_METRIC_REGISTRY = {
  tasteRating: {
    label: "Taste Rating",
    shortLabel: "Taste Rat.",
    max: 5,
    ideal: 5,
    category: "taste" as const,
    description: "Rate how much you liked the taste of the product.",
    scoreLabels: LIKENESS_LABELS,
  },
  sweetnessIntensity: {
    label: "Sweetness Intensity",
    shortLabel: "Sweetness Int.",
    max: 5,
    ideal: 3.5,
    category: "taste" as const,
    description: "Rate how sweet the product was (references provided).",
    scoreLabels: [
      { score: 1, label: "Not sweet at all (Unsweetened plain Greek yogurt)" },
      { score: 2, label: "Slightly sweet (Regular vanilla yogurt)" },
      { score: 3, label: "Moderately sweet (Vanilla milkshake)" },
      { score: 4, label: "Very sweet (Ice cream)" },
      { score: 5, label: "Extremely sweet (Frosting/syrup)" },
    ] as const,
  },
  sweetnessRating: {
    label: "Sweetness Rating",
    shortLabel: "Sweetness Rat.",
    max: 5,
    ideal: 5,
    category: "taste" as const,
    description: "Rate how much you liked the sweetness of the product.",
    scoreLabels: LIKENESS_LABELS,
  },
  flavorIntensity: {
    label: "Flavor Intensity",
    shortLabel: "Flavor Int.",
    max: 5,
    ideal: 4,
    category: "taste" as const,
    description:
      "Rate how intense the flavor of the product was (references provided).",
    scoreLabels: [
      { score: 1, label: "None (Plain milk)" },
      { score: 2, label: "Slight flavor (Light vanilla hint)" },
      { score: 3, label: "Moderate flavor (Standard vanilla yogurt)" },
      { score: 4, label: "Strong flavor (Pudding)" },
      {
        score: 5,
        label:
          "Extremely strong flavor (Cake batter ice cream, intense chocolate dessert)",
      },
    ] as const,
  },
  aftertasteIntensity: {
    label: "Aftertaste Intensity",
    shortLabel: "Aftertaste",
    max: 5,
    ideal: 1,
    category: "taste" as const,
    description:
      "Rate how much of an aftertaste the product had (references provided).",
    scoreLabels: [
      { score: 1, label: "None" },
      { score: 2, label: "Slight" },
      { score: 3, label: "Moderate" },
      { score: 4, label: "Strong" },
      { score: 5, label: "Very strong" },
    ] as const,
  },
  thicknessIntensity: {
    label: "Thickness Intensity",
    shortLabel: "Thickness",
    max: 5,
    ideal: 3,
    category: "texture" as const,
    description: "Rate how thick the product was (references provided).",
    scoreLabels: [
      { score: 1, label: "Very thin (Water)" },
      { score: 2, label: "Slightly thick (Kefir/drinkable yogurt)" },
      { score: 3, label: "Moderately thick (Classic spoonable yogurt)" },
      { score: 4, label: "Thick (Snack pack pudding)" },
      {
        score: 5,
        label:
          "Extremely thick (Very thick Greek yogurt/mousse/custard-like pudding)",
      },
    ] as const,
  },
  textureIntensity: {
    label: "Graininess",
    shortLabel: "Graininess",
    max: 5,
    ideal: 1,
    category: "texture" as const,
    description:
      "Rate how grainy the product was, from completely smooth to granular (references provided). Target: completely smooth.",
    scoreLabels: [
      { score: 1, label: "Completely smooth (Heavy cream)" },
      { score: 2, label: "Slightly textured (Like lightly stirred yogurt)" },
      { score: 3, label: "Noticeable graininess (Like fine cornmeal)" },
      { score: 4, label: "Moderately gritty (Like protein shake sediment)" },
      { score: 5, label: "Very gritty/sandy (Like dry flour paste)" },
    ] as const,
  },
  textureRating: {
    label: "Texture Rating",
    shortLabel: "Texture Rat.",
    max: 5,
    ideal: 5,
    category: "texture" as const,
    description: "Rate how much you liked the texture of the product.",
    scoreLabels: LIKENESS_LABELS,
  },
  mouthcoating: {
    label: "Mouthcoating",
    shortLabel: "Coating",
    max: 5,
    ideal: 1,
    category: "texture" as const,
    description:
      "How much the product coats and lingers in your mouth after swallowing (references provided). Target: clean finish.",
    scoreLabels: [
      { score: 1, label: "Clean finish (Water/skim milk)" },
      { score: 2, label: "Slight coating (Whole milk)" },
      { score: 3, label: "Moderate coating (Cream)" },
      { score: 4, label: "Heavy coating (Sweetened condensed milk)" },
      { score: 5, label: "Thick lingering film (Caramel/syrup)" },
    ] as const,
  },
  colorRating: {
    label: "Color Rating",
    shortLabel: "Color Rat.",
    max: 5,
    ideal: 5,
    category: "color" as const,
    description: "Rate how much you liked the color of the product.",
    scoreLabels: LIKENESS_LABELS,
    fullWidth: true,
  },
} satisfies Record<string, SensoryMetricConfig>;

export type MetricKey = keyof typeof SENSORY_METRIC_REGISTRY;

export const SENSORY_FORMS = {
  shelftop: [
    "tasteRating",
    "sweetnessIntensity",
    "sweetnessRating",
    "flavorIntensity",
    "aftertasteIntensity",
    "thicknessIntensity",
    "textureIntensity",
    "textureRating",
    "colorRating",
  ],
  industrial: [
    "tasteRating",
    "sweetnessIntensity",
    "sweetnessRating",
    "flavorIntensity",
    "aftertasteIntensity",
    "thicknessIntensity",
    "textureIntensity",
    "mouthcoating",
    "colorRating",
  ],
} as const satisfies Record<ProcessingType, readonly MetricKey[]>;

export const getForm = (pt: ProcessingType | undefined): readonly MetricKey[] =>
  SENSORY_FORMS[pt ?? "shelftop"];

export const formSections = (form: readonly MetricKey[]) =>
  SCORE_CATEGORIES.map((c) => ({
    label: c.formGroupLabel,
    keys: form.filter((k) => SENSORY_METRIC_REGISTRY[k].category === c.key),
  })).filter((s) => s.keys.length > 0);
