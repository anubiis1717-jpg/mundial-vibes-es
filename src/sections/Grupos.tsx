import { useState } from "react";
import { computeStandings, useTournament } from "@/store/useTournament";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

const GROUPS = "ABCDEFGHIJKL".split("");

export function Grupos() {
  const { t } = useI18n();
  const { data } = useTournament();
  const [active, setActive] = useState("A");

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black">{t("groups.title")}</h2>

      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 no-scrollbar">
        {GROUPS.map((g) => (
          <button
            key={g}
            onClick={() => setActive(g)}
            className={cn(
              "shrink-0 w-12 h-12 rounded-xl font-black text-lg border transition-all press",
              active === g
                ? "bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] text-primary-foreground border-primary/40 shadow-glow scale-105"
                : "bg-card text-foreground border-white/5 hover:border-white/20"
            )}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="card-surface p-4">
        <h3 className="font-bold mb-3">{t("common.group")} {active}</h3>
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase text-muted-foreground">
            <tr>
              <th className="text-left py-1">{t("groups.team")}</th>
              <th>{t("groups.pj")}</th><th>{t("groups.g")}</th><th>{t("groups.e")}</th><th>{t("groups.p")}</th><th>{t("groups.dg")}</th><th>{t("groups.pts")}</th>
            </tr>
          </thead>
          <tbody>
            {computeStandings(data, active).map((s, i) => (
              <tr key={s.team.id} className="border-t border-border">
                <td className="py-2">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-5 text-[10px] font-bold text-center rounded",
                      i < 2 ? "bg-secondary/20 accent-green" : i === 2 ? "bg-accent/20 accent-blue" : "text-muted-foreground"
                    )}>{i + 1}</span>
                    <span className="text-xl">{s.team.flag}</span>
                    <span className="font-semibold">{s.team.name}</span>
                  </div>
                </td>
                <td className="text-center">{s.pj}</td>
                <td className="text-center">{s.g}</td>
                <td className="text-center">{s.e}</td>
                <td className="text-center">{s.p}</td>
                <td className="text-center">{s.dg}</td>
                <td className="text-center font-black accent-red">{s.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
