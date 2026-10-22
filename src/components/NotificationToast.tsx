import React, { useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
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
      <div className="relative rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-4 text-white overflow-hidden select-none">
        <div className="flex items-start gap-3">
          {/* OneFocus Icon Badge */}
          <div className="w-10 h-10 rounded-xl bg-white text-neutral-900 flex items-center justify-center font-bold text-base shrink-0 shadow-sm">
            <span>1</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-400">
                OneFocus
              </span>
              <span className="text-[10px] text-neutral-500">·</span>
              <span className="text-[10px] text-neutral-400">now</span>
            </div>

            <h4 className="text-xs font-bold text-white leading-snug line-clamp-2 break-words">
              {notification.title}
            </h4>

            <p className="text-[11px] text-neutral-300 leading-normal mt-1 line-clamp-2">
              {notification.body}
            </p>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-neutral-800">
              {onAction && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick(1.0);
                    onAction();
                    onDismiss();
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white text-neutral-900 text-[11px] font-bold hover:bg-neutral-100 transition-all shadow-xs cursor-pointer"
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
                className="inline-flex items-center px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[11px] transition-all cursor-pointer"
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
            className="absolute top-3.5 right-3.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
