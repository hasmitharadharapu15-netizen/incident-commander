import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  PlusCircle, 
  RotateCcw, 
  Bell, 
  Activity, 
  Server, 
  Radio, 
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  X
} from 'lucide-react';
import { Incident, NotificationItem } from '../types/incident';

interface HeaderProps {
  incidents: Incident[];
  onSimulateIncident: () => void;
  onResetData: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onClearNotifications: () => void;
  onSelectIncident: (incident: Incident) => void;
}

export const Header: React.FC<HeaderProps> = ({
  incidents,
  onSimulateIncident,
  onResetData,
  notifications,
  onMarkNotificationRead,
  onClearNotifications,
  onSelectIncident,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [epsRate, setEpsRate] = useState<number>(30.2);

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Jitter EPS slightly around 30 to reflect live telemetry stream
  useEffect(() => {
    const interval = setInterval(() => {
      // Gentle fluctuation between 29.4 and 31.2 EPS
      const variation = (Math.random() - 0.5) * 0.8;
      setEpsRate(Number((30.0 + variation).toFixed(1)));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const criticalCount = incidents.filter((i) => (i.severity || '').toLowerCase() === 'critical').length;
  const activeCount = incidents.filter((i) => ['active', 'emergency'].includes((i.status || '').toLowerCase())).length;

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
      {/* Top Threat & Telemetry Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 px-4 py-1.5 border-b border-slate-800/60 text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="text-slate-300 font-semibold tracking-wider">DEFCON 3</span>
            <span className="text-slate-600">/</span>
            <span className="text-amber-400 font-medium">ELEVATED WATCH</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 border-l border-slate-800 pl-3">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-cyan-400 font-semibold">{epsRate} EPS</span>
            <span className="text-slate-500 text-[11px]">(Ingestion Stream)</span>
          </div>

          <div className="hidden md:flex items-center gap-2 border-l border-slate-800 pl-3">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">5,000 Servers</span>
            <span className="text-slate-500 text-[11px]">(Monitored Nodes)</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div className="hidden lg:flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{currentTime || 'Synchronizing SOC Clock...'}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Active Threats:</span>
            <span className="text-rose-400 font-bold">{criticalCount} Critical</span>
            <span className="text-slate-600">·</span>
            <span className="text-amber-400 font-bold">{activeCount} In Flight</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-600/40 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.25)]">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans">
                Incident Command Center
              </h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700">
                SOC / NOC v3.4
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              AI & Rule-Based Incident Monitoring, Threat Mitigation & Operations Response
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Simulate Incident Button */}
          <button
            onClick={onSimulateIncident}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30 transition-all active:scale-95 cursor-pointer border border-rose-500"
            title="Inject a realistic incoming anomaly or cyber incident"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Simulate Incident</span>
          </button>

          {/* Reset Defaults Button */}
          <button
            onClick={onResetData}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            title="Reset dataset to initial 10 SOC incidents"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Reset Data</span>
          </button>

          {/* Notification Bell with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
              title="View Incident Alerts & Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Flyout */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl z-50 overflow-hidden">
                <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-semibold text-slate-200">Alert Center</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {notifications.length} alerts
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <button
                        onClick={onClearNotifications}
                        className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      >
                        Clear all
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-200 p-0.5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No active alerts. Operational systems nominal.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          onMarkNotificationRead(notif.id);
                          if (notif.incidentId) {
                            const found = incidents.find((i) => i.incident_id === notif.incidentId);
                            if (found) {
                              onSelectIncident(found);
                              setShowNotifications(false);
                            }
                          }
                        }}
                        className={`p-3 text-xs transition-colors cursor-pointer hover:bg-slate-800/50 ${
                          notif.read ? 'opacity-70 bg-slate-900/40' : 'bg-slate-900'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {notif.type === 'critical' ? (
                            <Flame className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          ) : notif.type === 'warning' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="font-semibold text-slate-200 truncate">
                                {notif.title}
                              </span>
                              {!notif.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                              )}
                            </div>
                            <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
