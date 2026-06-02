// Formats an ISO date string in the user's local timezone (auto-detected).
const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function formatLocalDateTime(iso: string | null): string {
  if (!iso) return "Por confirmar";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Por confirmar";
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${DAYS[d.getDay()]} ${dd} ${MONTHS[d.getMonth()]} · ${hh}:${mm}`;
}

// Back-compat alias
export const formatColombiaDate = formatLocalDateTime;
