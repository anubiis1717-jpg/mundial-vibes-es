import { useCallback, useEffect, useState } from "react";
import { AppData, INITIAL_DATA, KOMatch, Match, SlotRef, Team } from "@/data/initialData";

const KEY = "mundial2026.v2";

function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppData;
      if (!parsed.knockout || parsed.knockout.length !== 32) {
        parsed.knockout = JSON.parse(JSON.stringify(INITIAL_DATA.knockout));
      }
      return parsed;
    }
  } catch {}
  return JSON.parse(JSON.stringify(INITIAL_DATA));
}

let listeners: Array<() => void> = [];
let state: AppData = load();

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  listeners.forEach((l) => l());
}

export function useTournament() {
  const [, setT] = useState(0);
  useEffect(() => {
    const l = () => setT((x) => x + 1);
    listeners.push(l);
    return () => { listeners = listeners.filter((x) => x !== l); };
  }, []);

  const setMatch = useCallback((id: string, patch: Partial<Match>) => {
    state = { ...state, matches: state.matches.map((m) => (m.id === id ? { ...m, ...patch } : m)) };
    persist();
  }, []);

  const setKO = useCallback((id: string, patch: Partial<KOMatch>) => {
    state = { ...state, knockout: state.knockout.map((m) => (m.id === id ? { ...m, ...patch } : m)) };
    persist();
  }, []);

  const setData = useCallback((d: AppData) => {
    if (!d.knockout || d.knockout.length !== 32) {
      d.knockout = JSON.parse(JSON.stringify(INITIAL_DATA.knockout));
    }
    state = d; persist();
  }, []);

  const restore = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
      Object.keys(localStorage)
        .filter((k) => /mundial|bracket|knockout|qualified|thirds|champion|simulation|round|quarter|semi|final|third/i.test(k))
        .forEach((k) => localStorage.removeItem(k));
    } catch {}
    state = JSON.parse(JSON.stringify(INITIAL_DATA));
    persist();
  }, []);

  const clearBracket = useCallback(() => {
    state = {
      ...state,
      knockout: JSON.parse(JSON.stringify(INITIAL_DATA.knockout)),
    };
    persist();
  }, []);

  const simulateGroups = useCallback(() => {
    state = {
      ...state,
      matches: state.matches.map((m) =>
        m.stage === "group"
          ? { ...m, homeScore: Math.floor(Math.random() * 4), awayScore: Math.floor(Math.random() * 4) }
          : m
      ),
    };
    persist();
  }, []);

  const clearScores = useCallback(() => {
    state = {
      ...state,
      matches: state.matches.map((m) => ({ ...m, homeScore: null, awayScore: null })),
      knockout: state.knockout.map((m) => ({ ...m, homeScore: null, awayScore: null, pensHome: null, pensAway: null })),
    };
    persist();
  }, []);

  const updatePlayer = useCallback((id: string, patch: Partial<{ goals: number; assists: number }>) => {
    state = { ...state, players: state.players.map((p) => (p.id === id ? { ...p, ...patch } : p)) };
    persist();
  }, []);

  return { data: state, setMatch, setKO, setData, restore, simulateGroups, clearScores, updatePlayer };
}

export function teamById(data: AppData, id: string): Team | undefined {
  return data.teams.find((t) => t.id === id);
}

export interface Standing {
  team: Team;
  pj: number; g: number; e: number; p: number;
  gf: number; gc: number; dg: number; pts: number;
}

export function computeStandings(data: AppData, group: string): Standing[] {
  const teams = data.teams.filter((t) => t.group === group);
  const rows = new Map<string, Standing>();
  teams.forEach((t) => rows.set(t.id, { team: t, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 }));
  data.matches
    .filter((m) => m.stage === "group" && m.group === group && m.homeScore !== null && m.awayScore !== null)
    .forEach((m) => {
      const h = rows.get(m.homeId)!; const a = rows.get(m.awayId)!;
      h.pj++; a.pj++;
      h.gf += m.homeScore!; h.gc += m.awayScore!;
      a.gf += m.awayScore!; a.gc += m.homeScore!;
      if (m.homeScore! > m.awayScore!) { h.g++; h.pts += 3; a.p++; }
      else if (m.homeScore! < m.awayScore!) { a.g++; a.pts += 3; h.p++; }
      else { h.e++; a.e++; h.pts++; a.pts++; }
    });
  rows.forEach((r) => (r.dg = r.gf - r.gc));
  return Array.from(rows.values()).sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);
}

export function bestThirds(data: AppData) {
  const groups = "ABCDEFGHIJKL".split("");
  const thirds = groups
    .map((g) => ({ group: g, standing: computeStandings(data, g)[2] }))
    .filter((x) => x.standing);
  return thirds.sort((a, b) =>
    b.standing.pts - a.standing.pts ||
    b.standing.dg - a.standing.dg ||
    b.standing.gf - a.standing.gf
  );
}

// ===== Knockout resolution =====

export function slotLabel(ref: SlotRef): string {
  if (ref.kind === "pos") return `${ref.pos}${ref.group}`;
  if (ref.kind === "third") return `Mejor 3.º`;
  if (ref.kind === "winner") return `Ganador Partido ${ref.matchId.replace("M", "")}`;
  return `Perdedor Partido ${ref.matchId.replace("M", "")}`;
}

export function koWinnerLoser(m: KOMatch): { winner: "home" | "away" | null; loser: "home" | "away" | null } {
  if (m.homeScore === null || m.awayScore === null) return { winner: null, loser: null };
  if (m.homeScore > m.awayScore) return { winner: "home", loser: "away" };
  if (m.awayScore > m.homeScore) return { winner: "away", loser: "home" };
  if (m.pensHome !== null && m.pensAway !== null && m.pensHome !== m.pensAway) {
    return m.pensHome > m.pensAway
      ? { winner: "home", loser: "away" }
      : { winner: "away", loser: "home" };
  }
  return { winner: null, loser: null };
}

export function resolveSlot(data: AppData, ref: SlotRef): Team | undefined {
  if (ref.kind === "pos") {
    return computeStandings(data, ref.group)[ref.pos - 1]?.team;
  }
  if (ref.kind === "third") {
    return bestThirds(data)[ref.index - 1]?.standing.team;
  }
  const src = data.knockout.find((k) => k.id === ref.matchId);
  if (!src) return undefined;
  const { winner, loser } = koWinnerLoser(src);
  const pick = ref.kind === "winner" ? winner : loser;
  if (!pick) return undefined;
  const ofRef = pick === "home" ? src.homeFrom : src.awayFrom;
  return resolveSlot(data, ofRef);
}
