import { useTournament } from "@/store/useTournament";
import { toast } from "sonner";
import { useI18n, type Lang } from "@/i18n";
import { cn } from "@/lib/utils";

export function Ajustes() {
  const { restore, clearBracket, simulateGroups, clearScores } = useTournament();
  const { t, lang, setLang } = useI18n();

  const langs: { id: Lang; label: string }[] = [
    { id: "es", label: "Español" },
    { id: "en", label: "English" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black">{t("settings.title")}</h2>

      <section className="card-surface p-4 space-y-3">
        <h3 className="font-bold">{t("settings.language")}</h3>
        <div className="flex gap-2">
          {langs.map((l) => (
            <button
              key={l.id}
              onClick={() => setLang(l.id)}
              className={cn(
                "flex-1 rounded-2xl py-3 font-bold border transition-all press",
                lang === l.id
                  ? "bg-accent text-accent-foreground border-accent/40 shadow-glow"
                  : "bg-card text-foreground border-white/10 hover:border-white/25"
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      </section>

      <section className="card-surface p-4 space-y-3">
        <h3 className="font-bold">{t("settings.simulation")}</h3>
        <Btn onClick={() => { simulateGroups(); toast.success(t("toast.simGroups")); }} variant="green">
          {t("settings.simGroups")}
        </Btn>
        <Btn onClick={() => { clearScores(); toast(t("toast.clearScores")); }} variant="muted">
          {t("settings.clearScores")}
        </Btn>
        <Btn onClick={() => { clearBracket(); toast.success(t("toast.clearBracket")); }} variant="blue">
          {t("settings.clearBracket")}
        </Btn>
        <Btn onClick={() => { restore(); toast.success(t("toast.restore")); }} variant="red">
          {t("settings.restore")}
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
