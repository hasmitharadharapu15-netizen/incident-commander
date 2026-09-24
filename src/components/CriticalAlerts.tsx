import React from 'react';
import { Flame, AlertOctagon, ArrowRight, ShieldAlert, Cpu, Thermometer, Radio } from 'lucide-react';
import { Incident } from '../types/incident';
import { formatCategoryLabel, formatRelativeTime } from '../utils/formatters';

interface CriticalAlertsProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
}

export const CriticalAlerts: React.FC<CriticalAlertsProps> = ({
  incidents,
  onSelectIncident,
}) => {
  // Filter for critical incidents, sorted by newest timestamp
  const criticalIncidents = incidents
    .filter(
      (inc) =>
        (inc.severity || '').toLowerCase() === 'critical' ||
        (inc.status || '').toLowerCase() === 'emergency'
    )
    .sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime() || 0;
      const timeB = new Date(b.timestamp).getTime() || 0;
      return timeB - timeA;
    });

  if (criticalIncidents.length === 0) {
    return null;
  }

  return (
    <section aria-label="Critical Alerts Section" className="mb-6">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-5 h-5 rounded bg-rose-500/20 text-rose-400">
            <Flame className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-rose-400 font-mono">
            Critical Alerts Priority Stream
          </h2>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
            {criticalIncidents.length} Urgent Action Required
          </span>
        </div>
        <span className="text-xs text-slate-500 font-mono hidden sm:inline">
          Sorted by newest detection
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {criticalIncidents.map((incident) => {
          const isEmergency = (incident.status || '').toLowerCase() === 'emergency';
          
          return (
            <div
              key={incident.incident_id}
              onClick={() => onSelectIncident(incident)}
              className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between relative overflow-hidden group ${
                isEmergency
                  ? 'bg-gradient-to-br from-rose-950/80 via-slate-900 to-rose-950/50 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] ring-1 ring-rose-500'
                  : 'bg-slate-900/80 hover:bg-slate-850 border-rose-900/50 hover:border-rose-700/80'
              }`}
            >
              {/* Emergency indicator stripe */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  isEmergency ? 'bg-rose-500 animate-pulse' : 'bg-rose-600'
                }`}
              />

              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-xs text-white bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                      {incident.incident_id}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-semibold ${
                        isEmergency
                          ? 'bg-rose-900 text-rose-200 animate-pulse'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {incident.status}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {formatRelativeTime(incident.timestamp)}
                  </span>
                </div>

                <h3 className="font-semibold text-slate-100 text-sm group-hover:text-rose-300 transition-colors line-clamp-1">
                  {formatCategoryLabel(incident.category)}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 mt-1 mb-2 leading-relaxed">
                  {incident.description}
                </p>

                {/* Key Telemetry Highlight if present */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-300 mb-2">
                  {incident.temperature_celsius !== undefined && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-700">
                      <Thermometer className="w-3 h-3 text-rose-400" />
                      {incident.temperature_celsius}°C
                    </span>
                  )}
                  {incident.requests_per_second !== undefined && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                      <Radio className="w-3 h-3 text-cyan-400" />
                      {incident.requests_per_second.toLocaleString()} req/s
                    </span>
                  )}
                  {incident.response_time_ms !== undefined && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
                      {incident.response_time_ms}ms latency
                    </span>
                  )}
                  {incident.malware_family && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800">
                      {incident.malware_family}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 truncate max-w-[140px]">
                  {incident.location.split(',')[0]}
                </span>
                <span className="flex items-center gap-1 text-rose-400 group-hover:translate-x-0.5 transition-transform font-medium">
                  <span>Triage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
