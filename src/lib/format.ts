// Date strings are stored as ISO without timezone, representing Colombia local time (UTC-5).
export function formatColombiaDate(iso: string | null): string {
  if (!iso) return "Por confirmar";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Por confirmar";
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${days[d.getDay()]} ${dd} ${months[d.getMonth()]} · ${hh}:${mm} COL`;
}
