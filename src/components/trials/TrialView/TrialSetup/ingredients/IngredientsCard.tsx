import { useState } from "react";
import { Pencil, Plus, Layers } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IngredientsPieChart } from "@/components/trials/TrialView/TrialSetup/ingredients/shared/IngredientsPieChart";
import { IngredientsModal } from "@/components/trials/TrialView/TrialSetup/ingredients/IngredientsModal";
import { useTrial } from "@/hooks/useTrials";

interface Props {
  trialId: string;
}

export const IngredientsCard = ({ trialId }: Props) => {
  const { data: trial } = useTrial(trialId);
  const [modalOpen, setModalOpen] = useState(false);

  const setup = trial?.setup;
  const variables = setup?.variables ?? [];

  return (
    <>
      <Card className="flex flex-col overflow-hidden gap-0 shrink-0">
        <CardHeader className="py-3 px-5 space-y-0 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded bg-orange-100 flex items-center justify-center">
                <Layers size={11} className="text-orange-600" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                Ingredients
              </span>
            </div>
            {variables.length > 0 && (
              <span className="text-xs text-muted-foreground/60">
                {variables.length} item{variables.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0 pb-2">
          {variables.length > 0 ? (
            <div className="px-5 py-3 h-100">
              <IngredientsPieChart variables={variables} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-8">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                <Layers size={20} className="text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground mb-1">
                  No ingredients yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Add the ingredients used in this trial
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center shrink-0">
          <Button
            size="sm"
            variant={variables.length > 0 ? "outline" : "default"}
            onClick={() => setModalOpen(true)}
            disabled={!setup}
            className="gap-2"
            title={!setup ? "Complete trial setup first" : undefined}
          >
            {variables.length > 0 ? <Pencil size={14} /> : <Plus size={14} />}
            {variables.length > 0 ? "Edit Ingredients" : "Add Ingredients"}
          </Button>
        </CardFooter>
      </Card>

      {setup && (
        <IngredientsModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          trialId={trialId}
          setup={setup}
          key={modalOpen ? "open" : "closed"}
        />
      )}
    </>
  );
};
