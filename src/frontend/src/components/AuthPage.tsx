import { Button } from "@/components/ui/button";
import { Car, Shield, Star, Zap } from "lucide-react";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const features = [
  { icon: Zap, label: "AI-Powered Routes", desc: "Smart traffic analysis" },
  { icon: Shield, label: "Safe Rides", desc: "Verified drivers only" },
  { icon: Star, label: "Top Rated", desc: "4.8★ average rating" },
];

export default function AuthPage() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, oklch(0.60 0.23 240), transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(circle, oklch(0.70 0.17 196), transparent 70%)",
          }}
        />
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full opacity-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="oklch(0.60 0.23 240)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center mb-10"
        >
          <div className="relative mb-6">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center glow-primary"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.60 0.23 240), oklch(0.70 0.17 196))",
              }}
            >
              <Car className="w-12 h-12 text-white" strokeWidth={1.5} />
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="absolute inset-0 rounded-3xl border-2 border-primary"
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            <span className="text-gradient">SmartCab</span>
            <span className="text-foreground"> AI</span>
          </h1>
          <p className="text-muted-foreground text-center text-base max-w-xs">
            Intelligent rides powered by generative AI. Fastest routes, best
            prices.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-sm grid grid-cols-3 gap-3 mb-10"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="glass-card rounded-2xl p-3 flex flex-col items-center text-center gap-2"
            >
              <f.icon className="w-5 h-5 text-primary" />
              <span className="text-xs font-semibold text-foreground leading-tight">
                {f.label}
              </span>
              <span className="text-xs text-muted-foreground">{f.desc}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="glass-card rounded-3xl p-8 shadow-card">
            <h2 className="text-xl font-bold text-center mb-2">Get Started</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Sign in securely with your Internet Identity to book rides and
              access your account.
            </p>

            <Button
              data-ocid="auth.primary_button"
              onClick={() => login()}
              disabled={isLoggingIn}
              className="w-full h-12 text-base font-semibold rounded-xl glow-primary"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.60 0.23 240), oklch(0.55 0.20 255))",
              }}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In / Sign Up"
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Powered by Internet Identity — no password needed
            </p>
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 text-center py-4">
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
