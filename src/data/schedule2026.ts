// Calendario oficial Copa Mundial 2026 (PDF de referencia provisto por el usuario).
// Horarios originales en COT (UTC-5), aquí convertidos a UTC sumando 5 horas.
// Solo se incluyen partidos cuyos equipos coinciden con la nómina actual de la app.

export interface FallbackFixture {
  kickoffUtc: string;
  venue: string;
  country: string;
}

// Map: venue → country (USA | México | Canadá)
const VENUE_COUNTRY: Record<string, string> = {
  "Estadio Akron, Guadalajara": "México",
  "Estadio BBVA, Monterrey": "México",
  "Estadio Azteca, CDMX": "México",
  "BMO Field, Toronto": "Canadá",
  "BC Place, Vancouver": "Canadá",
  "MetLife Stadium, Nueva Jersey": "USA",
  "SoFi Stadium, Los Ángeles": "USA",
  "AT&T Stadium, Dallas": "USA",
  "Mercedes-Benz Stadium, Atlanta": "USA",
  "Hard Rock Stadium, Miami": "USA",
  "Lincoln Financial Field, Filadelfia": "USA",
  "Lumen Field, Seattle": "USA",
  "Levi's Stadium, San Francisco": "USA",
  "Gillette Stadium, Boston": "USA",
  "NRG Stadium, Houston": "USA",
  "Arrowhead Stadium, Kansas City": "USA",
};

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

export const pairKey = (a: string, b: string) =>
  [norm(a), norm(b)].sort().join("|");

// Convert "YYYY-MM-DD" + "HH:MM" COT → UTC ISO. COT = UTC-5 → add 5h.
const cot = (date: string, time: string): string => {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(`${date}T${time}:00Z`);
  d.setUTCHours(d.getUTCHours() + 5);
  return d.toISOString();
};

const f = (
  home: string,
  away: string,
  date: string,
  time: string,
  venue: string,
): [string, FallbackFixture] => [
  pairKey(home, away),
  { kickoffUtc: cot(date, time), venue, country: VENUE_COUNTRY[venue] ?? "USA" },
];

// 42 partidos de la fase de grupos que coinciden con los equipos actuales.
const GROUP_ENTRIES: Array<[string, FallbackFixture]> = [
  // Jornada 1
  f("México", "Sudáfrica", "2026-06-11", "13:00", "Estadio Akron, Guadalajara"),
  f("Canadá", "Bosnia y Herzegovina", "2026-06-11", "15:00", "Estadio BBVA, Monterrey"),
  f("Brasil", "Marruecos", "2026-06-11", "18:00", "MetLife Stadium, Nueva Jersey"),
  f("Estados Unidos", "Paraguay", "2026-06-11", "21:00", "SoFi Stadium, Los Ángeles"),
  f("Alemania", "Curazao", "2026-06-12", "13:00", "AT&T Stadium, Dallas"),
  f("Países Bajos", "Japón", "2026-06-12", "15:00", "Mercedes-Benz Stadium, Atlanta"),
  f("Argentina", "Argelia", "2026-06-12", "18:00", "Hard Rock Stadium, Miami"),
  f("Portugal", "Colombia", "2026-06-13", "18:00", "Gillette Stadium, Boston"),
  f("Corea del Sur", "República Checa", "2026-06-14", "13:00", "Arrowhead Stadium, Kansas City"),
  f("Catar", "Suiza", "2026-06-14", "15:00", "BC Place, Vancouver"),
  f("Haití", "Escocia", "2026-06-14", "18:00", "BMO Field, Toronto"),
  f("Australia", "Turquía", "2026-06-14", "21:00", "Estadio Azteca, CDMX"),
  f("Costa de Marfil", "Ecuador", "2026-06-15", "13:00", "Estadio Akron, Guadalajara"),
  f("Suecia", "Túnez", "2026-06-15", "15:00", "Estadio BBVA, Monterrey"),
  f("Uzbekistán", "RD Congo", "2026-06-16", "15:00", "Hard Rock Stadium, Miami"),

  // Jornada 2
  f("México", "Corea del Sur", "2026-06-16", "21:00", "Lumen Field, Seattle"),
  f("Canadá", "Catar", "2026-06-16", "22:00", "Levi's Stadium, San Francisco"),
  f("Brasil", "Haití", "2026-06-17", "13:00", "Gillette Stadium, Boston"),
  f("Estados Unidos", "Australia", "2026-06-17", "15:00", "NRG Stadium, Houston"),
  f("Alemania", "Costa de Marfil", "2026-06-17", "18:00", "Arrowhead Stadium, Kansas City"),
  f("Países Bajos", "Suecia", "2026-06-17", "21:00", "BC Place, Vancouver"),
  f("Portugal", "Uzbekistán", "2026-06-18", "21:00", "MetLife Stadium, Nueva Jersey"),
  f("Sudáfrica", "República Checa", "2026-06-19", "13:00", "AT&T Stadium, Dallas"),
  f("Bosnia y Herzegovina", "Suiza", "2026-06-19", "15:00", "Mercedes-Benz Stadium, Atlanta"),
  f("Marruecos", "Escocia", "2026-06-19", "18:00", "Hard Rock Stadium, Miami"),
  f("Paraguay", "Turquía", "2026-06-19", "21:00", "Lincoln Financial Field, Filadelfia"),
  f("Curazao", "Ecuador", "2026-06-20", "13:00", "Lumen Field, Seattle"),
  f("Japón", "Túnez", "2026-06-20", "15:00", "Levi's Stadium, San Francisco"),
  f("Colombia", "RD Congo", "2026-06-21", "18:00", "BMO Field, Toronto"),

  // Jornada 3
  f("México", "República Checa", "2026-06-22", "13:00", "Estadio Akron, Guadalajara"),
  f("Canadá", "Suiza", "2026-06-22", "15:00", "Estadio BBVA, Monterrey"),
  f("Brasil", "Escocia", "2026-06-22", "18:00", "MetLife Stadium, Nueva Jersey"),
  f("Estados Unidos", "Turquía", "2026-06-22", "21:00", "SoFi Stadium, Los Ángeles"),
  f("Alemania", "Ecuador", "2026-06-23", "13:00", "AT&T Stadium, Dallas"),
  f("Países Bajos", "Túnez", "2026-06-23", "15:00", "Mercedes-Benz Stadium, Atlanta"),
  f("Portugal", "RD Congo", "2026-06-24", "18:00", "Gillette Stadium, Boston"),
  f("Sudáfrica", "Corea del Sur", "2026-06-25", "13:00", "Arrowhead Stadium, Kansas City"),
  f("Bosnia y Herzegovina", "Catar", "2026-06-25", "15:00", "BC Place, Vancouver"),
  f("Marruecos", "Haití", "2026-06-25", "18:00", "BMO Field, Toronto"),
  f("Paraguay", "Australia", "2026-06-25", "21:00", "Estadio Azteca, CDMX"),
  f("Curazao", "Costa de Marfil", "2026-06-26", "13:00", "Estadio Akron, Guadalajara"),
  f("Japón", "Suecia", "2026-06-26", "15:00", "Estadio BBVA, Monterrey"),
  f("Colombia", "Uzbekistán", "2026-06-27", "18:00", "Hard Rock Stadium, Miami"),
];

