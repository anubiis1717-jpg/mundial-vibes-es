import { useState } from "react";
import { KOMatch, SlotRef } from "@/data/initialData";
import { koWinnerLoser, resolveSlot, slotLabel, useTournament } from "@/store/useTournament";
import { getKoFixture } from "@/data/schedule2026";
import { formatLocalDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

const ROUND_KEY: Record<KOMatch["stage"], string> = {
  r32: "round.r32",
  r16: "round.r16",
  qf: "round.qf",
  sf: "round.sf",
  third: "round.third",
  final: "round.final",
};

export function Bracket() {
  const { t, lang } = useI18n();
  const [mode, setMode] = useState<"cuadro" | "lista">("lista");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-black">{t("bracket.title")}</h2>
        <div className="flex rounded-xl bg-muted p-1 text-sm font-bold">
          <button
            onClick={() => setMode("cuadro")}
            className={cn("px-3 h-9 rounded-lg transition", mode === "cuadro" && "bg-accent text-accent-foreground")}
          >
            {t("bracket.cuadro")}
          </button>
          <button
            onClick={() => setMode("lista")}
            className={cn("px-3 h-9 rounded-lg transition", mode === "lista" && "bg-accent text-accent-foreground")}
          >
            {t("bracket.lista")}
          </button>
        </div>
      </div>

      <div className="card-surface p-4 text-sm text-muted-foreground leading-relaxed">
        {lang === "en" ? (
          <>
            The <span className="accent-red font-bold">top two</span> of each group and the{" "}
            <span className="accent-blue font-bold">eight best third-placed</span> teams advance to the{" "}
            <span className="accent-green font-bold">Round of 32</span>. Winners advance round by round to the Final.
          </>
        ) : (
          <>
            Clasifican a la <span className="accent-green font-bold">Ronda de 32</span> los{" "}
            <span className="accent-red font-bold">dos primeros</span> de cada grupo y los{" "}
            <span className="accent-blue font-bold">ocho mejores terceros</span>. Los ganadores avanzan ronda por ronda hasta la Final.
          </>
        )}
      </div>

      {mode === "lista" ? <ListView /> : <CuadroView />}
    </div>
  );
}

// ============ LIST VIEW ============
function ListView() {
  const { t } = useI18n();
  const { data } = useTournament();
  const stages: KOMatch["stage"][] = ["r32", "r16", "qf", "sf", "third", "final"];
  return (
    <div className="space-y-6">
      {stages.map((s) => {
        const matches = data.knockout.filter((m) => m.stage === s);
        return (
          <section key={s} className="space-y-3">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <span className="h-1.5 w-6 rounded-full bg-primary" />
              {t(ROUND_KEY[s])}
              <span className="text-xs font-normal text-muted-foreground">({matches.length})</span>
            </h3>
            <div className="space-y-3">
              {matches.map((m) => <KOCard key={m.id} match={m} />)}
            </div>
          </section>
        );
      })}
      <ChampionCard />
    </div>
  );
}

