// Goleadores del Mundial 2026 — fuente ESPN core API (en vivo, sin clave).
// El endpoint de "leaders" da goles por jugador, pero el jugador y el equipo
// vienen como referencias ($ref) que hay que resolver con una llamada extra.
// En el teléfono usamos CapacitorHttp (nativo) para evitar bloqueos de CORS;
// en la web usamos fetch normal.

import { Capacitor, CapacitorHttp } from "@capacitor/core";

const LEADERS_URL =
  "https://sports.core.api.espn.com/v2/sports/soccer/leagues/fifa.world/seasons/2026/types/1/leaders";
const CACHE_KEY = "espn.scorers.wc2026";
const TTL_MS = 10 * 60 * 1000; // 10 min: la tabla de goleadores no cambia minuto a minuto.
const MAX_SCORERS = 20;

export interface TopScorer {
  rank: number;
  name: string;
  goals: number;
  matches: number | null;
  teamName: string;
  teamLogo: string | null;
  photo: string | null;
}

interface CacheEntry { ts: number; data: TopScorer[] }

function readCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CacheEntry) : null;
  } catch { return null; }
}

function writeCache(data: TopScorer[]) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch {}
}

// GET JSON que funciona en nativo (sin CORS) y en web.
async function getJson(url: string): Promise<any> {
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

// Extrae el número de goles de un leader (value es float, ej 3.0).
function goalsOf(leader: any): number {
  const v = Number(leader?.value);
  return Number.isFinite(v) ? Math.round(v) : 0;
}

// Saca "Matches: 2" del displayValue cuando exista.
function matchesOf(leader: any): number | null {
  const m = /Matches:\s*(\d+)/i.exec(String(leader?.displayValue ?? ""));
  return m ? Number(m[1]) : null;
}

export async function getTopScorers(force = false): Promise<TopScorer[]> {
  const cached = readCache();
  if (!force && cached && Date.now() - cached.ts < TTL_MS) return cached.data;
  try {
    const root = await getJson(LEADERS_URL);
    const categories: any[] = root?.categories ?? [];
    const cat = categories.find((c) => c?.name === "goalsLeaders") ?? categories[0];
    const leaders: any[] = (cat?.leaders ?? []).slice(0, MAX_SCORERS);
    if (leaders.length === 0) throw new Error("ESPN sin goleadores");

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
        const teamLogo = team?.logos?.[0]?.href ?? null;
        const name: string = ath?.displayName ?? ath?.fullName ?? "—";
        const photo: string | null = ath?.headshot?.href ?? null;
        return { name, goals: goalsOf(ld), matches: matchesOf(ld), teamName, teamLogo, photo };
      }),
    );

    const data: TopScorer[] = resolved
      .filter((r) => r.goals > 0)
      .map((r, i) => ({ rank: i + 1, ...r }));

    if (data.length === 0) throw new Error("ESPN goleadores vacíos");
    // eslint-disable-next-line no-console
    console.info(`[ESPN] goleadores Mundial 2026: ${data.length}`);
    writeCache(data);
    return data;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[ESPN] Falló goleadores, usando caché si existe:", e);
    return cached?.data ?? [];
  }
}
