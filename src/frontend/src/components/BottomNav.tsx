import { Clock, Home, User } from "lucide-react";
import { motion } from "motion/react";
import type { Page } from "../App";

interface BottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: {
  page: Page;
  icon: typeof Home;
  label: string;
  ocid: string;
}[] = [
  { page: "home", icon: Home, label: "Book", ocid: "nav.home.link" },
  { page: "history", icon: Clock, label: "History", ocid: "nav.history.link" },
  { page: "profile", icon: User, label: "Profile", ocid: "nav.profile.link" },
];

export default function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      <div
        className="border-t border-border"
        style={{
          background: "oklch(var(--card) / 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2 pb-safe">
          {navItems.map(({ page, icon: Icon, label, ocid }) => {
            const isActive = currentPage === page;
            return (
              <button
                type="button"
                key={page}
                data-ocid={ocid}
                onClick={() => onNavigate(page)}
                className="flex flex-col items-center gap-1 py-2 px-6 rounded-xl transition-all relative"
                style={{
                  minWidth: 80,
                  color: isActive
                    ? "oklch(var(--primary))"
                    : "oklch(var(--muted-foreground))",
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: "oklch(var(--primary) / 0.12)",
                      border: "1px solid oklch(var(--primary) / 0.2)",
                    }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <Icon
                  className="w-5 h-5 relative z-10"
                  strokeWidth={isActive ? 2 : 1.5}
                />
                <span className="text-xs font-medium relative z-10">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
