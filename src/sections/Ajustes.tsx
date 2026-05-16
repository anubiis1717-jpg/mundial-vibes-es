import { useRef } from "react";
import { useTournament } from "@/store/useTournament";
import { toast } from "sonner";

export function Ajustes() {
  const { data, setData, restore, simulateGroups, clearScores } = useTournament();
  const fileRef = useRef<HTMLInputElement>(null);

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
      </section>

      <section className="card-surface p-4">
        <h3 className="font-bold accent-blue mb-2">Conexión futura</h3>
        <p className="text-sm text-muted-foreground">
          La conexión con resultados en tiempo real se agregará más adelante. Por ahora, la app
          funciona 100% sin internet con los datos locales.
        </p>
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
