import { Trophy, Users, Flag } from "lucide-react";
import { useTournament } from "@/store/useTournament";

export function Inicio({ go }: { go: (s: any) => void }) {
  const { data } = useTournament();
  const played = data.matches.filter((m) => m.homeScore !== null && m.awayScore !== null).length;

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-hero p-6 text-primary-foreground shadow-[var(--shadow-glow)]">
        <p className="text-xs uppercase tracking-[0.3em] opacity-90">Copa Mundial</p>
        <h1 className="text-4xl font-black mt-1">Mundial 2026</h1>
        <p className="mt-2 text-sm opacity-90">Sigue cada grupo, partido y eliminatoria.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat icon={Flag} label="Grupos" value="12" color="accent-red" />
        <Stat icon={Users} label="Equipos" value={String(data.teams.length)} color="accent-green" />
        <Stat icon={Trophy} label="Jugados" value={`${played}/${data.matches.length}`} color="accent-blue" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <BigButton label="Ver Grupos" onClick={() => go("grupos")} variant="red" />
        <BigButton label="Partidos" onClick={() => go("partidos")} variant="blue" />
        <BigButton label="Bracket" onClick={() => go("bracket")} variant="green" />
        <BigButton label="Estadísticas" onClick={() => go("stats")} variant="muted" />
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }: any) {
  return (
    <div className="card-surface p-3 text-center">
      <Icon className={`h-5 w-5 mx-auto ${color}`} />
      <div className="mt-1 text-xl font-black">{value}</div>
      <div className="text-[10px] uppercase text-muted-foreground tracking-wider">{label}</div>
    </div>
  );
}

function BigButton({ label, onClick, variant }: { label: string; onClick: () => void; variant: "red" | "green" | "blue" | "muted" }) {
  const cls = {
    red: "bg-primary text-primary-foreground",
    green: "bg-secondary text-secondary-foreground",
    blue: "bg-accent text-accent-foreground",
    muted: "bg-muted text-foreground",
  }[variant];
  return (
    <button onClick={onClick} className={`${cls} rounded-2xl py-5 text-base font-bold active:scale-95 transition-transform shadow-[var(--shadow-card)]`}>
      {label}
    </button>
  );
}
