import React, { useState, useMemo } from 'react';
import { 
  X, 
  ShieldAlert, 
  Flame, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Server, 
  Cpu, 
  Radio, 
  HardDrive, 
  User, 
  Globe, 
  Hash, 
  Thermometer, 
  Activity, 
  FileText, 
  ChevronRight,
  Sparkles,
  ExternalLink,
  Send,
  CheckSquare,
  Square
} from 'lucide-react';
import { Incident, IncidentStatus, StatusHistoryEntry } from '../types/incident';
import { analyzeIncident } from '../utils/riskAnalyzer';
import { 
  formatTimestamp, 
  formatCategoryLabel, 
  formatTypeLabel, 
  getSeverityBadgeClass, 
  getStatusBadgeClass 
} from '../utils/formatters';

interface IncidentDetailModalProps {
  incident: Incident | null;
  onClose: () => void;
  onUpdateStatus: (incidentId: string, newStatus: IncidentStatus, note?: string) => void;
  onAddNote: (incidentId: string, note: string) => void;
}

const LIFECYCLE_STEPS: { key: IncidentStatus; label: string }[] = [
  { key: 'active', label: 'Detected / Active' },
  { key: 'investigating', label: 'Investigating' },
  { key: 'mitigating', label: 'Mitigating' },
  { key: 'contained', label: 'Contained' },
  { key: 'resolved', label: 'Resolved' },
];

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  onUpdateStatus,
  onAddNote,
}) => {
  const [newNote, setNewNote] = useState('');
  const [checklistCompleted, setChecklistCompleted] = useState<Record<string, boolean>>({});

  if (!incident) return null;

  // Execute transparent rule-based risk evaluation
  const riskAnalysis = useMemo(() => {
    return analyzeIncident(incident);
  }, [incident]);

  const toggleChecklist = (item: string) => {
    setChecklistCompleted((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      onAddNote(incident.incident_id, newNote.trim());
      setNewNote('');
    }
  };

  // Helper to determine current position in lifecycle
  const currentStatus = (incident.status || '').toLowerCase();
  const getStepIndex = (status: string) => {
    if (status === 'emergency' || status === 'active') return 0;
    if (status === 'investigating') return 1;
    if (status === 'mitigating') return 2;
    if (status === 'contained') return 3;
    if (status === 'resolved') return 4;
    return 0;
  };
  const activeStepIdx = getStepIndex(currentStatus);

  // Risk Score Gauge styling
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-rose-500 border-rose-500 bg-rose-950/40';
    if (score >= 70) return 'text-orange-400 border-orange-500 bg-orange-950/40';
    if (score >= 50) return 'text-amber-400 border-amber-500 bg-amber-950/40';
    return 'text-cyan-400 border-cyan-500 bg-cyan-950/40';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex justify-center items-start p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-4 sm:my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-sm sm:text-base font-mono font-bold px-2.5 py-1 rounded bg-slate-800 text-white border border-slate-700">
              {incident.incident_id}
            </span>
            <span
              className={`text-xs uppercase font-mono px-2.5 py-1 rounded font-bold ${getSeverityBadgeClass(
                incident.severity
              )}`}
            >
              {incident.severity} Severity
            </span>
            <span
              className={`text-xs uppercase font-mono px-2.5 py-1 rounded font-semibold ${getStatusBadgeClass(
                incident.status
              )}`}
            >
              {incident.status}
            </span>
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {formatTimestamp(incident.timestamp)}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Incident Title & Description */}
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
              <span>{formatTypeLabel(incident.incident_type)}</span>
              <span>/</span>
              <span className="text-slate-200 font-semibold">{formatCategoryLabel(incident.category)}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
              {incident.description}
            </h2>
          </div>

          {/* Incident Lifecycle Stepper */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Incident Operational Lifecycle</span>
              <span className="text-cyan-400 font-bold">Stage: {incident.status.toUpperCase()}</span>
            </div>

            <div className="grid grid-cols-5 gap-1 text-center font-mono text-xs">
              {LIFECYCLE_STEPS.map((step, idx) => {
                const isPastOrCurrent = idx <= activeStepIdx;
                const isCurrent = idx === activeStepIdx;

                return (
                  <div
                    key={step.key}
                    onClick={() => onUpdateStatus(incident.incident_id, step.key)}
                    className={`py-2 px-1 rounded-lg border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      isCurrent
                        ? 'bg-rose-950/80 border-rose-500 text-rose-300 ring-1 ring-rose-500/50'
                        : isPastOrCurrent
                        ? 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                        : 'bg-slate-900/30 border-slate-800 text-slate-600 hover:bg-slate-850'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 font-bold">0{idx + 1}</span>
                    <span className="text-[11px] font-medium truncate w-full px-1">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Status Action Buttons */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Transition Incident Status</span>
              <span className="text-[10px] text-slate-500">Persisted instantly to localStorage</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onUpdateStatus(incident.incident_id, 'investigating', 'Operator initiated active triage.')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors cursor-pointer ${
                  currentStatus === 'investigating'
                    ? 'bg-amber-950 text-amber-200 border-amber-500 ring-1 ring-amber-500'
                    : 'bg-slate-850 hover:bg-amber-950/40 text-amber-300 border-amber-700/50'
                }`}
              >
                Investigating
              </button>

              <button
                onClick={() => onUpdateStatus(incident.incident_id, 'mitigating', 'Countermeasures deployed; monitoring stabilization.')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors cursor-pointer ${
                  currentStatus === 'mitigating'
                    ? 'bg-sky-950 text-sky-200 border-sky-500 ring-1 ring-sky-500'
                    : 'bg-slate-850 hover:bg-sky-950/40 text-sky-300 border-sky-700/50'
                }`}
              >
                Mitigating
              </button>

              <button
                onClick={() => onUpdateStatus(incident.incident_id, 'contained', 'Blast radius isolated; lateral propagation prevented.')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors cursor-pointer ${
                  currentStatus === 'contained'
                    ? 'bg-emerald-950 text-emerald-200 border-emerald-500 ring-1 ring-emerald-500'
                    : 'bg-slate-850 hover:bg-emerald-950/40 text-emerald-300 border-emerald-700/50'
                }`}
              >
                Contained
              </button>

              <button
                onClick={() => onUpdateStatus(incident.incident_id, 'resolved', 'Post-incident recovery confirmed; all systems nominal.')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors cursor-pointer ${
                  currentStatus === 'resolved'
                    ? 'bg-emerald-900 text-emerald-100 border-emerald-400 ring-1 ring-emerald-400'
                    : 'bg-slate-850 hover:bg-emerald-900/30 text-emerald-400 border-emerald-800/60'
                }`}
              >
                Resolved
              </button>

              {currentStatus !== 'emergency' && (
                <button
                  onClick={() => onUpdateStatus(incident.incident_id, 'emergency', 'Facility/Safety emergency declared.')}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition-colors cursor-pointer ml-auto"
                >
                  Declare Emergency
                </button>
              )}
            </div>
          </div>

          {/* Rule-Based Risk Analysis Section (Crucial requirement from prompt) */}
          <div className="bg-slate-900/90 border-2 border-rose-900/60 rounded-xl p-4 sm:p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-rose-900/40 text-rose-300 px-3 py-1 rounded-bl-lg text-[10px] font-mono border-l border-b border-rose-700 uppercase tracking-wider font-semibold">
              Rule-Based Risk Analysis
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <h3 className="text-sm sm:text-base font-bold text-white font-mono">
                    Rule-Based Risk Analysis
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Deterministic Heuristics Engine (Telemetry, Severity, Anomalies & Risk Weighting)
                </p>
              </div>

              {/* Score Gauge */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-mono text-slate-400">Risk Priority</div>
                  <div className="text-sm font-bold font-mono text-rose-400">
                    {riskAnalysis.priority}
                  </div>
                </div>
                <div
                  className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center font-mono font-bold ${getScoreColor(
                    riskAnalysis.score
                  )}`}
                >
                  <span className="text-xl leading-none">{riskAnalysis.score}</span>
                  <span className="text-[9px] uppercase opacity-75">/ 100</span>
                </div>
              </div>
            </div>

            {/* Assessment Summary */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 mb-4 font-sans leading-relaxed">
              <strong className="text-rose-400 font-mono">SOC Assessment: </strong>
              {riskAnalysis.summary}
            </div>

            {/* Recommended Next Action */}
            <div className="bg-gradient-to-r from-rose-950/50 to-slate-900 border border-rose-700/60 rounded-lg p-3.5 mb-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-rose-300 font-bold mb-1 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Recommended Next Action:</span>
              </div>
              <p className="text-xs text-rose-100 font-medium leading-relaxed">
                {riskAnalysis.recommendedAction}
              </p>
            </div>

            {/* Action Checklist */}
            <div className="mb-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                Operational Action Checklist:
              </div>
              <div className="space-y-1.5">
                {riskAnalysis.actionChecklist.map((task, idx) => {
                  const isChecked = checklistCompleted[task];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleChecklist(task)}
                      className={`flex items-start gap-2 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 line-through'
                          : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-850'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      )}
                      <span>{task}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Triggered Risk Factors */}
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                Triggered Heuristic Factors:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {riskAnalysis.riskFactors.map((rf, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-slate-200 truncate">{rf.factor}</span>
                      <span
                        className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                          rf.impactScore > 0
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {rf.impactScore > 0 ? `+${rf.impactScore}` : rf.impactScore} pts
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{rf.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Incident Core Attributes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-500 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Location
              </div>
              <div className="text-xs font-semibold text-white">{incident.location}</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-500 mb-1 flex items-center gap-1">
                <Server className="w-3 h-3" /> Affected System
              </div>
              <div className="text-xs font-semibold font-mono text-cyan-300 truncate">
                {incident.affected_system}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-500 mb-1 flex items-center gap-1">
                <Activity className="w-3 h-3" /> Source
              </div>
              <div className="text-xs font-semibold text-slate-300 font-mono truncate">
                {incident.source}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-500 mb-1">
                Detection Confidence
              </div>
              <div className="text-xs font-semibold font-mono text-emerald-400">
                {((incident.confidence ?? 0.8) * 100).toFixed(1)}% (
                {incident.confidence >= 0.9 ? 'High' : 'Medium'})
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-500 mb-1">
                Incident Domain
              </div>
              <div className="text-xs font-semibold text-slate-300">
                {formatTypeLabel(incident.incident_type)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-500 mb-1">
                Classification Category
              </div>
              <div className="text-xs font-semibold text-slate-300 truncate">
                {formatCategoryLabel(incident.category)}
              </div>
            </div>
          </div>

          {/* Incident-Specific Telemetry Metrics (ONLY shown when fields are present!) */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>Incident-Specific Telemetry & Context</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs font-mono">
              {/* Temperature Celsius (INC010) */}
              {incident.temperature_celsius !== undefined && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-rose-800/60">
                  <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-rose-400" /> Temperature
                  </div>
                  <div className="text-sm font-bold text-rose-400 mt-0.5">
                    {incident.temperature_celsius}°C
                  </div>
                  <div className="text-[10px] text-rose-400/80 mt-0.5">Threshold: 50°C</div>
                </div>
              )}

              {/* Sensor ID (INC010) */}
              {incident.sensor_id && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Sensor ID</div>
                  <div className="text-sm font-bold text-white mt-0.5">{incident.sensor_id}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Server Room Hall</div>
                </div>
              )}

              {/* Response Time (INC002) */}
              {incident.response_time_ms !== undefined && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-amber-800/60">
                  <div className="text-[10px] text-slate-500 uppercase">Response Time</div>
                  <div className="text-sm font-bold text-amber-400 mt-0.5">
                    {incident.response_time_ms} ms
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Normal: &lt; 250ms</div>
                </div>
              )}

              {/* Error Rate (INC002) */}
              {incident.error_rate !== undefined && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-rose-800/60">
                  <div className="text-[10px] text-slate-500 uppercase">Error Rate</div>
                  <div className="text-sm font-bold text-rose-400 mt-0.5">
                    {(incident.error_rate * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">SLA Target: &lt; 0.5%</div>
                </div>
              )}

              {/* Source IP (INC001) */}
              {incident.source_ip && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Source IP</div>
                  <div className="text-sm font-bold text-rose-300 mt-0.5">{incident.source_ip}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Threat Ingress</div>
                </div>
              )}

              {/* Failed Attempts (INC001) */}
              {incident.failed_attempts !== undefined && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Failed Attempts</div>
                  <div className="text-sm font-bold text-rose-400 mt-0.5">
                    {incident.failed_attempts}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Brute-force limit: 5</div>
                </div>
              )}

              {/* Requests Per Second (INC006) */}
              {incident.requests_per_second !== undefined && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-rose-800/60">
                  <div className="text-[10px] text-slate-500 uppercase">Requests / Sec</div>
                  <div className="text-sm font-bold text-rose-400 mt-0.5">
                    {incident.requests_per_second.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Normal: {incident.normal_requests_per_second?.toLocaleString() || '1,200'}
                  </div>
                </div>
              )}

              {/* Malware Family (INC004) */}
              {incident.malware_family && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-purple-800/60">
                  <div className="text-[10px] text-slate-500 uppercase">Malware Family</div>
                  <div className="text-sm font-bold text-purple-300 mt-0.5">
                    {incident.malware_family}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Executable Vector</div>
                </div>
              )}

              {/* File Hash (INC004) */}
              {incident.file_hash && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 col-span-2">
                  <div className="text-[10px] text-slate-500 uppercase">File Hash</div>
                  <div className="text-xs font-bold text-slate-300 mt-0.5 truncate">
                    {incident.file_hash}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">SHA256 Payload Hash</div>
                </div>
              )}

              {/* Failed Connections (INC005) */}
              {incident.failed_connections !== undefined && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-orange-800/60">
                  <div className="text-[10px] text-slate-500 uppercase">Failed DB Conns</div>
                  <div className="text-sm font-bold text-orange-400 mt-0.5">
                    {incident.failed_connections}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Normal: {incident.normal_connections || '25'}
                  </div>
                </div>
              )}

              {/* CPU Usage Percent (INC007) */}
              {incident.cpu_usage_percent !== undefined && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-amber-800/60">
                  <div className="text-[10px] text-slate-500 uppercase">CPU Utilization</div>
                  <div className="text-sm font-bold text-amber-400 mt-0.5">
                    {incident.cpu_usage_percent}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Duration: {incident.duration_minutes || '8'}m
                  </div>
                </div>
              )}

              {/* User (INC008) */}
              {incident.user && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">User Account</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">{incident.user}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Privileged Role</div>
                </div>
              )}

              {/* Login Country (INC008) */}
              {incident.login_country && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Login Country</div>
                  <div className="text-sm font-bold text-rose-400 mt-0.5">
                    {incident.login_country}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Geo-Anomalous</div>
                </div>
              )}

              {/* Latency MS (INC009) */}
              {incident.latency_ms !== undefined && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-amber-800/60">
                  <div className="text-[10px] text-slate-500 uppercase">API Latency</div>
                  <div className="text-sm font-bold text-amber-400 mt-0.5">
                    {incident.latency_ms} ms
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Threshold: {incident.threshold_ms || 1000} ms
                  </div>
                </div>
              )}

              {/* Traffic GB (INC003) */}
              {incident.traffic_gb !== undefined && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-cyan-800/60">
                  <div className="text-[10px] text-slate-500 uppercase">Outbound Traffic</div>
                  <div className="text-sm font-bold text-cyan-300 mt-0.5">
                    {incident.traffic_gb} GB
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Normal: {incident.normal_traffic_gb || 320} GB
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Investigation Notes & Audit Log */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Notes Section */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Responder Notes & Observations</span>
                </div>

                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                  {(!incident.investigation_notes || incident.investigation_notes.length === 0) ? (
                    <p className="text-xs text-slate-500 italic">No notes logged yet by SOC responders.</p>
                  ) : (
                    incident.investigation_notes.map((note, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-sans">
                        {note}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <form onSubmit={handleAddNoteSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add triage note or remediation update..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  disabled={!newNote.trim()}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </form>
            </div>

            {/* Audit History Log */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Lifecycle History & Audit Trail</span>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto text-xs font-mono">
                {incident.status_history && incident.status_history.length > 0 ? (
                  incident.status_history.map((hist, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-950/70 border border-slate-800/80 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-200 uppercase">{hist.status}</span>
                          <span className="text-slate-500 text-[10px]">
                            {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                        {hist.note && <p className="text-[11px] text-slate-400 mt-0.5">{hist.note}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 uppercase">{incident.status}</span>
                      <span className="text-slate-500">{formatTimestamp(incident.timestamp)}</span>
                    </div>
                    <p className="mt-0.5">Initial detection event ingested by telemetry sensors.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="text-xs font-mono text-slate-400">
            System ID: <strong className="text-slate-200">{incident.affected_system}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors cursor-pointer"
          >
            Close Incident Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
