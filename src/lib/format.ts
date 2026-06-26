// Formats an ISO date string in the user's local timezone (auto-detected).
import { getLang, tr } from "@/i18n";

const DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const DAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatLocalDateParts(iso: string | null): { date: string; time: string } | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const en = getLang() === "en";
  const days = en ? DAYS_EN : DAYS_ES;
  const months = en ? MONTHS_EN : MONTHS_ES;
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return { date: `${days[d.getDay()]} ${dd} ${months[d.getMonth()]}`, time: `${hh}:${mm}` };
}

export function formatLocalDateTime(iso: string | null): string {
  const p = formatLocalDateParts(iso);
  if (!p) return tr("fmt.tbc");
  return `${p.date}, ${p.time}`;
}

// Back-compat alias
export const formatColombiaDate = formatLocalDateTime;
