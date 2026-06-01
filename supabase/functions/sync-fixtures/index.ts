import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// Sync FIFA World Cup fixtures from API-Football (RapidAPI).
// Credentials stay as backend secrets only.

const LEAGUE_ID = 1; // World Cup
const DEFAULT_SEASONS = [2026, 2022]; // try current edition, fall back to last played

function toColombiaParts(iso: string) {
  // Convert UTC ISO to Colombia time (UTC-5, no DST)
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(new Date(iso)).map((p) => [p.type, p.value]),
  );
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  const time = `${parts.hour}:${parts.minute}`;
  return { date, time, iso: `${date}T${time}` };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("FOOTBALL_API_KEY");
    const apiHost = Deno.env.get("FOOTBALL_API_HOST") ?? "api-football-v1.p.rapidapi.com";
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "FOOTBALL_API_KEY not configured", fixtures: [], count: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const url = new URL(req.url);
    const seasonParam = url.searchParams.get("season");
    const seasons = seasonParam ? [Number(seasonParam)] : DEFAULT_SEASONS;

    let raw: any[] = [];
    let usedSeason: number | null = null;
    let lastStatus = 0;
    let lastDetails = "";

    const isRapid = apiHost.includes("rapidapi");
    const pathPrefix = isRapid ? "/v3" : "";
    const authHeaders: Record<string, string> = isRapid
      ? { "x-rapidapi-key": apiKey, "x-rapidapi-host": apiHost }
      : { "x-apisports-key": apiKey };

    const diagnostics: any[] = [];
    for (const season of seasons) {
      const apiUrl = `https://${apiHost}${pathPrefix}/fixtures?league=${LEAGUE_ID}&season=${season}`;
      console.log("Fetching:", apiUrl);
      const apiRes = await fetch(apiUrl, { headers: authHeaders });
      console.log("Status:", apiRes.status, "for season", season);
      const text = await apiRes.text();
      let json: any = null;
      try { json = JSON.parse(text); } catch { /* not json */ }
      const diag = {
        season,
        url: apiUrl,
        httpStatus: apiRes.status,
        apiErrors: json?.errors ?? null,
        apiResults: json?.results ?? null,
        apiMessage: json?.message ?? null,
        bodyPreview: json ? null : text.slice(0, 300),
      };
      diagnostics.push(diag);
      console.log("Diag:", JSON.stringify(diag));
      if (!apiRes.ok) {
        lastStatus = apiRes.status;
        lastDetails = text.slice(0, 200);
        continue;
      }
      const arr = Array.isArray(json?.response) ? json.response : [];
      if (arr.length > 0) {
        raw = arr;
        usedSeason = season;
        break;
      }
    }

    if (raw.length === 0) {
      return new Response(
        JSON.stringify({
          error: `Sin fixtures disponibles`,
          diagnostics,
          fixtures: [],
          count: 0,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }


    const fixtures = raw.map((r: any) => {
      const iso = r?.fixture?.date as string;
      const co = iso ? toColombiaParts(iso) : { date: null, time: null, iso: null };
      return {
        id: r?.fixture?.id ?? null,
        homeTeam: r?.teams?.home?.name ?? null,
        awayTeam: r?.teams?.away?.name ?? null,
        dateColombia: co.date,
        timeColombia: co.time,
        isoColombia: co.iso,
        venue: r?.fixture?.venue?.name ?? null,
        city: r?.fixture?.venue?.city ?? null,
        status: r?.fixture?.status?.short ?? null,
        homeScore: r?.goals?.home ?? null,
        awayScore: r?.goals?.away ?? null,
        round: r?.league?.round ?? null,
      };
    });

    return new Response(
      JSON.stringify({ count: fixtures.length, fixtures, season: usedSeason, syncedAt: new Date().toISOString() }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: "Unexpected error", details: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
