import { bestThirds, teamById, useTournament } from "@/store/useTournament";
import { useTopScorers } from "@/hooks/useTopScorers";
import type { TopScorer } from "@/services/scorers";

export function Stats() {
  const { data, updatePlayer } = useTournament();
  const thirds = bestThirds(data);
  const assists = [...data.players].sort((a, b) => b.assists - a.assists);

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-black">Stats</h2>

      <section className="card-surface p-4">
        <h3 className="font-bold mb-3 accent-blue">Mejores terceros</h3>
        <ol className="space-y-2">
          {thirds.map((t, i) => (
            <li key={t.group} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="w-5 text-center font-bold text-muted-foreground">{i + 1}</span>
                <span className="text-xl">{t.standing.team.flag}</span>
                <span className="font-semibold">{t.standing.team.name}</span>
                <span className="text-xs text-muted-foreground">({t.group})</span>
              </span>
              <span className="text-xs">
                <b className="accent-red">{t.standing.pts}</b> pts · DG {t.standing.dg}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <TopScorers />
      <PlayerTable title="Asistencias" players={assists} field="assists" onChange={updatePlayer} />
    </div>
  );
}

// Goleadores REALES del Mundial, desde la API de ESPN (se actualizan solos).
function TopScorers() {
  const { scorers, loading, error } = useTopScorers();
  return (
    <section className="card-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold accent-green">Goleadores</h3>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
          En vivo · ESPN
        </span>
      </div>

      {loading && scorers.length === 0 && (
        <ul className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="h-9 rounded-lg bg-muted/50 animate-pulse" />
          ))}
        </ul>
      )}

      {!loading && error && (
        <p className="text-sm text-muted-foreground py-2">
          No se pudieron cargar los goleadores. Revisa tu conexión; se reintenta solo.
        </p>
      )}

      {scorers.length > 0 && (
        <ol className="space-y-1.5">
          {scorers.map((p) => (
            <ScorerRow key={`${p.rank}-${p.name}`} p={p} />
          ))}
        </ol>
      )}
    </section>
  );
}

function ScorerRow({ p }: { p: TopScorer }) {
  return (
    <li className="flex items-center gap-2.5 py-1">
      <span className="w-5 text-center font-black text-muted-foreground tabular-nums">{p.rank}</span>
      {p.photo ? (
        <img src={p.photo} alt="" loading="lazy" className="h-8 w-8 rounded-full object-cover bg-muted" />
      ) : (
        <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-black">
          {p.name.charAt(0)}
        </span>
      )}
      <span className="flex flex-col min-w-0 flex-1">
        <span className="font-semibold truncate leading-tight">{p.name}</span>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
          {p.teamLogo && <img src={p.teamLogo} alt="" loading="lazy" className="h-3.5 w-3.5 object-contain" />}
          <span className="truncate">{p.teamName}</span>
          {p.matches != null && <span className="opacity-70">· {p.matches} PJ</span>}
        </span>
      </span>
      <span className="flex items-baseline gap-1">
        <b className="accent-red text-lg tabular-nums">{p.goals}</b>
        <span className="text-[10px] text-muted-foreground font-bold">{p.goals === 1 ? "gol" : "goles"}</span>
      </span>
    </li>
  );
}

function PlayerTable({
  title, players, field, onChange,
}: {
  title: string;
  players: ReturnType<typeof useTournament>["data"]["players"];
  field: "goals" | "assists";
  onChange: (id: string, patch: any) => void;
}) {
  const { data } = useTournament();
  return (
    <section className="card-surface p-4">
      <h3 className="font-bold mb-3 accent-green">{title}</h3>
      <ul className="space-y-2">
        {players.map((p) => {
          const t = teamById(data, p.teamId);
          return (
            <li key={p.id} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 min-w-0">
                <span className="text-xl">{t?.flag}</span>
                <span className="font-semibold truncate">{p.name}</span>
              </span>
              <input
                type="number"
                min={0}
                value={p[field]}
                onChange={(e) => onChange(p.id, { [field]: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-14 h-9 rounded-lg bg-muted text-center font-bold border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
