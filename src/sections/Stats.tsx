import { useState } from "react";
import { bestThirds, useTournament } from "@/store/useTournament";
import { useLeaders } from "@/hooks/useTopScorers";
import type { LeaderKind, LeaderRow } from "@/services/scorers";
import { cn } from "@/lib/utils";

// ESPN no tiene foto de muchos jugadores de selecciones (la URL no existe).
// Para que el hueco se vea intencional, mostramos un avatar con su inicial y un
// color derivado del nombre. Si una foto sí existe pero falla al cargar en el
// teléfono, también caemos a este avatar.
const AVATAR_TONES = [
  "from-primary/45 to-primary/10 text-primary",
  "from-accent/45 to-accent/10 text-accent",
  "from-secondary/45 to-secondary/10 text-secondary",
  "from-[hsl(var(--gold))]/45 to-[hsl(var(--gold))]/10 accent-gold",
];
function toneFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_TONES[Math.abs(h) % AVATAR_TONES.length];
}

function PlayerAvatar({ photo, name }: { photo: string | null; name: string }) {
  const [broken, setBroken] = useState(false);
  if (photo && !broken) {
    return (
      <img
        src={photo}
        alt=""
        loading="lazy"
        onError={() => setBroken(true)}
        className="h-8 w-8 rounded-full object-cover bg-muted shrink-0"
      />
    );
  }
  return (
    <span
      className={cn(
        "h-8 w-8 rounded-full bg-gradient-to-br flex items-center justify-center text-xs font-black ring-1 ring-white/10 shrink-0",
        toneFor(name)
      )}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

// Solo los 8 mejores terceros avanzan a la ronda de 32; del 9.º al 12.º quedan eliminados.
const THIRDS_QUALIFY = 8;

export function Stats() {
  const { data } = useTournament();
  const thirds = bestThirds(data);

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-black">Stats</h2>

      <section className="card-surface p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold accent-blue">Mejores terceros</h3>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
            Avanzan 8
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mb-3">
          Pasan a la ronda de 32 los 8 mejores; del 9.º al 12.º quedan eliminados.
        </p>
        <ol className="space-y-1">
          {thirds.map((t, i) => {
            const eliminated = i >= THIRDS_QUALIFY;
            return (
              <li
                key={t.group}
                className={cn(
                  "flex items-center justify-between text-sm rounded-lg pl-2 pr-2 py-1.5 border-l-4 transition-colors",
                  eliminated
                    ? "border-l-primary bg-primary/10"
                    : "border-l-secondary/60 bg-secondary/5",
                )}
              >
                <span className="flex items-center gap-2">
                  <span className={cn("w-5 text-center font-black tabular-nums", eliminated ? "text-primary" : "text-secondary")}>
                    {i + 1}
                  </span>
                  <span className="text-xl">{t.standing.team.flag}</span>
                  <span className="font-semibold">{t.standing.team.name}</span>
                  <span className="text-xs text-muted-foreground">({t.group})</span>
                </span>
                <span className="text-xs flex items-center gap-2">
                  <span><b className="accent-red">{t.standing.pts}</b> pts · DG {t.standing.dg}</span>
                  {eliminated && (
                    <span className="text-[9px] uppercase font-black text-primary bg-primary/15 rounded px-1.5 py-0.5">
                      Elim.
                    </span>
                  )}
                </span>
              </li>
            );
          })}
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
      <PlayerAvatar photo={p.photo} name={p.name} />
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
