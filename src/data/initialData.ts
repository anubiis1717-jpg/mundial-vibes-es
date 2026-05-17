export interface Team {
  id: string;
  name: string;
  flag: string;
  group: string;
}

export interface Match {
  id: string;
  group?: string;
  stage: "group" | "r32" | "r16" | "qf" | "sf" | "third" | "final";
  homeId: string;
  awayId: string;
  homeScore: number | null;
  awayScore: number | null;
  date: string | null; // ISO in Colombia (UTC-5) e.g. "2026-06-11T18:00"
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
  goals: number;
  assists: number;
}

export type SlotRef =
  | { kind: "pos"; pos: 1 | 2; group: string }
  | { kind: "third"; index: number } // 1..8
  | { kind: "winner"; matchId: string }
  | { kind: "loser"; matchId: string };

export interface KOMatch {
  id: string; // M1..M32
  number: number;
  stage: "r32" | "r16" | "qf" | "sf" | "third" | "final";
  homeFrom: SlotRef;
  awayFrom: SlotRef;
  homeScore: number | null;
  awayScore: number | null;
  pensHome: number | null;
  pensAway: number | null;
}

export interface AppData {
  teams: Team[];
  matches: Match[];
  players: Player[];
  knockout: KOMatch[];
}

// 12 groups A-L
const groupsRaw: Record<string, [string, string][]> = {
  A: [["México", "🇲🇽"], ["Sudáfrica", "🇿🇦"], ["Corea del Sur", "🇰🇷"], ["República Checa", "🇨🇿"]],
  B: [["Canadá", "🇨🇦"], ["Bosnia y Herzegovina", "🇧🇦"], ["Catar", "🇶🇦"], ["Suiza", "🇨🇭"]],
  C: [["Brasil", "🇧🇷"], ["Marruecos", "🇲🇦"], ["Haití", "🇭🇹"], ["Escocia", "🏴󠁧󠁢󠁳󠁣󠁴󠁿"]],
  D: [["Estados Unidos", "🇺🇸"], ["Paraguay", "🇵🇾"], ["Australia", "🇦🇺"], ["Turquía", "🇹🇷"]],
  E: [["Alemania", "🇩🇪"], ["Curazao", "🇨🇼"], ["Costa de Marfil", "🇨🇮"], ["Ecuador", "🇪🇨"]],
  F: [["Países Bajos", "🇳🇱"], ["Japón", "🇯🇵"], ["Suecia", "🇸🇪"], ["Túnez", "🇹🇳"]],
  G: [["Bélgica", "🇧🇪"], ["Egipto", "🇪🇬"], ["Irán", "🇮🇷"], ["Nueva Zelanda", "🇳🇿"]],
  H: [["España", "🇪🇸"], ["Cabo Verde", "🇨🇻"], ["Arabia Saudita", "🇸🇦"], ["Uruguay", "🇺🇾"]],
  I: [["Francia", "🇫🇷"], ["Senegal", "🇸🇳"], ["Irak", "🇮🇶"], ["Noruega", "🇳🇴"]],
  J: [["Argentina", "🇦🇷"], ["Argelia", "🇩🇿"], ["Austria", "🇦🇹"], ["Jordania", "🇯🇴"]],
  K: [["Portugal", "🇵🇹"], ["RD Congo", "🇨🇩"], ["Uzbekistán", "🇺🇿"], ["Colombia", "🇨🇴"]],
  L: [["Inglaterra", "🏴󠁧󠁢󠁥󠁮󠁧󠁿"], ["Croacia", "🇭🇷"], ["Ghana", "🇬🇭"], ["Panamá", "🇵🇦"]],
};

const teams: Team[] = [];
const matches: Match[] = [];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

Object.entries(groupsRaw).forEach(([g, ts]) => {
  ts.forEach(([name, flag]) => {
    teams.push({ id: `${g}-${slug(name)}`, name, flag, group: g });
  });
  const ids = ts.map(([n]) => `${g}-${slug(n)}`);
  const pairs: [number, number][] = [[0, 1], [2, 3], [0, 2], [1, 3], [0, 3], [1, 2]];
  pairs.forEach(([h, a], i) => {
    matches.push({
      id: `${g}-m${i + 1}`,
      group: g,
      stage: "group",
      homeId: ids[h],
      awayId: ids[a],
      homeScore: null,
      awayScore: null,
      date: null,
    });
  });
});

