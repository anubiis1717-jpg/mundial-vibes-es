import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Lang = "es" | "en";

const STORAGE_KEY = "futhora.lang.v1";

// ------------------------------------------------------------------
// Auto-detección: si el teléfono está en español → español; cualquier
// otro idioma (inglés incluido) → inglés. Así los usuarios hispanos
// siguen en español y el resto del mundo (foco EE.UU.) ve la app en inglés.
// ------------------------------------------------------------------
function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "es" || saved === "en") return saved;
  } catch {}
  try {
    const nav = (navigator.language || navigator.languages?.[0] || "es").toLowerCase();
    return nav.startsWith("es") ? "es" : "en";
  } catch {}
  return "es";
}

// Variable a nivel de módulo para que servicios NO-React (matchDetail, scorers,
// format) sepan el idioma actual sin pasar por React.
let _lang: Lang = detectLang();
export function getLang(): Lang {
  return _lang;
}

// ------------------------------------------------------------------
// Diccionario de cadenas
// ------------------------------------------------------------------
type Dict = Record<string, string>;

const ES: Dict = {
  // Navegación
  "nav.inicio": "Inicio",
  "nav.grupos": "Grupos",
  "nav.partidos": "Partidos",
  "nav.bracket": "Bracket",
  "nav.plantillas": "Plantillas",
  "nav.stats": "Stats",
  "nav.ajustes": "Ajustes",

  // Comunes
  "common.group": "Grupo",
  "common.tbd": "Por definir",
  "common.vs": "VS",
  "common.final": "Final",
  "common.finished": "Finalizado",
  "common.live": "En vivo",

  // Inicio
  "home.nextMatch": "Próximo partido",
  "home.matchday": "Jornada",
  "home.minute": "Minuto {clock}",
  "home.inPlay": "En juego",
  "home.tbc": "POR CONFIRMAR",
  "home.localTime": "Hora local",
  "home.viewDetails": "VER DETALLES",
  "home.viewMatch": "VER PARTIDO",
  "home.stat.played": "Partidos",
  "home.stat.playedSub": "Jugados",
  "home.stat.goals": "Goles",
  "home.stat.goalsSub": "Marcados",
  "home.stat.qualified": "Clasificados",
  "home.stat.qualifiedSub": "A 16avos",
  "home.stat.champion": "Campeón",
  "home.groupStage": "Fase de grupos",
  "home.viewAll": "Ver todos",
  "home.viewTable": "Ver tabla",
  "home.finalBracket": "Cuadro Final",
  "home.viewBracket": "Ver bracket",

  // Grupos
  "groups.title": "Grupos",
  "groups.team": "Equipo",
  "groups.pj": "PJ",
  "groups.g": "G",
  "groups.e": "E",
  "groups.p": "P",
  "groups.dg": "DG",
  "groups.pts": "Pts",

  // Partidos
  "matches.title": "Partidos",

  // Stats
  "stats.title": "Stats",
  "stats.bestThirds": "Mejores terceros",
  "stats.advance8": "Avanzan 8",
  "stats.thirdsDesc": "Pasan a la ronda de 32 los 8 mejores; del 9.º al 12.º quedan eliminados.",
  "stats.elim": "Elim.",
  "stats.pts": "pts",
  "stats.scorers": "Goleadores",
  "stats.assists": "Asistencias",
  "stats.goalUnit1": "gol",
  "stats.goalUnit2": "goles",
  "stats.assistUnit": "asist.",
  "stats.mp": "PJ",
  "stats.loadError": "No se pudo cargar la información. Revisa tu conexión; se reintenta solo.",

  // Plantillas
  "squads.title": "Plantillas",
  "squads.search": "Buscar equipo...",
  "squads.playersShort": "jug.",
  "squads.noResults": "Sin resultados",
  "squads.back": "Volver",
  "squads.calledUp": "Convocados",
  "squads.playersWord": "jugadores",
  "squads.gk": "Porteros",
  "squads.def": "Defensas",
  "squads.mid": "Centrocampistas",
  "squads.fwd": "Delanteros",

  // Ajustes
  "settings.title": "Ajustes",
  "settings.language": "Idioma",
  "settings.simulation": "Simulación",
  "settings.simGroups": "Simular fase de grupos",
  "settings.clearScores": "Limpiar marcadores",
  "settings.clearBracket": "Limpiar bracket",
  "settings.restore": "Restaurar datos iniciales",
  "toast.simGroups": "Fase de grupos simulada",
  "toast.clearScores": "Marcadores limpiados",
  "toast.clearBracket": "Bracket limpiado",
  "toast.restore": "Datos restaurados",

  // Bracket
  "bracket.title": "Bracket",
  "bracket.cuadro": "Cuadro",
  "bracket.lista": "Lista",
  "bracket.colLeft32": "R32 · Izquierda",
  "bracket.colRight32": "R32 · Derecha",
  "bracket.octavos": "Octavos",
  "bracket.cuartos": "Cuartos",
  "bracket.semi": "Semifinal",
  "bracket.match": "Partido",
  "bracket.matchShort": "P",
  "bracket.status.pending": "Pendiente",
  "bracket.status.definePens": "Definir penales",
  "bracket.editScore": "Editar marcador",
  "bracket.close": "Cerrar",
  "bracket.clear": "Limpiar",
  "bracket.goals": "goles",
  "bracket.local": "Local",
  "bracket.visitor": "Visitante",
  "bracket.pensLocal": "Penales local",
  "bracket.pensVisitor": "Penales visitante",
  "bracket.tieHint": "Empate: ingresa penales distintos para avanzar.",
  "bracket.championTitle": "Campeón del Mundo",

  // Rondas
  "round.r32": "Ronda de 32",
  "round.r16": "Octavos de final",
  "round.qf": "Cuartos de final",
  "round.sf": "Semifinales",
  "round.third": "Tercer puesto",
  "round.final": "Final",

  // Slots
  "slot.best3": "Mejor 3.º",
  "slot.winner": "Ganador Partido {n}",
  "slot.loser": "Perdedor Partido {n}",

  // Tarjeta de partido
  "card.draw": "Empate",
  "card.upcoming": "Próximamente",
  "card.viewDetails": "Ver detalles",

  // Detalle del partido
  "detail.title": "Detalle del partido",
  "detail.loading": "Cargando detalle…",
  "detail.error": "No se pudo cargar el detalle.",
  "detail.errorHint": "Revisa tu conexión e inténtalo de nuevo.",
  "detail.match": "Partido",
  "detail.notAvailable": "El detalle (alineaciones, goles y estadísticas) estará disponible cuando el partido comience.",
  "detail.goalsCards": "Goles y tarjetas",
  "detail.stats": "Estadísticas",
  "detail.lineups": "Alineaciones",
  "detail.attendees": "asistentes",
  "detail.noData": "Sin datos",
  "detail.subs": "Suplentes",

  // Recordatorios
  "reminder.removed": "Recordatorio quitado",
  "reminder.startsIn15": "Empieza en 15 minutos",
  "reminder.willNotify": "Te avisaremos 15 min antes del partido",
  "reminder.enableNotifs": "Activa las notificaciones para recibir recordatorios",
  "reminder.ariaRemove": "Quitar recordatorio",
  "reminder.ariaAdd": "Recordarme este partido",

  // Detalle: notas de eventos
  "ev.assist": "Asist.: {name}",
  "ev.ownGoal": "En propia puerta",
  "ev.penalty": "Penal",

  // Estadísticas (etiquetas)
  "stat.possession": "Posesión (%)",
  "stat.shots": "Remates",
  "stat.shotsOnTarget": "Remates al arco",
  "stat.corners": "Tiros de esquina",
  "stat.fouls": "Faltas",
  "stat.offsides": "Fueras de juego",
  "stat.yellow": "Amarillas",
  "stat.red": "Rojas",
  "stat.saves": "Atajadas",

  // Fecha
  "fmt.tbc": "Por confirmar",
};

