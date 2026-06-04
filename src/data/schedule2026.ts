// Calendario oficial Copa Mundial 2026 — Fuente: FIFA.com / bracketmundial2026.com
// Horarios originales en ET (UTC-4 verano). Convertidos a UTC sumando 4 horas.
// COT (Colombia) = ET - 1h = UTC - 5h

export interface FallbackFixture {
  kickoffUtc: string;
  venue: string;
  country: string;
}

const VENUE_COUNTRY: Record<string, string> = {
  "Estadio Akron, Guadalajara": "México",
  "Estadio BBVA, Monterrey": "México",
  "Estadio Azteca, Ciudad de México": "México",
  "BMO Field, Toronto": "Canadá",
  "BC Place, Vancouver": "Canadá",
  "MetLife Stadium, Nueva Jersey": "USA",
  "SoFi Stadium, Los Ángeles": "USA",
  "AT&T Stadium, Arlington": "USA",
  "Mercedes-Benz Stadium, Atlanta": "USA",
  "Hard Rock Stadium, Miami": "USA",
  "Lincoln Financial Field, Filadelfia": "USA",
  "Lumen Field, Seattle": "USA",
  "Levi's Stadium, Santa Clara": "USA",
  "Gillette Stadium, Boston": "USA",
  "NRG Stadium, Houston": "USA",
  "GEHA Field, Kansas City": "USA",
};

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

export const pairKey = (a: string, b: string) =>
  [norm(a), norm(b)].sort().join("|");

// Convierte fecha + hora ET a UTC (ET = UTC-4 en verano)
const et = (date: string, time: string): string => {
  const d = new Date(`${date}T${time}:00Z`);
  d.setUTCHours(d.getUTCHours() + 4);
  return d.toISOString();
};

const f = (
  home: string,
  away: string,
  date: string,
  time: string, // hora ET
  venue: string,
): [string, FallbackFixture] => [
  pairKey(home, away),
  { kickoffUtc: et(date, time), venue, country: VENUE_COUNTRY[venue] ?? "USA" },
];

