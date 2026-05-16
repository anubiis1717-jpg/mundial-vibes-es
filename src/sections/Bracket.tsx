import { bestThirds, computeStandings, useTournament } from "@/store/useTournament";
import { cn } from "@/lib/utils";

const ROUNDS = [
  { key: "r32", title: "Ronda de 32" },
  { key: "r16", title: "Octavos" },
  { key: "qf", title: "Cuartos" },
  { key: "sf", title: "Semifinales" },
  { key: "third", title: "Tercer puesto" },
  { key: "final", title: "Final" },
];

interface Slot {
  label: string;
  flag?: string;
  name?: string;
}

function getSlots(data: ReturnType<typeof useTournament>["data"]): Slot[] {
  const groups = "ABCDEFGHIJKL".split("");
  const first: Slot[] = [];
  const second: Slot[] = [];
  groups.forEach((g) => {
    const s = computeStandings(data, g);
    first.push({ label: `1${g}`, flag: s[0]?.team.flag, name: s[0]?.team.name });
    second.push({ label: `2${g}`, flag: s[1]?.team.flag, name: s[1]?.team.name });
  });
  const thirds = bestThirds(data).slice(0, 8).map((t) => ({
    label: `Mejor tercero (${t.group})`,
    flag: t.standing.team.flag,
    name: t.standing.team.name,
  }));
  // Pad thirds to 8
  while (thirds.length < 8) thirds.push({ label: "Mejor tercero" });
  return [...first, ...second, ...thirds]; // 32 slots
}

export function Bracket() {
  const { data } = useTournament();
  const slots = getSlots(data);

  // Build 16 R32 pairings just by adjacent pairs from the 32 slot list
  const r32: [Slot, Slot][] = [];
  for (let i = 0; i < slots.length; i += 2) r32.push([slots[i], slots[i + 1]]);

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-black">Bracket</h2>
      <div className="card-surface p-4 text-sm text-muted-foreground leading-relaxed">
        Clasifican los <span className="accent-green font-bold">dos mejores</span> de cada grupo más los{" "}
        <span className="accent-blue font-bold">ocho mejores terceros</span> a la Ronda de 32.
      </div>

      {ROUNDS.map((r) => (
        <section key={r.key} className="space-y-3">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span className="h-1.5 w-6 rounded-full bg-primary" />
            {r.title}
          </h3>
          {r.key === "r32" ? (
            <div className="space-y-3">
              {r32.map((pair, i) => (
                <BracketCard key={i} a={pair[0]} b={pair[1]} />
              ))}
            </div>
          ) : (
            <div className="card-surface p-5 text-center text-sm text-muted-foreground">
              Por definir según resultados anteriores
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

function BracketCard({ a, b }: { a: Slot; b: Slot }) {
  return (
    <div className="card-surface p-3 space-y-2">
      <SlotRow s={a} />
      <div className="h-px bg-border" />
      <SlotRow s={b} />
    </div>
  );
}

function SlotRow({ s }: { s: Slot }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-2xl">{s.flag ?? "❔"}</span>
        <div className="min-w-0">
          <div className="font-semibold truncate">{s.name ?? "—"}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
        </div>
      </div>
      <div className={cn("w-9 h-9 rounded-lg bg-muted flex items-center justify-center font-black")}>-</div>
    </div>
  );
}
