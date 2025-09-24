// app/loading.tsx
'use client';

import { useEffect } from 'react';

export default function Loading() {
  // Lock scroll while route segment is loading
  useEffect(() => {
    const { documentElement, body } = document;
    documentElement.classList.add('overflow-hidden');
    body.classList.add('overflow-hidden');
    return () => {
      documentElement.classList.remove('overflow-hidden');
      body.classList.remove('overflow-hidden');
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="
        fixed inset-0 z-[9999] grid place-items-center
        bg-black/30 supports-[backdrop-filter]:backdrop-blur-sm
        pointer-events-auto
      "
    >
      {/* spinner only (motion-safe) */}
      <div
        className="
          h-12 w-12 rounded-full border-4 border-white/30 border-t-white
          animate-spin motion-reduce:animate-none
        "
        aria-label="Loading"
      />
      {/* Optional caption for slower networks
      <p className="mt-4 text-white/90 text-sm">Loading…</p>
      */}
    </div>
  );
}