// ============================================================
// FASE DE GRUPOS — 72 partidos (horarios ET oficiales FIFA)
// ============================================================
const GROUP_ENTRIES: Array<[string, FallbackFixture]> = [
  // --- 11 junio ---
  f("México", "Sudáfrica", "2026-06-11", "15:00", "Estadio Azteca, Ciudad de México"),
  f("Corea del Sur", "República Checa", "2026-06-11", "22:00", "Estadio Akron, Guadalajara"),

  // --- 12 junio ---
  f("Canadá", "Bosnia y Herzegovina", "2026-06-12", "15:00", "BMO Field, Toronto"),
  f("Estados Unidos", "Paraguay", "2026-06-12", "21:00", "SoFi Stadium, Los Ángeles"),

  // --- 13 junio ---
  f("Haití", "Escocia", "2026-06-13", "21:00", "Gillette Stadium, Boston"),
  f("Brasil", "Marruecos", "2026-06-13", "18:00", "MetLife Stadium, Nueva Jersey"),
  f("Catar", "Suiza", "2026-06-13", "15:00", "Levi's Stadium, Santa Clara"),

  // --- 14 junio ---
  f("Australia", "Turquía", "2026-06-14", "00:00", "BC Place, Vancouver"),
  f("Costa de Marfil", "Ecuador", "2026-06-14", "19:00", "Lincoln Financial Field, Filadelfia"),
  f("Alemania", "Curazao", "2026-06-14", "13:00", "NRG Stadium, Houston"),
  f("Países Bajos", "Japón", "2026-06-14", "16:00", "AT&T Stadium, Arlington"),
  f("Suecia", "Túnez", "2026-06-14", "22:00", "Estadio BBVA, Monterrey"),

  // --- 15 junio ---
  f("Arabia Saudita", "Uruguay", "2026-06-15", "18:00", "Hard Rock Stadium, Miami"),
  f("España", "Cabo Verde", "2026-06-15", "12:00", "Mercedes-Benz Stadium, Atlanta"),
  f("Irán", "Nueva Zelanda", "2026-06-15", "21:00", "SoFi Stadium, Los Ángeles"),
  f("Bélgica", "Egipto", "2026-06-15", "15:00", "Lumen Field, Seattle"),

  // --- 16 junio ---
  f("Francia", "Senegal", "2026-06-16", "15:00", "MetLife Stadium, Nueva Jersey"),
  f("Irak", "Noruega", "2026-06-16", "18:00", "Gillette Stadium, Boston"),
  f("Argentina", "Argelia", "2026-06-16", "21:00", "GEHA Field, Kansas City"),

  // --- 17 junio ---
  f("Austria", "Jordania", "2026-06-17", "00:00", "Levi's Stadium, Santa Clara"),
  f("Ghana", "Panamá", "2026-06-17", "19:00", "BMO Field, Toronto"),
  f("Inglaterra", "Croacia", "2026-06-17", "16:00", "AT&T Stadium, Arlington"),
  f("Portugal", "RD Congo", "2026-06-17", "13:00", "NRG Stadium, Houston"),
  f("Uzbekistán", "Colombia", "2026-06-17", "22:00", "Estadio Azteca, Ciudad de México"),

  // --- 18 junio ---
  f("República Checa", "Sudáfrica", "2026-06-18", "12:00", "Mercedes-Benz Stadium, Atlanta"),
  f("Suiza", "Bosnia y Herzegovina", "2026-06-18", "15:00", "SoFi Stadium, Los Ángeles"),
  f("Canadá", "Catar", "2026-06-18", "18:00", "BC Place, Vancouver"),
  f("México", "Corea del Sur", "2026-06-18", "21:00", "Estadio Akron, Guadalajara"),

  // --- 19 junio ---
  f("Brasil", "Haití", "2026-06-19", "20:30", "Lincoln Financial Field, Filadelfia"),
  f("Escocia", "Marruecos", "2026-06-19", "18:00", "Gillette Stadium, Boston"),
  f("Turquía", "Paraguay", "2026-06-19", "23:00", "Levi's Stadium, Santa Clara"),
  f("Estados Unidos", "Australia", "2026-06-19", "15:00", "Lumen Field, Seattle"),

  // --- 20 junio ---
  f("Alemania", "Costa de Marfil", "2026-06-20", "16:00", "BMO Field, Toronto"),
  f("Ecuador", "Curazao", "2026-06-20", "20:00", "GEHA Field, Kansas City"),
  f("Países Bajos", "Suecia", "2026-06-20", "13:00", "NRG Stadium, Houston"),

  // --- 21 junio ---
  f("Túnez", "Japón", "2026-06-21", "00:00", "Estadio BBVA, Monterrey"),
  f("Uruguay", "Cabo Verde", "2026-06-21", "18:00", "Hard Rock Stadium, Miami"),
  f("España", "Arabia Saudita", "2026-06-21", "12:00", "Mercedes-Benz Stadium, Atlanta"),
  f("Bélgica", "Irán", "2026-06-21", "15:00", "SoFi Stadium, Los Ángeles"),
  f("Nueva Zelanda", "Egipto", "2026-06-21", "21:00", "BC Place, Vancouver"),
  // Grupo G jornada 3
  f("Bélgica", "Nueva Zelanda", "2026-06-26", "21:00", "BC Place, Vancouver"),
  f("Egipto", "Irán", "2026-06-26", "21:00", "Lumen Field, Seattle"),

  // --- 22 junio ---
  f("Noruega", "Senegal", "2026-06-22", "20:00", "MetLife Stadium, Nueva Jersey"),
  f("Francia", "Irak", "2026-06-22", "17:00", "Gillette Stadium, Boston"),
  f("Colombia", "RD Congo", "2026-06-22", "22:00", "Estadio Akron, Guadalajara"),

  // --- 23 junio ---
  f("Argelia", "Jordania", "2026-06-23", "00:00", "Levi's Stadium, Santa Clara"),
  f("Argentina", "Austria", "2026-06-23", "21:00", "GEHA Field, Kansas City"),
  f("Croacia", "Panamá", "2026-06-23", "18:00", "AT&T Stadium, Arlington"),
  f("Inglaterra", "Ghana", "2026-06-23", "15:00", "NRG Stadium, Houston"),
  f("Portugal", "Uzbekistán", "2026-06-23", "12:00", "Hard Rock Stadium, Miami"),

  // --- 24 junio ---
  f("Canadá", "Suiza", "2026-06-24", "21:00", "Estadio BBVA, Monterrey"),
  f("Catar", "Bosnia y Herzegovina", "2026-06-24", "18:00", "Lumen Field, Seattle"),
  f("Sudáfrica", "Corea del Sur", "2026-06-24", "15:00", "BMO Field, Toronto"),
  f("México", "República Checa", "2026-06-24", "12:00", "Estadio Azteca, Ciudad de México"),

  // --- 25 junio ---
  f("Haití", "Marruecos", "2026-06-25", "21:00", "Lincoln Financial Field, Filadelfia"),
  f("Escocia", "Brasil", "2026-06-25", "18:00", "MetLife Stadium, Nueva Jersey"),
  f("Paraguay", "Australia", "2026-06-25", "15:00", "Gillette Stadium, Boston"),
  f("Turquía", "Estados Unidos", "2026-06-25", "12:00", "SoFi Stadium, Los Ángeles"),

  // --- 26 junio ---
  f("Costa de Marfil", "Curazao", "2026-06-26", "21:00", "Estadio Akron, Guadalajara"),
  f("Ecuador", "Alemania", "2026-06-26", "18:00", "GEHA Field, Kansas City"),
  f("Japón", "Suecia", "2026-06-26", "15:00", "AT&T Stadium, Arlington"),
  f("Túnez", "Países Bajos", "2026-06-26", "12:00", "NRG Stadium, Houston"),
  // Grupo H jornada 3
  f("Uruguay", "España", "2026-06-26", "20:00", "Estadio Akron, Guadalajara"),
  f("Cabo Verde", "Arabia Saudita", "2026-06-26", "17:00", "NRG Stadium, Houston"),
  // Grupo I jornada 3
  f("Noruega", "Francia", "2026-06-26", "12:00", "Gillette Stadium, Boston"),
  f("Senegal", "Irak", "2026-06-26", "12:00", "BMO Field, Toronto"),
  // Grupo K jornada 3
  f("Colombia", "Portugal", "2026-06-27", "17:00", "Hard Rock Stadium, Miami"),
  f("RD Congo", "Uzbekistán", "2026-06-27", "17:00", "Mercedes-Benz Stadium, Atlanta"),

  // --- 27 junio ---

  f("Cabo Verde", "España", "2026-06-27", "15:00", "Mercedes-Benz Stadium, Atlanta"),
  f("Arabia Saudita", "Uruguay", "2026-06-27", "12:00", "Hard Rock Stadium, Miami"),

  f("Jordania", "Argentina", "2026-06-27", "15:00", "Levi's Stadium, Santa Clara"),
  f("Argelia", "Austria", "2026-06-27", "12:00", "GEHA Field, Kansas City"),
  f("Panamá", "Inglaterra", "2026-06-27", "21:00", "AT&T Stadium, Arlington"),
  f("Croacia", "Ghana", "2026-06-27", "18:00", "NRG Stadium, Houston"),

];

