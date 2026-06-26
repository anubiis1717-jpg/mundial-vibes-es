import { useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { toast } from "sonner";
import { addReminder, removeReminder, isReminderOn } from "@/services/matchReminders";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

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
  const { t } = useI18n();
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
        toast(t("reminder.removed"));
      } else {
        const ok = await addReminder({
          matchId,
          kickoffUtc,
          title: `⚽ ${homeName} vs ${awayName}`,
          body: t("reminder.startsIn15"),
        });
        if (ok) {
          setOn(true);
          toast.success(t("reminder.willNotify"));
        } else {
          toast.error(t("reminder.enableNotifs"));
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={on ? t("reminder.ariaRemove") : t("reminder.ariaAdd")}
      className={cn(
        "h-8 w-8 rounded-full flex items-center justify-center press transition-colors shrink-0",
        on ? "bg-accent/20 text-accent ring-1 ring-accent/40" : "bg-muted text-muted-foreground"
      )}
    >
      {on ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
    </button>
  );
}
