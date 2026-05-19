import { Trophy, Users, Flag, CalendarDays, Sparkles } from "lucide-react";
import { useTournament } from "@/store/useTournament";

export function Inicio({ go }: { go: (s: any) => void }) {
  const { data } = useTournament();
  const played = data.matches.filter((m) => m.homeScore !== null && m.awayScore !== null).length;
  const goals = data.matches.reduce((acc, m) => acc + (m.homeScore ?? 0) + (m.awayScore ?? 0), 0);

  return (
    <div className="space-y-5 animate-fade-up">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl bg-hero p-6 text-primary-foreground shadow-glow shimmer-overlay">
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 blur-2xl animate-float-glow" />
        <div className="absolute -bottom-12 -left-6 w-40 h-40 rounded-full bg-accent/40 blur-3xl animate-float-glow" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] bg-white/15 backdrop-blur px-2.5 py-1 rounded-full">
            <Sparkles className="h-3 w-3" /> Copa Mundial
          </div>
          <h1 className="text-5xl font-black mt-3 leading-none tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            Mundial<br/>
            <span className="text-stroke-gold">2026</span>
          </h1>
          <p className="mt-3 text-sm opacity-95 max-w-[14rem]">
            48 selecciones · 12 grupos · una sola gloria.
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-2.5">
        <Stat icon={Flag} label="Grupos" value="12" tone="red" />
        <Stat icon={Users} label="Equipos" value={String(data.teams.length)} tone="blue" />
        <Stat icon={CalendarDays} label="Jugados" value={`${played}`} tone="green" />
        <Stat icon={Trophy} label="Goles" value={String(goals)} tone="gold" />
      </div>

      {/* CTA BUTTONS */}
      <div className="grid grid-cols-2 gap-3">
        <BigButton label="Ver Grupos" onClick={() => go("grupos")} variant="red" />
        <BigButton label="Partidos" onClick={() => go("partidos")} variant="blue" />
        <BigButton label="Bracket" onClick={() => go("bracket")} variant="green" />
        <BigButton label="Estadísticas" onClick={() => go("stats")} variant="gold" />
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: any) {
  const tones: Record<string, string> = {
    red: "from-primary/30 to-primary/0 text-primary",
    blue: "from-accent/30 to-accent/0 text-accent",
    green: "from-secondary/30 to-secondary/0 text-secondary",
    gold: "from-[hsl(var(--gold))]/30 to-transparent accent-gold",
  };
  return (
    <div className="card-surface p-2.5 text-center overflow-hidden relative">
      <div className={`absolute inset-0 bg-gradient-to-b ${tones[tone]} opacity-60`} />
      <div className="relative">
        <Icon className={`h-4 w-4 mx-auto ${tones[tone].split(" ").pop()}`} />
        <div className="mt-1 text-xl font-black tabular-nums">{value}</div>
        <div className="text-[9px] uppercase text-muted-foreground tracking-wider">{label}</div>
      </div>
    </div>
  );
}

function BigButton({ label, onClick, variant }: { label: string; onClick: () => void; variant: "red" | "green" | "blue" | "gold" }) {
  const cls = {
    red: "bg-gradient-to-br from-primary to-[hsl(var(--primary-glow))] text-primary-foreground shadow-glow",
    green: "bg-gradient-to-br from-secondary to-[hsl(var(--secondary-glow))] text-secondary-foreground shadow-glow-green",
    blue: "bg-gradient-to-br from-accent to-[hsl(var(--accent-glow))] text-accent-foreground shadow-glow-blue",
    gold: "bg-gold text-background shadow-glow-gold",
  }[variant];
  return (
    <button onClick={onClick} className={`${cls} rounded-2xl py-5 text-base font-black tracking-wide press relative overflow-hidden`}>
      <span className="relative z-10">{label}</span>
      <span className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
    </button>
  );
}
