import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
} from 'lucide-react';
import { ReminderSettings } from '../types.ts';
import { sounds } from '../utils/audio.ts';
import {
  formatTimeString,
  getNotificationPermissionState,
  requestNotificationPermission,
  sendTestPushNotification,
  NotificationPermissionState,
} from '../utils/notifications.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReminderSettings;
  onUpdateSettings: (updates: Partial<ReminderSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>('default');
  const [newTimeInput, setNewTimeInput] = useState('14:00');
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPermissionState(getNotificationPermissionState());
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        sounds.playClick(0.9);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    sounds.playClick(1.2);
    const result = await requestNotificationPermission();
    setPermissionState(result);
    if (result === 'granted') {
      onUpdateSettings({ desktopPushEnabled: true });
    }
  };

  const handleSendTestNotification = () => {
    sounds.playClick(1.1);
    const sent = sendTestPushNotification();
    if (sent) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 2500);
    } else {
      handleRequestPermission();
    }
  };

  const handleAddTime = (time24: string) => {
    const trimmed = time24.trim();
    if (!trimmed || settings.specificTimes.includes(trimmed)) return;
    sounds.playClick(1.2);
    const updated = [...settings.specificTimes, trimmed].sort();
    onUpdateSettings({ specificTimes: updated });
  };

  const handleRemoveTime = (timeToRemove: string) => {
    sounds.playClick(0.8);
    const updated = settings.specificTimes.filter((t) => t !== timeToRemove);
    onUpdateSettings({ specificTimes: updated });
  };

  const quickPresets = ['09:00', '12:00', '15:00', '18:00', '21:00'];
  const intervalPresets = [15, 30, 45, 60, 90, 120];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-200 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sounds.playClick(0.9);
          onClose();
        }
      }}
    >
      <div className="w-full max-w-[560px] bg-[#161a22]/95 border border-white/[0.1] rounded-2xl shadow-[0_24px_50px_rgba(0,0,0,0.85)] p-6 flex flex-col gap-6 text-[#dfe2eb] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-white">
              <Bell className="w-4 h-4 text-[#60a5fa]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Reminders & Desktop Push
              </h2>
              <p className="text-xs text-[#8b91a0]">
                Customize daily reminder times and desktop notifications
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playClick(0.9);
              onClose();
            }}
            className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-[#8b91a0] hover:text-white transition-colors cursor-pointer"
            title="Close Settings (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: Desktop Push Notification Permission */}
        <div className="p-4 rounded-xl border border-white/[0.08] bg-[#12161f]/70 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8b91a0]">
              Desktop Notifications Status
            </span>

            {permissionState === 'granted' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#122820] border border-[#34d399]/40 text-[#34d399] text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Enabled</span>
              </span>
            )}
            {permissionState === 'denied' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#2a1717] border border-[#f87171]/40 text-[#f87171] text-xs font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Blocked</span>
              </span>
            )}
            {permissionState === 'default' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1c2432] border border-[#3b82f6]/40 text-[#93c5fd] text-xs font-medium">
                <span>Action Needed</span>
              </span>
            )}
          </div>

          {permissionState === 'granted' ? (
            <div className="flex items-center justify-between gap-3 pt-1">
              <p className="text-xs text-[#8b91a0] leading-relaxed">
                Native desktop notifications are active. Reminders will pop up even if OneFocus is minimized.
              </p>
              <button
                type="button"
                onClick={handleSendTestNotification}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs text-white shrink-0 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Send className="w-3 h-3 text-[#34d399]" />
                <span>{testSent ? 'Sent!' : 'Send Test'}</span>
              </button>
            </div>
          ) : permissionState === 'denied' ? (
            <div className="text-xs text-[#f87171] leading-relaxed">
              Notifications were blocked in your browser. To enable them, click the lock or site settings icon in your browser address bar and set <strong>Notifications</strong> to <strong>Allow</strong>.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <p className="text-xs text-[#8b91a0] leading-relaxed">
                Enable desktop push to receive alerts at your set times while working in other apps.
              </p>
              <button
                type="button"
                onClick={handleRequestPermission}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#0a84ff] hover:bg-[#0070df] text-xs font-semibold text-white shrink-0 transition-all cursor-pointer shadow-md active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Enable Desktop Push</span>
              </button>
            </div>
          )}
        </div>

        {/* Section 2: Customizable Daily Reminder Times */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#8b91a0]" />
                <span>Custom Reminder Times</span>
              </h3>
              <p className="text-xs text-[#8b91a0]">
                Choose exact times of day you want to be checked in on your priority
              </p>
            </div>

            {/* Master Toggle */}
            <button
              type="button"
              onClick={() => {
                sounds.playToggle();
                onUpdateSettings({ enabled: !settings.enabled });
              }}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                settings.enabled ? 'bg-[#0a84ff]' : 'bg-white/15'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {settings.enabled && (
            <div className="flex flex-col gap-3 p-4 rounded-xl border border-white/[0.08] bg-[#12161f]/50 animate-in fade-in duration-150">
              {/* Existing times list */}
              <div className="flex flex-wrap gap-2">
                {settings.specificTimes.length === 0 ? (
                  <span className="text-xs text-[#64748b] py-1">
                    No custom times set. Add a time below.
                  </span>
                ) : (
                  settings.specificTimes.map((timeStr) => (
                    <div
                      key={timeStr}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18202d] border border-white/10 text-xs font-tabular text-[#dfe2eb] group shadow-sm"
                    >
                      <span>{formatTimeString(timeStr)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTime(timeStr)}
                        className="text-[#64748b] hover:text-[#f87171] transition-colors p-0.5"
                        title="Remove time"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Custom Time Input */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                <input
                  type="time"
                  value={newTimeInput}
                  onChange={(e) => setNewTimeInput(e.target.value)}
                  className="bg-[#181d26] border border-white/15 rounded-lg px-3 py-1.5 text-xs font-tabular text-white outline-none focus:border-[#3b82f6] transition-colors cursor-pointer"
                />

                <button
                  type="button"
                  onClick={() => handleAddTime(newTimeInput)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs text-white transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 text-[#3b82f6]" />
                  <span>Add Time</span>
                </button>

                {/* Quick Preset Pills */}
                <div className="flex items-center gap-1 ml-auto overflow-x-auto">
                  <span className="text-[10px] text-[#64748b] uppercase tracking-wide mr-1">
                    Presets:
                  </span>
                  {quickPresets.map((t) => (
                    <button
                      key={t}
                      type="button"
                      disabled={settings.specificTimes.includes(t)}
                      onClick={() => handleAddTime(t)}
                      className="px-2 py-1 text-[11px] font-tabular rounded bg-white/[0.03] hover:bg-white/[0.08] text-[#8b91a0] hover:text-white border border-white/[0.05] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      {formatTimeString(t)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Recurring Interval Reminders */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Recurring Interval Reminders
              </h3>
              <p className="text-xs text-[#8b91a0]">
                Periodically check in during active focus sessions
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                sounds.playToggle();
                onUpdateSettings({ intervalEnabled: !settings.intervalEnabled });
              }}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                settings.intervalEnabled ? 'bg-[#0a84ff]' : 'bg-white/15'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.intervalEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {settings.intervalEnabled && (
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-white/[0.08] bg-[#12161f]/50 animate-in fade-in duration-150">
              <span className="text-xs text-[#8b91a0] mr-1">Remind every:</span>
              {intervalPresets.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => {
                    sounds.playClick(1.1);
                    onUpdateSettings({ intervalMinutes: mins });
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-tabular transition-all cursor-pointer ${
                    settings.intervalMinutes === mins
                      ? 'bg-[#232e42] border border-[#60a5fa]/50 text-white font-medium shadow-sm'
                      : 'bg-white/[0.03] border border-white/[0.06] text-[#8b91a0] hover:text-white'
                  }`}
                >
                  {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Sound Chime */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#34d399]" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#64748b]" />
            )}
            <div>
              <span className="text-xs font-medium text-white block">Notification Chime</span>
              <span className="text-[11px] text-[#8b91a0]">
                Play calm harmonic chime when a reminder notification fires
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playToggle();
              onUpdateSettings({ soundEnabled: !settings.soundEnabled });
            }}
            className={`w-9 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              settings.soundEnabled ? 'bg-[#34d399]' : 'bg-white/15'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                settings.soundEnabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="button"
            onClick={() => {
              sounds.playClick(1.0);
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-white transition-all cursor-pointer shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
