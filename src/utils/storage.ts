import defaultIncidents from '../data/incidents.json';
import { Incident, NotificationItem } from '../types/incident';

const INCIDENTS_STORAGE_KEY = 'incident_command_center_incidents_v1';
const NOTIFICATIONS_STORAGE_KEY = 'incident_command_center_notifications_v1';

export function getInitialIncidents(): Incident[] {
  try {
    const raw = localStorage.getItem(INCIDENTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to read incidents from localStorage:', err);
  }

  // Fallback to initial 10 incidents from json
  return defaultIncidents as Incident[];
}

export function persistIncidents(incidents: Incident[]): boolean {
  try {
    localStorage.setItem(INCIDENTS_STORAGE_KEY, JSON.stringify(incidents));
    return true;
  } catch (err) {
    console.error('Failed to save incidents to localStorage:', err);
    return false;
  }
}

export function resetToDefaults(): Incident[] {
  try {
    localStorage.removeItem(INCIDENTS_STORAGE_KEY);
  } catch (err) {
    console.warn('Could not clear incidents key:', err);
  }
  const defaults = JSON.parse(JSON.stringify(defaultIncidents)) as Incident[];
  persistIncidents(defaults);
  return defaults;
}

export function getInitialNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to read notifications from localStorage:', err);
  }

  // Generate initial notifications from the initial dataset
  return [
    {
      id: 'notif-1',
      title: 'CRITICAL ALERT: Fire Alarm Triggered',
      message: 'Server room FIRE-SENSOR-17 at 78.5°C in Bengaluru data center.',
      timestamp: '2026-09-24T09:51:22Z',
      type: 'critical',
      incidentId: 'INC010',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'CRITICAL ALERT: Suspected DDoS Attack',
      message: '18,500 req/s flooding Delhi web server cluster.',
      timestamp: '2026-09-24T09:25:10Z',
      type: 'critical',
      incidentId: 'INC006',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'CRITICAL ALERT: Trojan Payload Contained',
      message: 'Malicious executable contained on employee_laptop_23 in Chennai.',
      timestamp: '2026-09-24T09:12:44Z',
      type: 'critical',
      incidentId: 'INC004',
      read: true,
    },
    {
      id: 'notif-4',
      title: 'High Severity: Database Connection Storm',
      message: '452 connection failures on Pune customer database.',
      timestamp: '2026-09-24T09:18:21Z',
      type: 'warning',
      incidentId: 'INC005',
      read: true,
    }
  ];
}

export function persistNotifications(notifications: NotificationItem[]): boolean {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    return true;
  } catch (err) {
    console.error('Failed to save notifications to localStorage:', err);
    return false;
  }
}
