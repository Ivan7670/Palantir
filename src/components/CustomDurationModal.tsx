import React, { useState } from 'react';
import { X, Clock } from 'lucide-react';
import { sounds } from '../utils/audio.ts';

interface CustomDurationModalProps {
  isOpen: boolean;
  currentDuration: number;
  onClose: () => void;
  onConfirm: (durationMinutes: number) => void;
}

export const CustomDurationModal: React.FC<CustomDurationModalProps> = ({
  isOpen,
  currentDuration,
  onClose,
  onConfirm,
}) => {
  const [minutes, setMinutes] = useState(currentDuration.toString());

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(minutes, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 720) {
      sounds.playClick(1.2);
      onConfirm(parsed);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xs bg-[#161a22] border border-white/10 rounded-2xl shadow-2xl p-5 text-[#dfe2eb]">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#aac7ff]" />
            <h3 className="text-sm font-semibold text-white">Custom Duration</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">
              Duration in minutes
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="720"
                autoFocus
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-full bg-[#11141a] border border-white/10 rounded-lg px-3 py-2 text-white font-tabular text-sm outline-none focus:border-[#0a84ff]"
              />
              <span className="text-xs text-slate-400">minutes</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-1.5 pt-1">
            {[45, 90, 120].map((quick) => (
              <button
                key={quick}
                type="button"
                onClick={() => setMinutes(quick.toString())}
                className="flex-1 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-xs font-tabular text-slate-300 border border-white/5"
              >
                {quick}m
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium bg-[#0a84ff] text-white rounded-lg hover:brightness-110 active:scale-95"
            >
              Set Duration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
