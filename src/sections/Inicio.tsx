import { CalendarDays, Users, Trophy, Goal, ChevronRight } from "lucide-react";
import { computeStandings, resolveSlot, useTournament } from "@/store/useTournament";
import { formatLocalDateParts } from "@/lib/format";
import { useWorldCupFixtures } from "@/hooks/useWorldCupFixtures";


const GROUP_TONES: Record<string, { ring: string; text: string; glow: string }> = {
  A: { ring: "border-primary/45", text: "text-primary", glow: "shadow-[0_0_28px_-4px_hsl(var(--primary)/0.45)]" },
  B: { ring: "border-accent/45", text: "text-accent", glow: "shadow-[0_0_28px_-4px_hsl(var(--accent)/0.45)]" },
  C: { ring: "border-secondary/45", text: "text-secondary", glow: "shadow-[0_0_28px_-4px_hsl(var(--secondary)/0.45)]" },
  D: { ring: "border-[hsl(var(--gold))]/45", text: "accent-gold", glow: "shadow-[0_0_28px_-4px_hsl(var(--gold)/0.45)]" },
  E: { ring: "border-primary/45", text: "text-primary", glow: "shadow-[0_0_28px_-4px_hsl(var(--primary)/0.45)]" },
  F: { ring: "border-accent/45", text: "text-accent", glow: "shadow-[0_0_28px_-4px_hsl(var(--accent)/0.45)]" },
  G: { ring: "border-secondary/45", text: "text-secondary", glow: "shadow-[0_0_28px_-4px_hsl(var(--secondary)/0.45)]" },
  H: { ring: "border-[hsl(var(--gold))]/45", text: "accent-gold", glow: "shadow-[0_0_28px_-4px_hsl(var(--gold)/0.45)]" },
  I: { ring: "border-primary/45", text: "text-primary", glow: "shadow-[0_0_28px_-4px_hsl(var(--primary)/0.45)]" },
  J: { ring: "border-accent/45", text: "text-accent", glow: "shadow-[0_0_28px_-4px_hsl(var(--accent)/0.45)]" },
  K: { ring: "border-secondary/45", text: "text-secondary", glow: "shadow-[0_0_28px_-4px_hsl(var(--secondary)/0.45)]" },
  L: { ring: "border-[hsl(var(--gold))]/45", text: "accent-gold", glow: "shadow-[0_0_28px_-4px_hsl(var(--gold)/0.45)]" },
};

