import { useCallback, useEffect, useState } from "react";
import { AppData, INITIAL_DATA, Match, Team } from "@/data/initialData";

const KEY = "mundial2026.v1";

function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
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

  const setData = useCallback((d: AppData) => { state = d; persist(); }, []);

  const restore = useCallback(() => { state = JSON.parse(JSON.stringify(INITIAL_DATA)); persist(); }, []);

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
    };
    persist();
  }, []);

  const updatePlayer = useCallback((id: string, patch: Partial<{ goals: number; assists: number }>) => {
    state = { ...state, players: state.players.map((p) => (p.id === id ? { ...p, ...patch } : p)) };
    persist();
  }, []);

  return { data: state, setMatch, setData, restore, simulateGroups, clearScores, updatePlayer };
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
