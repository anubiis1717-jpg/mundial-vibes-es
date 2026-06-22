// Líderes del Mundial 2026 (goleadores y asistencias) — fuente ESPN core API.
// El endpoint de "leaders" da el ranking por categoría, pero el jugador y el
// equipo vienen como referencias ($ref) que hay que resolver con una llamada
// extra. En el teléfono usamos CapacitorHttp (nativo) para evitar bloqueos de
// CORS; en la web usamos fetch normal.

import { Capacitor, CapacitorHttp } from "@capacitor/core";

const LEADERS_URL =
  "https://sports.core.api.espn.com/v2/sports/soccer/leagues/fifa.world/seasons/2026/types/1/leaders";
const TTL_MS = 10 * 60 * 1000; // 10 min: el ranking no cambia minuto a minuto.
const MAX_ROWS = 20;

export type LeaderKind = "goals" | "assists";

export interface LeaderRow {
  rank: number;
  name: string;
  value: number; // goles o asistencias según la categoría
  matches: number | null;
  teamName: string;
  teamLogo: string | null;
  photo: string | null;
}

const CATEGORY: Record<LeaderKind, string> = {
  goals: "goalsLeaders",
  assists: "assistsLeaders",
};

interface CacheEntry { ts: number; data: LeaderRow[] }

function readCache(kind: LeaderKind): CacheEntry | null {
  try {
    const raw = localStorage.getItem(`espn.leaders.${kind}.wc2026`);
    return raw ? (JSON.parse(raw) as CacheEntry) : null;
  } catch { return null; }
}

function writeCache(kind: LeaderKind, data: LeaderRow[]) {
  try { localStorage.setItem(`espn.leaders.${kind}.wc2026`, JSON.stringify({ ts: Date.now(), data })); } catch {}
}

