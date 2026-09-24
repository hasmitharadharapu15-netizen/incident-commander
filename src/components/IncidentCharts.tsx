import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { Incident } from '../types/incident';
import { formatTypeLabel } from '../utils/formatters';

interface IncidentChartsProps {
  incidents: Incident[];
  onSelectSeverity?: (sev: string) => void;
  onSelectType?: (type: string) => void;
  onSelectLocation?: (loc: string) => void;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#f43f5e',
  high: '#f97316',
  medium: '#eab308',
  low: '#38bdf8',
};

const STATUS_COLORS: Record<string, string> = {
  emergency: '#e11d48',
  active: '#ef4444',
  investigating: '#f59e0b',
  mitigating: '#0ea5e9',
  contained: '#10b981',
  resolved: '#059669',
};

export const IncidentCharts: React.FC<IncidentChartsProps> = ({
  incidents,
  onSelectSeverity,
  onSelectType,
  onSelectLocation,
}) => {
  // 1. Severity Distribution Data
  const severityData = useMemo(() => {
    const counts: Record<string, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
    incidents.forEach((inc) => {
      const sev = (inc.severity || 'low').toLowerCase();
      if (counts[sev] !== undefined) {
        counts[sev]++;
      } else {
        counts.low = (counts.low || 0) + 1;
      }
    });

    return [
      { name: 'Critical', value: counts.critical, key: 'critical', color: SEVERITY_COLORS.critical },
      { name: 'High', value: counts.high, key: 'high', color: SEVERITY_COLORS.high },
      { name: 'Medium', value: counts.medium, key: 'medium', color: SEVERITY_COLORS.medium },
      { name: 'Low', value: counts.low, key: 'low', color: SEVERITY_COLORS.low },
    ].filter((item) => item.value > 0);
  }, [incidents]);

  // 2. Incident Type Distribution Data
  const typeData = useMemo(() => {
    const map: Record<string, number> = {};
    incidents.forEach((inc) => {
      const type = (inc.incident_type || 'unclassified').toLowerCase();
      map[type] = (map[type] || 0) + 1;
    });

    return Object.entries(map).map(([key, count]) => ({
      name: formatTypeLabel(key),
      rawType: key,
      count,
    }));
  }, [incidents]);

  // 3. Incidents by Location Data
  const locationData = useMemo(() => {
    const map: Record<string, { total: number; critical: number }> = {};
    incidents.forEach((inc) => {
      const city = inc.location ? inc.location.split(',')[0].trim() : 'Unknown';
      if (!map[city]) {
        map[city] = { total: 0, critical: 0 };
      }
      map[city].total++;
      if ((inc.severity || '').toLowerCase() === 'critical') {
        map[city].critical++;
      }
    });

    return Object.entries(map)
      .map(([location, data]) => ({
        location,
        total: data.total,
        critical: data.critical,
      }))
      .sort((a, b) => b.total - a.total);
  }, [incidents]);

  // 4. Incident Status Distribution Data
  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    incidents.forEach((inc) => {
      const st = (inc.status || 'unknown').toLowerCase();
      map[st] = (map[st] || 0) + 1;
    });

    return Object.entries(map).map(([st, count]) => ({
      name: st.charAt(0).toUpperCase() + st.slice(1),
      rawStatus: st,
      count,
      color: STATUS_COLORS[st] || '#64748b',
    }));
  }, [incidents]);

  // 5. Timeline Frequency Data
  const timelineData = useMemo(() => {
    // Sort incidents by timestamp ascending
    const sorted = [...incidents].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Group into 15-minute or individual event points
    return sorted.map((inc) => {
      const date = new Date(inc.timestamp);
      const timeLabel = isNaN(date.getTime())
        ? inc.timestamp
        : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return {
        time: timeLabel,
        id: inc.incident_id,
        severity: inc.severity,
        riskScore: inc.severity === 'critical' ? 95 : inc.severity === 'high' ? 75 : 45,
        category: inc.category,
      };
    });
  }, [incidents]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs font-mono">
          <p className="font-bold text-slate-200">{label || payload[0].name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="text-slate-300 mt-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: entry.color || entry.fill }} />
              {entry.name}: <span className="font-bold text-white">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Chart 1: Severity Distribution (Donut) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
            Severity Breakdown
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Live Distribution</span>
        </div>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
                onClick={(entry: any) => {
                  if (onSelectSeverity && entry && entry.key) {
                    onSelectSeverity(String(entry.key));
                  }
                }}
                className="cursor-pointer"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Incident Type Distribution (Bar) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
            Incidents by Domain Type
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Vectors</span>
        </div>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={typeData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={10}
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                name="Incidents"
                fill="#38bdf8"
                radius={[4, 4, 0, 0]}
                onClick={(entry: any) => onSelectType && onSelectType(entry.rawType)}
                className="cursor-pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Incidents by Location (Bar) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
            Regional Density (Cities)
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Hotspots</span>
        </div>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={locationData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="location"
                stroke="#64748b"
                fontSize={10}
                interval={0}
                angle={-25}
                textAnchor="end"
              />
              <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="total"
                name="Total Incidents"
                fill="#818cf8"
                radius={[4, 4, 0, 0]}
                onClick={(entry: any) => onSelectLocation && onSelectLocation(entry.location)}
                className="cursor-pointer"
              />
              <Bar dataKey="critical" name="Critical Incidents" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 4: Incident Timeline Activity (Area) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between md:col-span-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
            Incident Ingestion Timeline & Risk Intensity
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Temporal Velocity</span>
        </div>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="riskScore"
                name="Risk Velocity"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRisk)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 5: Status Distribution (Bar / Donut) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
            Lifecycle Status States
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Pipeline Status</span>
        </div>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={statusData}
              margin={{ top: 5, right: 20, left: 15, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#64748b" fontSize={10} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#64748b"
                fontSize={10}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Count" radius={[0, 4, 4, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-status-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
