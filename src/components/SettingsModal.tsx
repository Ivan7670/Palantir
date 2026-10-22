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
  ExternalLink,
  Info,
  Flame,
  RotateCcw,
  Unlock,
} from 'lucide-react';
import { ReminderSettings } from '../types.ts';
import { sounds } from '../utils/audio.ts';
import {
  formatTimeString,
  getNotificationPermissionState,
  requestNotificationPermission,
  sendTestPushNotification,
  NotificationPermissionState,
  isRunningInIframe,
  initServiceWorker,
  isBraveBrowser,
} from '../utils/notifications.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReminderSettings;
  onUpdateSettings: (updates: Partial<ReminderSettings>) => void;
  onTriggerTestNotification?: () => void;
  onNewDay: () => void;
  onEmergencyUnlock: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onTriggerTestNotification,
  onNewDay,
  onEmergencyUnlock,
}) => {
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>('default');
  const [newTimeInput, setNewTimeInput] = useState('14:00');
  const [testStatus, setTestStatus] = useState<{
    sent: boolean;
    method?: string;
    reason?: string;
    isBrave?: boolean;
  } | null>(null);
  const [inIframe, setInIframe] = useState(false);
  const [isBrave, setIsBrave] = useState(false);
  const [confirmNewDay, setConfirmNewDay] = useState(false);
  const [emergencyUnlockActive, setEmergencyUnlockActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPermissionState(getNotificationPermissionState());
      setInIframe(isRunningInIframe());
      initServiceWorker().catch(() => {});
      isBraveBrowser().then((brave) => {
        setIsBrave(brave);
      });
      setConfirmNewDay(false);
      setEmergencyUnlockActive(false);
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

  const handleSendTestNotification = async () => {
    sounds.playClick(1.1);

    if (onTriggerTestNotification) {
      onTriggerTestNotification();
    }

    const res = await sendTestPushNotification();
    setTestStatus({
      sent: res.success,
      method: res.method,
      reason: res.reason,
      isBrave: res.isBrave,
    });

    if (!res.success && permissionState !== 'granted') {
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

  const handleNewDayClick = () => {
    if (!confirmNewDay) {
      sounds.playClick(1.0);
      setConfirmNewDay(true);
      return;
    }
    sounds.playDayWon();
    onNewDay();
    onClose();
  };

  const handleEmergencyUnlockClick = () => {
    sounds.playUnlock();
    onEmergencyUnlock();
    setEmergencyUnlockActive(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const quickPresets = ['09:00', '12:00', '15:00', '18:00', '21:00'];
  const intervalPresets = [15, 30, 45, 60, 90, 120];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm transition-all duration-200 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sounds.playClick(0.9);
          onClose();
        }
      }}
    >
      <div className="w-full max-w-[560px] bg-white border border-neutral-200 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 text-neutral-900 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-900">
              Settings
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Protocol controls, reminder schedules, and push notifications
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playClick(0.9);
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
            title="Close Settings (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section: Action Controls (New Day & Emergency Unlock moved here per user request) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* New Day */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70 flex flex-col justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Day Reset
              </span>
              <h3 className="text-sm font-bold text-neutral-900">New Day</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Reset your priority and start fresh for today.
              </p>
            </div>

            <button
              type="button"
              onClick={handleNewDayClick}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                confirmNewDay
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
                  : 'bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200 shadow-xs'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{confirmNewDay ? 'Confirm Reset Day' : 'Start New Day'}</span>
            </button>
          </div>

          {/* Emergency Unlock */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70 flex flex-col justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Safety Override
              </span>
              <h3 className="text-sm font-bold text-neutral-900">Emergency Unlock</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Unlock focus screen and return to setup immediately.
              </p>
            </div>

            <button
              type="button"
              onClick={handleEmergencyUnlockClick}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200 shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Unlock className="w-3.5 h-3.5 text-neutral-600" />
              <span>{emergencyUnlockActive ? 'Unlocked!' : 'Emergency Unlock'}</span>
            </button>
          </div>
        </div>

        {/* Section: Desktop Push Notification Engine */}
        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-200/70 flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-neutral-700" />
              <span className="text-sm font-bold text-neutral-900">
                Desktop Push Notifications
              </span>
              {isBrave && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[11px] font-semibold">
                  <Flame className="w-3 h-3 text-orange-600" />
                  <span>Brave</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {permissionState === 'granted' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Allowed</span>
                </span>
              )}
              {permissionState === 'denied' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Blocked</span>
                </span>
              )}
              {permissionState === 'default' && (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="px-3 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                >
                  Enable Push
                </button>
              )}
            </div>
          </div>

          {/* Standalone Tab Banner for iframes */}
          {inIframe && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-blue-900">
              <div className="flex items-start sm:items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 sm:mt-0" />
                <span className="leading-tight">
                  {isBrave
                    ? 'Brave strictly suppresses notification prompts inside iframe previews.'
                    : 'Browsers block desktop notification prompts inside iframe previews.'}{' '}
                  Open in a full tab for OS push integration.
                </span>
              </div>
              <a
                href={window.location.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 transition-colors shadow-xs"
              >
                <span>Open Tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Brave-specific configuration alert */}
          {isBrave && (
            <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-950 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold">
                  <Flame className="w-4 h-4 text-orange-600" />
                  <span>Brave Browser Notification Guide</span>
                </div>
              </div>

              <p className="text-[11px] text-orange-800 leading-relaxed">
                Brave blocks Google push messaging and alerts by default. To receive OS alerts in Brave:
              </p>

              <div className="space-y-1.5 text-[11px]">
                <div className="bg-white/80 p-2 rounded-lg border border-orange-200/60">
                  <strong className="text-neutral-900 block">1. Address Bar Permissions:</strong>
                  Click the lock/tune icon on the left of the URL bar &rarr; set <strong>Notifications</strong> to <strong>Allow</strong>.
                </div>

                <div className="bg-white/80 p-2 rounded-lg border border-orange-200/60">
                  <strong className="text-neutral-900 block">2. Brave Google Services:</strong>
                  Visit <code className="bg-orange-100 text-orange-900 px-1 py-0.5 rounded font-mono text-[10px]">brave://settings/privacy</code> and toggle ON &ldquo;Use Google services for push messaging&rdquo;.
                </div>

                <div className="bg-white/80 p-2 rounded-lg border border-orange-200/60">
                  <strong className="text-neutral-900 block">3. Fallback Flashing Tab Title & Sound:</strong>
                  Even with Brave Shields, OneFocus flashes the tab title and chimes a calm reminder.
                </div>
              </div>
            </div>
          )}

          {permissionState === 'granted' && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-neutral-500">
                System desktop push is active.
              </span>
              <button
                type="button"
                onClick={handleSendTestNotification}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-semibold text-white shrink-0 transition-colors cursor-pointer shadow-xs"
              >
                <Send className="w-3 h-3" />
                <span>Send Test Alert</span>
              </button>
            </div>
          )}

          {testStatus && (
            <div
              className={`p-3 rounded-xl border text-xs leading-relaxed ${
                testStatus.sent
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              {testStatus.sent ? (
                <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Notification sent to OS successfully!</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 font-semibold text-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>{testStatus.reason}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section: Customizable Reminder Times */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-600" />
                <span>Custom Reminder Times</span>
              </h3>
              <p className="text-xs text-neutral-500">
                Set times to be checked in on your priority throughout the day
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
                settings.enabled ? 'bg-neutral-900' : 'bg-neutral-200'
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
            <div className="flex flex-col gap-3 p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70 animate-in fade-in duration-150">
              {/* Existing times list */}
              <div className="flex flex-wrap gap-2">
                {settings.specificTimes.length === 0 ? (
                  <span className="text-xs text-neutral-400 py-1">
                    No custom times set. Add a time below.
                  </span>
                ) : (
                  settings.specificTimes.map((timeStr) => (
                    <div
                      key={timeStr}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-neutral-200 text-xs font-bold font-tabular text-neutral-800 shadow-xs"
                    >
                      <span>{formatTimeString(timeStr)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTime(timeStr)}
                        className="text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Remove time"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Custom Time Input */}
              <div className="flex items-center gap-2 pt-2 border-t border-neutral-200/70">
                <input
                  type="time"
                  value={newTimeInput}
                  onChange={(e) => setNewTimeInput(e.target.value)}
                  className="bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-xs font-bold font-tabular text-neutral-900 outline-none focus:border-neutral-900 transition-colors cursor-pointer"
                />

                <button
                  type="button"
                  onClick={() => handleAddTime(newTimeInput)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-white transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Time</span>
                </button>

                {/* Quick Presets */}
                <div className="flex items-center gap-1 ml-auto overflow-x-auto">
                  {quickPresets.map((t) => (
                    <button
                      key={t}
                      type="button"
                      disabled={settings.specificTimes.includes(t)}
                      onClick={() => handleAddTime(t)}
                      className="px-2 py-1 text-[11px] font-bold font-tabular rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    >
                      {formatTimeString(t)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section: Recurring Interval */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Recurring Interval Reminders
              </h3>
              <p className="text-xs text-neutral-500">
                Check in at set recurring intervals during your work session
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                sounds.playToggle();
                onUpdateSettings({ intervalEnabled: !settings.intervalEnabled });
              }}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                settings.intervalEnabled ? 'bg-neutral-900' : 'bg-neutral-200'
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
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-neutral-50 border border-neutral-200/70 animate-in fade-in duration-150">
              <span className="text-xs font-semibold text-neutral-500 mr-1">Every:</span>
              {intervalPresets.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => {
                    sounds.playClick(1.1);
                    onUpdateSettings({ intervalMinutes: mins });
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold font-tabular transition-all cursor-pointer ${
                    settings.intervalMinutes === mins
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Section: Sound Chime */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
          <div className="flex items-center gap-2.5">
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-neutral-900" />
            ) : (
              <VolumeX className="w-4 h-4 text-neutral-400" />
            )}
            <div>
              <span className="text-xs font-bold text-neutral-900 block">Sound Effects</span>
              <span className="text-[11px] text-neutral-500">
                Gentle tactile audio feedback and notification chimes
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playToggle();
              onUpdateSettings({ soundEnabled: !settings.soundEnabled });
            }}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              settings.soundEnabled ? 'bg-neutral-900' : 'bg-neutral-200'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
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
            className="px-6 py-2.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
