import { useEffect, useState } from "react";
import { getTopScorers, TopScorer } from "@/services/scorers";

const REFRESH_MS = 10 * 60 * 1000;

export function useTopScorers() {
  const [scorers, setScorers] = useState<TopScorer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const load = async (force = false) => {
      const data = await getTopScorers(force);
      if (cancelled) return;
      setScorers(data);
      setError(data.length === 0);
      setLoading(false);
      timer = setTimeout(() => load(true), REFRESH_MS);
    };

    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return { scorers, loading, error };
}
