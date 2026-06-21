import type { QueryClient } from "@tanstack/react-query";
import type { TrialRecord, AnalysisLog, SensoryEvaluation } from "@/types/trial";
import type { IngredientRecord, TrialIngredientRecord } from "@/types/ingredient";
import type { ProcessingType, Flavor } from "@/config/trial.config";
import rawDemoData from "@/data/demo-data.json";

const TRIALS_KEY = "pudds:trials";
const INGREDIENTS_KEY = "pudds:ingredients";
const TRIAL_INGREDIENTS_KEY = "pudds:trial-ingredients";

interface DemoIngredient {
  id: string;
  name: string;
  cost?: number;
  type?: string;
  solid?: boolean;
  pinned?: boolean;
  abbreviation?: string;
}

interface DemoEvaluation {
  id: string;
  label: string;
  metrics: Record<string, number>;
  comments?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

interface DemoLog {
  id: string;
  thermalProcessingType: string;
  storageTimeMinutes: number;
  photos?: string[];
  evaluations: DemoEvaluation[];
  createdAt: string;
  updatedAt: string;
}

interface DemoTrial {
  id: string;
  trialNumber: number;
  name?: string;
  setup?: { date: string; processingType: string; flavor: string };
  ingredients: Array<{ ingredient: DemoIngredient; percentage: number }>;
  analysisLogs: DemoLog[];
  createdAt: string;
  updatedAt: string;
}

const VALID_INGREDIENT_TYPES = new Set([
  "protein",
  "water-base",
  "texture",
  "sweetener",
  "flavor",
  "other",
]);

export function loadDemoData(queryClient: QueryClient): void {
  const demo = rawDemoData as DemoTrial[];

  // Deduplicated ingredient library
  const ingredientMap = new Map<string, IngredientRecord>();
  for (const trial of demo) {
    for (const { ingredient: ing } of trial.ingredients) {
      if (ingredientMap.has(ing.id)) continue;
      const record: IngredientRecord = { id: ing.id, name: ing.name };
      if (ing.abbreviation) record.abbreviation = ing.abbreviation;
      if (ing.type && VALID_INGREDIENT_TYPES.has(ing.type))
        record.type = ing.type as IngredientRecord["type"];
      if (ing.solid != null) record.solid = ing.solid;
      if (ing.pinned != null) record.pinned = ing.pinned;
      if (ing.cost != null) record.cost = ing.cost;
      ingredientMap.set(ing.id, record);
    }
  }

  // Trial records — strip enrichment fields (computedScores, averagedMetrics)
  const trials: TrialRecord[] = demo.map((t) => ({
    id: t.id,
    trialNumber: t.trialNumber,
    ...(t.name ? { name: t.name } : {}),
    setup: t.setup
      ? {
          date: t.setup.date,
          processingType: t.setup.processingType as ProcessingType,
          flavor: t.setup.flavor as Flavor,
        }
      : undefined,
    analysisLogs: t.analysisLogs.map(
      (log): AnalysisLog => ({
        id: log.id,
        thermalProcessingType: log.thermalProcessingType,
        storageTimeMinutes: log.storageTimeMinutes,
        evaluations: log.evaluations.map(
          (ev): SensoryEvaluation => ({
            id: ev.id,
            label: ev.label,
            metrics: ev.metrics,
            ...(ev.comments && Object.keys(ev.comments).length > 0
              ? { comments: ev.comments }
              : {}),
            createdAt: ev.createdAt,
            updatedAt: ev.updatedAt,
          }),
        ),
        createdAt: log.createdAt,
        updatedAt: log.updatedAt,
      }),
    ),
    processSteps: [],
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }));

  // Trial-ingredient join records
  const trialIngredients: TrialIngredientRecord[] = demo.flatMap((t) =>
    t.ingredients.map(({ ingredient: ing, percentage }) => ({
      trialId: t.id,
      ingredientId: ing.id,
      percentage,
      ...(ing.pinned != null ? { pinned: ing.pinned } : {}),
    })),
  );

  localStorage.setItem(TRIALS_KEY, JSON.stringify(trials));
  localStorage.setItem(INGREDIENTS_KEY, JSON.stringify([...ingredientMap.values()]));
  localStorage.setItem(TRIAL_INGREDIENTS_KEY, JSON.stringify(trialIngredients));

  queryClient.invalidateQueries();
}
