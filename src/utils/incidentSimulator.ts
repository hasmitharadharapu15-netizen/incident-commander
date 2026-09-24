import { Incident, IncidentSeverity, IncidentType } from '../types/incident';

interface IncidentTemplate {
  incident_type: IncidentType;
  category: string;
  severity: IncidentSeverity;
  source: string;
  location: string;
  affected_system: string;
  description: string;
  metrics: Partial<Incident>;
}

const TEMPLATES: IncidentTemplate[] = [
  {
    incident_type: 'cybersecurity',
    category: 'ransomware_canary',
    severity: 'critical',
    source: 'edr_agent_sentinel',
    location: 'Hyderabad, India',
    affected_system: 'finance_file_server',
    description: 'Canary honeypot file modified by unsigned script with anomalous entropy.',
    metrics: {
      malware_family: 'LockBit-Variant',
      file_hash: '9f2c8d0e51b74a33',
      confidence: 0.96,
    },
  },
  {
    incident_type: 'network',
    category: 'bgp_route_leak',
    severity: 'high',
    source: 'backbone_telemetry',
    location: 'Mumbai, India',
    affected_system: 'edge_gateway_router',
    description: 'Anomalous BGP route advertisement received, rerouting tier-1 traffic path.',
    metrics: {
      traffic_gb: 1240,
      normal_traffic_gb: 410,
      confidence: 0.92,
    },
  },
  {
    incident_type: 'system_failure',
    category: 'memory_leak_exhaustion',
    severity: 'critical',
    source: 'apm_datadog',
    location: 'Bengaluru, India',
    affected_system: 'order_processing_cluster',
    description: 'JVM heap utilization exceeded 98% resulting in aggressive garbage collection freeze.',
    metrics: {
      response_time_ms: 6800,
      error_rate: 0.44,
      confidence: 0.97,
    },
  },
  {
    incident_type: 'application',
    category: 'cache_stampede',
    severity: 'high',
    source: 'application_monitor',
    location: 'Pune, India',
    affected_system: 'catalog_redis_cache',
    description: 'Cache eviction triggered simultaneous DB querying surge across 60 worker pods.',
    metrics: {
      failed_connections: 520,
      normal_connections: 30,
      confidence: 0.89,
    },
  },
  {
    incident_type: 'cybersecurity',
    category: 'credential_stuffing',
    severity: 'high',
    source: 'waf_edge_guard',
    location: 'Delhi, India',
    affected_system: 'mobile_auth_gateway',
    description: 'Distributed credential stuffing pattern targeting customer mobile login endpoints.',
    metrics: {
      source_ip: '198.51.100.77',
      failed_attempts: 384,
      confidence: 0.93,
    },
  },
  {
    incident_type: 'physical',
    category: 'ups_battery_overheat',
    severity: 'critical',
    source: 'dcim_bms_sensor',
    location: 'Chennai, India',
    affected_system: 'pdu_battery_bank_b',
    description: 'Uninterruptible Power Supply (UPS) battery module thermal run-away sensor alarm.',
    metrics: {
      sensor_id: 'UPS-THERM-88',
      temperature_celsius: 69.2,
      confidence: 0.98,
    },
  },
  {
    incident_type: 'system_failure',
    category: 'disk_io_saturation',
    severity: 'medium',
    source: 'os_node_exporter',
    location: 'Kolkata, India',
    affected_system: 'analytics_clickhouse_node_02',
    description: 'Disk I/O queue length sustained above 90ms with 100% NVMe utilization.',
    metrics: {
      cpu_usage_percent: 91.2,
      duration_minutes: 12,
      confidence: 0.91,
    },
  },
  {
    incident_type: 'application',
    category: 'graphql_query_complexity_bomb',
    severity: 'medium',
    source: 'api_gateway',
    location: 'Ahmedabad, India',
    affected_system: 'public_graphql_api',
    description: 'Deeply nested recursive queries causing API worker thread starvation.',
    metrics: {
      latency_ms: 4800,
      threshold_ms: 1200,
      confidence: 0.88,
    },
  },
  {
    incident_type: 'network',
    category: 'syn_flood_detected',
    severity: 'critical',
    source: 'edge_firewall',
    location: 'Noida, India',
    affected_system: 'dmz_load_balancer',
    description: 'TCP SYN flood targeting port 443 with randomized spoofed header IP sequences.',
    metrics: {
      requests_per_second: 24500,
      normal_requests_per_second: 1500,
      confidence: 0.96,
    },
  },
];

/**
 * Calculates next available sequential Incident ID (e.g. INC011, INC012...)
 */
export function getNextIncidentId(existingIncidents: Incident[]): string {
  let maxIdNum = 0;
  for (const inc of existingIncidents) {
    const match = inc.incident_id?.match(/INC(\d+)/i);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxIdNum) {
        maxIdNum = num;
      }
    }
  }
  const nextNum = maxIdNum + 1;
  return `INC${String(nextNum).padStart(3, '0')}`;
}

/**
 * Simulates a realistic new incident with unique ID, current timestamp,
 * and high-fidelity SOC telemetry.
 */
export function generateSimulatedIncident(existingIncidents: Incident[]): Incident {
  const nextId = getNextIncidentId(existingIncidents);
  const randomIndex = Math.floor(Math.random() * TEMPLATES.length);
  const template = TEMPLATES[randomIndex];

  const nowIso = new Date().toISOString();

  const newIncident: Incident = {
    incident_id: nextId,
    timestamp: nowIso,
    incident_type: template.incident_type,
    category: template.category,
    severity: template.severity,
    source: template.source,
    location: template.location,
    affected_system: template.affected_system,
    description: template.description,
    status: template.severity === 'critical' ? 'active' : 'investigating',
    confidence: template.metrics.confidence || 0.94,
    status_history: [
      {
        status: template.severity === 'critical' ? 'active' : 'investigating',
        timestamp: nowIso,
        note: 'Incident detected by SOC automated correlation engine.',
        user: 'Automated Monitor',
      },
    ],
    ...template.metrics,
  };

  return newIncident;
}
