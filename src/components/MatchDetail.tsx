import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, AlertCircle } from "lucide-react";
import {
  getMatchDetail,
  MatchDetail as Detail,
  DetailEvent,
  EventKind,
  SideRoster,
  TeamInfo,
} from "@/services/matchDetail";
import { cn } from "@/lib/utils";

const EVENT_ICON: Record<EventKind, string> = {
  goal: "⚽", penalty: "⚽", own: "⚽", yellow: "🟨", red: "🟥", sub: "🔁", var: "📺", other: "•",
};

export function MatchDetail({ eventId, onClose }: { eventId: string; onClose: () => void }) {
  const [d, setD] = useState<Detail | null>(null);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const load = async () => {
      try {
        const r = await getMatchDetail(eventId);
        if (cancelled) return;
        setD(r);
        setErr(false);
        setLoading(false);
        // Si el partido está EN VIVO, refrescamos el detalle cada minuto.
        if (r.state === "in") timer = setTimeout(load, 60_000);
      } catch {
        if (!cancelled) { setErr(true); setLoading(false); }
      }
    };
    load();
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [eventId]);

  const live = d?.state === "in";

  return createPortal(
    <div className="fixed inset-0 z-[60] flex flex-col bg-background/95 backdrop-blur-md animate-fade-up">
      {/* Barra superior */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <h2 className="text-base font-black">Detalle del partido</h2>
        <button onClick={onClose} aria-label="Cerrar" className="h-9 w-9 rounded-full bg-muted flex items-center justify-center press">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      >
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-sm font-semibold">Cargando detalle…</span>
          </div>
        )}

        {err && !loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <AlertCircle className="h-8 w-8" />
            <span className="text-sm font-semibold">No se pudo cargar el detalle.</span>
            <span className="text-xs">Revisa tu conexión e inténtalo de nuevo.</span>
          </div>
        )}

        {d && !loading && (
          <>
            {/* Marcador */}
            <div className="card-surface p-4">
              <div className="flex items-center justify-center mb-3">
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider",
                    live ? "bg-primary/15 text-primary ring-1 ring-primary/30" : "bg-muted text-foreground"
                  )}
                >
                  {live && (
                    <span className="relative inline-flex h-1.5 w-1.5 mr-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                    </span>
                  )}
                  {live && d.clock ? `${d.statusText} · ${d.clock}` : d.statusText || "Partido"}
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <TeamHead team={d.home} />
                <div className="text-3xl font-black tabular-nums text-center px-1">
                  {d.home.score ?? "-"}<span className="text-muted-foreground mx-1">-</span>{d.away.score ?? "-"}
                </div>
                <TeamHead team={d.away} />
              </div>
            </div>

            {!d.hasData && (
              <div className="card-surface p-5 text-center text-sm text-muted-foreground">
                El detalle (alineaciones, goles y estadísticas) estará disponible
                cuando el partido comience.
              </div>
            )}

            {/* Eventos */}
            {d.events.length > 0 && (
              <Section title="Goles y tarjetas">
                <div className="space-y-1.5">
                  {d.events.map((ev, i) => <EventRow key={i} ev={ev} />)}
                </div>
              </Section>
            )}

            {/* Estadísticas */}
            {d.stats.length > 0 && (
              <Section title="Estadísticas">
                <div className="space-y-2.5">
                  {d.stats.map((s, i) => <StatBar key={i} label={s.label} home={s.home} away={s.away} />)}
                </div>
              </Section>
            )}

            {/* Alineaciones */}
            {(d.rosters.home?.starters.length || d.rosters.away?.starters.length) ? (
              <Section title="Alineaciones">
                <div className="grid grid-cols-2 gap-3">
                  <Lineup team={d.home} roster={d.rosters.home} />
                  <Lineup team={d.away} roster={d.rosters.away} />
                </div>
              </Section>
            ) : null}

            {/* Info */}
            {(d.venue || d.attendance) && (
              <div className="text-center text-[11px] text-muted-foreground space-y-0.5 pt-1">
                {d.venue && <div>📍 {d.venue}</div>}
                {d.attendance ? <div>👥 {d.attendance.toLocaleString("es")} asistentes</div> : null}
              </div>
            )}
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

function TeamHead({ team }: { team: TeamInfo }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center min-w-0">
      <Logo url={team.logo} name={team.name} size={44} />
      <span className="text-xs font-bold leading-tight line-clamp-2">{team.name}</span>
    </div>
  );
}

function Logo({ url, name, size }: { url: string | null; name: string; size: number }) {
  const [broken, setBroken] = useState(false);
  if (url && !broken) {
    return (
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        onError={() => setBroken(true)}
        className="object-contain"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-muted flex items-center justify-center font-black text-muted-foreground"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {name.charAt(0) || "?"}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-surface p-4">
      <h3 className="text-sm font-black uppercase tracking-wider mb-3 accent-gold">{title}</h3>
      {children}
    </div>
  );
}

function EventRow({ ev }: { ev: DetailEvent }) {
  const right = ev.side === "away";
  return (
    <div className={cn("flex items-center gap-2 text-sm", right && "flex-row-reverse text-right")}>
      <span className="w-9 shrink-0 text-[11px] font-bold tabular-nums text-muted-foreground">{ev.minute}</span>
      <span className="text-base leading-none">{EVENT_ICON[ev.kind]}</span>
      <div className={cn("min-w-0", right && "items-end")}>
        <span className="font-bold truncate">{ev.player || "—"}</span>
        {ev.note && <span className="text-[11px] text-muted-foreground ml-1.5">{ev.note}</span>}
      </div>
    </div>
  );
}

function StatBar({ label, home, away }: { label: string; home: string; away: string }) {
  const h = parseFloat(home.replace(",", "."));
  const a = parseFloat(away.replace(",", "."));
  const numeric = Number.isFinite(h) && Number.isFinite(a) && h + a > 0;
  const hPct = numeric ? (h / (h + a)) * 100 : 50;
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-bold mb-1">
        <span className="tabular-nums">{home}</span>
        <span className="text-muted-foreground uppercase tracking-wider text-[10px]">{label}</span>
        <span className="tabular-nums">{away}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-muted">
        <div className="bg-primary" style={{ width: `${hPct}%` }} />
        <div className="bg-accent" style={{ width: `${100 - hPct}%` }} />
      </div>
    </div>
  );
}

function Lineup({ team, roster }: { team: TeamInfo; roster: SideRoster | null }) {
  if (!roster) return <div className="text-xs text-muted-foreground">Sin datos</div>;
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 mb-2">
        <Logo url={team.logo} name={team.name} size={18} />
        {roster.formation && (
          <span className="text-[10px] font-bold text-muted-foreground tabular-nums">{roster.formation}</span>
        )}
      </div>
      <ul className="space-y-1">
        {roster.starters.map((p, i) => (
          <li key={i} className="flex items-baseline gap-1.5 text-[11px] leading-tight">
            <span className="w-4 shrink-0 text-right tabular-nums text-muted-foreground">{p.jersey}</span>
            <span className="font-semibold truncate">{p.name}</span>
          </li>
        ))}
      </ul>
      {roster.subs.length > 0 && (
        <>
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-2 mb-1">Suplentes</div>
          <ul className="space-y-1">
            {roster.subs.map((p, i) => (
              <li key={i} className="flex items-baseline gap-1.5 text-[11px] leading-tight text-muted-foreground">
                <span className="w-4 shrink-0 text-right tabular-nums">{p.jersey}</span>
                <span className="truncate">{p.name}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
