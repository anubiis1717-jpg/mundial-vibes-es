import { Home, Users, CalendarDays, Trophy, BarChart3, Settings, Shirt } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

export type Section = "inicio" | "grupos" | "partidos" | "bracket" | "plantillas" | "stats" | "ajustes";

const items: { id: Section; labelKey: string; icon: any }[] = [
  { id: "inicio", labelKey: "nav.inicio", icon: Home },
  { id: "grupos", labelKey: "nav.grupos", icon: Users },
  { id: "partidos", labelKey: "nav.partidos", icon: CalendarDays },
  { id: "bracket", labelKey: "nav.bracket", icon: Trophy },
  { id: "plantillas", labelKey: "nav.plantillas", icon: Shirt },
  { id: "stats", labelKey: "nav.stats", icon: BarChart3 },
  { id: "ajustes", labelKey: "nav.ajustes", icon: Settings },
];

export function BottomNav({ value, onChange }: { value: Section; onChange: (s: Section) => void }) {
  const { t } = useI18n();
  return (
    <nav className="fixed bottom-3 inset-x-3 z-50 pb-[env(safe-area-inset-bottom)] max-w-xl md:mx-auto">
      <div className="absolute inset-0 rounded-2xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.45)]" style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(22px) saturate(160%)", WebkitBackdropFilter: "blur(22px) saturate(160%)" }} />
      <ul className="relative grid grid-cols-7 rounded-2xl overflow-hidden">
        {items.map(({ id, labelKey, icon: Icon }) => {
          const label = t(labelKey);
          const active = value === id;
          return (
            <li key={id} className="relative">
              <button
                onClick={() => onChange(id)}
                className={cn(
                  "w-full flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-bold transition-all press",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {active && (
                  <span className="absolute -top-px left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-gradient-to-r from-primary via-[hsl(var(--primary-glow))] to-primary shadow-glow" />
                )}
                <Icon className={cn("h-5 w-5 transition-transform", active && "scale-110 drop-shadow-[0_0_10px_hsl(var(--primary))]")} />
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
