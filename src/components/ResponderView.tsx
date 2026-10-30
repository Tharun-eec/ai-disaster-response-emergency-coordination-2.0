import React, { useState } from 'react';
import { Incident, Responder, ChatMessage } from '../types';
import {
  Shield,
  Navigation,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  MapPin,
  Send,
  Radio,
  Truck,
  ArrowRight,
  LifeBuoy
} from 'lucide-react';

interface ResponderViewProps {
  incidents: Incident[];
  responders: Responder[];
  chatMessages: ChatMessage[];
  onUpdateIncidentStatus: (id: string, status: Incident['status']) => void;
  onAssignResponder: (incidentId: string, responderId: string, claimedBy?: string) => Promise<{ success: boolean; message?: string }>;
  onSendMessage: (text: string, channel: ChatMessage['channel'], incidentId?: string, isPreset?: boolean, name?: string) => void;
  isLoggedIn?: boolean;
  loggedInUser?: string | null;
  onOpenLoginModal?: (prompt?: string) => void;
}

export const ResponderView: React.FC<ResponderViewProps> = ({
  incidents,
  responders,
  chatMessages,
  onUpdateIncidentStatus,
  onAssignResponder,
  onSendMessage,
  isLoggedIn = false,
  loggedInUser = null,
  onOpenLoginModal
}) => {
  // Current logged in responder profile selection
  const [selectedResponderId, setSelectedResponderId] = useState<string>(
    responders[0]?.id || 'RESP-01'
  );
  const [chatText, setChatText] = useState('');
  const [activeIncidentChat, setActiveIncidentChat] = useState<string | null>(null);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);
  const [pendingClaimIncidentId, setPendingClaimIncidentId] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState<string | null>(null);

  const currentResponder = responders.find((r) => r.id === selectedResponderId) || responders[0];

  // Incidents assigned to this responder
  const assignedIncidents = incidents.filter(
    (i) => i.assignedResponderId === currentResponder?.id
  );

  // Unassigned urgent incidents nearby
  const unassignedIncidents = incidents.filter(
    (i) => !i.assignedResponderId && i.status !== 'RESOLVED'
  );

  const handleSendComm = (presetText?: string) => {
    const txt = presetText || chatText;
    if (!txt) return;
    onSendMessage(
      txt,
      'responder-control',
      activeIncidentChat || assignedIncidents[0]?.id,
      Boolean(presetText),
      currentResponder?.name || 'Rescue Unit'
    );
    setChatText('');
  };

  const handleClaimDispatch = async (incident: Incident) => {
    setDispatchError(null);
    setDispatchSuccess(null);

    // Gated by Demo Login
    if (!isLoggedIn) {
      setPendingClaimIncidentId(incident.id);
      return;
    }

    if (!currentResponder) {
      setDispatchError('No active rescue unit selected.');
      return;
    }

    // Check if unit is available
    if (currentResponder.status !== 'AVAILABLE' && currentResponder.currentIncidentId !== incident.id) {
      setDispatchError(
        `Selected unit "${currentResponder.name}" is currently ${currentResponder.status}. Please switch to an available unit (e.g. EMS Trauma or Mountain Rescue Alpha) or wait for current mission completion.`
      );
      return;
    }

    // Check if already claimed
    if (incident.assignedResponderId) {
      setDispatchError(
        `This incident has already been assigned to ${incident.assignedResponderName || incident.assignedResponderId}.`
      );
      return;
    }

    setIsClaiming(incident.id);
    try {
      const result = await onAssignResponder(
        incident.id,
        currentResponder.id,
        loggedInUser || 'Demo Responder'
      );

      if (result.success) {
        setDispatchSuccess(
          `Successfully claimed and dispatched ${currentResponder.name} to ${incident.id} (${incident.title})!`
        );
        setTimeout(() => setDispatchSuccess(null), 5000);
      } else {
        setDispatchError(result.message || 'Failed to dispatch unit to this emergency.');
      }
    } catch (err: any) {
      setDispatchError(err?.message || 'Unexpected network error during dispatch.');
    } finally {
      setIsClaiming(null);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header & Unit Selector */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Emergency Field Operations Terminal</h2>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                TACTICAL LINK ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Rapid incident response, GPS navigation corridor, and multi-agency coordination.
            </p>
          </div>
        </div>

        {/* Responder Identity Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Active Unit:</span>
          <select
            value={selectedResponderId}
            onChange={(e) => setSelectedResponderId(e.target.value)}
            className="p-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-indigo-300 font-semibold focus:outline-none"
          >
            {responders.map((resp) => (
              <option key={resp.id} value={resp.id}>
                {resp.name} ({resp.agency} - {resp.vehicle})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Unit Status Overview Bar */}
      {currentResponder && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-xs text-slate-400">Unit Status</div>
            <div className="text-base font-bold text-slate-100 flex items-center gap-1.5 mt-1">
              <span className={`w-2.5 h-2.5 rounded-full ${currentResponder.status === 'AVAILABLE' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
              {currentResponder.status}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-xs text-slate-400">Vehicle / Craft</div>
            <div className="text-base font-bold text-slate-100 flex items-center gap-1.5 mt-1">
              <Truck className="w-4 h-4 text-slate-400" />
              {currentResponder.vehicle}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-xs text-slate-400">Assigned Missions</div>
            <div className="text-base font-bold text-indigo-400 mt-1">
              {assignedIncidents.length} Active Target{assignedIncidents.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-xs text-slate-400">Completed Rescues</div>
            <div className="text-base font-bold text-emerald-400 mt-1">
              {currentResponder.completedRescues} Lives Secured
            </div>
          </div>
        </div>
      )}

      {/* Assigned Incidents Section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-indigo-400" />
          My Assigned Incident Targets ({assignedIncidents.length})
        </h3>

        {assignedIncidents.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-dashed border-slate-800 text-center space-y-2">
            <Shield className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-slate-300 font-semibold text-sm">No active incidents currently assigned to this unit.</div>
            <div className="text-xs text-slate-500">Stand by for dispatch orders from Command Center, or claim an unassigned incident below.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {assignedIncidents.map((inc) => (
              <div
                key={inc.id}
                className="p-5 rounded-2xl bg-slate-900 border-2 border-indigo-500/40 shadow-xl space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                        {inc.id}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${inc.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-amber-500 text-slate-950'}`}>
                        {inc.severity}
                      </span>
                      <span className="text-xs text-slate-300 capitalize bg-slate-800 px-2 py-0.5 rounded">
                        {inc.type.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white mt-1.5">{inc.title}</h4>
                    <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      {inc.location.address} ({inc.location.area})
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Reported Civilian:</span>
                    <span className="text-xs font-bold text-slate-200">{inc.reportedBy.name}</span>
                    <span className="text-xs text-indigo-400 block">{inc.reportedBy.phone}</span>
                    {inc.claimedBy && (
                      <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Claimed by: {inc.claimedBy}
                      </span>
                    )}
                  </div>
                </div>

                {/* Casualties and AI instructions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="text-slate-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> Trapped / Casualties:
                    </div>
                    <div className="font-bold text-slate-200">
                      Trapped: <span className="text-red-400">{inc.trappedCount}</span> | Injured: <span className="text-amber-400">{inc.injuredCount}</span> | Total: {inc.affectedCount}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 md:col-span-2 space-y-1">
                    <div className="text-slate-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Tactical Directive:
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {inc.aiClassification?.suggestedResponse || inc.description}
                    </p>
                  </div>
                </div>

                {/* Rescue Status Advance Flow */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-xs font-semibold text-slate-300 block mb-2">
                    Update Rescue Mission Progress:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { status: 'RESPONDER_ASSIGNED', label: '1. Mission Accepted' },
                      { status: 'RESCUE_IN_PROGRESS', label: '2. En Route / On Scene' },
                      { status: 'RESCUED', label: '3. Civilians Rescued' },
                      { status: 'RESOLVED', label: '4. Mission Completed' }
                    ].map((step) => (
                      <button
                        key={step.status}
                        onClick={() => onUpdateIncidentStatus(inc.id, step.status as Incident['status'])}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          inc.status === step.status
                            ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {step.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Presets to Control Room & Citizen */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-slate-400">
                    Tactical Radio Presets (Broadcast to Command Center):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'On-scene. Establishing triage perimeter.',
                      'Water depth 5 feet. Zodiac boat deployed.',
                      'All casualties safely evacuated to transport.',
                      'Need medical ambulance backup immediately.',
                      'Road obstructed by downed power lines.'
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendComm(`[${inc.id}] ${preset}`)}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition-colors"
                      >
                        📡 {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Global Dispatch Notification Banners */}
      {dispatchSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{dispatchSuccess}</span>
          </div>
          <button
            onClick={() => setDispatchSuccess(null)}
            className="text-emerald-400 hover:text-emerald-200"
          >
            ✕
          </button>
        </div>
      )}

      {dispatchError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{dispatchError}</span>
          </div>
          <button
            onClick={() => setDispatchError(null)}
            className="text-rose-400 hover:text-rose-200 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Pending Login Required Prompt for Claim & Dispatch */}
      {pendingClaimIncidentId && !isLoggedIn && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 shadow-xl flex flex-wrap items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-200">
                Authentication Required to Claim & Dispatch
              </h4>
              <p className="text-xs text-amber-300/80 mt-0.5">
                Please log in to claim and dispatch emergency incidents.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPendingClaimIncidentId(null)}
              className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 bg-slate-800"
            >
              Dismiss
            </button>
            <button
              id="btn-login-to-claim"
              onClick={() => {
                if (onOpenLoginModal) {
                  onOpenLoginModal('Please log in to claim and dispatch emergency incidents.');
                }
              }}
              className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 shadow-md shadow-amber-950 transition-all flex items-center gap-1.5"
            >
              Login Now
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Unassigned Emergencies - Claim / Self-Dispatch */}
      {unassignedIncidents.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-amber-400" />
              Unassigned Emergencies Requiring Field Units ({unassignedIncidents.length})
            </h3>
            <div className="text-xs text-slate-400">
              Active Unit: <span className="font-semibold text-indigo-300">{currentResponder?.name}</span> ({currentResponder?.status})
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {unassignedIncidents.map((inc) => {
              const isSelectedUnitAvailable = currentResponder?.status === 'AVAILABLE';
              const isThisClaiming = isClaiming === inc.id;

              return (
                <div key={inc.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-rose-400 font-bold">{inc.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">
                      {inc.severity}
                    </span>
                  </div>
                  <div className="font-bold text-slate-100">{inc.title}</div>
                  <div className="text-slate-400 text-[11px] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    {inc.location.address}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Trapped: <span className="text-red-400 font-semibold">{inc.trappedCount}</span> | Injured: <span className="text-amber-400 font-semibold">{inc.injuredCount}</span>
                  </div>

                  <button
                    id={`btn-claim-dispatch-${inc.id}`}
                    disabled={isThisClaiming}
                    onClick={() => handleClaimDispatch(inc)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs mt-2 transition-all flex items-center justify-center gap-1.5 shadow-md ${
                      !isSelectedUnitAvailable && isLoggedIn
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                        : 'bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white shadow-indigo-950 active:scale-98'
                    }`}
                    title={
                      !isLoggedIn
                        ? 'Login required to claim this incident'
                        : !isSelectedUnitAvailable
                        ? `Unit ${currentResponder?.name} is currently ${currentResponder?.status}. Click to view status notice or switch units.`
                        : `Claim and dispatch ${currentResponder?.name}`
                    }
                  >
                    <LifeBuoy className={`w-3.5 h-3.5 ${isThisClaiming ? 'animate-spin' : ''}`} />
                    <span>
                      {isThisClaiming
                        ? 'Dispatching Unit...'
                        : !isSelectedUnitAvailable && isLoggedIn
                        ? `Claim & Dispatch Unit (${currentResponder?.status})`
                        : 'Claim & Dispatch Unit'}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
