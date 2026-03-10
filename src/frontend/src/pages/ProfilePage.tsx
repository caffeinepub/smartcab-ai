import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Edit2, Loader2, LogOut, Phone, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import NotificationsDropdown from "../components/NotificationsDropdown";
import {
  useGetBookings,
  useGetProfile,
  useSaveProfile,
} from "../hooks/useQueries";

interface ProfilePageProps {
  onLogout: () => void;
}

export default function ProfilePage({ onLogout }: ProfilePageProps) {
  const { data: profile } = useGetProfile();
  const saveProfile = useSaveProfile();
  const { data: bookings = [] } = useGetBookings();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    try {
      await saveProfile.mutateAsync({ name: name.trim(), phone: phone.trim() });
      setEditing(false);
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const completedRides = bookings.filter(
    (b) => b.status === "Completed",
  ).length;
  const totalSpent = bookings.reduce((acc, b) => acc + Number(b.fare), 0);
  const totalKm = bookings.reduce((acc, b) => acc + Number(b.distance), 0);

  const initials = (profile?.name || "U")
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-lg mx-auto px-4">
      <div
        className="flex items-center justify-between py-4 sticky top-0 z-30"
        style={{
          background: "oklch(var(--background) / 0.9)",
          backdropFilter: "blur(12px)",
        }}
      >
        <h1 className="text-xl font-bold text-gradient">Profile</h1>
        <NotificationsDropdown />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center py-6 mb-4"
      >
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center text-3xl font-bold mb-4 glow-primary"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.60 0.23 240), oklch(0.70 0.17 196))",
          }}
        >
          {initials}
        </div>
        <h2 className="text-xl font-bold">{profile?.name || "User"}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {profile?.phone || "No phone added"}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3 mb-5"
      >
        <div className="glass-card rounded-2xl p-3 text-center">
          <div className="text-2xl font-bold">{completedRides}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Rides</div>
        </div>
        <div className="glass-card rounded-2xl p-3 text-center">
          <div className="text-2xl font-bold">₹{totalSpent}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Spent</div>
        </div>
        <div className="glass-card rounded-2xl p-3 text-center">
          <div className="text-2xl font-bold">{totalKm}</div>
          <div className="text-xs text-muted-foreground mt-0.5">km</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card rounded-2xl p-5 mb-4 shadow-card"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
            Personal Info
          </h3>
          {!editing ? (
            <Button
              data-ocid="profile.edit.button"
              variant="ghost"
              size="sm"
              onClick={() => setEditing(true)}
              className="h-8 rounded-lg text-primary hover:text-primary"
            >
              <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                data-ocid="profile.cancel.button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditing(false);
                  if (profile) {
                    setName(profile.name);
                    setPhone(profile.phone);
                  }
                }}
                className="h-8 rounded-lg text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                data-ocid="profile.save.save_button"
                size="sm"
                onClick={handleSave}
                disabled={saveProfile.isPending}
                className="h-8 rounded-lg"
                style={{ background: "oklch(0.60 0.23 240)" }}
              >
                {saveProfile.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1" /> Save
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                data-ocid="profile.name.input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!editing}
                className="pl-10 bg-muted border-0 rounded-xl h-11 disabled:opacity-70"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Phone Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                data-ocid="profile.phone.input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!editing}
                placeholder="+91 98765 43210"
                className="pl-10 bg-muted border-0 rounded-xl h-11 disabled:opacity-70"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="pb-6"
      >
        <Button
          data-ocid="profile.logout.button"
          variant="outline"
          className="w-full h-12 rounded-2xl border-destructive/40 text-destructive hover:bg-destructive/10"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-2" /> Log Out
        </Button>
      </motion.div>

      <div className="text-center pb-8">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
