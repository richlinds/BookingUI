import { Booking } from "../types";
import { useBookings } from "../hooks/useBookings";

// Small focused component just for the status badge
// Keeping it separate makes BookingRow easier to read
function StatusBadge({ status }: { status: Booking["status"] }) {
  // Record<K, V> is a TypeScript type for an object where keys are K and values are V
  // Booking["status"] extracts the type of the status field — "confirmed" | "cancelled" | "pending"
  // This ensures we have a style for every possible status value
  const styles: Record<Booking["status"], string> = {
    confirmed: "bg-green-900 text-green-400",
    cancelled: "bg-red-900 text-red-400",
    pending: "bg-yellow-900 text-yellow-400",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded ${styles[status]}`}>
      {status}
    </span>
  );
}

interface BookingRowProps {
  booking: Booking;
  onCancel: () => void;
}

function BookingRow({ booking, onCancel }: BookingRowProps) {
  // Convert ISO string to a JS Date object for formatting
  const start = new Date(booking.start_time);
  const end = new Date(booking.end_time);

  // toLocaleDateString and toLocaleTimeString format dates according to locale
  // "en-CA" gives us Canadian English format (YYYY-MM-DD style dates)
  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`bg-card border border-border rounded-xl p-5 flex justify-between items-center gap-4 ${
      // Dim cancelled bookings so they're visually de-emphasised
      booking.status === "cancelled" ? "opacity-50" : ""
    }`}>
      <div className="flex-1">
        <p className="font-semibold text-gray-100">{booking.resource_name}</p>
        <p className="text-sm text-gray-500 mt-0.5">
          {formatDate(start)} · {formatTime(start)} – {formatTime(end)}
        </p>
        {/* Only render notes if they exist — && short-circuits if notes is null */}
        {booking.notes && (
          <p className="text-sm text-gray-600 italic mt-0.5">{booking.notes}</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-2">
        <StatusBadge status={booking.status} />
        {/* Only show the cancel button for confirmed bookings */}
        {booking.status === "confirmed" && (
          <button
            onClick={onCancel}
            className="text-xs border border-red-800 text-red-400 rounded px-2 py-1 hover:bg-red-900"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const { bookings, loading, error, cancel } = useBookings();

  if (loading) return <p className="text-gray-500">Loading bookings...</p>;
  if (error) return <p className="text-red-400">{error}</p>;
  if (!bookings.length) return <p className="text-gray-500">No bookings yet.</p>;

  return (
    <div className="flex flex-col gap-3">
      {bookings.map((b) => (
        // Pass an arrow function so cancel receives the booking id
        // without needing to pass the id as a separate prop to BookingRow
        <BookingRow key={b.id} booking={b} onCancel={() => cancel(b.id)} />
      ))}
    </div>
  );
}
