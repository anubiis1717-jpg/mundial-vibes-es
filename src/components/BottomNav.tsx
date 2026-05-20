import { Home, Users, CalendarDays, Trophy, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export type Section = "inicio" | "grupos" | "partidos" | "bracket" | "stats" | "ajustes";

const items: { id: Section; label: string; icon: any }[] = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "grupos", label: "Grupos", icon: Users },
  { id: "partidos", label: "Partidos", icon: CalendarDays },
  { id: "bracket", label: "Bracket", icon: Trophy },
  { id: "stats", label: "Stats", icon: BarChart3 },
  { id: "ajustes", label: "Ajustes", icon: Settings },
];

export function BottomNav({ value, onChange }: { value: Section; onChange: (s: Section) => void }) {
  return (
    <nav className="fixed bottom-3 inset-x-3 z-50 pb-[env(safe-area-inset-bottom)] max-w-xl md:mx-auto">
      <div className="absolute inset-0 rounded-2xl bg-background/30 backdrop-blur-2xl border border-white/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]" />
      <ul className="relative grid grid-cols-6 rounded-2xl overflow-hidden">
        {items.map(({ id, label, icon: Icon }) => {
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
