import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAcceptPriceSuggestion } from "@/lib/api";
import type { PriceSuggestion } from "@/lib/types";

export function PriceSuggestionCard({ suggestion }: { suggestion: PriceSuggestion }) {
  const accept = useAcceptPriceSuggestion();
  const isIncrease = Number(suggestion.suggestedPrice) > Number(suggestion.currentPrice);
  const Icon = isIncrease ? TrendingUp : TrendingDown;

  return (
    <Card className="border-accent/30 bg-accent/5">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full ${isIncrease ? "bg-secondary/10 text-secondary" : "bg-red-100 text-red-600"}`}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{suggestion.property?.name}</p>
            <p className="text-sm text-gray-500">
              ${Number(suggestion.currentPrice).toFixed(0)} &rarr; ${Number(suggestion.suggestedPrice).toFixed(0)}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600">{suggestion.reason}</p>

        <Button
          size="sm"
          variant="secondary"
          className="self-start"
          disabled={accept.isPending}
          onClick={() => accept.mutate(suggestion.id)}
        >
          {accept.isPending ? "Aplicando..." : "Aceptar sugerencia"}
        </Button>
      </CardContent>
    </Card>
  );
}