const GROUP_MAP = new Map<string, FallbackFixture>(GROUP_ENTRIES);

export function getFallbackFixture(homeName: string, awayName: string): FallbackFixture | undefined {
  return GROUP_MAP.get(pairKey(homeName, awayName));
}

// ---------- Eliminatorias (M1..M32 ↔ #73..#104) ----------
// COT → UTC sumando 5h.
const ko = (date: string, time: string, venue: string): FallbackFixture => ({
  kickoffUtc: cot(date, time),
  venue,
  country: VENUE_COUNTRY[venue] ?? "USA",
});

const KO_FIXTURES: Record<string, FallbackFixture> = {
  // Ronda de 32
  M1: ko("2026-06-28", "14:00", "Lumen Field, Seattle"),
  M2: ko("2026-06-29", "17:00", "Levi's Stadium, San Francisco"),
  M3: ko("2026-06-30", "20:00", "Gillette Stadium, Boston"),
  M4: ko("2026-07-01", "14:00", "NRG Stadium, Houston"),
  M5: ko("2026-07-02", "17:00", "Arrowhead Stadium, Kansas City"),
  M6: ko("2026-07-03", "20:00", "BC Place, Vancouver"),
  M7: ko("2026-06-28", "14:00", "BMO Field, Toronto"),
  M8: ko("2026-06-29", "17:00", "Estadio Azteca, CDMX"),
  M9: ko("2026-06-30", "20:00", "Estadio Akron, Guadalajara"),
  M10: ko("2026-07-01", "14:00", "Estadio BBVA, Monterrey"),
  M11: ko("2026-07-02", "17:00", "MetLife Stadium, Nueva Jersey"),
  M12: ko("2026-07-03", "20:00", "SoFi Stadium, Los Ángeles"),
  M13: ko("2026-06-28", "14:00", "AT&T Stadium, Dallas"),
  M14: ko("2026-06-29", "17:00", "Mercedes-Benz Stadium, Atlanta"),
  M15: ko("2026-06-30", "20:00", "Hard Rock Stadium, Miami"),
  M16: ko("2026-07-01", "14:00", "Lincoln Financial Field, Filadelfia"),
  // Octavos
  M17: ko("2026-07-04", "15:00", "Lumen Field, Seattle"),
  M18: ko("2026-07-05", "19:00", "Levi's Stadium, San Francisco"),
  M19: ko("2026-07-06", "15:00", "Gillette Stadium, Boston"),
  M20: ko("2026-07-07", "19:00", "NRG Stadium, Houston"),
  M21: ko("2026-07-04", "15:00", "Arrowhead Stadium, Kansas City"),
  M22: ko("2026-07-05", "19:00", "BC Place, Vancouver"),
  M23: ko("2026-07-06", "15:00", "BMO Field, Toronto"),
  M24: ko("2026-07-07", "19:00", "Estadio Azteca, CDMX"),
  // Cuartos
  M25: ko("2026-07-09", "15:00", "Estadio Akron, Guadalajara"),
  M26: ko("2026-07-10", "19:00", "Estadio BBVA, Monterrey"),
  M27: ko("2026-07-11", "15:00", "MetLife Stadium, Nueva Jersey"),
  M28: ko("2026-07-09", "19:00", "SoFi Stadium, Los Ángeles"),
  // Semifinales
  M29: ko("2026-07-14", "19:00", "Mercedes-Benz Stadium, Atlanta"),
  M30: ko("2026-07-15", "19:00", "AT&T Stadium, Dallas"),
  // Tercer puesto
  M31: ko("2026-07-18", "15:00", "Hard Rock Stadium, Miami"),
  // Final
  M32: ko("2026-07-19", "15:00", "MetLife Stadium, Nueva Jersey"),
};

export function getKoFixture(matchId: string): FallbackFixture | undefined {
  return KO_FIXTURES[matchId];
}
