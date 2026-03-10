import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRightLeft,
  Car,
  Clock,
  Loader2,
  Navigation,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { ActiveBookingData } from "../App";
import NotificationsDropdown from "../components/NotificationsDropdown";
import {
  useAddNotification,
  useCreateBooking,
  useGetAISuggestion,
  useGetProfile,
} from "../hooks/useQueries";

const RIDE_OPTIONS = [
  {
    type: "Mini",
    emoji: "🚗",
    priceBase: 80,
    pricePerKm: 10,
    etaMin: 4,
    etaMax: 7,
    capacity: 3,
    desc: "Economical & quick",
    colorBg: "oklch(0.70 0.17 196 / 0.15)",
  },
  {
    type: "Sedan",
    emoji: "🚙",
    priceBase: 120,
    pricePerKm: 14,
    etaMin: 3,
    etaMax: 5,
    capacity: 4,
    desc: "Comfortable rides",
    colorBg: "oklch(0.60 0.23 240 / 0.15)",
  },
  {
    type: "SUV",
    emoji: "🚐",
    priceBase: 200,
    pricePerKm: 20,
    etaMin: 6,
    etaMax: 10,
    capacity: 6,
    desc: "Premium & spacious",
    colorBg: "oklch(0.65 0.21 305 / 0.15)",
  },
];

const SAMPLE_DRIVERS = [
  {
    name: "Raj Kumar",
    carModel: "Maruti Swift Dzire",
    vehicleNumber: "DL 01 AB 1234",
    rating: 4.8,
  },
  {
    name: "Amir Singh",
    carModel: "Honda City CVT",
    vehicleNumber: "MH 02 CD 5678",
    rating: 4.7,
  },
  {
    name: "Priya Patel",
    carModel: "Toyota Innova Crysta",
    vehicleNumber: "KA 03 EF 9012",
    rating: 4.9,
  },
  {
    name: "Vikram Mehta",
    carModel: "Hyundai Creta SX",
    vehicleNumber: "GJ 04 GH 3456",
    rating: 4.6,
  },
  {
    name: "Neha Sharma",
    carModel: "Tata Nexon EV",
    vehicleNumber: "UP 05 IJ 7890",
    rating: 4.8,
  },
];

function getSimulatedDistance(pickup: string, dropoff: string) {
  const hash = (pickup + dropoff)
    .split("")
    .reduce((a, c) => a + c.charCodeAt(0), 0);
  return 3 + (hash % 22);
}

function getFare(dist: number, opt: (typeof RIDE_OPTIONS)[0]) {
  return Math.round(opt.priceBase + dist * opt.pricePerKm);
}

function getDriver(pickup: string) {
  const idx =
    pickup.split("").reduce((a, c) => a + c.charCodeAt(0), 0) %
    SAMPLE_DRIVERS.length;
  return SAMPLE_DRIVERS[idx];
}

interface BookingPageProps {
  onBookingCreated: (booking: ActiveBookingData) => void;
}

