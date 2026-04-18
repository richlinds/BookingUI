import { Booking } from "../types";
import { useBookings } from "../hooks/useBookings";

function StatusBadge({ status }: { status: Booking["status"] }) {
  const styles: Record<Booking["status"], string> = {
    confirmed: "bg-green-900 text-green-400",
    cancelled: "bg-red-900 text-red-400",
    pending: "bg-yellow-900 text-yellow-400",
  };
  return <span className={`text-xs px-2 py-0.5 rounded ${styles[status]}`}>{status}</span>;
}

interface BookingRowProps {
  booking: Booking;
  onCancel: () => void;
}

function BookingRow({ booking, onCancel }: BookingRowProps) {
  const start = new Date(booking.start_time);
  const end = new Date(booking.end_time);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-CA", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      className={`bg-card border border-border rounded-xl p-5 flex justify-between items-center gap-4 ${
        booking.status === "cancelled" ? "opacity-50" : ""
      }`}
    >
      <div className="flex-1">
        <p className="font-semibold text-gray-100">{booking.resource_name ?? "Unknown Resource"}</p>
        <p className="text-sm text-gray-500 mt-0.5">
          {formatDate(start)} · {formatTime(start)} – {formatTime(end)}
        </p>
        <p className="text-sm text-gray-600 mt-0.5">
          {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
          {booking.notes && ` · ${booking.notes}`}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <StatusBadge status={booking.status} />
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
        <BookingRow key={b.id} booking={b} onCancel={() => cancel(b.id)} />
      ))}
    </div>
  );
}
