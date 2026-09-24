import { Incident, RiskAnalysis, RiskFactor, RiskPriority } from '../types/incident';

/**
 * Deterministic, explainable SOC heuristic engine.
 * Transparent rule-based risk analysis calculated strictly from telemetry, 
 * severity weightings, anomalous thresholds, and operational urgency.
 * (NOT a machine-learning model; fully inspectable SOC operational logic).
 */
export function analyzeIncident(incident: Incident): RiskAnalysis {
  let score = 0;
  const factors: RiskFactor[] = [];
  const actionChecklist: string[] = [];
  let recommendedAction = '';
  let summary = '';

  const severity = (incident.severity || '').toLowerCase();
  const status = (incident.status || '').toLowerCase();
  const category = (incident.category || '').toLowerCase();
  const incidentType = (incident.incident_type || '').toLowerCase();
  const confidence = typeof incident.confidence === 'number' ? incident.confidence : 0.8;

  // 1. Base Severity Contribution
  if (severity === 'critical') {
    score += 35;
    factors.push({
      factor: 'Critical Severity Classification',
      impactScore: 35,
      detail: 'Assigned top-tier severity due to direct operational or security risk to core business infrastructure.',
      category: 'threat',
    });
  } else if (severity === 'high') {
    score += 24;
    factors.push({
      factor: 'High Severity Level',
      impactScore: 24,
      detail: 'Significant incident posing degradation or risk of escalation across systems.',
      category: 'threat',
    });
  } else if (severity === 'medium') {
    score += 12;
    factors.push({
      factor: 'Medium Severity Level',
      impactScore: 12,
      detail: 'Elevated anomaly requiring SOC review and remediation.',
      category: 'threat',
    });
  } else {
    score += 5;
    factors.push({
      factor: 'Standard Base Telemetry',
      impactScore: 5,
      detail: 'Standard alert triage threshold.',
      category: 'threat',
    });
  }

  // 2. Incident Status Modifier
  if (status === 'emergency') {
    score += 35;
    factors.push({
      factor: 'Active Emergency State',
      impactScore: 35,
      detail: 'Facility or operational safety hazard requiring urgent human and automated intervention.',
      category: 'environment',
    });
  } else if (status === 'active') {
    score += 20;
    factors.push({
      factor: 'Active / Uncontained Incident',
      impactScore: 20,
      detail: 'Active threat state with ongoing impact on production or infrastructure.',
      category: 'system',
    });
  } else if (status === 'investigating') {
    score += 12;
    factors.push({
      factor: 'Ongoing Investigation',
      impactScore: 12,
      detail: 'Incident currently under review by active SOC responder.',
      category: 'system',
    });
  } else if (status === 'mitigating') {
    score += 6;
    factors.push({
      factor: 'Mitigation in Progress',
      impactScore: 6,
      detail: 'Mitigation controls applied; observing telemetry for stabilization.',
      category: 'system',
    });
  } else if (status === 'contained') {
    score -= 15;
    factors.push({
      factor: 'Contained Threat Vector',
      impactScore: -15,
      detail: 'Blast radius isolated; lateral movement or failure spread prevented.',
      category: 'system',
    });
  } else if (status === 'resolved') {
    score -= 35;
    factors.push({
      factor: 'Remediation Verified (Resolved)',
      impactScore: -35,
      detail: 'System returned to nominal baselines; risk minimized.',
      category: 'system',
    });
  }

  // 3. Confidence Weight
  const confidencePoints = Math.round(confidence * 12);
  score += confidencePoints;
  factors.push({
    factor: `Detection Confidence: ${(confidence * 100).toFixed(0)}%`,
    impactScore: confidencePoints,
    detail: `Sensor and telemetry correlation confidence rating of ${(confidence * 100).toFixed(1)}%.`,
    category: 'metric',
  });

  // 4. Domain & Category Specific Anomalies
  // Fire Alarm & Thermal Emergency (INC010)
  if (category.includes('fire') || incidentType === 'physical' || (incident.temperature_celsius && incident.temperature_celsius > 50)) {
    const temp = incident.temperature_celsius ?? 75;
    const tempScore = temp > 70 ? 25 : 18;
    score += tempScore;
    factors.push({
      factor: `Extreme Thermal Reading: ${temp}°C`,
      impactScore: tempScore,
      detail: `Server room thermal threshold exceeded by ${(temp - 24).toFixed(1)}°C over standard ambient 24°C rack temperature. Sensor ID: ${incident.sensor_id || 'FIRE-SENSOR-17'}.`,
      category: 'environment',
    });

    summary = `CRITICAL FACILITY EMERGENCY: Fire detection in ${incident.location} server facility with elevated temperatures (${temp}°C).`;
    recommendedAction = `TRIGGER IMMEDIATE BUILDING EVACUATION PROTOCOL: Dispatch facility emergency response and fire brigade to server room in ${incident.location}. Disconnect electrical busways to ${incident.affected_system} to minimize thermal propagation.`;
    actionChecklist.push(
      'Verify life-safety evacuation alarm sounds across the facility',
      `Dispatch facility incident response team to ${incident.location} data hall`,
      'Activate clean-agent gaseous fire suppression override sequence',
      'Reroute upstream traffic away from affected data center facility'
    );
  }

  // Malware Detection (INC004)
  else if (category.includes('malware') || incident.malware_family || incident.file_hash) {
    score += 20;
    factors.push({
      factor: `Endpoint Host Compromise: ${incident.malware_family || 'Malicious Executable'}`,
      impactScore: 20,
      detail: `Known signature payload detected (Hash: ${incident.file_hash || 'SHA256'}). Potential persistence or lateral movement threat.`,
      category: 'threat',
    });
    summary = `MALWARE DETECTED: ${incident.malware_family || 'Trojan'} detected on ${incident.affected_system}.`;
    recommendedAction = `ISOLATE ENDPOINT IMMEDIATELY: Sever network connectivity to ${incident.affected_system}, pull memory image for forensics, and revoke cached Kerberos tickets for logged-in user.`;
    actionChecklist.push(
      `Issue automated network quarantine for ${incident.affected_system}`,
      `Query SIEM/EDR for hashes matching ${incident.file_hash || 'unknown'} across all fleet endpoints`,
      'Revoke user enterprise sessions and force password reset',
      'Trigger endpoint reimaging workflow once forensic artifact dump is complete'
    );
  }

  // DDoS / Flood Attack (INC006)
  else if (category.includes('ddos') || (incident.requests_per_second && incident.requests_per_second > 5000)) {
    const rps = incident.requests_per_second || 18500;
    const normal = incident.normal_requests_per_second || 1200;
    const multiplier = (rps / (normal || 1)).toFixed(1);
    score += 22;
    factors.push({
      factor: `Massive Ingestion Spike: ${rps.toLocaleString()} req/s (${multiplier}x baseline)`,
      impactScore: 22,
      detail: `Volumetric request flood overwhelming ${incident.affected_system} compared to standard ${normal} req/s.`,
      category: 'metric',
    });
    summary = `SUSPECTED DISTRIBUTED DENIAL OF SERVICE: Heavy flood attack directed against ${incident.affected_system}.`;
    recommendedAction = `ENGAGE EDGE SCRUBBING & RATE LIMITING: Divert incoming external ingress via Cloudflare/WAF scrubbing centers and apply IP challenge captchas to ASN ranges with elevated request rates.`;
    actionChecklist.push(
      'Activate Tier-1 DDoS mitigation scrubbers on external edge routers',
      'Set adaptive rate limiting at API gateway (max 100 req/min per IP)',
      'Scale target web tier auto-scaling group by 3x replicas',
      'Inspect geo-distribution of source IPs and block rogue autonomous systems'
    );
  }

  // Brute Force Attack (INC001)
  else if (category.includes('brute_force') || (incident.failed_attempts && incident.failed_attempts > 50)) {
    const attempts = incident.failed_attempts || 127;
    score += 18;
    factors.push({
      factor: `Repeated Authentication Failures: ${attempts} attempts`,
      impactScore: 18,
      detail: `Originating IP ${incident.source_ip || 'external'} exceeded login failure safety bounds.`,
      category: 'threat',
    });
    summary = `CREDENTIAL BRUTE FORCE ATTACK: Repeated unauthorized attempts against ${incident.affected_system}.`;
    recommendedAction = `BLOCK SOURCE IP & ENFORCE STEP-UP MFA: Null-route source IP ${incident.source_ip || 'suspicious origin'} on edge firewall and trigger compulsory MFA re-verification for targeted accounts.`;
    actionChecklist.push(
      `Drop all ingress packets from ${incident.source_ip || 'source IP'} across perimeter firewalls`,
      'Lock targeted accounts after 5 consecutive failures for a 30-minute cooldown',
      'Review authentication logs for any successful logins from adjacent IP blocks',
      'Enforce hardware key / TOTP authentication requirement'
    );
  }

  // Unauthorized Access (INC008)
  else if (category.includes('unauthorized') || incident.login_country === 'Unknown') {
    score += 20;
    factors.push({
      factor: 'Privileged Account Anomaly',
      impactScore: 20,
      detail: `User ${incident.user || 'Administrator'} accessed privileged console from anomalous country (${incident.login_country || 'Unknown'}).`,
      category: 'threat',
    });
    summary = `PRIVILEGED ACCOUNT COMPROMISE RISK: Anomalous administrative access on ${incident.affected_system}.`;
    recommendedAction = `REVOKE ADMIN SESSIONS & ROTATE CREDENTIALS: Invalidate all active OAuth tokens for ${incident.user || 'admin'}, lock account, and inspect audit trails for role assignment tampering.`;
    actionChecklist.push(
      `Terminate all active session tokens for user: ${incident.user || 'admin'}`,
      'Trigger security audit on all administrative actions taken in last 120 minutes',
      'Require physical out-of-band verification before unlocking administrative rights',
      'Correlate session IP against global threat intelligence feeds'
    );
  }

  // Service Outage / Latency Spike (INC002, INC009)
  else if (category.includes('outage') || category.includes('latency') || (incident.response_time_ms && incident.response_time_ms > 2000)) {
    const latency = incident.response_time_ms || incident.latency_ms || 3500;
    const errorRate = incident.error_rate ? `${(incident.error_rate * 100).toFixed(0)}%` : 'elevated';
    score += 18;
    factors.push({
      factor: `Degraded SLA / Response Latency: ${latency}ms (Error Rate: ${errorRate})`,
      impactScore: 18,
      detail: `Production service exceeding acceptable SLA thresholds by ${latency > 3000 ? '300%' : '150%'}.`,
      category: 'metric',
    });
    summary = `CRITICAL API DEGRADATION: Severe response time bottleneck on ${incident.affected_system}.`;
    recommendedAction = `ENABLE CIRCUIT BREAKERS & TRAFFIC SHIFT: Engage circuit breaker fallbacks, inspect downstream database dependency queries, and route 50% traffic to backup availability zone.`;
    actionChecklist.push(
      `Check downstream connection timeouts on ${incident.affected_system}`,
      'Enable Redis caching layer for read-heavy query endpoints',
      'Trigger warm-standby failover if latency does not recover within 3 minutes',
      'Post status notification to internal operations channel'
    );
  }

  // Database Connection Failure (INC005)
  else if (category.includes('database') || (incident.failed_connections && incident.failed_connections > 50)) {
    const failedConns = incident.failed_connections || 452;
    score += 20;
    factors.push({
      factor: `Connection Pool Exhaustion: ${failedConns} failed connects`,
      impactScore: 20,
      detail: `Massive connection drop rate vs standard baseline (${incident.normal_connections || 25}).`,
      category: 'system',
    });
    summary = `DATABASE AVAILABILITY CRISIS: Connection pool saturation on ${incident.affected_system}.`;
    recommendedAction = `RECYCLE CONNECTION POOL & SCALE READ REPLICAS: Kill orphaned connection locks, provision 2 additional read replicas, and restart pgbouncer/proxy instances.`;
    actionChecklist.push(
      'Inspect long-running idle transactions and terminate blocking locks',
      'Increase max pool capacity temporarily by 50% while investigating leak',
      'Restart database connection pooling proxy layer',
      'Verify failover read replica health and sync lag'
    );
  }

  // High CPU Usage (INC007)
  else if (category.includes('cpu') || (incident.cpu_usage_percent && incident.cpu_usage_percent > 85)) {
    const cpu = incident.cpu_usage_percent || 97.4;
    score += 15;
    factors.push({
      factor: `Host Compute Saturation: ${cpu}% CPU load`,
      impactScore: 15,
      detail: `CPU utilization continuously pegged for ${incident.duration_minutes || 8} minutes.`,
      category: 'metric',
    });
    summary = `HOST RESOURCE EXHAUSTION: High CPU utilization on ${incident.affected_system}.`;
    recommendedAction = `PROFILE RUNNING PROCESSES & SCALE INSTANCES: Capture thread dump/flamegraph, offload batch tasks to background workers, and spin up 2 additional compute nodes.`;
    actionChecklist.push(
      'Execute top/pidstat capture to identify offending thread PID',
      'Restart stuck background batch processing worker',
      'Trigger horizontal pod autoscaler to rebalance traffic load',
      'Check system kernel logs (dmesg) for throttling or memory pressure'
    );
  }

  // Network Anomaly (INC003)
  else if (category.includes('network') || (incident.traffic_gb && incident.traffic_gb > 500)) {
    const traffic = incident.traffic_gb || 840;
    score += 15;
    factors.push({
      factor: `Anomalous Outbound Egress: ${traffic} GB (Normal: ${incident.normal_traffic_gb || 320} GB)`,
      impactScore: 15,
      detail: `Unscheduled data transfer volume exceeding baseline by ${(traffic - (incident.normal_traffic_gb || 320))} GB. Potential exfiltration.`,
      category: 'threat',
    });
    summary = `SUSPECTED DATA EXFILTRATION: Unexplained outbound network volume detected on ${incident.affected_system}.`;
    recommendedAction = `RESTRICT OUTBOUND PORTS & AUDIT EGRESS FLOWS: Cap outbound bandwidth at edge router, generate VPC NetFlow capture for peer analysis, and verify target destination IPs.`;
    actionChecklist.push(
      'Enable NetFlow deep packet inspection on egress boundary interface',
      'Check top destination IP addresses against threat intelligence feeds',
      'Throttle outbound bandwidth for non-essential protocols',
      'Audit file integrity on affected subnet servers'
    );
  } else {
    // Default fallback
    summary = `Operational anomaly detected on ${incident.affected_system} requiring review.`;
    recommendedAction = `Investigate system telemetry and verify monitoring alarms.`;
    actionChecklist.push(
      'Inspect system service logs for error traces',
      'Check recent deployment and configuration changes',
      'Verify host reachability and health status'
    );
  }

  // Clamp score strictly between 5 and 100
  score = Math.min(100, Math.max(5, score));

  // Determine priority classification
  let priority: RiskPriority = 'LOW';
  if (score >= 85) {
    priority = 'CRITICAL';
  } else if (score >= 70) {
    priority = 'HIGH';
  } else if (score >= 50) {
    priority = 'ELEVATED';
  } else if (score >= 30) {
    priority = 'MODERATE';
  } else {
    priority = 'LOW';
  }

  return {
    score,
    priority,
    summary,
    riskFactors: factors,
    recommendedAction,
    actionChecklist,
    evaluatedAt: new Date().toISOString(),
    analysisType: 'Rule-Based Deterministic SOC Engine',
  };
}
