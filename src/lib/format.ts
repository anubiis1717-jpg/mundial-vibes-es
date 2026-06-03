// Formats an ISO date string in the user's local timezone (auto-detected).
const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function formatLocalDateParts(iso: string | null): { date: string; time: string } | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return { date: `${DAYS[d.getDay()]} ${dd} ${MONTHS[d.getMonth()]}`, time: `${hh}:${mm}` };
}

export function formatLocalDateTime(iso: string | null): string {
  const p = formatLocalDateParts(iso);
  if (!p) return "Por confirmar";
  return `${p.date}, ${p.time}`;
}

// Back-compat alias
export const formatColombiaDate = formatLocalDateTime;
