/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Incident, IncidentStatus, NotificationItem } from './types/incident';
import { 
  getInitialIncidents, 
  persistIncidents, 
  resetToDefaults, 
  getInitialNotifications, 
  persistNotifications 
} from './utils/storage';
import { generateSimulatedIncident } from './utils/incidentSimulator';
import { Header } from './components/Header';
import { TelemetryBar } from './components/TelemetryBar';
import { MetricCards } from './components/MetricCards';
import { CriticalAlerts } from './components/CriticalAlerts';
import { IncidentCharts } from './components/IncidentCharts';
import { LocationsOverview } from './components/LocationsOverview';
import { IncidentTable } from './components/IncidentTable';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { ToastContainer } from './components/ToastContainer';

export default function App() {
  // 1. Incidents State & LocalStorage Persistence
  const [incidents, setIncidents] = useState<Incident[]>(() => getInitialIncidents());

  // 2. Selected Incident for Detail Modal
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // 3. Notifications & Toasts
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => getInitialNotifications());
  const [toasts, setToasts] = useState<NotificationItem[]>([]);

  // 4. Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // 5. Sorting State
  const [sortBy, setSortBy] = useState<'timestamp' | 'severity'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Synchronize state changes to localStorage
  useEffect(() => {
    persistIncidents(incidents);
  }, [incidents]);

  useEffect(() => {
    persistNotifications(notifications);
  }, [notifications]);

  // Keep selected incident synchronized if its data was updated in the list
  useEffect(() => {
    if (selectedIncident) {
      const updated = incidents.find((i) => i.incident_id === selectedIncident.incident_id);
      if (updated) {
        setSelectedIncident(updated);
      }
    }
  }, [incidents]);

  // Toast Helper
  const triggerToast = useCallback((toast: NotificationItem) => {
    setToasts((prev) => [...prev, toast]);
    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 6000);
  }, []);

  // Update Status Handler
  const handleUpdateStatus = useCallback((incidentId: string, newStatus: IncidentStatus, note?: string) => {
    const timestamp = new Date().toISOString();

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.incident_id === incidentId) {
          const updatedHistory = [
            ...(inc.status_history || []),
            {
              status: newStatus,
              timestamp,
              note: note || `Status transitioned to ${newStatus.toUpperCase()}`,
              user: 'SOC Operator',
            },
          ];

          return {
            ...inc,
            status: newStatus,
            status_history: updatedHistory,
          };
        }
        return inc;
      })
    );

    const toastItem: NotificationItem = {
      id: `toast-${Date.now()}`,
      title: `Status Updated: ${incidentId}`,
      message: `Incident status transitioned to ${newStatus.toUpperCase()}`,
      timestamp,
      type: newStatus === 'resolved' || newStatus === 'contained' ? 'success' : 'info',
      incidentId,
      read: true,
    };
    triggerToast(toastItem);
  }, [triggerToast]);

  // Add Note Handler
  const handleAddNote = useCallback((incidentId: string, noteText: string) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.incident_id === incidentId) {
          return {
            ...inc,
            investigation_notes: [...(inc.investigation_notes || []), noteText],
          };
        }
        return inc;
      })
    );
  }, []);

  // Simulate Incident Handler
  const handleSimulateIncident = useCallback(() => {
    const newInc = generateSimulatedIncident(incidents);
    const isCritical = (newInc.severity || '').toLowerCase() === 'critical';

    setIncidents((prev) => [newInc, ...prev]);

    // Create Notification Item
    const notifItem: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: isCritical
        ? `CRITICAL ALERT: ${newInc.incident_id} Generated`
        : `New Incident Ingested: ${newInc.incident_id}`,
      message: `${newInc.description} (${newInc.location})`,
      timestamp: newInc.timestamp,
      type: isCritical ? 'critical' : 'warning',
      incidentId: newInc.incident_id,
      read: false,
    };

    setNotifications((prev) => [notifItem, ...prev]);
    triggerToast(notifItem);
  }, [incidents, triggerToast]);

  // Reset Data Handler
  const handleResetData = useCallback(() => {
    const defaultData = resetToDefaults();
    setIncidents(defaultData);
    setSelectedIncident(null);
    setSearchQuery('');
    setSeverityFilter('all');
    setStatusFilter('all');
    setTypeFilter('all');
    setLocationFilter('all');
    setCategoryFilter('all');

    const resetToast: NotificationItem = {
      id: `toast-${Date.now()}`,
      title: 'Dataset Reinitialized',
      message: 'Restored initial 10 baseline SOC incidents.',
      timestamp: new Date().toISOString(),
      type: 'info',
      read: true,
    };
    triggerToast(resetToast);
  }, [triggerToast]);

  // Clear Filters Handler
  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSeverityFilter('all');
    setStatusFilter('all');
    setTypeFilter('all');
    setLocationFilter('all');
    setCategoryFilter('all');
  }, []);

  // Sort Toggle Handler
  const handleToggleSort = useCallback((field: 'timestamp' | 'severity') => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  }, [sortBy]);

  // Notification Handlers
  const handleMarkNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const handleClearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const handleDismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleSelectToastIncident = useCallback((incidentId: string) => {
    const found = incidents.find((i) => i.incident_id === incidentId);
    if (found) {
      setSelectedIncident(found);
    }
  }, [incidents]);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200">
      {/* Top Header */}
      <Header
        incidents={incidents}
        onSimulateIncident={handleSimulateIncident}
        onResetData={handleResetData}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onClearNotifications={handleClearNotifications}
        onSelectIncident={setSelectedIncident}
      />

      {/* SOC Telemetry Status Strip: 30 EPS & 5000 Servers */}
      <TelemetryBar incidents={incidents} />

      {/* Main Dashboard Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Metric Summary Cards */}
        <MetricCards
          incidents={incidents}
          activeSeverityFilter={severityFilter}
          activeStatusFilter={statusFilter}
          onFilterBySeverity={setSeverityFilter}
          onFilterByStatus={setStatusFilter}
        />

        {/* Prominent Critical Alerts Section */}
        <CriticalAlerts
          incidents={incidents}
          onSelectIncident={setSelectedIncident}
        />

        {/* Visual Analytics & Charts Section */}
        <IncidentCharts
          incidents={incidents}
          onSelectSeverity={setSeverityFilter}
          onSelectType={setTypeFilter}
          onSelectLocation={setLocationFilter}
        />

        {/* Locations Section with Clean Map Nodes */}
        <LocationsOverview
          incidents={incidents}
          activeLocationFilter={locationFilter}
          onSelectLocation={setLocationFilter}
        />

        {/* Complete Incident Data Table with Filtering & Sorting */}
        <section aria-label="Incident Table Section">
          <IncidentTable
            incidents={incidents}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            severityFilter={severityFilter}
            onSeverityFilterChange={setSeverityFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            locationFilter={locationFilter}
            onLocationFilterChange={setLocationFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onToggleSort={handleToggleSort}
            onClearFilters={handleClearFilters}
            onSelectIncident={setSelectedIncident}
          />
        </section>
      </main>

      {/* Incident Detail Modal / Inspector */}
      <IncidentDetailModal
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onUpdateStatus={handleUpdateStatus}
        onAddNote={handleAddNote}
      />

      {/* Toast Notification Container */}
      <ToastContainer
        toasts={toasts}
        onDismiss={handleDismissToast}
        onSelectToastIncident={handleSelectToastIncident}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-xs font-mono text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Incident Command Center · Deterministic SOC Operations</span>
          <span>Log Ingestion: 30 EPS · Fleet: 5,000 Servers Active</span>
        </div>
      </footer>
    </div>
  );
}