const EN: Dict = {
  // Navigation
  "nav.inicio": "Home",
  "nav.grupos": "Groups",
  "nav.partidos": "Matches",
  "nav.bracket": "Bracket",
  "nav.plantillas": "Squads",
  "nav.stats": "Stats",
  "nav.ajustes": "Settings",

  // Common
  "common.group": "Group",
  "common.tbd": "TBD",
  "common.vs": "VS",
  "common.final": "Final",
  "common.finished": "Finished",
  "common.live": "Live",

  // Home
  "home.nextMatch": "Next match",
  "home.matchday": "Matchday",
  "home.minute": "Minute {clock}",
  "home.inPlay": "In play",
  "home.tbc": "TBC",
  "home.localTime": "Local time",
  "home.viewDetails": "VIEW DETAILS",
  "home.viewMatch": "VIEW MATCH",
  "home.stat.played": "Matches",
  "home.stat.playedSub": "Played",
  "home.stat.goals": "Goals",
  "home.stat.goalsSub": "Scored",
  "home.stat.qualified": "Qualified",
  "home.stat.qualifiedSub": "To Ro32",
  "home.stat.champion": "Champion",
  "home.groupStage": "Group stage",
  "home.viewAll": "View all",
  "home.viewTable": "View table",
  "home.finalBracket": "Final Bracket",
  "home.viewBracket": "View bracket",

  // Groups
  "groups.title": "Groups",
  "groups.team": "Team",
  "groups.pj": "MP",
  "groups.g": "W",
  "groups.e": "D",
  "groups.p": "L",
  "groups.dg": "GD",
  "groups.pts": "Pts",

  // Matches
  "matches.title": "Matches",

  // Stats
  "stats.title": "Stats",
  "stats.bestThirds": "Best third-placed",
  "stats.advance8": "8 advance",
  "stats.thirdsDesc": "The 8 best third-placed teams advance to the Round of 32; 9th–12th are eliminated.",
  "stats.elim": "Out",
  "stats.pts": "pts",
  "stats.scorers": "Top scorers",
  "stats.assists": "Assists",
  "stats.goalUnit1": "goal",
  "stats.goalUnit2": "goals",
  "stats.assistUnit": "ast.",
  "stats.mp": "MP",
  "stats.loadError": "Couldn't load the data. Check your connection; it will retry automatically.",

  // Squads
  "squads.title": "Squads",
  "squads.search": "Search team...",
  "squads.playersShort": "players",
  "squads.noResults": "No results",
  "squads.back": "Back",
  "squads.calledUp": "Called up",
  "squads.playersWord": "players",
  "squads.gk": "Goalkeepers",
  "squads.def": "Defenders",
  "squads.mid": "Midfielders",
  "squads.fwd": "Forwards",

  // Settings
  "settings.title": "Settings",
  "settings.language": "Language",
  "settings.simulation": "Simulation",
  "settings.simGroups": "Simulate group stage",
  "settings.clearScores": "Clear scores",
  "settings.clearBracket": "Clear bracket",
  "settings.restore": "Restore initial data",
  "toast.simGroups": "Group stage simulated",
  "toast.clearScores": "Scores cleared",
  "toast.clearBracket": "Bracket cleared",
  "toast.restore": "Data restored",

  // Bracket
  "bracket.title": "Bracket",
  "bracket.cuadro": "Chart",
  "bracket.lista": "List",
  "bracket.colLeft32": "Ro32 · Left",
  "bracket.colRight32": "Ro32 · Right",
  "bracket.octavos": "Round of 16",
  "bracket.cuartos": "Quarter-finals",
  "bracket.semi": "Semi-final",
  "bracket.match": "Match",
  "bracket.matchShort": "M",
  "bracket.status.pending": "Pending",
  "bracket.status.definePens": "Decide on pens",
  "bracket.editScore": "Edit score",
  "bracket.close": "Close",
  "bracket.clear": "Clear",
  "bracket.goals": "goals",
  "bracket.local": "Home",
  "bracket.visitor": "Away",
  "bracket.pensLocal": "Home pens",
  "bracket.pensVisitor": "Away pens",
  "bracket.tieHint": "Tie: enter different penalty scores to advance.",
  "bracket.championTitle": "World Champion",

  // Rounds
  "round.r32": "Round of 32",
  "round.r16": "Round of 16",
  "round.qf": "Quarter-finals",
  "round.sf": "Semi-finals",
  "round.third": "Third place",
  "round.final": "Final",

  // Slots
  "slot.best3": "Best 3rd",
  "slot.winner": "Winner Match {n}",
  "slot.loser": "Loser Match {n}",

  // Match card
  "card.draw": "Draw",
  "card.upcoming": "Upcoming",
  "card.viewDetails": "View details",

  // Match detail
  "detail.title": "Match details",
  "detail.loading": "Loading details…",
  "detail.error": "Couldn't load the details.",
  "detail.errorHint": "Check your connection and try again.",
  "detail.match": "Match",
  "detail.notAvailable": "Details (line-ups, goals and stats) will be available once the match kicks off.",
  "detail.goalsCards": "Goals & cards",
  "detail.stats": "Statistics",
  "detail.lineups": "Line-ups",
  "detail.attendees": "attendance",
  "detail.noData": "No data",
  "detail.subs": "Substitutes",

  // Reminders
  "reminder.removed": "Reminder removed",
  "reminder.startsIn15": "Starts in 15 minutes",
  "reminder.willNotify": "We'll remind you 15 min before kickoff",
  "reminder.enableNotifs": "Enable notifications to get reminders",
  "reminder.ariaRemove": "Remove reminder",
  "reminder.ariaAdd": "Remind me about this match",

  // Detail: event notes
  "ev.assist": "Assist: {name}",
  "ev.ownGoal": "Own goal",
  "ev.penalty": "Penalty",

  // Stats (labels)
  "stat.possession": "Possession (%)",
  "stat.shots": "Shots",
  "stat.shotsOnTarget": "Shots on target",
  "stat.corners": "Corner kicks",
  "stat.fouls": "Fouls",
  "stat.offsides": "Offsides",
  "stat.yellow": "Yellow cards",
  "stat.red": "Red cards",
  "stat.saves": "Saves",

  // Date
  "fmt.tbc": "To be confirmed",
};

const DICTS: Record<Lang, Dict> = { es: ES, en: EN };

function interpolate(s: string, vars?: Record<string, string | number>): string {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

// Traducción sin React (para servicios). Usa el idioma actual del módulo.
export function tr(key: string, vars?: Record<string, string | number>): string {
  const dict = DICTS[_lang] ?? ES;
  const raw = dict[key] ?? ES[key] ?? key;
  return interpolate(raw, vars);
}

// ------------------------------------------------------------------
// Contexto React
// ------------------------------------------------------------------
interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(_lang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    _lang = l;
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
    setLangState(l);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const dict = DICTS[lang] ?? ES;
      const raw = dict[key] ?? ES[key] ?? key;
      return interpolate(raw, vars);
    },
    [lang]
  );

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n debe usarse dentro de I18nProvider");
  return ctx;
}
