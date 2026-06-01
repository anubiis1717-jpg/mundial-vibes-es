import { useRef, useState } from "react";
import { useTournament } from "@/store/useTournament";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Map API-Football team names -> local team names when they differ
const NAME_ALIASES: Record<string, string> = {
  "south korea": "corea del sur",
  "czech republic": "república checa",
  "czechia": "república checa",
  "bosnia and herzegovina": "bosnia y herzegovina",
  "qatar": "catar",
  "morocco": "marruecos",
  "haiti": "haití",
  "scotland": "escocia",
  "usa": "estados unidos",
  "united states": "estados unidos",
  "paraguay": "paraguay",
  "australia": "australia",
  "turkey": "turquía",
  "türkiye": "turquía",
  "germany": "alemania",
  "curacao": "curazao",
  "curaçao": "curazao",
  "ivory coast": "costa de marfil",
  "cote d'ivoire": "costa de marfil",
  "ecuador": "ecuador",
  "netherlands": "países bajos",
  "japan": "japón",
  "sweden": "suecia",
  "tunisia": "túnez",
  "belgium": "bélgica",
  "egypt": "egipto",
  "iran": "irán",
  "new zealand": "nueva zelanda",
  "spain": "españa",
  "cape verde": "cabo verde",
  "saudi arabia": "arabia saudita",
  "uruguay": "uruguay",
  "france": "francia",
  "senegal": "senegal",
  "iraq": "irak",
  "norway": "noruega",
  "argentina": "argentina",
  "algeria": "argelia",
  "austria": "austria",
  "jordan": "jordania",
  "portugal": "portugal",
  "dr congo": "rd congo",
  "congo dr": "rd congo",
  "uzbekistan": "uzbekistán",
  "colombia": "colombia",
  "england": "inglaterra",
  "croatia": "croacia",
  "ghana": "ghana",
  "panama": "panamá",
  "mexico": "méxico",
  "south africa": "sudáfrica",
  "canada": "canadá",
  "brazil": "brasil",
  "switzerland": "suiza",
};

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

export function Ajustes() {
  const { data, setData, restore, clearBracket, simulateGroups, clearScores, updateMatchDates } =
    useTournament();
  const fileRef = useRef<HTMLInputElement>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(
    () => localStorage.getItem("mundial2026.lastSync"),
  );

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "mundial2026.json"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Datos exportados");
  };

  const importJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!parsed.teams || !parsed.matches) throw new Error();
        setData(parsed);
        toast.success("Datos importados");
      } catch {
        toast.error("Archivo inválido");
      }
    };
    reader.readAsText(file);
  };

  const syncFixtures = async () => {
    setSyncing(true);
    try {
      const { data: res, error } = await supabase.functions.invoke("sync-fixtures");
      if (error) throw error;
      const fixtures: Array<{
        homeTeam: string | null;
        awayTeam: string | null;
        isoColombia: string | null;
      }> = res?.fixtures ?? [];

      // Build lookup from local team name -> id
      const teamByName = new Map<string, string>();
      data.teams.forEach((t) => teamByName.set(norm(t.name), t.id));

      const resolveId = (name: string | null): string | undefined => {
        if (!name) return undefined;
        const n = norm(name);
        if (teamByName.has(n)) return teamByName.get(n);
        const aliased = NAME_ALIASES[n];
        if (aliased && teamByName.has(norm(aliased))) return teamByName.get(norm(aliased));
        return undefined;
      };

      const updates: Array<{ id: string; date: string }> = [];
      for (const f of fixtures) {
        if (!f.isoColombia) continue;
        const hId = resolveId(f.homeTeam);
        const aId = resolveId(f.awayTeam);
        if (!hId || !aId) continue;
        // find a group-stage match between these two teams (any order)
        const m = data.matches.find(
          (mm) =>
            mm.stage === "group" &&
            ((mm.homeId === hId && mm.awayId === aId) ||
              (mm.homeId === aId && mm.awayId === hId)),
        );
        if (m) updates.push({ id: m.id, date: f.isoColombia });
      }

      const count = updateMatchDates(updates);
      const now = new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" });
      localStorage.setItem("mundial2026.lastSync", now);
      setLastSync(now);
      if (count === 0) toast("Sin coincidencias para actualizar");
      else toast.success(`${count} partidos actualizados (hora Colombia)`);
    } catch (e: any) {
      toast.error("Error al sincronizar", { description: e?.message ?? "Intenta de nuevo" });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black">Ajustes</h2>

      <section className="card-surface p-4 space-y-3">
        <h3 className="font-bold">Datos</h3>
        <Btn onClick={exportJSON} variant="blue">Exportar JSON</Btn>
        <Btn onClick={() => fileRef.current?.click()} variant="green">Importar JSON</Btn>
        <input
          ref={fileRef} type="file" accept="application/json" hidden
          onChange={(e) => e.target.files?.[0] && importJSON(e.target.files[0])}
        />
        <Btn onClick={() => { restore(); toast.success("Datos restaurados"); }} variant="red">
          Restaurar datos iniciales
        </Btn>
      </section>

      <section className="card-surface p-4 space-y-3">
        <h3 className="font-bold">Simulación</h3>
        <Btn onClick={() => { simulateGroups(); toast.success("Fase de grupos simulada"); }} variant="green">
          Simular fase de grupos
        </Btn>
        <Btn onClick={() => { clearScores(); toast("Marcadores limpiados"); }} variant="muted">
          Limpiar marcadores
        </Btn>
        <Btn onClick={() => { clearBracket(); toast.success("Bracket limpiado"); }} variant="blue">
          Limpiar bracket
        </Btn>
      </section>

      <section className="card-surface p-4 space-y-3">
        <h3 className="font-bold accent-blue">Calendario en vivo</h3>
        <p className="text-sm text-muted-foreground">
          Actualiza las fechas y horas de los partidos en hora de Colombia (UTC-5)
          usando datos oficiales. Los marcadores y la simulación no se modifican.
        </p>
        <Btn onClick={syncFixtures} variant="blue">
          {syncing ? "Sincronizando..." : "Sincronizar calendario"}
        </Btn>
        {lastSync && (
          <p className="text-xs text-muted-foreground">Última sincronización: {lastSync}</p>
        )}
      </section>
    </div>
  );
}

function Btn({ children, onClick, variant }: { children: any; onClick: () => void; variant: "red" | "green" | "blue" | "muted" }) {
  const cls = {
    red: "bg-primary text-primary-foreground",
    green: "bg-secondary text-secondary-foreground",
    blue: "bg-accent text-accent-foreground",
    muted: "bg-muted text-foreground",
  }[variant];
  return (
    <button onClick={onClick} className={`${cls} w-full rounded-2xl py-4 font-bold active:scale-[0.98] transition-transform`}>
      {children}
    </button>
  );
}
