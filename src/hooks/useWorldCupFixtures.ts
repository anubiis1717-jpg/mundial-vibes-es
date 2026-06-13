import { useEffect, useMemo, useRef, useState } from "react";
import { TsdbFixture } from "@/services/theSportsDb";
import { getFixtures } from "@/services/espn";
import { useTournament, teamById } from "@/store/useTournament";
import { getFallbackFixture } from "@/data/schedule2026";

const REFRESH_MS = 15 * 60 * 1000;
// Con partido en vivo, refrescar rápido para el marcador al minuto.
const LIVE_REFRESH_MS = 90 * 1000;

// English (ESPN/TheSportsDB) → local Spanish names
const NAME_ALIASES: Record<string, string> = {
  "south korea": "corea del sur", "korea republic": "corea del sur",
  "czech republic": "república checa", "czechia": "república checa",
  "bosnia and herzegovina": "bosnia y herzegovina",
  "bosnia-herzegovina": "bosnia y herzegovina",
  "turkiye": "turquía",
  "qatar": "catar", "morocco": "marruecos", "haiti": "haití",
  "scotland": "escocia", "usa": "estados unidos", "united states": "estados unidos",
  "turkey": "turquía", "türkiye": "turquía", "germany": "alemania",
  "curacao": "curazao", "curaçao": "curazao",
  "ivory coast": "costa de marfil", "cote d'ivoire": "costa de marfil",
  "netherlands": "países bajos", "japan": "japón", "sweden": "suecia",
  "tunisia": "túnez", "belgium": "bélgica", "egypt": "egipto",
  "iran": "irán", "new zealand": "nueva zelanda", "spain": "españa",
  "cape verde": "cabo verde", "saudi arabia": "arabia saudita",
  "france": "francia", "senegal": "senegal", "iraq": "irak", "norway": "noruega",
  "algeria": "argelia", "austria": "austria", "jordan": "jordania",
  "portugal": "portugal", "dr congo": "rd congo", "congo dr": "rd congo",
  "uzbekistan": "uzbekistán", "england": "inglaterra", "croatia": "croacia",
  "ghana": "ghana", "panama": "panamá", "mexico": "méxico",
  "south africa": "sudáfrica", "canada": "canadá", "brazil": "brasil",
  "switzerland": "suiza",
};

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

// Reordena un fixture cuando la API lista local/visitante al revés del calendario local.
const oriented = (f: TsdbFixture, reversed: boolean): TsdbFixture =>
  !reversed
    ? f
    : {
        ...f,
        homeTeam: f.awayTeam,
        awayTeam: f.homeTeam,
        homeBadge: f.awayBadge,
        awayBadge: f.homeBadge,
        homeScore: f.awayScore,
        awayScore: f.homeScore,
      };

export function useWorldCupFixtures() {
  const { data, setMatch } = useTournament();
  const [fixtures, setFixtures] = useState<TsdbFixture[]>([]);
  const retries = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const schedule = (hasLive: boolean) => {
      if (cancelled) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => load(true), hasLive ? LIVE_REFRESH_MS : REFRESH_MS);
    };

    const load = async (force = false) => {
      const result = await getFixtures(force);
      if (cancelled) return;
      if (result.length > 0) {
        setFixtures(result);
        retries.current = 0;
        schedule(result.some((f) => f.status === "LIVE"));
      } else if (retries.current < 3) {
        retries.current++;
        timer = setTimeout(() => load(true), 60_000);
      } else {
        schedule(false);
      }
    };

    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // Build map: local matchId -> fixture
  const byMatchId = useMemo(() => {
    const teamNameToId = new Map<string, string>();
    data.teams.forEach((t) => teamNameToId.set(norm(t.name), t.id));

    const resolveLocalId = (tsdbName: string): string | undefined => {
      const n = norm(tsdbName);
      if (teamNameToId.has(n)) return teamNameToId.get(n);
      const alias = NAME_ALIASES[n];
      if (alias && teamNameToId.has(norm(alias))) return teamNameToId.get(norm(alias));
      return undefined;
    };

    const map = new Map<string, TsdbFixture>();
    for (const f of fixtures) {
      const hId = resolveLocalId(f.homeTeam);
      const aId = resolveLocalId(f.awayTeam);
      if (!hId || !aId) continue;
      const match = data.matches.find(
        (m) =>
          (m.homeId === hId && m.awayId === aId) ||
          (m.homeId === aId && m.awayId === hId),
      );
      if (match) map.set(match.id, oriented(f, match.homeId !== hId));
    }
    // Fallback: para cada partido sin datos de TSDB, busca en el calendario PDF.
    for (const m of data.matches) {
      if (map.has(m.id)) continue;
      const home = teamById(data, m.homeId);
      const away = teamById(data, m.awayId);
      if (!home || !away) continue;
      const fb = getFallbackFixture(home.name, away.name);
      if (!fb) continue;
      map.set(m.id, {
        id: `fallback-${m.id}`,
        homeTeam: home.name,
        awayTeam: away.name,
        homeBadge: null,
        awayBadge: null,
        venue: fb.venue,
        country: fb.country,
        kickoffUtc: fb.kickoffUtc,
        status: "NS",
        homeScore: null,
        awayScore: null,
        round: null,
      });
    }
    return map;
  }, [fixtures, data]);

  // Sincroniza resultados FINALES de la API hacia el almacén local:
  // así las tablas, estadísticas y clasificados se actualizan solos.
  useEffect(() => {
    byMatchId.forEach((fx, matchId) => {
      if (fx.status !== "FT" || fx.homeScore === null || fx.awayScore === null) return;
      if (fx.id.startsWith("fallback-")) return;
      const m = data.matches.find((x) => x.id === matchId);
      if (!m) return;
      if (m.homeScore === fx.homeScore && m.awayScore === fx.awayScore) return;
      setMatch(matchId, { homeScore: fx.homeScore, awayScore: fx.awayScore });
    });
  }, [byMatchId, data.matches, setMatch]);

  return { fixtures, byMatchId };
}
