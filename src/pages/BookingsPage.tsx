import { useState } from "react";
import { Booking } from "../types";
import { useBookings } from "../hooks/useBookings";
import ImageLightbox from "../components/ImageLightbox";

function StatusBadge({ status }: { status: Booking["status"] }) {
  const styles: Record<Booking["status"], string> = {
    confirmed: "bg-green-900 text-green-400",
    cancelled: "bg-red-900 text-red-400",
    pending: "bg-yellow-900 text-yellow-400",
  };
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

interface BookingRowProps {
  booking: Booking;
  onCancel: () => void;
}

function BookingRow({ booking, onCancel }: BookingRowProps) {
  const [lightbox, setLightbox] = useState(false);
  const start = new Date(booking.start_time);
  const end = new Date(booking.end_time);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" });

  const isCancelled = booking.status === "cancelled";

  return (
    <div
      className={`bg-card border border-border rounded-xl p-5 flex gap-4 items-center transition-all duration-200 ${
        isCancelled ? "opacity-50" : "hover:border-accent hover:shadow-lg"
      }`}
    >
      <div className="w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-surface border border-border">
        {booking.resource_image_url ? (
          <img
            src={booking.resource_image_url}
            alt={booking.resource_name ?? "Resource"}
            className="h-full w-full object-cover cursor-zoom-in"
            onClick={() => setLightbox(true)}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400 dark:text-gray-600 text-xs italic">
            No image
          </div>
        )}
      </div>
      {lightbox && booking.resource_image_url && (
        <ImageLightbox
          src={booking.resource_image_url}
          alt={booking.resource_name ?? "Resource"}
          onClose={() => setLightbox(false)}
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
          {booking.resource_name ?? "Unknown Resource"}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {formatDate(start)} · {formatTime(start)} – {formatTime(end)}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-0.5">
          {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
          {booking.notes && (
            <span className="text-gray-600 dark:text-gray-400"> · {booking.notes}</span>
          )}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <StatusBadge status={booking.status} />
        {booking.status === "confirmed" && (
          <button
            onClick={onCancel}
            className="text-xs border border-red-800 text-red-400 rounded-lg px-3 py-1.5 hover:bg-red-900 transition-colors"
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

  if (loading) return <p className="text-gray-600 dark:text-gray-400">Loading bookings...</p>;
  if (error) return <p className="text-red-400">{error}</p>;
  if (!bookings.length) return <p className="text-gray-600 dark:text-gray-400">No bookings yet.</p>;

  return (
    <div className="flex flex-col gap-3">
      {bookings.map((b) => (
        <BookingRow key={b.id} booking={b} onCancel={() => cancel(b.id)} />
      ))}
    </div>
  );
}
