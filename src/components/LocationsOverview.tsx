import React, { useMemo } from 'react';
import { MapPin, Flame, Activity, ShieldCheck, ArrowRight, Building } from 'lucide-react';
import { Incident, LocationSummary } from '../types/incident';
import { getSeverityBadgeClass } from '../utils/formatters';

interface LocationsOverviewProps {
  incidents: Incident[];
  activeLocationFilter: string;
  onSelectLocation: (loc: string) => void;
}

export const LocationsOverview: React.FC<LocationsOverviewProps> = ({
  incidents,
  activeLocationFilter,
  onSelectLocation,
}) => {
  // Aggregate location data dynamically
  const locationSummaries: LocationSummary[] = useMemo(() => {
    const map: Record<string, LocationSummary> = {};

    incidents.forEach((inc) => {
      const loc = inc.location || 'Unknown Location';
      if (!map[loc]) {
        map[loc] = {
          location: loc,
          totalIncidents: 0,
          criticalIncidents: 0,
          activeIncidents: 0,
          highestSeverity: 'low',
          affectedSystems: [],
        };
      }

      const entry = map[loc];
      entry.totalIncidents++;

      const sev = (inc.severity || '').toLowerCase();
      if (sev === 'critical') {
        entry.criticalIncidents++;
        entry.highestSeverity = 'critical';
      } else if (sev === 'high' && entry.highestSeverity !== 'critical') {
        entry.highestSeverity = 'high';
      } else if (sev === 'medium' && !['critical', 'high'].includes(entry.highestSeverity)) {
        entry.highestSeverity = 'medium';
      }

      const st = (inc.status || '').toLowerCase();
      if (['active', 'emergency'].includes(st)) {
        entry.activeIncidents++;
      }

      if (inc.affected_system && !entry.affectedSystems.includes(inc.affected_system)) {
        entry.affectedSystems.push(inc.affected_system);
      }
    });

    // Sort by critical count desc, then total count desc
    return Object.values(map).sort((a, b) => {
      if (b.criticalIncidents !== a.criticalIncidents) {
        return b.criticalIncidents - a.criticalIncidents;
      }
      return b.totalIncidents - a.totalIncidents;
    });
  }, [incidents]);

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
            <Building className="w-4 h-4 text-cyan-400" />
            <span>Regional Incident Distribution & Hotspots</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Geographic presence across distributed data centers and office hubs (Click any city to filter table)
          </p>
        </div>

        {activeLocationFilter !== 'all' && (
          <button
            onClick={() => onSelectLocation('all')}
            className="text-xs text-rose-400 hover:text-rose-300 font-mono flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Showing: {activeLocationFilter}</span>
            <span className="text-slate-500">(Click to show all)</span>
          </button>
        )}
      </div>

      {/* Grid of Location Nodes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {locationSummaries.map((loc) => {
          const isSelected = activeLocationFilter.toLowerCase() === loc.location.toLowerCase();
          const hasCritical = loc.criticalIncidents > 0;

          return (
            <div
              key={loc.location}
              onClick={() => onSelectLocation(isSelected ? 'all' : loc.location)}
              className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800/90 border-cyan-500 ring-1 ring-cyan-500 shadow-lg'
                  : hasCritical
                  ? 'bg-slate-900/80 hover:bg-slate-850 border-rose-900/40 hover:border-rose-700/60'
                  : 'bg-slate-900/60 hover:bg-slate-850 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg ${
                        hasCritical
                          ? 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-xs sm:text-sm">
                        {loc.location}
                      </h3>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Data Center Hub
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-semibold ${getSeverityBadgeClass(
                      loc.highestSeverity
                    )}`}
                  >
                    Max: {loc.highestSeverity}
                  </span>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950/60 rounded-lg p-2 font-mono text-center mb-2">
                  <div>
                    <div className="text-[10px] text-slate-500">Total</div>
                    <div className="text-sm font-bold text-white">{loc.totalIncidents}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Critical</div>
                    <div className={`text-sm font-bold ${loc.criticalIncidents > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                      {loc.criticalIncidents}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Active</div>
                    <div className={`text-sm font-bold ${loc.activeIncidents > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                      {loc.activeIncidents}
                    </div>
                  </div>
                </div>

                {/* Affected systems preview */}
                <div className="text-[11px] font-mono text-slate-400 line-clamp-1 mb-1">
                  Systems: <span className="text-slate-300">{loc.affectedSystems.join(', ')}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">
                  {isSelected ? 'Filter Active' : 'Click to filter'}
                </span>
                <span className="flex items-center gap-1 text-cyan-400 font-mono text-xs">
                  <span>View incidents</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
