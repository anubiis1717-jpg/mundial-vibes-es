import { useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { toast } from "sonner";
import { addReminder, removeReminder, isReminderOn } from "@/services/matchReminders";
import { cn } from "@/lib/utils";

export function ReminderBell({
  matchId,
  kickoffUtc,
  homeName,
  awayName,
}: {
  matchId: string;
  kickoffUtc: string | null;
  homeName: string;
  awayName: string;
}) {
  const [on, setOn] = useState(() => isReminderOn(matchId));
  const [busy, setBusy] = useState(false);

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      if (on) {
        await removeReminder(matchId);
        setOn(false);
        toast("Recordatorio quitado");
      } else {
        const ok = await addReminder({
          matchId,
          kickoffUtc,
          title: `⚽ ${homeName} vs ${awayName}`,
          body: "Empieza en 15 minutos",
        });
        if (ok) {
          setOn(true);
          toast.success("Te avisaremos 15 min antes del partido");
        } else {
          toast.error("Activa las notificaciones para recibir recordatorios");
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={on ? "Quitar recordatorio" : "Recordarme este partido"}
      className={cn(
        "h-8 w-8 rounded-full flex items-center justify-center press transition-colors shrink-0",
        on ? "bg-accent/20 text-accent ring-1 ring-accent/40" : "bg-muted text-muted-foreground"
      )}
    >
      {on ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
    </button>
  );
}
