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
  strTime?: string | null;
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
  if (ev.strTimestamp) {
    const d = new Date(ev.strTimestamp.includes("Z") ? ev.strTimestamp : ev.strTimestamp + "Z");
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  if (ev.dateEvent) {
    const t = ev.strTime || "00:00:00";
    const d = new Date(`${ev.dateEvent}T${t}Z`);
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
    const res = await fetch(`${BASE}/eventsseason.php?id=${LEAGUE_ID}&s=${SEASON}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const events: RawEvent[] = json?.events ?? [];
    const mapped = events.map(mapEvent);
    writeCache(CACHE_KEY, mapped);
    return mapped;
  } catch (e) {
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
