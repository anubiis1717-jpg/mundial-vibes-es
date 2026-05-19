import { Match } from "@/data/initialData";
import { teamById } from "@/store/useTournament";
import { useTournament } from "@/store/useTournament";
import { formatColombiaDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function MatchCard({ match, editable = true }: { match: Match; editable?: boolean }) {
  const { data, setMatch } = useTournament();
  const home = teamById(data, match.homeId);
  const away = teamById(data, match.awayId);
  if (!home || !away) return null;

  const hs = match.homeScore;
  const as = match.awayScore;
  const played = hs !== null && as !== null;
  const homeWin = played && hs! > as!;
  const awayWin = played && as! > hs!;
  const draw = played && hs === as;

  const status = !played
    ? { label: "Pendiente", cls: "bg-accent/15 text-accent ring-1 ring-accent/30" }
    : draw
      ? { label: "Empate", cls: "bg-muted text-foreground ring-1 ring-border" }
      : { label: "Finalizado", cls: "bg-secondary/15 text-secondary ring-1 ring-secondary/30" };

  return (
    <div className="card-surface p-4 space-y-3 animate-fade-up press">
      <div className="text-[11px] uppercase tracking-wider flex justify-between items-center">
        <span className="font-bold text-foreground/80">
          {match.group ? `Grupo ${match.group}` : match.stage.toUpperCase()}
        </span>
        <span className="text-muted-foreground">{formatColombiaDate(match.date)}</span>
        <span className={cn("px-2 py-0.5 rounded-md font-semibold text-[10px]", status.cls)}>
          {status.label}
        </span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <TeamSide flag={home.flag} name={home.name} win={homeWin} align="left" />
        <div className="flex items-center gap-1.5 px-2">
          <ScoreInput
            value={hs}
            disabled={!editable}
            win={homeWin}
            onChange={(v) => setMatch(match.id, { homeScore: v })}
          />
          <span className="text-muted-foreground font-black">·</span>
          <ScoreInput
            value={as}
            disabled={!editable}
            win={awayWin}
            onChange={(v) => setMatch(match.id, { awayScore: v })}
          />
        </div>
        <TeamSide flag={away.flag} name={away.name} win={awayWin} align="right" />
      </div>
    </div>
  );
}

function TeamSide({ flag, name, win, align }: { flag: string; name: string; win: boolean; align: "left" | "right" }) {
  return (
    <div className={cn(
      "flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all",
      align === "right" && "flex-row-reverse text-right",
      win && "bg-win ring-1 ring-secondary/40"
    )}>
      <span className="text-2xl leading-none drop-shadow">{flag}</span>
      <span className={cn("text-sm font-bold leading-tight", win && "accent-green")}>{name}</span>
    </div>
  );
}

function ScoreInput({ value, onChange, disabled, win }: { value: number | null; onChange: (v: number | null) => void; disabled?: boolean; win?: boolean }) {
  return (
    <input
      type="number"
      min={0}
      inputMode="numeric"
      disabled={disabled}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? null : Math.max(0, parseInt(e.target.value)))}
      placeholder="-"
      className={cn(
        "w-11 h-11 rounded-xl text-center font-black text-xl border focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 transition-all tabular-nums",
        win
          ? "bg-gradient-to-br from-secondary to-[hsl(var(--secondary-glow))] text-secondary-foreground border-secondary/60 shadow-glow-green"
          : "bg-muted border-border"
      )}
    />
  );
}
