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

  return (
    <div className="card-surface p-4 space-y-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex justify-between">
        <span>{match.group ? `Grupo ${match.group}` : match.stage.toUpperCase()}</span>
        <span>{formatColombiaDate(match.date)}</span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <TeamSide flag={home.flag} name={home.name} win={homeWin} align="left" />
        <div className="flex items-center gap-2">
          <ScoreInput
            value={hs}
            disabled={!editable}
            onChange={(v) => setMatch(match.id, { homeScore: v })}
          />
          <span className="text-muted-foreground">-</span>
          <ScoreInput
            value={as}
            disabled={!editable}
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
      "flex items-center gap-2 rounded-xl px-2 py-1.5",
      align === "right" && "flex-row-reverse text-right",
      win && "bg-win"
    )}>
      <span className="text-2xl leading-none">{flag}</span>
      <span className={cn("text-sm font-semibold leading-tight", win && "accent-green")}>{name}</span>
    </div>
  );
}

function ScoreInput({ value, onChange, disabled }: { value: number | null; onChange: (v: number | null) => void; disabled?: boolean }) {
  return (
    <input
      type="number"
      min={0}
      inputMode="numeric"
      disabled={disabled}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? null : Math.max(0, parseInt(e.target.value)))}
      placeholder="-"
      className="w-10 h-10 rounded-lg bg-muted text-center font-bold text-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
    />
  );
}
