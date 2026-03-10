import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import AuthPage from "./components/AuthPage";
import BottomNav from "./components/BottomNav";
import ProfileSetup from "./components/ProfileSetup";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetProfile } from "./hooks/useQueries";
import ActiveRidePage from "./pages/ActiveRidePage";
import BookingPage from "./pages/BookingPage";
import HistoryPage from "./pages/HistoryPage";
import ProfilePage from "./pages/ProfilePage";

export type Page = "home" | "history" | "profile";

export interface ActiveBookingData {
  id: bigint;
  pickup: string;
  dropoff: string;
  rideType: string;
  fare: number;
  distance: number;
  duration: number;
  driverName: string;
  vehicleNumber: string;
  carModel: string;
  driverRating: number;
  driverEta: number;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
        <p className="text-muted-foreground text-sm">Loading SmartCab AI...</p>
      </div>
    </div>
  );
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [activeBooking, setActiveBooking] = useState<ActiveBookingData | null>(
    null,
  );

  const {
    data: profile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetProfile();

  if (isInitializing) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <>
        <AuthPage />
        <Toaster richColors position="top-center" />
      </>
    );
  }

  if (profileLoading && !profileFetched) {
    return <LoadingScreen />;
  }

  const showProfileSetup =
    isAuthenticated && !profileLoading && profileFetched && profile === null;
  if (showProfileSetup) {
    return (
      <>
        <ProfileSetup />
        <Toaster richColors position="top-center" />
      </>
    );
  }

  const handleLogout = async () => {
    const { clear } = identity as unknown as { clear: () => Promise<void> };
    if (typeof clear === "function") await clear();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen bg-background">
      {activeBooking ? (
        <ActiveRidePage
          booking={activeBooking}
          onComplete={() => {
            setActiveBooking(null);
            setCurrentPage("history");
          }}
        />
      ) : (
        <>
          <main className="pb-20 min-h-screen">
            {currentPage === "home" && (
              <BookingPage onBookingCreated={setActiveBooking} />
            )}
            {currentPage === "history" && <HistoryPage />}
            {currentPage === "profile" && (
              <ProfilePage onLogout={handleLogout} />
            )}
          </main>
          <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
        </>
      )}
      <Toaster richColors position="top-center" />
    </div>
  );
}
