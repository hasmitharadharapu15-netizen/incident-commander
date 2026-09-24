export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low' | string;

export type IncidentStatus = 
  | 'active'
  | 'investigating'
  | 'mitigating'
  | 'contained'
  | 'resolved'
  | 'emergency'
  | string;

export type IncidentType = 
  | 'cybersecurity'
  | 'system_failure'
  | 'network'
  | 'application'
  | 'physical'
  | string;

export interface StatusHistoryEntry {
  status: IncidentStatus;
  timestamp: string;
  note?: string;
  user?: string;
}

export interface Incident {
  incident_id: string;
  timestamp: string;
  incident_type: IncidentType;
  category: string;
  severity: IncidentSeverity;
  source: string;
  location: string;
  affected_system: string;
  description: string;
  status: IncidentStatus;
  confidence: number;

  // Optional incident-specific telemetry metrics
  source_ip?: string;
  failed_attempts?: number;
  response_time_ms?: number;
  error_rate?: number;
  traffic_gb?: number;
  normal_traffic_gb?: number;
  malware_family?: string;
  file_hash?: string;
  failed_connections?: number;
  normal_connections?: number;
  requests_per_second?: number;
  normal_requests_per_second?: number;
  cpu_usage_percent?: number;
  duration_minutes?: number;
  user?: string;
  login_country?: string;
  latency_ms?: number;
  threshold_ms?: number;
  sensor_id?: string;
  temperature_celsius?: number;

  // Operational tracking
  status_history?: StatusHistoryEntry[];
  investigation_notes?: string[];
  assigned_team?: string;
}

export type RiskPriority = 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'MODERATE' | 'LOW';

export interface RiskFactor {
  factor: string;
  impactScore: number;
  detail: string;
  category: 'threat' | 'environment' | 'system' | 'metric';
}

export interface RiskAnalysis {
  score: number; // 0 - 100
  priority: RiskPriority;
  summary: string;
  riskFactors: RiskFactor[];
  recommendedAction: string;
  actionChecklist: string[];
  evaluatedAt: string;
  analysisType: 'Rule-Based Deterministic SOC Engine';
}

export interface DashboardMetrics {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  active: number;
  investigating: number;
  mitigating: number;
  contained: number;
  resolved: number;
  emergency: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  incidentId?: string;
  read: boolean;
}

export interface LocationSummary {
  location: string;
  totalIncidents: number;
  criticalIncidents: number;
  activeIncidents: number;
  highestSeverity: IncidentSeverity;
  affectedSystems: string[];
}
