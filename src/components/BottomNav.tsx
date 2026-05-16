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
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-6 max-w-xl mx-auto">
        {items.map(({ id, label, icon: Icon }) => {
          const active = value === id;
          return (
            <li key={id}>
              <button
                onClick={() => onChange(id)}
                className={cn(
                  "w-full flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_8px_hsl(var(--primary))]")} />
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
