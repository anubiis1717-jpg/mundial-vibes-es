## Objetivo

Mantener TheSportsDB solo como fuente de datos (calendario, horarios, estadios, resultados) y restaurar las banderas emoji originales en toda la app. Además, arreglar el "Próximo partido" del Inicio para que muestre el siguiente cronológicamente con datos reales.

## Cambios

### 1. Quitar escudos de TheSportsDB
**`src/components/MatchCard.tsx`**
- Eliminar lógica de `homeBadge` / `awayBadge` / `swapped`.
- `TeamSide` vuelve a mostrar solo el `flag` emoji (drop el `<img>`).
- Mantener: fecha/hora local, status (NS/LIVE/FT), venue, country desde `fixture`.

### 2. Mantener TheSportsDB como datos
**`src/services/theSportsDb.ts`**
- Sin cambios funcionales. Se siguen consumiendo `kickoffUtc`, `venue`, `country`, `status`, `homeScore`, `awayScore`.
- Opcional: dejar de exponer `homeBadge`/`awayBadge` en el tipo (limpieza menor) — o dejarlos sin usar. Elegimos **dejarlos sin usar** para no romper nada.

### 3. Verificar banderas de los 48 equipos
**`src/data/initialData.ts`**
- Revisar país por país que el emoji `flag` corresponda al ISO correcto:
  - Brasil 🇧🇷, Marruecos 🇲🇦, Suiza 🇨🇭, Australia 🇦🇺, Haití 🇭🇹, etc.
- Corregir cualquier desalineación encontrada (sin tocar nombres, grupos ni IDs).

### 4. Próximo partido en Inicio
**`src/sections/Inicio.tsx`**
- Usar `useWorldCupFixtures()` para enriquecer matches con `kickoffUtc` y `venue`.
- `next` = primer partido sin marcador ordenado por `kickoffUtc` ascendente (no por orden del array).
- Mostrar: banderas, equipos, fecha local, hora local (via `formatLocalDateTime`), estadio, ciudad, grupo y jornada.
- Reemplazar la etiqueta "Hora Colombia" por "Hora local".
- Eliminar el texto "POR CONFIRMAR" cuando haya `kickoffUtc` de la API.

### 5. Partidos por grupo
**`src/sections/Partidos.tsx`** — sin cambios (ya usa `MatchCard`, que ahora muestra venue + ciudad).

### 6. Bracket y diseño
- No tocar `Bracket.tsx`, `Grupos.tsx`, glassmorphism, colores, fondos ni animaciones.

## Archivos

- Editar: `src/components/MatchCard.tsx`, `src/sections/Inicio.tsx`, `src/data/initialData.ts`
- Revisar (sin cambios esperados): `src/services/theSportsDb.ts`, `src/hooks/useWorldCupFixtures.ts`, `src/lib/format.ts`

## Resultado

App con banderas emoji uniformes y elegantes para los 48 equipos, datos reales (fechas, horas locales, estadios, ciudades, resultados) provistos por TheSportsDB, y tarjeta de "Próximo partido" mostrando el siguiente partido cronológico con toda su información.
