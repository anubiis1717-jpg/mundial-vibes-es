import { useTournament } from "@/store/useTournament";
import { toast } from "sonner";

export function Ajustes() {
  const { restore, clearBracket, simulateGroups, clearScores } = useTournament();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black">Ajustes</h2>

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
        <Btn onClick={() => { restore(); toast.success("Datos restaurados"); }} variant="red">
          Restaurar datos iniciales
        </Btn>
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
