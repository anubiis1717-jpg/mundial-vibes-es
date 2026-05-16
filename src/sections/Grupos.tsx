import { useState } from "react";
import { computeStandings, useTournament } from "@/store/useTournament";
import { cn } from "@/lib/utils";

const GROUPS = "ABCDEFGHIJKL".split("");

export function Grupos() {
  const { data } = useTournament();
  const [active, setActive] = useState("A");

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black">Grupos</h2>

      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 no-scrollbar">
        {GROUPS.map((g) => (
          <button
            key={g}
            onClick={() => setActive(g)}
            className={cn(
              "shrink-0 w-12 h-12 rounded-xl font-black text-lg border border-border",
              active === g ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]" : "bg-card text-foreground"
            )}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="card-surface p-4">
        <h3 className="font-bold mb-3">Grupo {active}</h3>
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase text-muted-foreground">
            <tr>
              <th className="text-left py-1">Equipo</th>
              <th>PJ</th><th>G</th><th>E</th><th>P</th><th>DG</th><th>Pts</th>
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
