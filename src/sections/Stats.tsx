import { bestThirds, useTournament } from "@/store/useTournament";
import { useLeaders } from "@/hooks/useTopScorers";
import type { LeaderKind, LeaderRow } from "@/services/scorers";

export function Stats() {
  const { data } = useTournament();
  const thirds = bestThirds(data);

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

      {/* Datos reales del Mundial: goleadores y luego asistencias. */}
      <LeaderTable kind="goals" title="Goleadores" unit={["gol", "goles"]} />
      <LeaderTable kind="assists" title="Asistencias" unit={["asist.", "asist."]} />
    </div>
  );
}

// Ranking REAL del Mundial (goleadores o asistencias) desde la API de ESPN.
function LeaderTable({ kind, title, unit }: { kind: LeaderKind; title: string; unit: [string, string] }) {
  const { rows, loading, error } = useLeaders(kind);
  return (
    <section className="card-surface p-4">
      <h3 className="font-bold accent-green mb-3">{title}</h3>

      {loading && rows.length === 0 && (
        <ul className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="h-9 rounded-lg bg-muted/50 animate-pulse" />
          ))}
        </ul>
      )}

      {!loading && error && (
        <p className="text-sm text-muted-foreground py-2">
          No se pudo cargar la información. Revisa tu conexión; se reintenta solo.
        </p>
      )}

      {rows.length > 0 && (
        <ol className="space-y-1.5">
          {rows.map((p) => (
            <LeaderRowItem key={`${p.rank}-${p.name}`} p={p} unit={unit} />
          ))}
        </ol>
      )}
    </section>
  );
}

function LeaderRowItem({ p, unit }: { p: LeaderRow; unit: [string, string] }) {
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
        <b className="accent-red text-lg tabular-nums">{p.value}</b>
        <span className="text-[10px] text-muted-foreground font-bold">{p.value === 1 ? unit[0] : unit[1]}</span>
      </span>
    </li>
  );
}