const GROUP_MAP = new Map<string, FallbackFixture>(GROUP_ENTRIES);

export function getFallbackFixture(homeName: string, awayName: string): FallbackFixture | undefined {
  return GROUP_MAP.get(pairKey(homeName, awayName));
}

// ============================================================
// ELIMINATORIAS — M1..M32 (horarios ET oficiales FIFA)
// ============================================================
const ko = (date: string, time: string, venue: string): FallbackFixture => ({
  kickoffUtc: et(date, time),
  venue,
  country: VENUE_COUNTRY[venue] ?? "USA",
});

const KO_FIXTURES: Record<string, FallbackFixture> = {
  // --- Ronda de 32 (28 jun – 3 jul) ---
  M1:  ko("2026-06-28", "15:00", "Lumen Field, Seattle"),
  M2:  ko("2026-06-28", "19:00", "AT&T Stadium, Arlington"),
  M3:  ko("2026-06-29", "15:00", "Gillette Stadium, Boston"),
  M4:  ko("2026-06-29", "19:00", "MetLife Stadium, Nueva Jersey"),
  M5:  ko("2026-06-30", "15:00", "NRG Stadium, Houston"),
  M6:  ko("2026-06-30", "19:00", "SoFi Stadium, Los Ángeles"),
  M7:  ko("2026-07-01", "15:00", "Mercedes-Benz Stadium, Atlanta"),
  M8:  ko("2026-07-01", "19:00", "Hard Rock Stadium, Miami"),
  M9:  ko("2026-07-02", "15:00", "GEHA Field, Kansas City"),
  M10: ko("2026-07-02", "19:00", "Estadio Akron, Guadalajara"),
  M11: ko("2026-07-02", "23:00", "BC Place, Vancouver"),
  M12: ko("2026-07-03", "15:00", "Estadio Azteca, Ciudad de México"),
  M13: ko("2026-07-03", "19:00", "BMO Field, Toronto"),
  M14: ko("2026-07-03", "23:00", "Estadio BBVA, Monterrey"),
  M15: ko("2026-07-03", "15:00", "Lincoln Financial Field, Filadelfia"),
  M16: ko("2026-07-03", "19:00", "Levi's Stadium, Santa Clara"),

  // --- Octavos de final (4 – 7 jul) ---
  M17: ko("2026-07-04", "15:00", "MetLife Stadium, Nueva Jersey"),
  M18: ko("2026-07-04", "19:00", "SoFi Stadium, Los Ángeles"),
  M19: ko("2026-07-05", "15:00", "Lumen Field, Seattle"),
  M20: ko("2026-07-05", "19:00", "AT&T Stadium, Arlington"),
  M21: ko("2026-07-06", "15:00", "Gillette Stadium, Boston"),
  M22: ko("2026-07-06", "19:00", "NRG Stadium, Houston"),
  M23: ko("2026-07-07", "15:00", "Mercedes-Benz Stadium, Atlanta"),
  M24: ko("2026-07-07", "19:00", "Hard Rock Stadium, Miami"),

  // --- Cuartos de final (9 – 11 jul) ---
  M25: ko("2026-07-09", "19:00", "MetLife Stadium, Nueva Jersey"),
  M26: ko("2026-07-10", "19:00", "SoFi Stadium, Los Ángeles"),
  M27: ko("2026-07-11", "15:00", "Lumen Field, Seattle"),
  M28: ko("2026-07-11", "19:00", "AT&T Stadium, Arlington"),

  // --- Semifinales (14 – 15 jul) ---
  M29: ko("2026-07-14", "19:00", "AT&T Stadium, Arlington"),
  M30: ko("2026-07-15", "19:00", "Mercedes-Benz Stadium, Atlanta"),

  // --- Tercer puesto (18 jul) ---
  M31: ko("2026-07-18", "15:00", "Hard Rock Stadium, Miami"),

  // --- Final (19 jul) ---
  M32: ko("2026-07-19", "15:00", "MetLife Stadium, Nueva Jersey"),
};

export function getKoFixture(matchId: string): FallbackFixture | undefined {
  return KO_FIXTURES[matchId];
}
