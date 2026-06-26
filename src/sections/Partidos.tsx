import { useState } from "react";
import { MatchCard } from "@/components/MatchCard";
import { useTournament } from "@/store/useTournament";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

const GROUPS = "ABCDEFGHIJKL".split("");

export function Partidos({ initialGroup = "A" }: { initialGroup?: string }) {
  const { t } = useI18n();
  const { data } = useTournament();
  const [g, setG] = useState<string>(initialGroup);

  const matches = data.matches.filter((m) => m.stage === "group" && m.group === g);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black">{t("matches.title")}</h2>
      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
        {GROUPS.map((x) => (
          <button
            key={x}
            onClick={() => setG(x)}
            className={cn(
              "shrink-0 px-4 h-10 rounded-xl font-bold border border-border",
              g === x ? "bg-accent text-accent-foreground" : "bg-card"
            )}
          >
            {t("common.group")} {x}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {matches.map((m) => <MatchCard key={m.id} match={m} />)}
      </div>
    </div>
  );
}
