import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import NotificationsDropdown from "../components/NotificationsDropdown";
import { useGetBookings } from "../hooks/useQueries";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Completed: {
    bg: "oklch(0.70 0.17 196 / 0.15)",
    text: "oklch(0.70 0.17 196)",
  },
  "En Route": {
    bg: "oklch(0.60 0.23 240 / 0.15)",
    text: "oklch(0.75 0.15 240)",
  },
  Arrived: { bg: "oklch(0.60 0.23 240 / 0.15)", text: "oklch(0.75 0.15 240)" },
  Assigned: { bg: "oklch(0.65 0.21 305 / 0.15)", text: "oklch(0.75 0.15 305)" },
  Searching: {
    bg: "oklch(0.62 0.20 40 / 0.15)",
    text: "oklch(0.75 0.15 40)",
  },
  Cancelled: { bg: "oklch(0.52 0.22 25 / 0.15)", text: "oklch(0.70 0.15 25)" },
};

const RIDE_EMOJIS: Record<string, string> = {
  Mini: "🚗",
  Sedan: "🚙",
  SUV: "🚐",
};

export default function HistoryPage() {
  const { data: bookings = [], isLoading } = useGetBookings();

  const sorted = [...bookings].sort((a, b) => Number(b.id) - Number(a.id));

  return (
    <div className="max-w-lg mx-auto px-4">
      <div
        className="flex items-center justify-between py-4 sticky top-0 z-30"
        style={{
          background: "oklch(var(--background) / 0.9)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div>
          <h1 className="text-xl font-bold text-gradient">Ride History</h1>
          <p className="text-xs text-muted-foreground">
            {sorted.length} total rides
          </p>
        </div>
        <NotificationsDropdown />
      </div>

      {sorted.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3 mb-5"
        >
          <div className="glass-card rounded-2xl p-3 text-center">
            <div className="text-lg font-bold">{sorted.length}</div>
            <div className="text-xs text-muted-foreground">Rides</div>
          </div>
          <div className="glass-card rounded-2xl p-3 text-center">
            <div className="text-lg font-bold">
              ₹{sorted.reduce((acc, b) => acc + Number(b.fare), 0)}
            </div>
            <div className="text-xs text-muted-foreground">Spent</div>
          </div>
          <div className="glass-card rounded-2xl p-3 text-center">
            <div className="text-lg font-bold">
              {sorted.reduce((acc, b) => acc + Number(b.distance), 0)} km
            </div>
            <div className="text-xs text-muted-foreground">Distance</div>
          </div>
        </motion.div>
      )}

      {isLoading && (
        <div data-ocid="history.loading_state" className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && sorted.length === 0 && (
        <motion.div
          data-ocid="history.empty_state"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 gap-4"
        >
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
            style={{ background: "oklch(var(--muted))" }}
          >
            🚗
          </div>
          <div className="text-center">
            <p className="font-semibold text-lg">No rides yet</p>
            <p className="text-muted-foreground text-sm mt-1">
              Book your first ride from the Home tab
            </p>
          </div>
        </motion.div>
      )}

      {!isLoading && (
        <div className="space-y-3 pb-6">
          {sorted.map((booking, i) => {
            const statusStyle =
              STATUS_COLORS[booking.status] || STATUS_COLORS.Searching;
            const rideEmoji = RIDE_EMOJIS[booking.rideType] || "🚗";
            return (
              <motion.div
                key={booking.id.toString()}
                data-ocid={`history.item.${i + 1}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card rounded-2xl p-4 shadow-card"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: "oklch(var(--muted))" }}
                  >
                    {rideEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">
                        {booking.rideType}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: statusStyle.bg,
                          color: statusStyle.text,
                        }}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-sm">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: "oklch(0.70 0.17 196)" }}
                        />
                        <span className="text-foreground/80 truncate">
                          {booking.pickup}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm">
                        <div
                          className="w-2 h-2 rounded-sm flex-shrink-0"
                          style={{ background: "oklch(0.60 0.23 240)" }}
                        />
                        <span className="text-foreground/80 truncate">
                          {booking.dropoff}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground"
                  style={{ borderColor: "oklch(var(--border))" }}
                >
                  <span>Driver: {booking.driverName}</span>
                  <span>{booking.distance.toString()} km</span>
                  <span
                    className="font-semibold"
                    style={{ color: "oklch(0.82 0.18 85)" }}
                  >
                    ₹{booking.fare.toString()}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
