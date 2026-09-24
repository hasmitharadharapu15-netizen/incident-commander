import React from 'react';
import { Activity, Server, Radio, Cpu, Network, ShieldCheck, Database } from 'lucide-react';
import { Incident } from '../types/incident';

interface TelemetryBarProps {
  incidents: Incident[];
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({ incidents }) => {
  const criticalCount = incidents.filter((i) => (i.severity || '').toLowerCase() === 'critical').length;
  const activeCount = incidents.filter((i) => ['active', 'emergency'].includes((i.status || '').toLowerCase())).length;
  const healthyServers = 5000 - (criticalCount * 2 + activeCount);

  return (
    <div className="bg-slate-900/60 border-y border-slate-800/80 px-4 py-2.5 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-2 gap-x-6 text-xs font-mono">
        {/* Metric 1: EPS 30 Ingestion */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/50">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Log Ingestion</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-cyan-300 font-bold text-sm">30 EPS</span>
              <span className="text-slate-500 text-[11px]">(Events/sec)</span>
            </div>
          </div>
        </div>

        {/* Metric 2: 5000 Servers */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
            <Server className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Monitored Fleet</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-emerald-300 font-bold text-sm">{healthyServers.toLocaleString()} / 5,000</span>
              <span className="text-slate-500 text-[11px]">Online</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Network Aggregate Throughput */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="p-1.5 rounded bg-indigo-950/60 text-indigo-400 border border-indigo-800/50">
            <Network className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Network Egress</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-indigo-300 font-bold text-sm">1.84 Gbps</span>
              <span className="text-slate-500 text-[11px]">Nominal</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Heuristics Risk Analyzer */}
        <div className="hidden md:flex items-center gap-2">
          <div className="p-1.5 rounded bg-rose-950/60 text-rose-400 border border-rose-800/50">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Risk Evaluation</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-rose-300 font-bold text-sm">Rule-Based SOC Engine</span>
              <span className="text-slate-500 text-[11px]">Deterministic</span>
            </div>
          </div>
        </div>

        {/* Metric 5: Regional Hubs */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="p-1.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/50">
            <Database className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Regional Data Centers</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-amber-300 font-bold text-sm">10 Hubs Active</span>
              <span className="text-slate-500 text-[11px]">Pan-India</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
