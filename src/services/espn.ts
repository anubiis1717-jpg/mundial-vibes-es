// ESPN scoreboard client for FIFA World Cup 2026 — fuente principal.
// API pública sin clave, con marcadores en vivo al minuto.
// TheSportsDB queda como respaldo automático si ESPN falla.

import {
  TsdbFixture,
  FixtureStatus,
  getWorldCupFixtures as getTsdbFixtures,
} from "./theSportsDb";

const URL =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260601-20260801&limit=200";
const CACHE_KEY = "espn.fixtures.wc2026";
// TTL corto: durante partidos en vivo el marcador cambia minuto a minuto.
const TTL_MS = 60 * 1000;

interface CacheEntry { ts: number; data: TsdbFixture[] }

function readCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CacheEntry) : null;
  } catch { return null; }
}

function writeCache(data: TsdbFixture[]) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch {}
}

function mapStatus(state?: string): FixtureStatus {
  if (state === "in") return "LIVE";
  if (state === "post") return "FT";
  return "NS";
}

function mapEvent(ev: any): TsdbFixture | null {
  const comp = ev?.competitions?.[0];
  if (!comp) return null;
  const home = comp.competitors?.find((c: any) => c.homeAway === "home");
  const away = comp.competitors?.find((c: any) => c.homeAway === "away");
  if (!home?.team || !away?.team) return null;
  const finishedOrLive = ev.status?.type?.state === "in" || ev.status?.type?.state === "post";
  return {
    id: String(ev.id),
    homeTeam: home.team.displayName ?? "",
    awayTeam: away.team.displayName ?? "",
    homeBadge: home.team.logo ?? null,
    awayBadge: away.team.logo ?? null,
    venue: comp.venue?.fullName ?? null,
    country: comp.venue?.address?.country ?? comp.venue?.address?.city ?? null,
    kickoffUtc: ev.date ? new Date(ev.date).toISOString() : null,
    status: mapStatus(ev.status?.type?.state),
    homeScore: finishedOrLive && home.score != null ? Number(home.score) : null,
    awayScore: finishedOrLive && away.score != null ? Number(away.score) : null,
    round: comp.notes?.[0]?.headline ?? null,
    // Reloj solo cuando el partido está EN VIVO (ej. "67'"); en "post"/"pre" no aplica.
    clock: ev.status?.type?.state === "in" && ev.status?.displayClock ? String(ev.status.displayClock) : null,
    period: ev.status?.period != null ? Number(ev.status.period) : null,
  };
}

export async function getFixtures(force = false): Promise<TsdbFixture[]> {
  const cached = readCache();
  if (!force && cached && Date.now() - cached.ts < TTL_MS) return cached.data;
  try {
    const res = await fetch(URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const mapped: TsdbFixture[] = (json?.events ?? [])
      .map(mapEvent)
      .filter(Boolean) as TsdbFixture[];
    if (mapped.length === 0) throw new Error("ESPN sin eventos");
    // eslint-disable-next-line no-console
    console.info(`[ESPN] World Cup 2026 fixtures: total=${mapped.length}`);
    writeCache(mapped);
    return mapped;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[ESPN] Falló, usando respaldo TheSportsDB:", e);
    const fallback = await getTsdbFixtures(force);
    if (fallback.length > 0) return fallback;
    return cached?.data ?? [];
  }
}
