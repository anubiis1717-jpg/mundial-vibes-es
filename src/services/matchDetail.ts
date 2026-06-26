// Detalle de un partido — fuente ESPN ("summary"). Trae alineaciones, eventos
// (goles, tarjetas, cambios) y estadísticas, además de estadio y asistencia.
// El endpoint vive en site.api.espn.com (CORS abierto) y funciona en web y en
// nativo. Aun así usamos CapacitorHttp en el teléfono por robustez, y forzamos
// https en las imágenes (Android bloquea el http en claro → escudos vacíos).

import { Capacitor, CapacitorHttp } from "@capacitor/core";
import { getLang, tr } from "@/i18n";

const SUMMARY = (eventId: string) =>
  `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${encodeURIComponent(eventId)}`;

const toHttps = (u: string | null | undefined): string | null =>
  u ? u.replace(/^http:\/\//i, "https://") : null;

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

// Nombres de país EN→ES (acabado en español) para selecciones del Mundial.
const COUNTRY_ES: Record<string, string> = {
  "South Korea": "Corea del Sur", "Korea Republic": "Corea del Sur",
  "Czechia": "República Checa", "Czech Republic": "República Checa",
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
// En inglés mostramos el nombre tal cual lo da ESPN; en español lo traducimos.
const localName = (name: string) => (getLang() === "en" ? name : (COUNTRY_ES[name] ?? name));

// Estado del partido EN→ES. ESPN usa textos como "First Half", "Halftime",
// "Full Time", etc. Mapeamos por texto en minúsculas y, si no, intentamos por
// palabras clave antes de devolver el original.
const STATUS_ES: Record<string, string> = {
  "scheduled": "Programado",
  "pre-game": "Programado",
  "first half": "Primer tiempo",
  "1st half": "Primer tiempo",
  "halftime": "Entretiempo",
  "half time": "Entretiempo",
  "second half": "Segundo tiempo",
  "2nd half": "Segundo tiempo",
  "full time": "Finalizado",
  "full-time": "Finalizado",
  "ft": "Finalizado",
  "end of regulation": "Fin del tiempo reglamentario",
  "extra time": "Tiempo extra",
  "first half extra time": "Tiempo extra (1ª parte)",
  "second half extra time": "Tiempo extra (2ª parte)",
  "penalties": "Penales",
  "penalty shootout": "Penales",
  "postponed": "Aplazado",
  "delayed": "Demorado",
  "abandoned": "Suspendido",
  "cancelled": "Cancelado",
  "canceled": "Cancelado",
};

function translateStatus(raw: string): string {
  const t = (raw || "").trim().toLowerCase();
  if (!t) return "";
  if (STATUS_ES[t]) return STATUS_ES[t];
  if (t.includes("half")) {
    if (t.includes("first") || t.includes("1st")) return "Primer tiempo";
    if (t.includes("second") || t.includes("2nd")) return "Segundo tiempo";
    if (t.includes("half time") || t.includes("halftime")) return "Entretiempo";
  }
  if (t.includes("penal")) return "Penales";
  if (t.includes("full")) return "Finalizado";
  return raw; // desconocido: mejor el original que nada
}

export type Side = "home" | "away";
export type EventKind = "goal" | "own" | "penalty" | "yellow" | "red" | "sub" | "var" | "other";

export interface DetailEvent {
  minute: string;
  kind: EventKind;
  side: Side | null;
  player: string;
  note: string | null;
}
export interface RosterPlayer { name: string; pos: string; jersey: string; starter: boolean; }
export interface SideRoster { formation: string | null; starters: RosterPlayer[]; subs: RosterPlayer[]; }
export interface StatRow { label: string; home: string; away: string; }
export interface TeamInfo { name: string; logo: string | null; score: number | null; }

export interface MatchDetail {
  statusText: string;
  state: string; // pre | in | post
  clock: string | null;
  home: TeamInfo;
  away: TeamInfo;
  events: DetailEvent[];
  rosters: { home: SideRoster | null; away: SideRoster | null };
  stats: StatRow[];
  venue: string | null;
  attendance: number | null;
  hasData: boolean;
}

const num = (v: any): number | null => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function classify(typeText: string, scoring: boolean): EventKind {
  const t = (typeText || "").toLowerCase();
  if (t.includes("own goal")) return "own";
  if (t.includes("penalty") && (scoring || t.includes("scored"))) return "penalty";
  if (t.includes("card")) return t.includes("red") || t.includes("second yellow") ? "red" : "yellow";
  if (t.includes("substitution")) return "sub";
  if (t.includes("var")) return "var";
  if (scoring || t === "goal" || t.includes("goal")) {
    return t.includes("disallow") || t.includes("no goal") ? "var" : "goal";
  }
  return "other";
}

// Estadísticas que mostramos, en orden, con sus posibles etiquetas en ESPN.
const STAT_DEFS: { key: string; match: string[] }[] = [
  { key: "stat.possession", match: ["possession"] },
  { key: "stat.shots", match: ["shots", "total shots"] },
  { key: "stat.shotsOnTarget", match: ["shots on target", "shots on goal"] },
  { key: "stat.corners", match: ["corner kicks", "won corners"] },
  { key: "stat.fouls", match: ["fouls", "fouls committed"] },
  { key: "stat.offsides", match: ["offsides"] },
  { key: "stat.yellow", match: ["yellow cards"] },
  { key: "stat.red", match: ["red cards"] },
  { key: "stat.saves", match: ["saves"] },
];

export async function getMatchDetail(eventId: string): Promise<MatchDetail> {
  const d = await getJson(SUMMARY(eventId));

  const comp = d?.header?.competitions?.[0];
  const competitors: any[] = comp?.competitors ?? [];
  const homeC = competitors.find((c) => c?.homeAway === "home") ?? competitors[0];
  const awayC = competitors.find((c) => c?.homeAway === "away") ?? competitors[1];
  const homeId = String(homeC?.team?.id ?? "");
  const awayId = String(awayC?.team?.id ?? "");

  const teamInfo = (c: any): TeamInfo => ({
    name: localName(c?.team?.displayName ?? ""),
    logo: toHttps(c?.team?.logos?.[0]?.href ?? c?.team?.logo),
    score: num(c?.score),
  });
  const home = teamInfo(homeC);
  const away = teamInfo(awayC);

  const sideOf = (teamId: any): Side | null => {
    const id = String(teamId ?? "");
    return id === homeId ? "home" : id === awayId ? "away" : null;
  };

  const state: string = comp?.status?.type?.state ?? "pre";
  const rawStatus: string = comp?.status?.type?.description ?? comp?.status?.type?.shortDetail ?? "";
  // ESPN entrega el estado en inglés; en modo inglés lo dejamos tal cual.
  const statusText = getLang() === "en" ? rawStatus : translateStatus(rawStatus);
  const clock = state === "in" ? (comp?.status?.displayClock ?? null) : null;

  // --- Eventos (goles, tarjetas, cambios) ---
  const events: DetailEvent[] = (d?.keyEvents ?? [])
    .map((e: any): DetailEvent | null => {
      const kind = classify(e?.type?.text ?? "", !!e?.scoringPlay);
      if (!["goal", "own", "penalty", "yellow", "red", "sub"].includes(kind)) return null;
      const parts: any[] = e?.participants ?? [];
      const p0 = parts[0]?.athlete?.displayName ?? "";
      const p1 = parts[1]?.athlete?.displayName ?? "";
      let note: string | null = null;
      if ((kind === "goal" || kind === "penalty") && p1) note = tr("ev.assist", { name: p1 });
      else if (kind === "own") note = tr("ev.ownGoal");
      else if (kind === "penalty") note = tr("ev.penalty");
      else if (kind === "sub" && p1) note = `↔ ${p1}`;
      return {
        minute: e?.clock?.displayValue ?? "",
        kind,
        side: sideOf(e?.team?.id),
        player: p0,
        note,
      };
    })
    .filter(Boolean) as DetailEvent[];

  // --- Alineaciones ---
  const buildRoster = (r: any): SideRoster => {
    const players: RosterPlayer[] = (r?.roster ?? []).map((p: any) => ({
      name: p?.athlete?.displayName ?? "",
      pos: p?.position?.abbreviation ?? "",
      jersey: String(p?.jersey ?? ""),
      starter: !!p?.starter,
    }));
    return {
      formation: r?.formation ?? null,
      starters: players.filter((p) => p.starter),
      subs: players.filter((p) => !p.starter),
    };
  };
  const rosters: { home: SideRoster | null; away: SideRoster | null } = { home: null, away: null };
  for (const r of d?.rosters ?? []) {
    const side = r?.homeAway === "home" ? "home" : r?.homeAway === "away" ? "away" : sideOf(r?.team?.id);
    if (side) rosters[side] = buildRoster(r);
  }

  // --- Estadísticas ---
  const statBySide: Record<Side, Record<string, string>> = { home: {}, away: {} };
  for (const bt of d?.boxscore?.teams ?? []) {
    const side = sideOf(bt?.team?.id);
    if (!side) continue;
    for (const s of bt?.statistics ?? []) {
      const label = String(s?.label ?? s?.name ?? "").toLowerCase();
      if (label) statBySide[side][label] = String(s?.displayValue ?? s?.value ?? "");
    }
  }
  const stats: StatRow[] = [];
  for (const def of STAT_DEFS) {
    const key = def.match.find((m) => m in statBySide.home || m in statBySide.away);
    if (!key) continue;
    const h = statBySide.home[key] ?? "-";
    const a = statBySide.away[key] ?? "-";
    if (h === "-" && a === "-") continue;
    stats.push({ label: tr(def.key), home: h, away: a });
  }

  const hasData =
    events.length > 0 ||
    (rosters.home?.starters.length ?? 0) > 0 ||
    (rosters.away?.starters.length ?? 0) > 0 ||
    stats.length > 0;

  return {
    statusText,
    state,
    clock,
    home,
    away,
    events,
    rosters,
    stats,
    venue: d?.gameInfo?.venue?.fullName ?? null,
    attendance: num(d?.gameInfo?.attendance),
    hasData,
  };
}
