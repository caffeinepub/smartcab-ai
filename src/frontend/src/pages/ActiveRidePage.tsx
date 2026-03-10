import { Button } from "@/components/ui/button";
import { Check, Loader2, MessageSquare, Phone } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ActiveBookingData } from "../App";
import MapSVG from "../components/MapSVG";
import TripSummaryModal from "../components/TripSummaryModal";
import {
  useAddNotification,
  useUpdateBookingStatus,
} from "../hooks/useQueries";

const RIDE_STATUSES = [
  { label: "Searching", desc: "Finding your driver" },
  { label: "Assigned", desc: "Driver on the way" },
  { label: "En Route", desc: "Heading to pickup" },
  { label: "Arrived", desc: "Driver is here!" },
  { label: "Completed", desc: "Ride complete" },
];

interface ActiveRidePageProps {
  booking: ActiveBookingData;
  onComplete: () => void;
}

export default function ActiveRidePage({
  booking,
  onComplete,
}: ActiveRidePageProps) {
  const [statusIndex, setStatusIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const updateStatus = useUpdateBookingStatus();
  const addNotification = useAddNotification();

  // biome-ignore lint/correctness/useExhaustiveDependencies: addNotification.mutate is stable
  useEffect(() => {
    if (statusIndex >= RIDE_STATUSES.length - 1) return;
    const timer = setTimeout(() => {
      setStatusIndex((prev) => {
        const next = prev + 1;
        if (next === 1) {
          addNotification.mutate(
            `🚗 Driver ${booking.driverName} has been assigned to your ride!`,
          );
        } else if (next === 3) {
          addNotification.mutate(
            `📍 Your driver ${booking.driverName} has arrived at the pickup location!`,
          );
        }
        updateStatus.mutate({
          bookingId: booking.id,
          status: RIDE_STATUSES[next].label,
        });
        return next;
      });
    }, 4000);
    return () => clearTimeout(timer);
  }, [statusIndex]);

  useEffect(() => {
    if (statusIndex === RIDE_STATUSES.length - 1) {
      const t = setTimeout(() => setShowSummary(true), 1200);
      return () => clearTimeout(t);
    }
  }, [statusIndex]);

  const mapProgress = statusIndex / (RIDE_STATUSES.length - 1);
  const currentStatus = RIDE_STATUSES[statusIndex];
  const isCompleted = statusIndex === RIDE_STATUSES.length - 1;

  return (
    <div className="max-w-lg mx-auto min-h-screen flex flex-col">
      <div
        className="flex items-center gap-3 px-4 py-4 sticky top-0 z-30"
        style={{
          background: "oklch(var(--background) / 0.9)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gradient">Active Ride</h1>
          <p className="text-xs text-muted-foreground">
            {booking.pickup} → {booking.dropoff}
          </p>
        </div>
        <div
          className="px-3 py-1.5 rounded-xl text-xs font-semibold"
          style={{
            background: isCompleted
              ? "oklch(0.70 0.17 196 / 0.2)"
              : "oklch(0.60 0.23 240 / 0.2)",
            color: isCompleted
              ? "oklch(0.70 0.17 196)"
              : "oklch(0.75 0.15 240)",
            border: `1px solid ${
              isCompleted
                ? "oklch(0.70 0.17 196 / 0.4)"
                : "oklch(0.60 0.23 240 / 0.4)"
            }`,
          }}
        >
          {isCompleted ? "✓ Completed" : "● Live"}
        </div>
      </div>

      <div className="flex-1 px-4 pb-6 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <MapSVG
            pickup={booking.pickup}
            dropoff={booking.dropoff}
            progress={mapProgress}
            statusIndex={statusIndex}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-4"
        >
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-border" />
            <motion.div
              className="absolute top-4 left-4 h-0.5"
              style={{ background: "oklch(0.60 0.23 240)" }}
              animate={{
                width: `${(statusIndex / (RIDE_STATUSES.length - 1)) * 100}%`,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />

            {RIDE_STATUSES.map((s, i) => (
              <div
                key={s.label}
                className="flex flex-col items-center gap-1.5 relative z-10"
              >
                <motion.div
                  animate={{
                    scale: i === statusIndex ? [1, 1.1, 1] : 1,
                  }}
                  transition={{ duration: 0.4 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < statusIndex
                      ? "bg-accent text-accent-foreground"
                      : i === statusIndex
                        ? "status-step-active text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < statusIndex ? <Check className="w-4 h-4" /> : i + 1}
                </motion.div>
                <span
                  className={`text-xs font-medium ${
                    i === statusIndex ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={statusIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                <p className="font-semibold text-base">{currentStatus.label}</p>
                <p className="text-sm text-muted-foreground">
                  {currentStatus.desc}
                </p>
              </motion.div>
            </AnimatePresence>

            {statusIndex < RIDE_STATUSES.length - 1 && (
              <div
                data-ocid="active_ride.loading_state"
                className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground"
              >
                <Loader2 className="w-3 h-3 animate-spin" />
                Auto-updating...
              </div>
            )}
          </div>
        </motion.div>

        <AnimatePresence>
          {statusIndex >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="glass-card rounded-2xl p-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.60 0.23 240 / 0.3), oklch(0.70 0.17 196 / 0.3))",
                    border: "1px solid oklch(var(--primary) / 0.3)",
                  }}
                >
                  {booking.driverName.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base">
                      {booking.driverName}
                    </h3>
                    <span
                      className="text-sm font-bold"
                      style={{ color: "oklch(0.82 0.18 85)" }}
                    >
                      ⭐ {booking.driverRating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {booking.carModel}
                  </p>
                  <p
                    className="text-xs font-mono mt-0.5"
                    style={{ color: "oklch(0.75 0.15 240)" }}
                  >
                    {booking.vehicleNumber}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <div
                  className="flex-1 rounded-xl p-2.5 text-center"
                  style={{ background: "oklch(var(--muted))" }}
                >
                  <div className="text-xs text-muted-foreground">ETA</div>
                  <div className="font-bold text-sm">
                    {booking.driverEta} min
                  </div>
                </div>
                <div
                  className="flex-1 rounded-xl p-2.5 text-center"
                  style={{ background: "oklch(var(--muted))" }}
                >
                  <div className="text-xs text-muted-foreground">Distance</div>
                  <div className="font-bold text-sm">{booking.distance} km</div>
                </div>
                <div
                  className="flex-1 rounded-xl p-2.5 text-center"
                  style={{ background: "oklch(var(--muted))" }}
                >
                  <div className="text-xs text-muted-foreground">Fare</div>
                  <div className="font-bold text-sm">₹{booking.fare}</div>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <Button
                  data-ocid="active_ride.contact.button"
                  variant="outline"
                  className="flex-1 h-10 rounded-xl border-border text-sm"
                  onClick={() => toast.info("Calling driver...")}
                >
                  <Phone className="w-4 h-4 mr-2" /> Call
                </Button>
                <Button
                  data-ocid="active_ride.message.button"
                  variant="outline"
                  className="flex-1 h-10 rounded-xl border-border text-sm"
                  onClick={() => toast.info("Opening chat...")}
                >
                  <MessageSquare className="w-4 h-4 mr-2" /> Chat
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isCompleted && (
          <Button
            data-ocid="active_ride.complete.button"
            variant="outline"
            className="w-full h-12 rounded-2xl border-border text-muted-foreground"
            onClick={() => {
              setStatusIndex(RIDE_STATUSES.length - 1);
              updateStatus.mutate({
                bookingId: booking.id,
                status: "Completed",
              });
            }}
          >
            Mark as Completed
          </Button>
        )}
      </div>

      <TripSummaryModal
        open={showSummary}
        booking={booking}
        onClose={() => {
          setShowSummary(false);
          onComplete();
        }}
      />
    </div>
  );
}