// ESPN devuelve sus referencias ($ref) y a veces fotos/escudos como "http://".
// Android bloquea el tráfico en claro por defecto, así que en el teléfono esas
// llamadas/imágenes fallan (nombres y fotos salían vacíos). Forzamos "https://"
// —el mismo contenido se sirve por HTTPS— para que cargue también en nativo.
const toHttps = (url: string | null | undefined): string | null =>
  url ? url.replace(/^http:\/\//i, "https://") : null;

// GET JSON que funciona en nativo (sin CORS) y en web.
async function getJson(rawUrl: string): Promise<any> {
  const url = toHttps(rawUrl)!;
  if (Capacitor.isNativePlatform()) {
    const res = await CapacitorHttp.get({ url, headers: { Accept: "application/json" } });
    if (res.status >= 400) throw new Error(`HTTP ${res.status}`);
    return typeof res.data === "string" ? JSON.parse(res.data) : res.data;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Nombres de país EN→ES para los participantes del Mundial (acabado en español).
const COUNTRY_ES: Record<string, string> = {
  "South Korea": "Corea del Sur", "Korea Republic": "Corea del Sur",
  "Czechia": "Chequia", "Czech Republic": "Chequia",
  "Bosnia-Herzegovina": "Bosnia y Herzegovina", "Bosnia and Herzegovina": "Bosnia y Herzegovina",
  "Qatar": "Catar", "Morocco": "Marruecos", "Haiti": "Haití", "Scotland": "Escocia",
  "USA": "Estados Unidos", "United States": "Estados Unidos", "Turkey": "Turquía", "Türkiye": "Turquía",
  "Germany": "Alemania", "Curacao": "Curazao", "Curaçao": "Curazao", "Ivory Coast": "Costa de Marfil",
  "Netherlands": "Países Bajos", "Japan": "Japón", "Sweden": "Suecia", "Tunisia": "Túnez",
  "Belgium": "Bélgica", "Egypt": "Egipto", "Iran": "Irán", "New Zealand": "Nueva Zelanda",
  "Spain": "España", "Cape Verde": "Cabo Verde", "Saudi Arabia": "Arabia Saudita", "France": "Francia",
  "Senegal": "Senegal", "Iraq": "Irak", "Norway": "Noruega", "Algeria": "Argelia", "Austria": "Austria",
  "Jordan": "Jordania", "Portugal": "Portugal", "DR Congo": "RD Congo", "Uzbekistan": "Uzbekistán",
  "England": "Inglaterra", "Croatia": "Croacia", "Ghana": "Ghana", "Panama": "Panamá", "Mexico": "México",
  "South Africa": "Sudáfrica", "Canada": "Canadá", "Brazil": "Brasil", "Switzerland": "Suiza",
  "Colombia": "Colombia", "Argentina": "Argentina", "Uruguay": "Uruguay", "Paraguay": "Paraguay",
  "Ecuador": "Ecuador", "Italy": "Italia", "Poland": "Polonia", "Denmark": "Dinamarca",
  "Australia": "Australia", "Nigeria": "Nigeria", "Cameroon": "Camerún",
};
const toEs = (name: string) => COUNTRY_ES[name] ?? name;

// El value de ESPN es float (ej 3.0); lo redondeamos a entero.
function valueOf(leader: any): number {
  const v = Number(leader?.value);
  return Number.isFinite(v) ? Math.round(v) : 0;
}

// Saca "Matches: 2" del displayValue cuando exista.
function matchesOf(leader: any): number | null {
  const m = /Matches:\s*(\d+)/i.exec(String(leader?.displayValue ?? ""));
  return m ? Number(m[1]) : null;
}

export async function getLeaders(kind: LeaderKind, force = false): Promise<LeaderRow[]> {
  const cached = readCache(kind);
  if (!force && cached && Date.now() - cached.ts < TTL_MS) return cached.data;
  try {
    const root = await getJson(LEADERS_URL);
    const categories: any[] = root?.categories ?? [];
    const cat = categories.find((c) => c?.name === CATEGORY[kind]);
    const leaders: any[] = (cat?.leaders ?? []).slice(0, MAX_ROWS);
    if (leaders.length === 0) throw new Error(`ESPN sin ${kind}`);

    // Resuelve jugador y equipo de cada líder en paralelo. Los equipos se cachean
    // por URL para no repetir descargas (varios jugadores del mismo país).
    const teamCache = new Map<string, Promise<any>>();
    const teamRef = (url: string) => {
      if (!teamCache.has(url)) teamCache.set(url, getJson(url).catch(() => null));
      return teamCache.get(url)!;
    };

    const resolved = await Promise.all(
      leaders.map(async (ld) => {
        const [ath, team] = await Promise.all([
          ld?.athlete?.$ref ? getJson(ld.athlete.$ref).catch(() => null) : null,
          ld?.team?.$ref ? teamRef(ld.team.$ref) : null,
        ]);
        const teamName = team?.displayName ? toEs(team.displayName) : "";
        const teamLogo = toHttps(team?.logos?.[0]?.href);
        const name: string = ath?.displayName ?? ath?.fullName ?? "—";
        const photo: string | null = toHttps(ath?.headshot?.href);
        return { name, value: valueOf(ld), matches: matchesOf(ld), teamName, teamLogo, photo };
      }),
    );

    const data: LeaderRow[] = resolved
      .filter((r) => r.value > 0)
      .map((r, i) => ({ rank: i + 1, ...r }));

    if (data.length === 0) throw new Error(`ESPN ${kind} vacío`);
    // eslint-disable-next-line no-console
    console.info(`[ESPN] ${kind} Mundial 2026: ${data.length}`);
    writeCache(kind, data);
    return data;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`[ESPN] Falló ${kind}, usando caché si existe:`, e);
    return cached?.data ?? [];
  }
}

export const getTopScorers = (force = false) => getLeaders("goals", force);
export const getTopAssists = (force = false) => getLeaders("assists", force);
