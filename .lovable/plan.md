# Integración segura con API-Football (Mundial 2026)

## Objetivo

Guardar la API key de API-Football de forma **privada en el backend** (no visible en el frontend ni en el código publicado) y usarla para **actualizar fechas y horas de los partidos en hora de Colombia (UTC-5)** dentro de la app, sin exponer la clave aunque compartas la app o la conviertas en APK más adelante.

## Qué se va a hacer

1. **Activar Lovable Cloud** (backend integrado). Necesario para tener secretos seguros y edge functions.
2. **Guardar las credenciales como secretos privados** del backend:
   - `FOOTBALL_API_KEY`
   - `FOOTBALL_API_HOST` (api-football-v1.p.rapidapi.com)
   
   Estos secretos **solo viven en el servidor**. No aparecen en el bundle de la app ni en el APK.
3. **Crear una edge function** `sync-fixtures` que:
   - Llama a API-Football usando los secretos.
   - Obtiene los fixtures de la Copa Mundial 2026 (league id 1, season 2026).
   - Convierte cada fecha/hora a **zona horaria America/Bogota (UTC-5)**.
   - Devuelve un JSON limpio con: `homeTeam`, `awayTeam`, `dateColombia`, `timeColombia`, `venue`, `status`, `score`.
4. **Botón "Actualizar calendario desde API"** en la sección **Ajustes**:
   - Llama a la edge function.
   - Hace match de los partidos devueltos con los partidos existentes en el store (por nombres de equipos).
   - Actualiza únicamente `fecha` y `hora` de los partidos en hora colombiana.
   - **No toca** grupos, equipos, marcadores ya jugados, bracket ni lógica de simulación.
5. **Estado de sincronización**: mostrar toast con "X partidos actualizados" y la última fecha de sync.

## Lo que NO se cambia

- Equipos, grupos, bracket, dashboard, navegación, colores, diseño glassmorphism.
- Lógica de simulación, tablas, mejores terceros, stats.
- Import/export JSON.
- La clave **nunca** se expone en el frontend (nada de `VITE_*`).

## Detalles técnicos

- Backend: Lovable Cloud (Supabase Edge Functions, runtime Deno).
- Secretos accesibles solo vía `Deno.env.get("FOOTBALL_API_KEY")` dentro de la function.
- Llamada desde frontend con `supabase.functions.invoke("sync-fixtures")` — sin headers de API key.
- Conversión horaria con `Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota" })`.
- Matching de equipos: normalización (lowercase, sin acentos) + diccionario de alias por si la API usa nombres distintos a los del store.
- Si la API devuelve un equipo que no existe en el store, se ignora (no se crea nada nuevo).

## Flujo del usuario

1. Abres **Ajustes** → botón **"Sincronizar calendario (API)"**.
2. La app llama al backend, el backend llama a API-Football, devuelve fechas en hora Colombia.
3. Los partidos se actualizan en pantalla. Marcadores existentes se conservan.

## Seguridad para el APK

- La key vive en Lovable Cloud, no en el código.
- Cuando empaquetes como APK, el APK solo conoce la URL pública de la edge function (segura por sí misma) — no la API key.
- Opcional siguiente paso: agregar rate limiting o auth a la edge function antes de publicar.