export default function BookingPage({ onBookingCreated }: BookingPageProps) {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [selectedRide, setSelectedRide] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<{
    rideType: string;
    reasoning: string;
  } | null>(null);

  const { data: profile } = useGetProfile();
  const getAISuggestion = useGetAISuggestion();
  const createBooking = useCreateBooking();
  const addNotification = useAddNotification();

  const canSearch = pickup.trim().length >= 2 && dropoff.trim().length >= 2;
  const distance = canSearch ? getSimulatedDistance(pickup, dropoff) : 10;

  const handleSwap = () => {
    const tmp = pickup;
    setPickup(dropoff);
    setDropoff(tmp);
  };

  const handleAISuggest = async () => {
    if (!canSearch) {
      toast.error("Enter pickup and dropoff locations first");
      return;
    }
    try {
      const result = await getAISuggestion.mutateAsync({ pickup, dropoff });
      setAiSuggestion(result);
      setSelectedRide(result.rideType);
      toast.success("AI suggestion ready!");
    } catch {
      toast.error("AI suggestion failed. Please try again.");
    }
  };

  const handleBookNow = async () => {
    if (!canSearch) {
      toast.error("Enter pickup and dropoff locations");
      return;
    }
    const rideType = selectedRide || "Sedan";
    const opt =
      RIDE_OPTIONS.find((r) => r.type === rideType) || RIDE_OPTIONS[1];
    const fare = getFare(distance, opt);
    const duration = Math.ceil((distance / 30) * 60);
    const driverEta =
      opt.etaMin + Math.floor(Math.random() * (opt.etaMax - opt.etaMin));
    const driver = getDriver(pickup);

    try {
      const bookingId = await createBooking.mutateAsync({
        pickup,
        dropoff,
        rideType,
        fare,
        distance,
        duration,
        driverName: driver.name,
        vehicleNumber: driver.vehicleNumber,
        carModel: driver.carModel,
        driverRating: driver.rating,
        driverEta,
      });

      await addNotification.mutateAsync(
        `🚗 Booking confirmed! Searching for a ${rideType} near ${pickup}.`,
      );

      toast.success("Ride booked successfully!");
      onBookingCreated({
        id: bookingId,
        pickup,
        dropoff,
        rideType,
        fare,
        distance,
        duration,
        driverName: driver.name,
        vehicleNumber: driver.vehicleNumber,
        carModel: driver.carModel,
        driverRating: driver.rating,
        driverEta,
      });
    } catch {
      toast.error("Failed to create booking. Please try again.");
    }
  };

  const displayName = profile?.name || "Rider";

  return (
    <div className="max-w-lg mx-auto px-4 pt-0 pb-6">
      <div
        className="flex items-center justify-between py-4 sticky top-0 z-30"
        style={{
          background: "oklch(var(--background) / 0.9)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div>
          <p className="text-xs text-muted-foreground">Hello,</p>
          <h1 className="text-lg font-bold text-gradient">SmartCab AI</h1>
        </div>
        <div className="flex items-center gap-2">
          <NotificationsDropdown />
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.60 0.23 240), oklch(0.70 0.17 196))",
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <h2 className="text-2xl font-bold mb-1">
          Where to,{" "}
          <span className="text-gradient">{displayName.split(" ")[0]}</span>?
        </h2>
        <p className="text-muted-foreground text-sm">
          AI-powered routes for the best ride
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-4 mb-4 shadow-card"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="flex flex-col items-center gap-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: "oklch(0.70 0.17 196)" }}
            />
            <div
              className="w-0.5 h-6 rounded-full"
              style={{ background: "oklch(var(--border))" }}
            />
            <div
              className="w-3 h-3 rounded-sm"
              style={{ background: "oklch(0.60 0.23 240)" }}
            />
          </div>
          <div className="flex-1 space-y-2">
            <Input
              data-ocid="booking.pickup.input"
              placeholder="Pickup location"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className="h-11 bg-muted border-0 rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-primary"
            />
            <Input
              data-ocid="booking.dropoff.input"
              placeholder="Drop location"
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              className="h-11 bg-muted border-0 rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
          <Button
            data-ocid="booking.swap.button"
            variant="ghost"
            size="icon"
            onClick={handleSwap}
            className="rounded-xl w-9 h-9 flex-shrink-0"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </Button>
        </div>

        {canSearch && (
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground pl-6">
            <Navigation className="w-3 h-3" />
            <span>~{distance} km estimated distance</span>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-4"
      >
        <Button
          data-ocid="booking.ai_suggest.button"
          onClick={handleAISuggest}
          disabled={getAISuggestion.isPending || !canSearch}
          className="w-full h-11 rounded-xl font-semibold text-sm"
          style={{
            background: canSearch
              ? "linear-gradient(135deg, oklch(0.60 0.23 240 / 0.2), oklch(0.70 0.17 196 / 0.2))"
              : undefined,
            border: "1px solid oklch(var(--primary) / 0.3)",
            color: canSearch ? "oklch(var(--primary))" : undefined,
          }}
          variant="outline"
        >
          {getAISuggestion.isPending ? (
            <Loader2 className="mr-2 w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 w-4 h-4" />
          )}
          {getAISuggestion.isPending
            ? "Analyzing routes..."
            : "Get AI Suggestion"}
        </Button>
      </motion.div>

      <AnimatePresence>
        {aiSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="mb-4 rounded-2xl p-4 shadow-card"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.60 0.23 240 / 0.1), oklch(0.70 0.17 196 / 0.08))",
              border: "1px solid oklch(var(--primary) / 0.3)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="ai-badge">AI Recommendation</span>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">
              {aiSuggestion.reasoning}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge
                style={{
                  background: "oklch(0.60 0.23 240 / 0.2)",
                  color: "oklch(0.85 0.10 240)",
                  border: "1px solid oklch(0.60 0.23 240 / 0.3)",
                }}
              >
                Suggested: {aiSuggestion.rideType}
              </Badge>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-5"
      >
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Choose Your Ride
        </h3>
        <div className="space-y-3">
          {RIDE_OPTIONS.map((opt, i) => {
            const fare = getFare(distance, opt);
            const isSelected = selectedRide === opt.type;
            const isAISuggested = aiSuggestion?.rideType === opt.type;
            return (
              <motion.button
                type="button"
                key={opt.type}
                data-ocid={`booking.ride_option.item.${i + 1}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.08 }}
                onClick={() => setSelectedRide(opt.type)}
                className={`w-full glass-card rounded-2xl p-4 text-left transition-all duration-200 ${
                  isSelected ? "ride-card-selected" : "hover:border-border"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: opt.colorBg }}
                  >
                    {opt.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-base">{opt.type}</span>
                      {isAISuggested && (
                        <Badge
                          className="text-xs py-0 px-2 rounded-full"
                          style={{
                            background: "oklch(0.60 0.23 240 / 0.2)",
                            color: "oklch(0.85 0.10 240)",
                            border: "1px solid oklch(0.60 0.23 240 / 0.3)",
                          }}
                        >
                          <Zap className="w-2.5 h-2.5 mr-1" />
                          AI Pick
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs flex items-center gap-1 text-muted-foreground">
                        <Users className="w-3 h-3" /> {opt.capacity}
                      </span>
                      <span className="text-xs flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" /> {opt.etaMin}-{opt.etaMax}
                        min
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-lg">₹{fare}</div>
                    <div className="text-xs text-muted-foreground">
                      est. fare
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          data-ocid="booking.book_now.primary_button"
          onClick={handleBookNow}
          disabled={createBooking.isPending || !canSearch}
          className="w-full h-14 text-base font-bold rounded-2xl glow-primary"
          style={{
            background: canSearch
              ? "linear-gradient(135deg, oklch(0.60 0.23 240), oklch(0.55 0.20 255))"
              : undefined,
          }}
        >
          {createBooking.isPending ? (
            <>
              <Loader2 className="mr-2 w-5 h-5 animate-spin" />
              Booking Ride...
            </>
          ) : (
            <>
              <Car className="mr-2 w-5 h-5" />
              {`Book Now${selectedRide ? ` - ${selectedRide}` : ""}`}
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
