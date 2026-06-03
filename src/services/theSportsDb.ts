// TheSportsDB client for FIFA World Cup 2026 (League 4429, Season 2026).
// Public free key "3" — safe to ship in the client.

const BASE = "https://www.thesportsdb.com/api/v1/json/3";
const LEAGUE_ID = "4429";
const SEASON = "2026";
const CACHE_KEY = `tsdb.fixtures.${LEAGUE_ID}.${SEASON}`;
const TEAMS_CACHE_KEY = `tsdb.teams.${LEAGUE_ID}`;
const TTL_MS = 15 * 60 * 1000;

export type FixtureStatus = "NS" | "LIVE" | "FT";

export interface TsdbFixture {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeBadge: string | null;
  awayBadge: string | null;
  venue: string | null;
  country: string | null;
  kickoffUtc: string | null;
  status: FixtureStatus;
  homeScore: number | null;
  awayScore: number | null;
  round: string | null;
}

interface RawEvent {
  idEvent: string;
  strEvent?: string;
  strHomeTeam?: string;
  strAwayTeam?: string;
  strHomeTeamBadge?: string | null;
  strAwayTeamBadge?: string | null;
  strVenue?: string | null;
  strCountry?: string | null;
  strTimestamp?: string | null;
  dateEvent?: string | null;
  dateEventLocal?: string | null;
  strTime?: string | null;
  strTimeLocal?: string | null;
  strStatus?: string | null;
  intHomeScore?: string | null;
  intAwayScore?: string | null;
  strRound?: string | null;
}

interface CacheEntry<T> { ts: number; data: T }

function readCache<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry<T>;
  } catch { return null; }
}

function writeCache<T>(key: string, data: T) {
  try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); } catch {}
}

function normalizeStatus(s?: string | null): FixtureStatus {
  if (!s) return "NS";
  const u = s.toUpperCase();
  if (u.includes("FT") || u.includes("MATCH FINISHED") || u.includes("FINISHED")) return "FT";
  if (u === "NS" || u.includes("NOT STARTED") || u === "" || u === "TBD") return "NS";
  return "LIVE";
}

function toIsoUtc(ev: RawEvent): string | null {
  // 1) strTimestamp from TSDB is "YYYY-MM-DD HH:MM:SS" in UTC.
  if (ev.strTimestamp && ev.strTimestamp.trim() !== "") {
    let s = ev.strTimestamp.trim().replace(" ", "T");
    if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(s)) s += "Z";
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  // 2) Fallback: dateEvent + strTime (UTC).
  if (ev.dateEvent && ev.dateEvent.trim() !== "") {
    let time = (ev.strTime && ev.strTime.trim() !== "") ? ev.strTime.trim() : "00:00:00";
    // strip trailing tz markers, normalize to HH:MM:SS
    time = time.replace(/[zZ]$/, "").replace(/[+-]\d{2}:?\d{2}$/, "");
    if (/^\d{2}:\d{2}$/.test(time)) time += ":00";
    const d = new Date(`${ev.dateEvent.trim()}T${time}Z`);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  // 3) Last resort: dateEventLocal + strTimeLocal (assume local browser tz).
  if (ev.dateEventLocal && ev.dateEventLocal.trim() !== "") {
    let time = (ev.strTimeLocal && ev.strTimeLocal.trim() !== "") ? ev.strTimeLocal.trim() : "00:00:00";
    if (/^\d{2}:\d{2}$/.test(time)) time += ":00";
    const d = new Date(`${ev.dateEventLocal.trim()}T${time}`);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return null;
}

function mapEvent(ev: RawEvent): TsdbFixture {
  return {
    id: ev.idEvent,
    homeTeam: ev.strHomeTeam ?? "",
    awayTeam: ev.strAwayTeam ?? "",
    homeBadge: ev.strHomeTeamBadge ?? null,
    awayBadge: ev.strAwayTeamBadge ?? null,
    venue: ev.strVenue ?? null,
    country: ev.strCountry ?? null,
    kickoffUtc: toIsoUtc(ev),
    status: normalizeStatus(ev.strStatus),
    homeScore: ev.intHomeScore != null && ev.intHomeScore !== "" ? Number(ev.intHomeScore) : null,
    awayScore: ev.intAwayScore != null && ev.intAwayScore !== "" ? Number(ev.intAwayScore) : null,
    round: ev.strRound ?? null,
  };
}

export async function getWorldCupFixtures(force = false): Promise<TsdbFixture[]> {
  const cached = readCache<TsdbFixture[]>(CACHE_KEY);
  if (!force && cached && Date.now() - cached.ts < TTL_MS) return cached.data;
  try {
    const url = `${BASE}/eventsseason.php?id=${LEAGUE_ID}&s=${SEASON}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const events: RawEvent[] = json?.events ?? [];
    const mapped = events.map(mapEvent);
    const withDate = mapped.filter((m) => m.kickoffUtc).length;
    const missing = mapped.filter((m) => !m.kickoffUtc);
    // eslint-disable-next-line no-console
    console.info(
      `[TSDB] World Cup 2026 fixtures: total=${mapped.length}, withDate=${withDate}, missingDate=${missing.length}`,
    );
    if (missing.length > 0) {
      // eslint-disable-next-line no-console
      console.warn(
        "[TSDB] Fixtures without date/time:",
        missing.map((m) => `${m.id} ${m.homeTeam} vs ${m.awayTeam} (${m.round ?? "?"})`),
      );
    }
    writeCache(CACHE_KEY, mapped);
    return mapped;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[TSDB] Error fetching fixtures:", e);
    if (cached) return cached.data;
    return [];
  }
}

export async function getMatchById(id: string): Promise<TsdbFixture | null> {
  try {
    const res = await fetch(`${BASE}/lookupevent.php?id=${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    const json = await res.json();
    const ev: RawEvent | undefined = json?.events?.[0];
    return ev ? mapEvent(ev) : null;
  } catch { return null; }
}

export const getMatchDetails = getMatchById;

export async function getTeams(): Promise<Array<{ id: string; name: string; badge: string | null }>> {
  const cached = readCache<Array<{ id: string; name: string; badge: string | null }>>(TEAMS_CACHE_KEY);
  if (cached && Date.now() - cached.ts < TTL_MS) return cached.data;
  try {
    const res = await fetch(`${BASE}/lookup_all_teams.php?id=${LEAGUE_ID}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const teams = (json?.teams ?? []).map((t: any) => ({
      id: t.idTeam, name: t.strTeam, badge: t.strTeamBadge ?? null,
    }));
    writeCache(TEAMS_CACHE_KEY, teams);
    return teams;
  } catch {
    return cached?.data ?? [];
  }
}