export function Inicio({ go }: { go: (s: any) => void }) {
  const { data } = useTournament();
  const { byMatchId } = useWorldCupFixtures();
  const groupMatches = data.matches.filter((m) => m.stage === "group");
  const played = groupMatches.filter((m) => m.homeScore !== null && m.awayScore !== null).length;
  const goals = data.matches.reduce((acc, m) => acc + (m.homeScore ?? 0) + (m.awayScore ?? 0), 0);
  const qualified = data.knockout
    .filter((k) => k.stage === "r32")
    .reduce((acc, k) => acc + (resolveSlot(data, k.homeFrom) ? 1 : 0) + (resolveSlot(data, k.awayFrom) ? 1 : 0), 0);
  const finalMatch = data.knockout.find((k) => k.stage === "final");
  const champTeam = finalMatch ? resolveSlot(data, { kind: "winner", matchId: "M32" }) : undefined;

  // Partido destacado: el que esté EN VIVO ahora tiene prioridad; si no hay, el próximo
  // cronológicamente sin marcador (usa kickoff de la API cuando exista).
  const liveEntry = groupMatches
    .map((m) => ({ m, fx: byMatchId.get(m.id) }))
    .find((x) => x.fx?.status === "LIVE");
  const upcoming = groupMatches
    .filter((m) => m.homeScore === null && m.awayScore === null)
    .map((m) => {
      const fx = byMatchId.get(m.id);
      const iso = fx?.kickoffUtc ?? m.date;
      return { m, fx, iso, ts: iso ? new Date(iso).getTime() : Number.POSITIVE_INFINITY };
    })
    .sort((a, b) => a.ts - b.ts);
  const isLive = !!liveEntry;
  const nextEntry = liveEntry
    ? { m: liveEntry.m, fx: liveEntry.fx, iso: liveEntry.fx?.kickoffUtc ?? liveEntry.m.date }
    : upcoming[0];
  const next = nextEntry?.m;
  const nextFixture = nextEntry?.fx;
  const nextIso = nextEntry?.iso ?? null;
  const home = next ? data.teams.find((t) => t.id === next.homeId) : undefined;
  const away = next ? data.teams.find((t) => t.id === next.awayId) : undefined;
  const jornada = next ? (parseInt(next.id.split("-m")[1]) <= 2 ? 1 : parseInt(next.id.split("-m")[1]) <= 4 ? 2 : 3) : 1;
  const nextParts = formatLocalDateParts(nextIso);
  const [nextDate, nextTime] = nextParts ? [nextParts.date, nextParts.time] : [null, null];

  return (
    <div className="space-y-4 animate-fade-up">
      {/* PRÓXIMO PARTIDO */}
      {next && home && away && (
        <div className="card-surface p-4 relative">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {isLive ? (
              <span className="flex items-center gap-1.5 font-bold text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                En vivo
              </span>
            ) : (
              <span className="flex items-center gap-1.5 font-bold">
                <CalendarDays className="h-3.5 w-3.5 accent-gold" /> Próximo partido
              </span>
            )}
            <span className="text-muted-foreground/90">Grupo {next.group} · Jornada {jornada}</span>
          </div>
          <div className="h-px my-3 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="text-5xl leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">{home.flag}</div>
              <div className="text-xs font-black uppercase tracking-wide">{home.name}</div>
            </div>
            <div className="flex flex-col items-center gap-1 px-2">
              {isLive && nextFixture?.homeScore !== null && nextFixture?.awayScore !== null ? (
                <>
                  <div className="text-4xl font-black tabular-nums leading-none text-primary">
                    {nextFixture!.homeScore} <span className="text-muted-foreground">-</span> {nextFixture!.awayScore}
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-primary font-bold mt-1">En juego</div>
                </>
              ) : (
                <>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">
                    {nextDate ?? "POR CONFIRMAR"}
                  </div>
                  <div className="text-[11px] accent-gold font-bold">{nextTime ?? "--:--"}</div>
                  <div className="text-2xl font-black">VS</div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Hora local</div>
                </>
              )}
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="text-5xl leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">{away.flag}</div>
              <div className="text-xs font-black uppercase tracking-wide">{away.name}</div>
            </div>
          </div>
          {nextFixture?.venue && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground bg-muted/40 rounded-lg px-2.5 py-1.5">
              <span>📍</span>
              <span className="font-semibold truncate">{nextFixture.venue}</span>
              {nextFixture.country && <span className="opacity-70">· {nextFixture.country}</span>}
            </div>
          )}
          <button
            onClick={() => go("partidos", next.group)}
            className="glass-btn glass-btn-red mt-4 w-full h-11 font-black text-sm tracking-wide press"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-primary/30 via-primary/15 to-primary/30" />
            <span className="relative z-10">{isLive ? "VER EN VIVO" : "VER PARTIDO"}</span>
          </button>
        </div>
      )}



      {/* STATS GRID */}
      <div className="grid grid-cols-4 gap-2">
        <StatTile icon={CalendarDays} value={played} label="Partidos" sub="Jugados" tone="red" />
        <StatTile icon={Goal} value={goals} label="Goles" sub="Marcados" tone="blue" />
        <StatTile icon={Users} value={qualified} label="Clasificados" sub="A 16avos" tone="green" />
        <StatTile icon={Trophy} value={champTeam ? "1" : "0"} label="Campeón" sub={champTeam?.name ?? "Por definir"} tone="gold" />
      </div>

      {/* FASE DE GRUPOS */}
      <div className="card-surface p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
            <Users className="h-4 w-4 accent-gold" /> Fase de grupos
          </h3>
          <button onClick={() => go("grupos")} className="text-xs text-muted-foreground flex items-center gap-1 font-bold press">
            Ver todos <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1 snap-x">
          {"ABCDEFGHIJKL".split("").map((g) => {
            const st = computeStandings(data, g).slice(0, 4);
            const tone = GROUP_TONES[g];
            return (
              <div
                key={g}
                onClick={() => go("grupos")}
                className={`snap-start shrink-0 w-[180px] rounded-2xl border ${tone.ring} ${tone.glow} p-3 cursor-pointer press`}
                style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[11px] font-black uppercase tracking-wider ${tone.text}`}>Grupo {g}</span>
                  <ChevronRight className={`h-3.5 w-3.5 ${tone.text}`} />
                </div>
                <ul className="space-y-1.5">
                  {st.map((row) => (
                    <li key={row.team.id} className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="text-sm leading-none">{row.team.flag}</span>
                        <span className="truncate font-semibold">{row.team.name}</span>
                      </span>
                      <span className="font-black tabular-nums">{row.pts}</span>
                    </li>
                  ))}
                </ul>
                <div className={`mt-2 pt-2 border-t border-white/10 text-[10px] font-bold flex items-center justify-center gap-1 ${tone.text}`}>
                  <ChevronRight className="h-3 w-3" /> Ver tabla
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CUADRO FINAL */}
      <div className="card-surface p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
            <Trophy className="h-4 w-4 accent-gold" /> Cuadro Final
          </h3>
          <button onClick={() => go("bracket")} className="text-xs text-muted-foreground flex items-center gap-1 font-bold press">
            Ver bracket <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <BracketPreview />
      </div>
    </div>
  );
}

function StatTile({ icon: Icon, value, label, sub, tone }: any) {
  const tones: Record<string, { bg: string; text: string; border: string }> = {
    red: { bg: "from-primary/25", text: "text-primary", border: "border-primary/35" },
    blue: { bg: "from-accent/25", text: "text-accent", border: "border-accent/35" },
    green: { bg: "from-secondary/25", text: "text-secondary", border: "border-secondary/35" },
    gold: { bg: "from-[hsl(var(--gold))]/25", text: "accent-gold", border: "border-[hsl(var(--gold))]/40" },
  };
  const t = tones[tone];
  return (
    <div
      className={`relative rounded-2xl border ${t.border} p-2 text-center overflow-hidden`}
      style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}
    >
      <div className={`absolute inset-0 bg-gradient-to-b ${t.bg} to-transparent opacity-70`} />
      <div className="relative">
        <div className={`mx-auto h-9 w-9 rounded-xl flex items-center justify-center ${t.text}`}
             style={{ background: "rgba(255,255,255,0.06)", boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.15)" }}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="mt-1.5 text-xl font-black tabular-nums leading-none">{value}</div>
        <div className="mt-1 text-[9px] uppercase font-bold tracking-wider">{label}</div>
        <div className="text-[8.5px] text-muted-foreground truncate">{sub}</div>
      </div>
    </div>
  );
}

function BracketPreview() {
  const { data } = useTournament();
  const finalM = data.knockout.find((k) => k.stage === "final");
  const semi1 = data.knockout.find((k) => k.id === "M29");
  const semi2 = data.knockout.find((k) => k.id === "M30");
  const slot = (ref: any) => (ref ? resolveSlot(data, ref) : undefined);
  const tL = semi1 ? [slot(semi1.homeFrom), slot(semi1.awayFrom)] : [];
  const tR = semi2 ? [slot(semi2.homeFrom), slot(semi2.awayFrom)] : [];

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
      <div className="space-y-2">
        {tL.map((t, i) => (
          <MiniSlot key={i} team={t} side="left" />
        ))}
      </div>
      <div className="flex flex-col items-center gap-1 px-1">
        <Trophy className="h-7 w-7 accent-gold animate-trophy" />
        <div className="text-[10px] font-black uppercase tracking-widest accent-gold">Final</div>
        <div className="text-[9px] text-muted-foreground text-center">
          {finalM?.homeScore !== null && finalM?.awayScore !== null ? "Finalizado" : "Por definir"}
        </div>
      </div>
      <div className="space-y-2">
        {tR.map((t, i) => (
          <MiniSlot key={i} team={t} side="right" />
        ))}
      </div>
    </div>
  );
}

function MiniSlot({ team, side }: { team: any; side: "left" | "right" }) {
  return (
    <div
      className={`relative h-10 rounded-xl border border-white/15 px-2 flex items-center gap-2 ${side === "right" ? "flex-row-reverse text-right" : ""}`}
      style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(14px)" }}
    >
      <div className="text-lg leading-none">{team?.flag ?? "🏳️"}</div>
      <div className="text-[11px] font-bold truncate flex-1">{team?.name ?? "Por definir"}</div>
    </div>
  );
}
