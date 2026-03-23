import { useState, useEffect, useCallback } from "react";
import { Booking } from "../types";
import { api } from "../api/client";

// Custom hook that owns all booking data fetching and mutation logic
// Components just call useBookings() instead of duplicating this code
export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [total, setTotal] = useState(0);

  // Wrapped in useCallback so the function reference stays stable across renders
  // Without this, a new function would be created every render causing an infinite fetch loop
  const fetch = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      // API returns a paginated envelope — extract items and pagination metadata
      const data = await api.getBookings(p);
      setBookings(data.items);
      setHasNext(data.pagination.has_next);
      setTotal(data.pagination.total);
      setPage(p);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      // finally runs whether the request succeeded or failed
      setLoading(false);
    }
  }, []);

  // Fetch on mount — empty dependency array means this only runs once
  useEffect(() => {
    fetch(1);
  }, [fetch]);

  const cancel = useCallback(
    async (id: number) => {
      await api.cancelBooking(id);
      // Refetch the current page so the cancelled booking updates immediately
      await fetch(page);
    },
    [fetch, page]
  );

  // Expose pagination state so pages can show next/prev controls if needed
  return { bookings, loading, error, refetch: fetch, cancel, hasNext, total, page, setPage: fetch };
}
