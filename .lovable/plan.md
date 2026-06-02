# Plan: Migrar de API-Football a TheSportsDB

## Objetivo
Eliminar por completo la integración con API-Football y usar exclusivamente TheSportsDB (League 4429, Season 2026) como fuente de datos del Mundial 2026, mostrando fecha real, hora local del dispositivo del usuario, estadio y escudos reales, sin tocar el diseño glassmorphism, grupos, bracket ni navegación.

## 1. Eliminación de API-Football
- Borrar la edge function `supabase/functions/sync-fixtures/` y desplegar su eliminación.
- Borrar los secrets `FOOTBALL_API_KEY` y `FOOTBALL_API_HOST` del backend.
- Quitar de `src/sections/Ajustes.tsx`:
  - el mapa `NAME_ALIASES` ligado a API-Football, el estado `syncing`/`lastSync`, la función `syncFixtures`, el bloque "Calendario en vivo" y los imports de `supabase`.
- Eliminar la clave `mundial2026.lastSync` y cualquier referencia residual a API-Football en el código.

## 2. Nuevo servicio `src/services/theSportsDb.ts`
Cliente puro frontend (sin backend), con caché en `localStorage` (TTL 15 min) y refresco automático.

Funciones expuestas:
- `getWorldCupFixtures()` → `eventsseason.php?id=4429&s=2026`
- `getMatchById(id)` → `lookupevent.php?id=<id>`
- `getTeams()` → `lookup_all_teams.php?id=4429`
- `getMatchDetails(id)` → alias enriquecido de `getMatchById` (incluye estadio, escudos, estado).

Tipos normalizados:
```ts
type TsdbFixture = {
  id: string;
  homeTeam: string; awayTeam: string;
  homeBadge: string | null; awayBadge: string | null;
  venue: string | null; country: string | null;
  kickoffUtc: string | null;       // ISO UTC desde strTimestamp
  status: "NS" | "LIVE" | "FT";
  homeScore: number | null; awayScore: number | null;
};
```

Detalles técnicos:
- Caché: `localStorage["tsdb.fixtures.4429.2026"] = { ts, data }`; se invalida a los 15 min o por `force=true`.
- Polling: hook `useWorldCupFixtures()` con `setInterval(15*60*1000)` y refetch al volver la pestaña a foco.
- Fallback: si `fetch` falla o devuelve `events: null`, devolver los datos en caché; si tampoco hay, devolver `[]` y dejar que la UI use los datos locales actuales de `initialData.ts`.
- Sin claves: TheSportsDB key `3` es pública y va hardcoded en el servicio.

## 3. Hora local automática
Nueva utilidad `src/lib/format.ts`:
- Reemplazar `formatColombiaDate` por `formatLocalDateTime(isoUtc)` que use `Intl.DateTimeFormat(undefined, { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, ... })`.
- Devuelve `"Sáb 13 Jun · 18:00"` en la zona horaria del dispositivo. La sigla "COL" se elimina.
- Mantener compat: exportar también `formatColombiaDate` como alias temporal apuntando a la nueva función para no romper imports residuales.

## 4. Integración con la UI existente (sin cambios visuales)
- Hook `useWorldCupFixtures()` en `src/hooks/useWorldCupFixtures.ts`: hace el matching TheSportsDB → matches locales por nombre de equipo (reutilizando un `NAME_ALIASES` mínimo: inglés → español que ya existe en local) y devuelve un `Map<matchId, TsdbFixture>`.
- `MatchCard.tsx`: recibe del hook (vía context o consulta directa) el fixture correspondiente y:
  - usa `fixture.kickoffUtc` para `formatLocalDateTime` (cae a `match.date` si no hay fixture).
  - reemplaza el emoji `flag` por `<img src={fixture.homeBadge}>` cuando exista; si no, conserva el emoji actual.
  - añade una tarjeta pequeña debajo con `📍 {venue}` cuando exista (misma clase `card-surface` para mantener glassmorphism, sin nuevos colores).
  - estado del partido: badge "Próximamente" (NS), "En vivo" (LIVE, color accent existente), "Finalizado" (FT). Se mantienen las clases actuales.
- No se modifican `Grupos.tsx`, `Bracket.tsx`, `Inicio.tsx`, navegación ni el dashboard.

## 5. Caché y refresco
- Primera carga: lee de cache si <15 min, si no fetch + guarda.
- Refresco automático: cada 15 min mientras la app está abierta.
- Reintento: si falla, próximo intento en 60 s (máx 3 reintentos), luego espera al ciclo normal.

## 6. Resumen de archivos
Crear:
- `src/services/theSportsDb.ts`
- `src/hooks/useWorldCupFixtures.ts`

Editar:
- `src/lib/format.ts` (nueva función + alias)
- `src/components/MatchCard.tsx` (escudos reales, estadio, estado, hora local)
- `src/sections/Ajustes.tsx` (eliminar bloque sync + aliases + imports)

Eliminar:
- `supabase/functions/sync-fixtures/index.ts` (+ desplegar borrado)
- Secrets `FOOTBALL_API_KEY`, `FOOTBALL_API_HOST`

## Garantías visuales
No se tocan: tokens de color, `index.css`, `tailwind.config.ts`, fondo de la Copa, glassmorphism, grupos, bracket, navegación inferior. Sólo se añaden subnodos dentro de la `MatchCard` actual.
