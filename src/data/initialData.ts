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

export interface AppData {
  teams: Team[];
  matches: Match[];
  players: Player[];
}

// 12 groups A-L with 4 teams each (plausible names + emoji flags)
const groupsRaw: Record<string, [string, string][]> = {
  A: [["México", "🇲🇽"], ["Canadá", "🇨🇦"], ["Marruecos", "🇲🇦"], ["Uzbekistán", "🇺🇿"]],
  B: [["Estados Unidos", "🇺🇸"], ["Colombia", "🇨🇴"], ["Senegal", "🇸🇳"], ["Polonia", "🇵🇱"]],
  C: [["Argentina", "🇦🇷"], ["Croacia", "🇭🇷"], ["Japón", "🇯🇵"], ["Túnez", "🇹🇳"]],
  D: [["Francia", "🇫🇷"], ["Australia", "🇦🇺"], ["Egipto", "🇪🇬"], ["Ecuador", "🇪🇨"]],
  E: [["España", "🇪🇸"], ["Suiza", "🇨🇭"], ["Corea del Sur", "🇰🇷"], ["Catar", "🇶🇦"]],
  F: [["Brasil", "🇧🇷"], ["Uruguay", "🇺🇾"], ["Dinamarca", "🇩🇰"], ["Ghana", "🇬🇭"]],
  G: [["Inglaterra", "🏴󠁧󠁢󠁥󠁮󠁧󠁿"], ["Países Bajos", "🇳🇱"], ["Irán", "🇮🇷"], ["Nueva Zelanda", "🇳🇿"]],
  H: [["Portugal", "🇵🇹"], ["Bélgica", "🇧🇪"], ["Argelia", "🇩🇿"], ["Costa Rica", "🇨🇷"]],
  I: [["Alemania", "🇩🇪"], ["Serbia", "🇷🇸"], ["Camerún", "🇨🇲"], ["Panamá", "🇵🇦"]],
  J: [["Italia", "🇮🇹"], ["Chile", "🇨🇱"], ["Nigeria", "🇳🇬"], ["Jordania", "🇯🇴"]],
  K: [["Países Bajos B", "🇳🇱"], ["Perú", "🇵🇪"], ["Sudáfrica", "🇿🇦"], ["Arabia Saudita", "🇸🇦"]],
  L: [["Bélgica B", "🇧🇪"], ["Paraguay", "🇵🇾"], ["Costa de Marfil", "🇨🇮"], ["Cabo Verde", "🇨🇻"]],
};

const teams: Team[] = [];
const matches: Match[] = [];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

Object.entries(groupsRaw).forEach(([g, ts]) => {
  ts.forEach(([name, flag]) => {
    teams.push({ id: `${g}-${slug(name)}`, name, flag, group: g });
  });
  // 6 round-robin matches: indexes (0v1)(2v3)(0v2)(1v3)(0v3)(1v2)
  const ids = ts.map(([n]) => `${g}-${slug(n)}`);
  const pairs: [number, number][] = [
    [0, 1], [2, 3], [0, 2], [1, 3], [0, 3], [1, 2],
  ];
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

// A few sample scorers/assists
const players: Player[] = [
  { id: "p1", name: "Lionel Messi", teamId: "C-argentina", goals: 0, assists: 0 },
  { id: "p2", name: "Kylian Mbappé", teamId: "D-francia", goals: 0, assists: 0 },
  { id: "p3", name: "Vinícius Jr.", teamId: "F-brasil", goals: 0, assists: 0 },
  { id: "p4", name: "Lamine Yamal", teamId: "E-espana", goals: 0, assists: 0 },
  { id: "p5", name: "Luis Díaz", teamId: "B-colombia", goals: 0, assists: 0 },
  { id: "p6", name: "Harry Kane", teamId: "G-inglaterra", goals: 0, assists: 0 },
  { id: "p7", name: "Cristiano Ronaldo", teamId: "H-portugal", goals: 0, assists: 0 },
  { id: "p8", name: "Jamal Musiala", teamId: "I-alemania", goals: 0, assists: 0 },
];

export const INITIAL_DATA: AppData = { teams, matches, players };