// ============ CUADRO VIEW ============
function CuadroView() {
  const { t } = useI18n();
  const { data } = useTournament();
  const byStage = (s: KOMatch["stage"]) => data.knockout.filter((m) => m.stage === s);

  // Mitad izquierda: r32 M1-M8, r16 M17-M20, qf M25-M26, sf M29
  // Mitad derecha:   r32 M9-M16, r16 M21-M24, qf M27-M28, sf M30
  const r32 = byStage("r32");
  const r16 = byStage("r16");
  const qf = byStage("qf");
  const sf = byStage("sf");
  const finalM = byStage("final")[0];
  const third = byStage("third")[0];

  const Col = ({ title, matches, w = "w-60" }: { title: string; matches: KOMatch[]; w?: string }) => (
    <div className={cn("shrink-0 flex flex-col gap-3", w)}>
      <h4 className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">{title}</h4>
      <div className="flex flex-col gap-3 flex-1 justify-around">
        {matches.map((m) => <MiniCard key={m.id} match={m} />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto -mx-4 px-4 pb-3">
        <div className="flex gap-3 min-w-max">
          <Col title={t("bracket.colLeft32")} matches={r32.slice(0, 8)} />
          <Col title={t("bracket.octavos")} matches={r16.slice(0, 4)} />
          <Col title={t("bracket.cuartos")} matches={qf.slice(0, 2)} />
          <Col title={t("bracket.semi")} matches={[sf[0]]} w="w-56" />
          <div className="shrink-0 w-64 flex flex-col items-center justify-center">
            <h4 className="text-[11px] uppercase tracking-wider text-primary font-bold mb-2">{t("common.final")}</h4>
            <div className="w-full">
              <MiniCard match={finalM} highlight />
            </div>
          </div>
          <Col title={t("bracket.semi")} matches={[sf[1]]} w="w-56" />
          <Col title={t("bracket.cuartos")} matches={qf.slice(2)} />
          <Col title={t("bracket.octavos")} matches={r16.slice(4)} />
          <Col title={t("bracket.colRight32")} matches={r32.slice(8)} />
        </div>
      </div>

      <section className="space-y-3">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span className="h-1.5 w-6 rounded-full bg-accent" />
          {t("round.third")}
        </h3>
        <KOCard match={third} />
      </section>

      <ChampionCard />
    </div>
  );
}

// ============ KO MATCH CARD ============
function KOCard({ match, compact = false }: { match: KOMatch; compact?: boolean }) {
  const { t } = useI18n();
  const { data, setKO } = useTournament();
  const [editing, setEditing] = useState(false);

  const home = resolveSlot(data, match.homeFrom);
  const away = resolveSlot(data, match.awayFrom);
  const { winner } = koWinnerLoser(match);
  const played = match.homeScore !== null && match.awayScore !== null;
  const tied = played && match.homeScore === match.awayScore;
  const statusKey = !played
    ? "pending"
    : tied && winner === null
      ? "definePens"
      : winner
        ? "finished"
        : "live";
  const statusLabel =
    statusKey === "pending"
      ? t("bracket.status.pending")
      : statusKey === "definePens"
        ? t("bracket.status.definePens")
        : statusKey === "finished"
          ? t("common.finished")
          : t("common.live");

  const isFinal = match.stage === "final";

  return (
    <div className={cn(
      "card-surface p-4 space-y-3 relative overflow-hidden",
      isFinal && "ring-2 ring-primary/60 shadow-glow"
    )}>
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider">
        <span className="font-bold text-foreground/80">{t("bracket.match")} {match.number}</span>
        <span className="text-muted-foreground">{t(ROUND_KEY[match.stage])}</span>
        <span className={cn(
          "px-2 py-0.5 rounded-md font-semibold",
          statusKey === "finished" && "bg-secondary/20 text-secondary",
          statusKey === "pending" && "bg-muted text-muted-foreground",
          statusKey === "definePens" && "bg-primary/20 text-primary",
        )}>{statusLabel}</span>
      </div>
      {(() => {
        const ko = getKoFixture(match.id);
        if (!ko) return null;
        return (
          <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground bg-muted/40 rounded-lg px-2.5 py-1.5">
            <span className="font-semibold">{formatLocalDateTime(ko.kickoffUtc)}</span>
            <span className="truncate opacity-80">📍 {ko.venue}</span>
          </div>
        );
      })()}

      <KOSide
        team={home}
        slot={match.homeFrom}
        score={match.homeScore}
        pens={match.pensHome}
        showPens={tied}
        win={winner === "home"}
      />
      <div className="h-px bg-border" />
      <KOSide
        team={away}
        slot={match.awayFrom}
        score={match.awayScore}
        pens={match.pensAway}
        showPens={tied}
        win={winner === "away"}
      />

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => setEditing((e) => !e)}
          className="text-xs px-3 h-8 rounded-lg bg-muted font-semibold hover:bg-muted/70"
        >
          {editing ? t("bracket.close") : t("bracket.editScore")}
        </button>
        {played && (
          <button
            onClick={() => setKO(match.id, { homeScore: null, awayScore: null, pensHome: null, pensAway: null })}
            className="text-xs px-3 h-8 rounded-lg bg-muted font-semibold hover:bg-muted/70"
          >
            {t("bracket.clear")}
          </button>
        )}
      </div>

      {editing && (
        <div className="rounded-xl bg-background/50 p-3 space-y-2 border border-border">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <ScoreField label={`${home?.name ?? t("bracket.local")} - ${t("bracket.goals")}`} value={match.homeScore}
              onChange={(v) => setKO(match.id, { homeScore: v })} />
            <ScoreField label={`${away?.name ?? t("bracket.visitor")} - ${t("bracket.goals")}`} value={match.awayScore}
              onChange={(v) => setKO(match.id, { awayScore: v })} />
            {tied && (
              <>
                <ScoreField label={t("bracket.pensLocal")} value={match.pensHome}
                  onChange={(v) => setKO(match.id, { pensHome: v })} />
                <ScoreField label={t("bracket.pensVisitor")} value={match.pensAway}
                  onChange={(v) => setKO(match.id, { pensAway: v })} />
              </>
            )}
          </div>
          {tied && (match.pensHome === null || match.pensAway === null || match.pensHome === match.pensAway) && (
            <p className="text-[11px] text-primary">{t("bracket.tieHint")}</p>
          )}
        </div>
      )}
    </div>
  );
}

function KOSide({
  team, slot, score, pens, showPens, win,
}: {
  team?: { name: string; flag: string };
  slot: SlotRef;
  score: number | null;
  pens: number | null;
  showPens: boolean;
  win: boolean;
}) {
  const { t } = useI18n();
  return (
    <div className={cn(
      "flex items-center justify-between gap-3 rounded-xl px-2 py-1.5 transition",
      win && "bg-win ring-1 ring-secondary/50"
    )}>
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-3xl leading-none">{team?.flag ?? "❔"}</span>
        <div className="min-w-0">
          <div className={cn("font-bold truncate text-sm", win && "accent-green")}>
            {team?.name ?? t("common.tbd")}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{slotLabel(slot)}</div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg",
          win ? "bg-secondary text-secondary-foreground" : "bg-muted"
        )}>
          {score ?? "-"}
        </div>
        {showPens && (
          <div className="text-xs font-bold text-muted-foreground">
            ({pens ?? "-"})
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreField({ label, value, onChange }: { label: string; value: number | null; onChange: (v: number | null) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-muted-foreground">{label}</span>
      <input
        type="number" min={0} inputMode="numeric"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Math.max(0, parseInt(e.target.value)))}
        className="h-9 rounded-lg bg-muted text-center font-bold border border-border focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </label>
  );
}

// ============ MINI CARD (Cuadro view) ============
function MiniCard({ match, highlight = false }: { match: KOMatch; highlight?: boolean }) {
  const { t } = useI18n();
  const { data } = useTournament();
  const home = resolveSlot(data, match.homeFrom);
  const away = resolveSlot(data, match.awayFrom);
  const { winner } = koWinnerLoser(match);

  const Row = ({ team, slot, score, win }: { team?: { name: string; flag: string }; slot: SlotRef; score: number | null; win: boolean }) => (
    <div className={cn(
      "flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-xs",
      win && "bg-secondary/20"
    )}>
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-base">{team?.flag ?? "❔"}</span>
        <span className={cn("truncate font-semibold", win && "accent-green")}>
          {team?.name ?? slotLabel(slot)}
        </span>
      </div>
      <span className={cn("font-black tabular-nums", win && "accent-green")}>{score ?? "-"}</span>
    </div>
  );

  return (
    <div className={cn(
      "card-surface p-2 space-y-1",
      highlight && "ring-2 ring-primary shadow-glow bg-hero/10"
    )}>
      <div className="flex items-center justify-between px-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        <span className="font-bold">{t("bracket.matchShort")}{match.number}</span>
        <span>{t(ROUND_KEY[match.stage])}</span>
      </div>
      <Row team={home} slot={match.homeFrom} score={match.homeScore} win={winner === "home"} />
      <Row team={away} slot={match.awayFrom} score={match.awayScore} win={winner === "away"} />
    </div>
  );
}

// ============ CHAMPION ============
function ChampionCard() {
  const { t } = useI18n();
  const { data } = useTournament();
  const final = data.knockout.find((m) => m.id === "M32")!;
  const { winner } = koWinnerLoser(final);
  if (!winner) return null;
  const champ = resolveSlot(data, winner === "home" ? final.homeFrom : final.awayFrom);
  if (!champ) return null;
  return (
    <div className="relative overflow-hidden rounded-3xl p-8 text-center space-y-3 shadow-glow-gold animate-fade-up">
      <div className="absolute inset-0 bg-gold opacity-95" />
      <div className="absolute inset-0 shimmer-overlay" />
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/30 blur-3xl animate-float-glow" />
      <div className="relative">
        <div className="text-[10px] uppercase tracking-[0.4em] text-background/80 font-black">{t("bracket.championTitle")}</div>
        <div className="text-7xl mt-3 animate-trophy">{champ.flag}</div>
        <div className="text-3xl font-black mt-2 text-background tracking-tight">{champ.name}</div>
        <div className="mt-3 inline-flex items-center gap-1 text-background/80 text-xs font-bold tracking-widest">★ ★ ★</div>
      </div>
    </div>
  );
}
