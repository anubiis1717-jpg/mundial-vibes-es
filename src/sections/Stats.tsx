import { bestThirds, teamById, useTournament } from "@/store/useTournament";

export function Stats() {
  const { data, updatePlayer } = useTournament();
  const thirds = bestThirds(data);
  const scorers = [...data.players].sort((a, b) => b.goals - a.goals);
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

      <PlayerTable title="Goleadores" players={scorers} field="goals" onChange={updatePlayer} />
      <PlayerTable title="Asistencias" players={assists} field="assists" onChange={updatePlayer} />
    </div>
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
