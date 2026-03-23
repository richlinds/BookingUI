import { useState, useEffect, useCallback } from "react";
import { Resource } from "../types";
import { api } from "../api/client";

export function useResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetch = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getResources(p);
      setResources(data.items);
      setHasNext(data.pagination.has_next);
      setTotal(data.pagination.total);
      setPage(p);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch(1);
  }, [fetch]);

  return { resources, loading, error, refetch: fetch, hasNext, total, page, setPage: fetch };
}
