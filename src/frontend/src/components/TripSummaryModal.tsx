import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  IndianRupee,
  Loader2,
  MapPin,
  Sparkles,
  Star,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { ActiveBookingData } from "../App";
import { useGetAITripSummary, useSubmitRating } from "../hooks/useQueries";

interface TripSummaryModalProps {
  open: boolean;
  booking: ActiveBookingData;
  onClose: () => void;
}

export default function TripSummaryModal({
  open,
  booking,
  onClose,
}: TripSummaryModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const getAITripSummary = useGetAITripSummary();
  const submitRating = useSubmitRating();

  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const fetchSummary = async () => {
    if (summaryText || summaryLoading) return;
    setSummaryLoading(true);
    try {
      const text = await getAITripSummary.mutateAsync(booking.id);
      setSummaryText(text);
    } catch {
      setSummaryText(
        `Your ${booking.rideType} ride from ${booking.pickup} to ${booking.dropoff} was completed successfully. Distance: ${booking.distance} km, Duration: ${booking.duration} min, Fare: \u20b9${booking.fare}. Thank you for choosing SmartCab AI!`,
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleOpenChange = (val: boolean) => {
    if (val) fetchSummary();
  };

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    try {
      await submitRating.mutateAsync({ bookingId: booking.id, rating });
      setSubmitted(true);
      toast.success("Rating submitted! Thanks for your feedback.");
      setTimeout(onClose, 1500);
    } catch {
      toast.error("Failed to submit rating");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
        else handleOpenChange(v);
      }}
    >
      <DialogContent
        data-ocid="trip_summary.dialog"
        className="max-w-sm rounded-3xl border-border p-0 overflow-hidden"
        style={{
          background: "oklch(var(--card))",
          backdropFilter: "blur(16px)",
        }}
      >
        <div
          className="p-6 pb-4"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.60 0.23 240 / 0.15), oklch(0.70 0.17 196 / 0.1))",
          }}
        >
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="ai-badge">AI Trip Summary</span>
            </div>
            <DialogTitle className="text-xl font-bold">
              Ride Completed! 🎉
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card rounded-xl p-3 text-center">
              <MapPin className="w-4 h-4 text-accent mx-auto mb-1" />
              <div className="text-lg font-bold">{booking.distance} km</div>
              <div className="text-xs text-muted-foreground">Distance</div>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
              <div className="text-lg font-bold">{booking.duration} min</div>
              <div className="text-xs text-muted-foreground">Duration</div>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <IndianRupee className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
              <div className="text-lg font-bold">₹{booking.fare}</div>
              <div className="text-xs text-muted-foreground">Total Fare</div>
            </div>
          </div>

          <div
            className="rounded-2xl p-4"
            style={{
              background: "oklch(var(--primary) / 0.08)",
              border: "1px solid oklch(var(--primary) / 0.2)",
            }}
          >
            {summaryLoading ? (
              <div
                data-ocid="trip_summary.loading_state"
                className="flex items-center gap-3 text-muted-foreground"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">
                  AI is generating your trip summary...
                </span>
              </div>
            ) : (
              <p
                data-ocid="trip_summary.success_state"
                className="text-sm leading-relaxed text-foreground/90"
              >
                {summaryText || "Loading summary..."}
              </p>
            )}
          </div>

          {!submitted ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-center">
                Rate your driver: {booking.driverName}
              </p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    data-ocid="trip_summary.rating.toggle"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className="w-8 h-8"
                      fill={
                        (hoverRating || rating) >= star
                          ? "oklch(0.82 0.18 85)"
                          : "transparent"
                      }
                      stroke={
                        (hoverRating || rating) >= star
                          ? "oklch(0.82 0.18 85)"
                          : "oklch(var(--muted-foreground))"
                      }
                    />
                  </button>
                ))}
              </div>
              <Button
                data-ocid="trip_summary.submit_button"
                onClick={handleRatingSubmit}
                className="w-full h-11 font-semibold rounded-xl"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.60 0.23 240), oklch(0.70 0.17 196))",
                }}
                disabled={submitRating.isPending}
              >
                {submitRating.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Submit Rating"
                )}
              </Button>
              <Button
                data-ocid="trip_summary.cancel_button"
                variant="ghost"
                className="w-full h-9 text-muted-foreground"
                onClick={onClose}
              >
                Skip for now
              </Button>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="text-4xl mb-2">⭐</div>
                <p className="font-semibold">Thanks for rating!</p>
                <p className="text-sm text-muted-foreground">
                  Your feedback helps improve the experience
                </p>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
