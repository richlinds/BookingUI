import { useState, FormEvent } from "react";
import { Resource } from "../types";
import { api } from "../api/client";
import { useResources } from "../hooks/useResources";
import { useBookings } from "../hooks/useBookings";

interface BookingFormProps {
  resource: Resource;
  onSuccess: () => void;
  onCancel: () => void;
}

// Inline booking form that appears inside the resource card
function BookingForm({ resource, onSuccess, onCancel }: BookingFormProps) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [availability, setAvailability] = useState<boolean | null>(null); // null = not checked yet
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checkAvailability = async () => {
    if (!startTime || !endTime) return;
    try {
      // datetime-local input gives "2026-04-01T09:00" (no seconds)
      // .slice(0, 19) ensures we have exactly "2026-04-01T09:00:00" as the API expects
      const data = await api.checkAvailability(
        resource.id,
        startTime.slice(0, 19),
        endTime.slice(0, 19)
      );
      setAvailability(data.available);
    } catch {
      setAvailability(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.createBooking({
        resource_id: resource.id,
        start_time: startTime.slice(0, 19),
        end_time: endTime.slice(0, 19),
        // Only include notes if the user typed something — undefined is excluded from JSON.stringify
        notes: notes || undefined,
      });
      onSuccess(); // Notify the parent so it can refresh bookings and switch tabs
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
      <div>
        <label className="text-xs text-gray-500 block mb-1">Start time</label>
        <input
          type="datetime-local"
          className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-accent"
          value={startTime}
          // Reset availability when times change — previous check is no longer valid
          onChange={(e) => { setStartTime(e.target.value); setAvailability(null); }}
          required
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">End time</label>
        <input
          type="datetime-local"
          className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-accent"
          value={endTime}
          onChange={(e) => { setEndTime(e.target.value); setAvailability(null); }}
          required
        />
      </div>
      <input
        className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-accent"
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <button
        type="button" // type="button" prevents this from submitting the form
        onClick={checkAvailability}
        className="text-sm bg-border text-gray-300 rounded-lg py-2 hover:bg-opacity-80"
      >
        Check availability
      </button>

      {/* Conditional rendering — only show these when availability has been checked */}
      {availability === true && <p className="text-green-400 text-sm">✓ Available</p>}
      {availability === false && <p className="text-red-400 text-sm">✗ Already booked</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          // Disable the confirm button if we know it's unavailable
          disabled={loading || availability === false}
          className="flex-1 bg-accent text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-50"
        >
          {loading ? "Booking..." : "Confirm"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 border border-border text-gray-500 rounded-lg text-sm hover:text-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

interface ResourceCardProps {
  resource: Resource;
  onBooked: () => void;
}

function ResourceCard({ resource, onBooked }: ResourceCardProps) {
  // Track whether the booking form is open for this specific card
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-semibold text-gray-100">{resource.name}</h3>
        <span className="text-xs bg-border text-gray-400 px-2 py-0.5 rounded">
          cap. {resource.capacity}
        </span>
      </div>
      {/* ?? is the nullish coalescing operator — use right side if left is null or undefined */}
      <p className="text-sm text-gray-500 mb-4">
        {resource.description ?? "No description"}
      </p>

      {/* Toggle between the Book button and the booking form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-accent text-white rounded-lg py-2 text-sm font-semibold hover:bg-opacity-90"
        >
          Book
        </button>
      ) : (
        <BookingForm
          resource={resource}
          onSuccess={() => { setShowForm(false); onBooked(); }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

export default function ResourcesPage() {
  const { resources, loading, error } = useResources();
  // We need refetch from useBookings so we can refresh the bookings list after a new booking
  const { refetch } = useBookings();

  if (loading) return <p className="text-gray-500">Loading resources...</p>;
  if (error) return <p className="text-red-400">{error}</p>;
  if (!resources.length) return <p className="text-gray-500">No resources available.</p>;

  return (
    // CSS grid that automatically fills columns — each card is at least 320px wide
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {resources.map((r) => (
        <ResourceCard key={r.id} resource={r} onBooked={refetch} />
      ))}
    </div>
  );
}
