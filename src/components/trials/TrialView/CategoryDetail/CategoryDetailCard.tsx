import { useState, useRef } from "react";
import { Activity, BarChart2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SensoryEvalModal from "@/components/trials/TrialView/SensoryEval/SensoryEvalModal";
import CategoryImagePanel from "./CategoryImagePanel";
import type { CategoryImagePanelHandle } from "./CategoryImagePanel";
import SensoryChartPanel from "./SensoryChartPanel";
import { isCategoryDone } from "./sensoryUtils";
import { useTrial } from "@/hooks/useTrials";
import { SENSORY_CATEGORIES } from "@/config/trial.config";
import type { SensoryCategory } from "@/config/trial.config";
import { cn } from "@/lib/utils";

interface Props {
  trialId: string;
}

export default function CategoryDetailCard({ trialId }: Props) {
  const { data: trial } = useTrial(trialId);

  const [selectedCategory, setSelectedCategory] =
    useState<SensoryCategory | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<
    SensoryCategory | undefined
  >();

  const imagePanelRef = useRef<CategoryImagePanelHandle>(null);

  const sensory = trial?.sensory ?? {};
  const photos = trial?.photos ?? {};

  // Count categories where both sensory + photo are done
  const doneCount = SENSORY_CATEGORIES.filter(({ key, photoSlot }) => {
    const sensoryDone = isCategoryDone(sensory, key);
    const photoDone = Boolean(photos[photoSlot]);
    return sensoryDone && photoDone;
  }).length;
  const allDone = doneCount === SENSORY_CATEGORIES.length;

  // Default: first incomplete category, fallback to first overall
  const defaultCategory =
    SENSORY_CATEGORIES.find(({ key, photoSlot }) => {
      const sensoryDone = isCategoryDone(sensory, key);
      const photoDone = Boolean(photos[photoSlot]);
      return !sensoryDone || !photoDone;
    })?.key ?? SENSORY_CATEGORIES[0].key;

  const activeCategory = selectedCategory ?? defaultCategory;
  const activeCategoryConfig = SENSORY_CATEGORIES.find(
    (c) => c.key === activeCategory,
  )!;
  const categoryHasSensory = isCategoryDone(sensory, activeCategory);

  function openModal(category?: SensoryCategory) {
    setModalCategory(category);
    setModalOpen(true);
  }

  return (
    <>
      <Card className="flex flex-col overflow-hidden gap-0">
        <CardHeader className="py-3 px-5 flex items-center justify-between border-b shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-md bg-violet-100 flex items-center justify-center">
              <Activity size={13} className="text-violet-600" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Category Analysis
            </p>
          </div>
          {doneCount === 0 ? (
            <span className="text-xs text-muted-foreground">Not started</span>
          ) : (
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium",
                allDone ? "text-emerald-600" : "text-amber-600",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  allDone ? "bg-emerald-500" : "bg-amber-500",
                )}
              />
              {doneCount}/{SENSORY_CATEGORIES.length} done
            </div>
          )}
        </CardHeader>

        <CardContent className="p-5 flex flex-col gap-4">
          {/* Category chips */}
          <div className="flex gap-2 flex-wrap shrink-0">
            {SENSORY_CATEGORIES.map((cat) => {
              const sensoryDone = isCategoryDone(sensory, cat.key);
              const photoDone = Boolean(photos[cat.photoSlot]);
              const done = sensoryDone && photoDone;
              const active = cat.key === activeCategory;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={cn(
                    "text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer transition-all whitespace-nowrap",
                    active && "bg-foreground text-background shadow-sm",
                    !active &&
                      done &&
                      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100",
                    !active &&
                      !done &&
                      "bg-muted text-muted-foreground hover:bg-muted/80 ring-1 ring-transparent hover:ring-border",
                  )}
                >
                  {cat.label}
                  {done && !active && " ✓"}
                </button>
              );
            })}
          </div>

          {/* Side-by-side: Image | Chart */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-4">
            <CategoryImagePanel
              ref={imagePanelRef}
              trialId={trialId}
              photoSlot={activeCategoryConfig.photoSlot}
              categoryLabel={activeCategoryConfig.shortLabel}
            />
            <SensoryChartPanel
              trialId={trialId}
              categoryKey={activeCategory}
              hasData={categoryHasSensory}
              onAddData={() => openModal(activeCategory)}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-center shrink-0">
          <Button
            size="sm"
            variant={categoryHasSensory ? "outline" : "default"}
            onClick={() => openModal(activeCategory)}
            className="gap-2"
          >
            <BarChart2 size={14} />
            {categoryHasSensory ? "Review Data" : "Add Data"}
          </Button>
        </CardFooter>
      </Card>

      <SensoryEvalModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        trialId={trialId}
        sensory={sensory}
        initialCategory={modalCategory}
      />
    </>
  );
}
