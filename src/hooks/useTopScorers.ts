import { useEffect, useState } from "react";
import { getLeaders, LeaderKind, LeaderRow } from "@/services/scorers";

const REFRESH_MS = 10 * 60 * 1000;

export function useLeaders(kind: LeaderKind) {
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const load = async (force = false) => {
      const data = await getLeaders(kind, force);
      if (cancelled) return;
      setRows(data);
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
  }, [kind]);

  return { rows, loading, error };
}

export const useTopScorers = () => useLeaders("goals");
export const useTopAssists = () => useLeaders("assists");