const players: Player[] = [
  { id: "p1", name: "Lionel Messi", teamId: "J-argentina", goals: 0, assists: 0 },
  { id: "p2", name: "Kylian Mbappé", teamId: "I-francia", goals: 0, assists: 0 },
  { id: "p3", name: "Vinícius Jr.", teamId: "C-brasil", goals: 0, assists: 0 },
  { id: "p4", name: "Lamine Yamal", teamId: "H-espana", goals: 0, assists: 0 },
  { id: "p5", name: "Luis Díaz", teamId: "K-colombia", goals: 0, assists: 0 },
  { id: "p6", name: "Harry Kane", teamId: "L-inglaterra", goals: 0, assists: 0 },
  { id: "p7", name: "Cristiano Ronaldo", teamId: "K-portugal", goals: 0, assists: 0 },
  { id: "p8", name: "Jamal Musiala", teamId: "E-alemania", goals: 0, assists: 0 },
];

// Build 32 knockout matches with slot references
function p(pos: 1 | 2, group: string): SlotRef { return { kind: "pos", pos, group }; }
function t(index: number): SlotRef { return { kind: "third", index }; }
function w(matchId: string): SlotRef { return { kind: "winner", matchId }; }
function l(matchId: string): SlotRef { return { kind: "loser", matchId }; }

// R32 pairings (16). Left side M1..M8, Right side M9..M16
const r32Pairs: [SlotRef, SlotRef][] = [
  [p(1, "A"), t(1)],          // M1
  [p(2, "C"), p(2, "E")],     // M2
  [p(1, "B"), t(2)],          // M3
  [p(2, "D"), p(2, "F")],     // M4
  [p(1, "E"), p(2, "A")],     // M5
  [p(1, "F"), t(3)],          // M6
  [p(1, "G"), p(2, "H")],     // M7
  [p(1, "H"), t(4)],          // M8
  [p(1, "I"), t(5)],          // M9
  [p(2, "K"), p(2, "I")],     // M10
  [p(1, "J"), t(6)],          // M11
  [p(2, "L"), p(2, "J")],     // M12
  [p(1, "K"), p(2, "B")],     // M13
  [p(1, "L"), t(7)],          // M14
  [p(1, "C"), p(2, "G")],     // M15
  [p(1, "D"), t(8)],          // M16
];

const knockout: KOMatch[] = [];
const blank = { homeScore: null, awayScore: null, pensHome: null, pensAway: null };

r32Pairs.forEach((pair, i) => {
  knockout.push({
    id: `M${i + 1}`, number: i + 1, stage: "r32",
    homeFrom: pair[0], awayFrom: pair[1], ...blank,
  });
});
// R16 (M17..M24): pair adjacents
for (let i = 0; i < 8; i++) {
  const a = `M${i * 2 + 1}`;
  const b = `M${i * 2 + 2}`;
  knockout.push({
    id: `M${17 + i}`, number: 17 + i, stage: "r16",
    homeFrom: w(a), awayFrom: w(b), ...blank,
  });
}
// QF (M25..M28)
for (let i = 0; i < 4; i++) {
  knockout.push({
    id: `M${25 + i}`, number: 25 + i, stage: "qf",
    homeFrom: w(`M${17 + i * 2}`), awayFrom: w(`M${18 + i * 2}`), ...blank,
  });
}
// SF (M29..M30)
knockout.push({ id: "M29", number: 29, stage: "sf", homeFrom: w("M25"), awayFrom: w("M26"), ...blank });
knockout.push({ id: "M30", number: 30, stage: "sf", homeFrom: w("M27"), awayFrom: w("M28"), ...blank });
// Third place (M31)
knockout.push({ id: "M31", number: 31, stage: "third", homeFrom: l("M29"), awayFrom: l("M30"), ...blank });
// Final (M32)
knockout.push({ id: "M32", number: 32, stage: "final", homeFrom: w("M29"), awayFrom: w("M30"), ...blank });

export const INITIAL_DATA: AppData = { teams, matches, players, knockout };
