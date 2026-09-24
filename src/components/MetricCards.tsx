import React from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  Flame, 
  Search, 
  ShieldCheck, 
  Layers,
  CheckCircle,
  Activity
} from 'lucide-react';
import { Incident } from '../types/incident';

interface MetricCardsProps {
  incidents: Incident[];
  activeSeverityFilter: string;
  activeStatusFilter: string;
  onFilterBySeverity: (severity: string) => void;
  onFilterByStatus: (status: string) => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  incidents,
  activeSeverityFilter,
  activeStatusFilter,
  onFilterBySeverity,
  onFilterByStatus,
}) => {
  // Dynamically calculate all metrics strictly from current incidents list
  const total = incidents.length;
  
  const critical = incidents.filter(
    (i) => (i.severity || '').toLowerCase() === 'critical'
  ).length;

  const high = incidents.filter(
    (i) => (i.severity || '').toLowerCase() === 'high'
  ).length;

  const active = incidents.filter(
    (i) => (i.status || '').toLowerCase() === 'active'
  ).length;

  const investigating = incidents.filter(
    (i) => (i.status || '').toLowerCase() === 'investigating'
  ).length;

  const contained = incidents.filter(
    (i) => (i.status || '').toLowerCase() === 'contained'
  ).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Total Incidents */}
      <button
        onClick={() => {
          onFilterBySeverity('all');
          onFilterByStatus('all');
        }}
        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
          activeSeverityFilter === 'all' && activeStatusFilter === 'all'
            ? 'bg-slate-800/90 border-cyan-500/60 ring-1 ring-cyan-500/40'
            : 'bg-slate-900/60 hover:bg-slate-850 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Total Incidents</span>
          <Layers className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-2xl font-bold font-mono text-white">{total}</div>
        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
          <span>All tracked logs</span>
        </div>
      </button>

      {/* 2. Critical Incidents */}
      <button
        onClick={() => onFilterBySeverity(activeSeverityFilter === 'critical' ? 'all' : 'critical')}
        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
          activeSeverityFilter === 'critical'
            ? 'bg-rose-950/70 border-rose-500 ring-1 ring-rose-500'
            : 'bg-slate-900/60 hover:bg-rose-950/30 border-rose-900/40'
        }`}
      >
        <div className="flex items-center justify-between text-rose-300 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Critical</span>
          <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
        </div>
        <div className="text-2xl font-bold font-mono text-rose-400">{critical}</div>
        <div className="text-[11px] text-rose-400/70 mt-1">
          Requires immediate response
        </div>
      </button>

      {/* 3. High Severity Incidents */}
      <button
        onClick={() => onFilterBySeverity(activeSeverityFilter === 'high' ? 'all' : 'high')}
        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
          activeSeverityFilter === 'high'
            ? 'bg-orange-950/70 border-orange-500 ring-1 ring-orange-500'
            : 'bg-slate-900/60 hover:bg-orange-950/30 border-orange-900/40'
        }`}
      >
        <div className="flex items-center justify-between text-orange-300 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">High Severity</span>
          <AlertTriangle className="w-4 h-4 text-orange-400" />
        </div>
        <div className="text-2xl font-bold font-mono text-orange-400">{high}</div>
        <div className="text-[11px] text-orange-400/70 mt-1">
          Elevated escalation risk
        </div>
      </button>

      {/* 4. Active Incidents */}
      <button
        onClick={() => onFilterByStatus(activeStatusFilter === 'active' ? 'all' : 'active')}
        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
          activeStatusFilter === 'active'
            ? 'bg-red-950/70 border-red-500 ring-1 ring-red-500'
            : 'bg-slate-900/60 hover:bg-slate-850 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between text-red-300 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Active</span>
          <Activity className="w-4 h-4 text-red-400" />
        </div>
        <div className="text-2xl font-bold font-mono text-red-300">{active}</div>
        <div className="text-[11px] text-slate-500 mt-1">
          Unmitigated impact
        </div>
      </button>

      {/* 5. Investigating Incidents */}
      <button
        onClick={() => onFilterByStatus(activeStatusFilter === 'investigating' ? 'all' : 'investigating')}
        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
          activeStatusFilter === 'investigating'
            ? 'bg-amber-950/70 border-amber-500 ring-1 ring-amber-500'
            : 'bg-slate-900/60 hover:bg-slate-850 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between text-amber-300 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Investigating</span>
          <Search className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-2xl font-bold font-mono text-amber-300">{investigating}</div>
        <div className="text-[11px] text-slate-500 mt-1">
          SOC triage in progress
        </div>
      </button>

      {/* 6. Contained Incidents */}
      <button
        onClick={() => onFilterByStatus(activeStatusFilter === 'contained' ? 'all' : 'contained')}
        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
          activeStatusFilter === 'contained'
            ? 'bg-emerald-950/70 border-emerald-500 ring-1 ring-emerald-500'
            : 'bg-slate-900/60 hover:bg-slate-850 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between text-emerald-300 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Contained</span>
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-bold font-mono text-emerald-400">{contained}</div>
        <div className="text-[11px] text-emerald-500/70 mt-1">
          Spread neutralized
        </div>
      </button>
    </div>
  );
};
