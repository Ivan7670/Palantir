import React, { useEffect } from 'react';
import { X, Check, ArrowRight, Bell, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio.ts';

export interface ActiveNotification {
  id: string;
  title: string;
  body: string;
  contextName?: string;
  durationMinutes?: number;
  type?: 'reminder' | 'test' | 'completed';
}

interface NotificationToastProps {
  notification: ActiveNotification | null;
  onDismiss: () => void;
  onAction?: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onDismiss,
  onAction,
}) => {
  useEffect(() => {
    if (!notification) return;

    // Auto-dismiss after 9 seconds
    const timer = setTimeout(() => {
      onDismiss();
    }, 9000);

    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] max-w-sm w-full pointer-events-auto transition-all animate-in slide-in-from-top-3 fade-in duration-300">
      <div className="relative rounded-2xl bg-[#141822]/95 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(10,132,255,0.2)] p-4 text-[#f0f6fc] overflow-hidden select-none">
        {/* Top subtle blue accent sheen */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0a84ff] to-transparent" />

        <div className="flex items-start gap-3">
          {/* OneFocus Icon Badge */}
          <div className="w-10 h-10 rounded-xl bg-[#1b2332] border border-[#0a84ff]/40 flex items-center justify-center shrink-0 shadow-inner">
            <span className="font-bold text-[#0a84ff] text-base">1</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-[#8b91a0]">
                {notification.contextName ? `OneFocus · ${notification.contextName}` : 'OneFocus'}
              </span>
              <span className="text-[10px] text-[#4b5563]">·</span>
              <span className="text-[10px] text-[#6b7280]">now</span>
            </div>

            <h4 className="text-xs font-semibold text-white leading-snug line-clamp-1">
              {notification.title}
            </h4>

            <p className="text-[11px] text-[#9ca3af] leading-normal mt-1 line-clamp-2">
              {notification.body}
            </p>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/[0.08]">
              {onAction && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick(1.0);
                    onAction();
                    onDismiss();
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#0a84ff] hover:bg-[#0070e0] text-white text-[11px] font-medium transition-all shadow-sm cursor-pointer"
                >
                  <span>Focus Priority</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  sounds.playClick(0.9);
                  onDismiss();
                }}
                className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[#8b91a0] hover:text-white text-[11px] transition-all cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>

          {/* Close X */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick(0.9);
              onDismiss();
            }}
            className="absolute top-3.5 right-3.5 text-[#6b7280] hover:text-white transition-colors cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
