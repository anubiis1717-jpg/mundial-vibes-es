import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// Sync FIFA World Cup 2026 fixtures from API-Football (RapidAPI).
// All credentials live as backend secrets only — never exposed to the client.

const LEAGUE_ID = 1; // World Cup
const SEASON = 2026;

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
        JSON.stringify({ error: "FOOTBALL_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const url = `https://${apiHost}/v3/fixtures?league=${LEAGUE_ID}&season=${SEASON}`;
    const apiRes = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": apiHost,
      },
    });

    if (!apiRes.ok) {
      const text = await apiRes.text();
      return new Response(
        JSON.stringify({ error: `API-Football error ${apiRes.status}`, details: text }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const json = await apiRes.json();
    const raw = Array.isArray(json?.response) ? json.response : [];

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
      JSON.stringify({ count: fixtures.length, fixtures, syncedAt: new Date().toISOString() }),
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
