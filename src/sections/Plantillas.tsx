import { useMemo, useState } from "react";
import { ChevronLeft, Search } from "lucide-react";
import { SQUADS, type SquadPosition, type SquadTeam } from "@/data/squads";
import { useI18n } from "@/i18n";

const POSITION_KEY: Record<SquadPosition, string> = {
  GK: "squads.gk",
  DEF: "squads.def",
  MID: "squads.mid",
  FWD: "squads.fwd",
};

const POSITION_ORDER: SquadPosition[] = ["GK", "DEF", "MID", "FWD"];

function normalize(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function Plantillas() {
  const { t, lang } = useI18n();
  const [selected, setSelected] = useState<SquadTeam | null>(null);
  const [query, setQuery] = useState("");

  const teams = useMemo(
    () => [...SQUADS].sort((a, b) => a.name.localeCompare(b.name, lang)),
    [lang]
  );

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return teams;
    return teams.filter((t) => normalize(t.name).includes(q));
  }, [teams, query]);

  if (selected) {
    return <TeamSquadView team={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black">{t("squads.title")}</h2>

      <div className="card-surface p-3 flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground shrink-0 ml-1" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("squads.search")}
          className="bg-transparent outline-none text-sm font-semibold flex-1 placeholder:text-muted-foreground"
        />
      </div>

      <div className="card-surface p-2">
        <ul className="divide-y divide-white/5">
          {filtered.map((team) => (
            <li key={team.id}>
              <button
                onClick={() => setSelected(team)}
                className="w-full flex items-center gap-3 px-3 py-3 press hover:bg-white/5 rounded-xl transition-colors text-left"
              >
                <span className="text-2xl leading-none">{team.flag}</span>
                <span className="font-bold text-sm flex-1 truncate">{team.name}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                  {team.players.length} {t("squads.playersShort")}
                </span>
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
              {t("squads.noResults")}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function TeamSquadView({ team, onBack }: { team: SquadTeam; onBack: () => void }) {
  const { t } = useI18n();
  const grouped = POSITION_ORDER.map((pos) => ({
    pos,
    players: team.players
      .filter((p) => p.position === pos)
      .sort((a, b) => a.dorsal - b.dorsal),
  }));

  return (
    <div className="space-y-4 animate-fade-up">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground press"
      >
        <ChevronLeft className="h-4 w-4" />
        {t("squads.back")}
      </button>

      <div className="card-surface p-4 flex items-center gap-3">
        <div className="text-4xl leading-none">{team.flag}</div>
        <div className="flex-1">
          <div className="text-xl font-black">{team.name}</div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
            {t("squads.calledUp")} · {team.players.length} {t("squads.playersWord")}
          </div>
        </div>
      </div>

      {grouped.map(({ pos, players }) => (
        <section key={pos} className="card-surface p-4">
          <h3 className="text-sm font-black uppercase tracking-wider accent-gold mb-3">
            {t(POSITION_KEY[pos])}
          </h3>
          <ul className="space-y-2">
            {players.map((p) => (
              <li
                key={p.dorsal}
                className="flex items-center gap-3 rounded-xl px-3 py-2 border border-white/10"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <div className="h-9 w-9 rounded-lg flex items-center justify-center font-black text-sm bg-muted text-foreground tabular-nums">
                  {p.dorsal}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{p.club}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
