import { useState, useEffect, useCallback } from "react";
import { Booking } from "../types";
import { api } from "../api/client";

// Custom hook that encapsulates all booking data fetching and mutation logic
// Components that need bookings just call useBookings() instead of duplicating this code
export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Wrapped in useCallback so the function reference stays stable across renders
  // This is important because it's listed as a dependency in useEffect below —
  // an unstable reference would cause an infinite fetch loop
  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getBookings();
      setBookings(data);
    } catch (err) {
      // TypeScript doesn't know the type of caught errors so we cast to Error
      setError((err as Error).message);
    } finally {
      // finally runs whether the request succeeded or failed
      setLoading(false);
    }
  }, []);

  // useEffect runs after the component mounts and whenever dependencies change
  // The empty dependency array [] means it only runs once on mount
  // fetch is included because it's used inside — eslint would warn if omitted
  useEffect(() => { fetch(); }, [fetch]);

  const cancel = useCallback(async (id: number) => {
    await api.cancelBooking(id);
    // Refetch the list after cancelling so the UI reflects the change
    await fetch();
  }, [fetch]);

  // Expose refetch so parent components can trigger a refresh after creating a booking
  return { bookings, loading, error, refetch: fetch, cancel };
}
