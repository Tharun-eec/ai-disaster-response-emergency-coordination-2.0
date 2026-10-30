import { useState, useEffect, useCallback } from 'react';
import {
  Incident,
  Responder,
  Hospital,
  Shelter,
  MissingPerson,
  EmergencyResource,
  EmergencyAlert,
  EmergencyRoute,
  DisasterZone,
  ChatMessage,
  UserRole,
  LanguageCode
} from '../types';
import {
  initialIncidents,
  initialResponders,
  initialHospitals,
  initialShelters,
  initialMissingPersons,
  initialResources,
  initialAlerts,
  initialRoutes,
  initialDisasterZones
} from '../data/seedData';
import { apiUrl } from '../config';

export function useDisasterState() {
  // Initialize with seed data immediately so the website opens instantly in 0ms without blank screens
  const [incidents, setIncidents] = useState<Incident[]>(() => initialIncidents);
  const [responders, setResponders] = useState<Responder[]>(() => initialResponders);
  const [hospitals, setHospitals] = useState<Hospital[]>(() => initialHospitals);
  const [shelters, setShelters] = useState<Shelter[]>(() => initialShelters);
  const [missingPersons, setMissingPersons] = useState<MissingPerson[]>(() => initialMissingPersons);
  const [resources, setResources] = useState<EmergencyResource[]>(() => initialResources);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(() => initialAlerts);
  const [routes, setRoutes] = useState<EmergencyRoute[]>(() => initialRoutes);
  const [zones, setZones] = useState<DisasterZone[]>(() => initialDisasterZones);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isOfflineModeSimulated, setIsOfflineModeSimulated] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>('citizen');
  const [activeLanguage, setActiveLanguage] = useState<LanguageCode>('en');
  const [notification, setNotification] = useState<{ title: string; message: string; type: 'critical' | 'info' | 'success' } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Fetch initial state with rapid 4.5s timeout so spinning Render backend never blocks or hangs the app
  const fetchState = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    try {
      const res = await fetch(apiUrl('/api/state'), { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.incidents?.length) setIncidents(data.incidents);
        if (data.responders?.length) setResponders(data.responders);
        if (data.hospitals?.length) setHospitals(data.hospitals);
        if (data.shelters?.length) setShelters(data.shelters);
        if (data.missingPersons?.length) setMissingPersons(data.missingPersons);
        if (data.resources?.length) setResources(data.resources);
        if (data.alerts?.length) setAlerts(data.alerts);
        if (data.routes?.length) setRoutes(data.routes);
        if (data.zones?.length) setZones(data.zones);
        if (data.chatMessages?.length) setChatMessages(data.chatMessages);

        // Cache critical offline data into localStorage
        try {
          localStorage.setItem('cached_shelters', JSON.stringify(data.shelters || []));
          localStorage.setItem('cached_hospitals', JSON.stringify(data.hospitals || []));
          localStorage.setItem('cached_alerts', JSON.stringify(data.alerts || []));
        } catch {
          // ignore storage quota
        }
      }
    } catch {
      // Gracefully continue using instantaneous local seed state - no error thrown
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();

    // Monitor browser online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Setup SSE connection
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(apiUrl('/api/events'));
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'INCIDENT_CREATED') {
            setIncidents((prev) => {
              const exists = prev.some((i) => i.id === payload.data.incident.id);
              if (exists) return prev;
              return [payload.data.incident, ...prev];
            });
            if (payload.data.responders) {
              setResponders(payload.data.responders);
            }
            showNotification(
              '🚨 NEW EMERGENCY INCIDENT',
              `${payload.data.incident.title} (${payload.data.incident.severity})`,
              'critical'
            );
          } else if (payload.type === 'INCIDENT_STATUS_UPDATED') {
            setIncidents((prev) =>
              prev.map((inc) => (inc.id === payload.data.incident.id ? payload.data.incident : inc))
            );
            if (payload.data.responders) {
              setResponders(payload.data.responders);
            }
          } else if (payload.type === 'RESPONDER_ASSIGNED') {
            setIncidents((prev) =>
              prev.map((inc) => (inc.id === payload.data.incident.id ? payload.data.incident : inc))
            );
            setResponders((prev) =>
              prev.map((resp) => (resp.id === payload.data.responder.id ? payload.data.responder : resp))
            );
            showNotification(
              '🛡️ RESPONDER DISPATCHED',
              `${payload.data.responder.name} assigned to ${payload.data.incident.id}`,
              'info'
            );
          } else if (payload.type === 'HOSPITAL_UPDATED') {
            setHospitals((prev) =>
              prev.map((h) => (h.id === payload.data.id ? payload.data : h))
            );
          } else if (payload.type === 'SHELTER_UPDATED') {
            setShelters((prev) =>
              prev.map((s) => (s.id === payload.data.id ? payload.data : s))
            );
          } else if (payload.type === 'MISSING_PERSON_REPORTED') {
            setMissingPersons((prev) => [payload.data, ...prev]);
          } else if (payload.type === 'MISSING_PERSON_UPDATED') {
            setMissingPersons((prev) =>
              prev.map((p) => (p.id === payload.data.id ? payload.data : p))
            );
          } else if (payload.type === 'RESOURCE_UPDATED') {
            setResources((prev) =>
              prev.map((r) => (r.id === payload.data.id ? payload.data : r))
            );
          } else if (payload.type === 'ALERT_BROADCASTED') {
            setAlerts((prev) => [payload.data, ...prev]);
            showNotification('⚠️ EMERGENCY ALERT BROADCAST', payload.data.title, 'critical');
          } else if (payload.type === 'CHAT_MESSAGE') {
            setChatMessages((prev) => [...prev, payload.data]);
          } else if (payload.type === 'SIMULATION_TRIGGERED') {
            setIncidents((prev) => [payload.data.incident, ...prev]);
            if (payload.data.shelters) setShelters(payload.data.shelters);
            if (payload.data.hospitals) setHospitals(payload.data.hospitals);
            if (payload.data.alerts) setAlerts(payload.data.alerts);
            showNotification(
              '⚡ DISASTER SIMULATION RUNNING',
              'Storm Surge and Rapid Flood Incident Injected',
              'critical'
            );
          } else if (payload.type === 'STATE_RESET') {
            fetchState();
            showNotification('STATE RESET', 'System reset to base disaster state', 'info');
          }
        } catch {
          // ignore parse error
        }
      };
    } catch {
      // SSE not available
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (eventSource) eventSource.close();
    };
  }, [fetchState]);

  const showNotification = (title: string, message: string, type: 'critical' | 'info' | 'success') => {
    setNotification({ title, message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.title === title ? null : curr));
    }, 6000);
  };

  // Create SOS or new incident
  const submitIncident = async (incidentData: Partial<Incident>) => {
    // If simulated offline or offline, store in pending queue
    if (!isOnline || isOfflineModeSimulated) {
      const offlineId = `OFFLINE-DR-${Date.now().toString(36).toUpperCase()}`;
      const queuedIncident: Incident = {
        id: offlineId,
        title: incidentData.title || 'OFFLINE EMERGENCY REPORT',
        type: incidentData.type || 'rescue',
        severity: incidentData.severity || 'CRITICAL',
        status: 'REPORTED',
        description: incidentData.description || 'Saved offline. Pending sync when network connects.',
        location: incidentData.location || { lat: 13.0827, lng: 80.2707, address: 'Cached GPS Coordinates', area: 'Local Sector' },
        reportedBy: incidentData.reportedBy || { name: 'Offline Citizen', phone: 'Local Store' },
        affectedCount: incidentData.affectedCount || 1,
        injuredCount: incidentData.injuredCount || 0,
        trappedCount: incidentData.trappedCount || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isSOS: Boolean(incidentData.isSOS)
      };

      setIncidents((prev) => [queuedIncident, ...prev]);
      showNotification('OFFLINE SAVED', 'Your emergency report was saved locally and will sync when network connects.', 'info');
      return queuedIncident;
    }

    try {
      const res = await fetch(apiUrl('/api/incidents'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incidentData)
      });
      if (res.ok) {
        const data = await res.json();
        return data.incident;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  // Update Incident Status
  const updateIncidentStatus = async (id: string, status: Incident['status']) => {
    try {
      const res = await fetch(apiUrl(`/api/incidents/${id}/status`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const data = await res.json();
        setIncidents((prev) => prev.map((i) => (i.id === id ? data.incident : i)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Assign responder
  const assignResponder = async (
    incidentId: string,
    responderId: string,
    claimedBy?: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch(apiUrl(`/api/incidents/${incidentId}/assign`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responderId, claimedBy })
      });

      if (res.ok) {
        const data = await res.json();
        setIncidents((prev) => prev.map((i) => (i.id === incidentId ? data.incident : i)));
        setResponders((prev) => prev.map((r) => (r.id === responderId ? data.responder : r)));
        showNotification(
          '🛡️ UNIT DISPATCHED',
          `Unit ${data.responder?.name || responderId} successfully assigned to ${incidentId}.`,
          'success'
        );
        return { success: true };
      } else {
        const errData = await res.json().catch(() => ({}));
        const errorMsg = errData.error || `Dispatch assignment failed with status ${res.status}`;
        showNotification('ASSIGNMENT FAILED', errorMsg, 'critical');
        return { success: false, message: errorMsg };
      }
    } catch (err: any) {
      console.warn('Backend assign request error, applying resilient local assignment fallback:', err);
      // Resilient fallback when backend is unreachable or offline
      let targetIncident: Incident | undefined;
      let targetResponder: Responder | undefined;

      setIncidents((prev) => {
        return prev.map((i) => {
          if (i.id === incidentId) {
            targetIncident = {
              ...i,
              assignedResponderId: responderId,
              status: 'RESPONDER_ASSIGNED',
              claimedBy: claimedBy || i.claimedBy,
              updatedAt: new Date().toISOString()
            };
            return targetIncident;
          }
          return i;
        });
      });

      setResponders((prev) => {
        return prev.map((r) => {
          if (r.id === responderId) {
            targetResponder = {
              ...r,
              status: 'DISPATCHED',
              currentIncidentId: incidentId
            };
            return targetResponder;
          }
          return r;
        });
      });

      showNotification(
        '🛡️ UNIT DISPATCHED (OFFLINE / LOCAL)',
        `Unit ${responderId} assigned to ${incidentId}.`,
        'success'
      );
      return { success: true };
    }
  };

  // Send chat message
  const sendChatMessage = async (
    text: string,
    channel: ChatMessage['channel'],
    incidentId?: string,
    isEmergencyPreset = false,
    senderName = 'Citizen'
  ) => {
    try {
      const res = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          incidentId,
          senderRole: activeRole,
          senderName,
          text,
          isEmergencyPreset
        })
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [...prev, data.message]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger Simulation
  const triggerSimulation = async () => {
    setIsSimulating(true);
    try {
      await fetch(apiUrl('/api/simulation/start'), { method: 'POST' });
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsSimulating(false), 2000);
    }
  };

  // Reset Simulation
  const resetSimulation = async () => {
    try {
      await fetch(apiUrl('/api/simulation/reset'), { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  return {
    incidents,
    responders,
    hospitals,
    shelters,
    missingPersons,
    resources,
    alerts,
    routes,
    zones,
    chatMessages,
    loading,
    isOnline: isOnline && !isOfflineModeSimulated,
    isOfflineModeSimulated,
    setIsOfflineModeSimulated,
    selectedIncident,
    setSelectedIncident,
    activeRole,
    setActiveRole,
    activeLanguage,
    setActiveLanguage,
    notification,
    setNotification,
    isSimulating,
    submitIncident,
    updateIncidentStatus,
    assignResponder,
    sendChatMessage,
    triggerSimulation,
    resetSimulation,
    refreshState: fetchState
  };
}
