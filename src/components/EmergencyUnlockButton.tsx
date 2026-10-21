import React, { useState, useRef, useEffect } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { sounds } from '../utils/audio.ts';

interface EmergencyUnlockButtonProps {
  holdSeconds: number;
  onUnlock: () => void;
}

export const EmergencyUnlockButton: React.FC<EmergencyUnlockButtonProps> = ({
  holdSeconds,
  onUnlock,
}) => {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startHold = (e: React.MouseEvent | React.TouchEvent) => {
    // If Shift is pressed during click, instant unlock for quick testing
    if ('shiftKey' in e && (e as React.MouseEvent).shiftKey) {
      sounds.playUnlock();
      onUnlock();
      return;
    }

    setHolding(true);
    startTimeRef.current = Date.now();
    sounds.playClick(0.8);

    const targetMs = holdSeconds * 1000;

    const interval = window.setInterval(() => {
      if (!startTimeRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / targetMs) * 100);
      setProgress(pct);

      if (elapsed >= targetMs) {
        window.clearInterval(interval);
        setHolding(false);
        setProgress(0);
        sounds.playUnlock();
        onUnlock();
      }
    }, 30);

    timerRef.current = interval;
  };

  const endHold = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setHolding(false);
    setProgress(0);
    startTimeRef.current = null;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onMouseDown={startHold}
        onMouseUp={endHold}
        onMouseLeave={endHold}
        onTouchStart={startHold}
        onTouchEnd={endHold}
        title={`Click and hold for ${holdSeconds}s to reset (or Shift+Click to quick unlock)`}
        className="relative group overflow-hidden flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-normal text-[#8b91a0] hover:text-[#dfe2eb] transition-colors border border-transparent hover:border-white/[0.06] active:scale-95 select-none"
      >
        {/* Progress fill bar */}
        {holding && (
          <span
            className="absolute inset-0 bg-[#f59e0b]/20 transition-all pointer-events-none"
            style={{ width: `${progress}%` }}
          />
        )}

        {holding && progress > 5 ? (
          <Unlock className="w-3.5 h-3.5 text-[#f59e0b] animate-pulse" />
        ) : (
          <Lock className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
        )}

        <span>
          Emergency Unlock (hold {holdSeconds}s)
          {holding && progress > 0 && (
            <span className="ml-1.5 font-tabular text-[#f59e0b] font-medium">
              {Math.ceil((holdSeconds * (100 - progress)) / 100)}s
            </span>
          )}
        </span>
      </button>
    </div>
  );
};
