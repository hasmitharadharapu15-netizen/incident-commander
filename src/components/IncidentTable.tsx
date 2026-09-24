import React, { useMemo } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  ArrowUpDown, 
  Eye, 
  AlertCircle, 
  MapPin, 
  Server, 
  ShieldAlert, 
  Clock 
} from 'lucide-react';
import { Incident } from '../types/incident';
import { 
  formatTimestamp, 
  formatCategoryLabel, 
  formatTypeLabel, 
  getSeverityBadgeClass, 
  getSeverityDotColor, 
  getStatusBadgeClass 
} from '../utils/formatters';

interface IncidentTableProps {
  incidents: Incident[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  severityFilter: string;
  onSeverityFilterChange: (sev: string) => void;
  statusFilter: string;
  onStatusFilterChange: (st: string) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  locationFilter: string;
  onLocationFilterChange: (loc: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (cat: string) => void;
  sortBy: 'timestamp' | 'severity';
  sortOrder: 'asc' | 'desc';
  onToggleSort: (field: 'timestamp' | 'severity') => void;
  onClearFilters: () => void;
  onSelectIncident: (incident: Incident) => void;
}

const SEVERITY_ORDER: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export const IncidentTable: React.FC<IncidentTableProps> = ({
  incidents,
  searchQuery,
  onSearchChange,
  severityFilter,
  onSeverityFilterChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  locationFilter,
  onLocationFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  sortBy,
  sortOrder,
  onToggleSort,
  onClearFilters,
  onSelectIncident,
}) => {
  // Extract unique locations, types, and categories for dropdowns
  const availableLocations = useMemo(() => {
    const set = new Set<string>();
    incidents.forEach((i) => {
      if (i.location) set.add(i.location);
    });
    return Array.from(set).sort();
  }, [incidents]);

  const availableTypes = useMemo(() => {
    const set = new Set<string>();
    incidents.forEach((i) => {
      if (i.incident_type) set.add(i.incident_type);
    });
    return Array.from(set).sort();
  }, [incidents]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    incidents.forEach((i) => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set).sort();
  }, [incidents]);

  // Filtering & Searching logic
  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      // 1. Search Query (across ID, affected system, description, location, category, source IP, user)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchId = (incident.incident_id || '').toLowerCase().includes(query);
        const matchSys = (incident.affected_system || '').toLowerCase().includes(query);
        const matchDesc = (incident.description || '').toLowerCase().includes(query);
        const matchLoc = (incident.location || '').toLowerCase().includes(query);
        const matchCat = (incident.category || '').toLowerCase().includes(query);
        const matchType = (incident.incident_type || '').toLowerCase().includes(query);
        const matchIp = (incident.source_ip || '').toLowerCase().includes(query);
        const matchUser = (incident.user || '').toLowerCase().includes(query);
        if (!matchId && !matchSys && !matchDesc && !matchLoc && !matchCat && !matchType && !matchIp && !matchUser) {
          return false;
        }
      }

      // 2. Severity Filter
      if (severityFilter !== 'all') {
        if ((incident.severity || '').toLowerCase() !== severityFilter.toLowerCase()) {
          return false;
        }
      }

