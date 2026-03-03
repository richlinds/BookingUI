import { useState, useEffect, useCallback } from "react";
import { Resource } from "../types";
import { api } from "../api/client";

// Same pattern as useBookings — a custom hook that owns the fetch logic
// for resources so multiple pages can reuse it without duplicating code
export function useResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getResources();
      setResources(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  // refetch is exposed so the Admin page can trigger a refresh after creating or editing a resource
  return { resources, loading, error, refetch: fetch };
}