      // 3. Status Filter
      if (statusFilter !== 'all') {
        if ((incident.status || '').toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      // 4. Type Filter
      if (typeFilter !== 'all') {
        if ((incident.incident_type || '').toLowerCase() !== typeFilter.toLowerCase()) {
          return false;
        }
      }

      // 5. Location Filter
      if (locationFilter !== 'all') {
        if ((incident.location || '').toLowerCase() !== locationFilter.toLowerCase()) {
          return false;
        }
      }

      // 6. Category Filter
      if (categoryFilter !== 'all') {
        if ((incident.category || '').toLowerCase() !== categoryFilter.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [
    incidents,
    searchQuery,
    severityFilter,
    statusFilter,
    typeFilter,
    locationFilter,
    categoryFilter,
  ]);

  // Sorting
  const sortedIncidents = useMemo(() => {
    return [...filteredIncidents].sort((a, b) => {
      if (sortBy === 'timestamp') {
        const timeA = new Date(a.timestamp).getTime() || 0;
        const timeB = new Date(b.timestamp).getTime() || 0;
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      } else if (sortBy === 'severity') {
        const orderA = SEVERITY_ORDER[(a.severity || '').toLowerCase()] || 0;
        const orderB = SEVERITY_ORDER[(b.severity || '').toLowerCase()] || 0;
        return sortOrder === 'desc' ? orderB - orderA : orderA - orderB;
      }
      return 0;
    });
  }, [filteredIncidents, sortBy, sortOrder]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    severityFilter !== 'all' ||
    statusFilter !== 'all' ||
    typeFilter !== 'all' ||
    locationFilter !== 'all' ||
    categoryFilter !== 'all';

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Search & Filter Header Bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by ID (INC002), system, location (Bengaluru), category, IP..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500/80 focus:ring-1 focus:ring-rose-500/50 transition-all font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Incident Count Indicator & Clear Filters Button */}
          <div className="flex items-center gap-2.5 shrink-0 justify-between sm:justify-end">
            <span className="text-xs font-mono text-slate-400">
              Showing <strong className="text-white font-semibold">{sortedIncidents.length}</strong> of{' '}
              <span className="text-slate-500">{incidents.length}</span> incidents
            </span>

            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-rose-400 hover:text-rose-300 border border-slate-700 text-xs font-mono transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
          {/* Severity Filter */}
          <div>
            <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">
              Severity
            </label>
            <select
              value={severityFilter}
              onChange={(e) => onSeverityFilterChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="investigating">Investigating</option>
              <option value="mitigating">Mitigating</option>
              <option value="contained">Contained</option>
              <option value="resolved">Resolved</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          {/* Incident Type Filter */}
          <div>
            <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">
              Incident Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => onTypeFilterChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="all">All Types</option>
              {availableTypes.map((t) => (
                <option key={t} value={t}>
                  {formatTypeLabel(t)}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">
              Location
            </label>
            <select
              value={locationFilter}
              onChange={(e) => onLocationFilterChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="all">All Locations</option>
              {availableLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {formatCategoryLabel(c)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th scope="col" className="py-3 px-3.5 whitespace-nowrap">
                Incident ID
              </th>
              <th scope="col" className="py-3 px-3.5 whitespace-nowrap">
                <button
                  onClick={() => onToggleSort('timestamp')}
                  className="flex items-center gap-1 hover:text-slate-200 cursor-pointer"
                >
                  <span>Timestamp</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </button>
              </th>
              <th scope="col" className="py-3 px-3.5 whitespace-nowrap">
                Incident Type
              </th>
              <th scope="col" className="py-3 px-3.5 whitespace-nowrap">
                Category
              </th>
              <th scope="col" className="py-3 px-3.5 whitespace-nowrap">
                <button
                  onClick={() => onToggleSort('severity')}
                  className="flex items-center gap-1 hover:text-slate-200 cursor-pointer"
                >
                  <span>Severity</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </button>
              </th>
              <th scope="col" className="py-3 px-3.5 whitespace-nowrap">
                Location
              </th>
              <th scope="col" className="py-3 px-3.5 whitespace-nowrap">
                Affected System
              </th>
              <th scope="col" className="py-3 px-3.5 whitespace-nowrap">
                Status
              </th>
              <th scope="col" className="py-3 px-3.5 whitespace-nowrap">
                Confidence
              </th>
              <th scope="col" className="py-3 px-3.5 text-right whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60 font-sans">
            {sortedIncidents.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-6 h-6 text-slate-500" />
                    <span className="font-semibold text-slate-300">No matching incidents found</span>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Try clearing search terms or changing your severity and status filters.
                    </p>
                    <button
                      onClick={onClearFilters}
                      className="mt-2 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer font-mono"
                    >
                      Reset All Filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              sortedIncidents.map((incident) => {
                const confidencePct = Math.round((incident.confidence || 0.8) * 100);
                const isCritical = (incident.severity || '').toLowerCase() === 'critical';

                return (
                  <tr
                    key={incident.incident_id}
                    onClick={() => onSelectIncident(incident)}
                    className={`group transition-colors cursor-pointer hover:bg-slate-800/60 ${
                      isCritical ? 'bg-rose-950/10' : 'even:bg-slate-900/30'
                    }`}
                  >
                    {/* ID */}
                    <td className="py-3 px-3.5 font-mono font-bold text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getSeverityDotColor(incident.severity)}`} />
                        <span>{incident.incident_id}</span>
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3 px-3.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {formatTimestamp(incident.timestamp)}
                    </td>

                    {/* Type */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="text-slate-300">
                        {formatTypeLabel(incident.incident_type)}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3.5 font-medium text-slate-200 whitespace-nowrap">
                      {formatCategoryLabel(incident.category)}
                    </td>

                    {/* Severity */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span
                        className={`text-[11px] uppercase font-mono px-2 py-0.5 rounded font-semibold ${getSeverityBadgeClass(
                          incident.severity
                        )}`}
                      >
                        {incident.severity}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-3.5 text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{incident.location}</span>
                      </div>
                    </td>

                    {/* Affected System */}
                    <td className="py-3 px-3.5 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Server className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="max-w-[150px] truncate">{incident.affected_system}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span
                        className={`text-[11px] uppercase font-mono px-2 py-0.5 rounded font-medium ${getStatusBadgeClass(
                          incident.status
                        )}`}
                      >
                        {incident.status}
                      </span>
                    </td>

                    {/* Confidence */}
                    <td className="py-3 px-3.5 font-mono text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              confidencePct >= 95
                                ? 'bg-emerald-500'
                                : confidencePct >= 85
                                ? 'bg-cyan-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${confidencePct}%` }}
                          />
                        </div>
                        <span className="text-slate-300 text-[11px]">{confidencePct}%</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIncident(incident);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-mono transition-colors border border-slate-700 cursor-pointer"
                        title="Open incident detail panel"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Triage</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
