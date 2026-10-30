import React, { useState } from 'react';
import {
  Incident,
  Responder,
  Hospital,
  Shelter,
  EmergencyResource,
  EmergencyAlert,
  SeverityLevel,
  DisasterType
} from '../types';
import { apiUrl } from '../config';
import {
  Activity,
  AlertTriangle,
  Shield,
  Hospital as HospitalIcon,
  Tent,
  Truck,
  Sparkles,
  Send,
  Users,
  CheckCircle2,
  Filter,
  Search,
  Layers,
  Radio,
  Clock,
  MapPin,
  TrendingUp,
  Flame,
  Waves
} from 'lucide-react';

interface AdminControlViewProps {
  incidents: Incident[];
  responders: Responder[];
  hospitals: Hospital[];
  shelters: Shelter[];
  resources: EmergencyResource[];
  alerts: EmergencyAlert[];
  onAssignResponder: (incidentId: string, responderId: string) => void;
  onUpdateStatus: (id: string, status: Incident['status']) => void;
  onSelectIncident: (inc: Incident) => void;
  isDemoAdmin?: boolean;
  onExitAdminDemo?: () => void;
}

export const AdminControlView: React.FC<AdminControlViewProps> = ({
  incidents,
  responders,
  hospitals,
  shelters,
  resources,
  alerts,
  onAssignResponder,
  onUpdateStatus,
  onSelectIncident,
  isDemoAdmin = true,
  onExitAdminDemo
}) => {
  // Filters
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Broadcast Alert Form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastArea, setBroadcastArea] = useState('Central & Coastal Districts');
  const [broadcastAction, setBroadcastAction] = useState('Evacuate immediately to designated relief shelters on higher ground.');
  const [broadcastSeverity, setBroadcastSeverity] = useState<SeverityLevel>('CRITICAL');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // AI Smart Dispatch Recommendation State
  const [smartDispatchLoading, setSmartDispatchLoading] = useState(false);
  const [smartRecommendations, setSmartRecommendations] = useState<Record<string, {
    responderId: string;
    responderName: string;
    etaMinutes: number;
    distanceKm: number;
    reasoning: string;
  }>>({});

  // Filtered Incidents
  const filteredIncidents = incidents.filter((inc) => {
    if (filterSeverity !== 'ALL' && inc.severity !== filterSeverity) return false;
    if (filterStatus !== 'ALL' && inc.status !== filterStatus) return false;
    if (filterType !== 'ALL' && inc.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        inc.id.toLowerCase().includes(q) ||
        inc.title.toLowerCase().includes(q) ||
        inc.location.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate High-Level Metrics
  const criticalCount = incidents.filter((i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length;
  const activeCount = incidents.filter((i) => i.status !== 'RESOLVED').length;
  const deployedResponders = responders.filter((r) => r.status !== 'AVAILABLE').length;
  const totalSheltered = shelters.reduce((acc, s) => acc + s.occupancy, 0);
  const totalAvailableBeds = hospitals.reduce((acc, h) => acc + h.availableBeds, 0);
  const totalAvailableICU = hospitals.reduce((acc, h) => acc + h.availableICU, 0);

  // Trigger Smart Dispatch Recommendation for unassigned incidents
  const handleGenerateSmartDispatch = async (incidentId: string) => {
    setSmartDispatchLoading(true);
    try {
      const res = await fetch(apiUrl('/api/ai/dispatch-recommendation'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId })
      });
      if (res.ok) {
        const data = await res.json();
        setSmartRecommendations((prev) => ({
          ...prev,
          [incidentId]: data.recommendation
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSmartDispatchLoading(false);
    }
  };

  // Broadcast Alert Form Submit
  const handleBroadcastAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle) return;

    setIsBroadcasting(true);
    try {
      await fetch(apiUrl('/api/alerts'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: broadcastTitle,
          area: broadcastArea,
          severity: broadcastSeverity,
          actionRequired: broadcastAction,
          issuedBy: 'State Disaster Management Operations Center'
        })
      });
      setBroadcastSuccess(true);
      setBroadcastTitle('');
      setTimeout(() => setBroadcastSuccess(false), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* DEMO ADMIN MODE HEADER INDICATOR (Requirement 3) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border-2 border-purple-500/40 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/30 border border-purple-400/50 text-purple-200 text-xs font-black tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                Demo Admin Mode
              </span>
              <span className="text-xs text-slate-300 font-bold">
                Unrestricted One-Click Demonstration Access
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 max-w-2xl">
              Academic demo access enabled. Full operational controls, live triage dispatch, AI recommendations, and alert broadcasting are active without password verification.
              <span className="text-amber-400/90 ml-1">
                (Unrestricted demo feature — not production identity verification).
              </span>
            </p>
          </div>
        </div>

        {onExitAdminDemo && (
          <button
            id="btn-exit-demo-admin"
            onClick={onExitAdminDemo}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors shadow-sm"
          >
            Exit Demo Admin Mode
          </button>
        )}
      </div>

      {/* 1. TOP LIVE KPI METRICS BAR (Section 5 & 10 Requirement) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Active Incidents */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Active Emergencies</span>
            <Activity className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-white">{activeCount}</div>
          <div className="text-[10px] text-slate-500">Live triage queue</div>
        </div>

        {/* Metric 2: Critical SOS */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-red-500/40 space-y-1">
          <div className="text-xs text-red-300 flex items-center justify-between">
            <span>Critical Severity</span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          </div>
          <div className="text-2xl font-black text-red-400">{criticalCount}</div>
          <div className="text-[10px] text-red-400/80">Immediate life threat</div>
        </div>

        {/* Metric 3: Responders Deployed */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Rescue Units Active</span>
            <Shield className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-400">
            {deployedResponders} / {responders.length}
          </div>
          <div className="text-[10px] text-slate-500">
            {responders.length - deployedResponders} available for dispatch
          </div>
        </div>

        {/* Metric 4: Total Sheltered */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Civilians in Shelters</span>
            <Tent className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{totalSheltered}</div>
          <div className="text-[10px] text-slate-500">Across {shelters.length} relief camps</div>
        </div>

        {/* Metric 5: Available Hospital Beds */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>General Beds Ready</span>
            <HospitalIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{totalAvailableBeds}</div>
          <div className="text-[10px] text-slate-500">In metropolitan network</div>
        </div>

        {/* Metric 6: Available ICU Ventilators */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>ICU Ventilators</span>
            <AlertTriangle className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400">{totalAvailableICU}</div>
          <div className="text-[10px] text-slate-500">Critical trauma reserve</div>
        </div>
      </div>

      {/* 2. SMART DISPATCH AI RECOMMENDATION SECTION (Section 8 Requirement) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/40 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                AI Smart Emergency Dispatch Recommendations
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  OPTIMAL ROUTING ENGINE
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Matches closest specialized task force, vehicle type, and available equipment to the emergency type.
              </p>
            </div>
          </div>
        </div>

        {/* Unassigned incidents list needing dispatch */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {incidents
            .filter((i) => !i.assignedResponderId && i.status !== 'RESOLVED')
            .slice(0, 4)
            .map((inc) => {
              const rec = smartRecommendations[inc.id];
              return (
                <div
                  key={inc.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-rose-400 font-bold">{inc.id}</span>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${inc.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-amber-500 text-slate-900'}`}>
                          {inc.severity}
                        </span>
                        <span className="text-slate-400 capitalize">{inc.type.replace('_', ' ')}</span>
                      </div>
                      <h4 className="font-bold text-slate-100 mt-1">{inc.title}</h4>
                      <p className="text-slate-400 text-[11px]">{inc.location.address}</p>
                    </div>
                  </div>

                  {/* AI Recommendation Card */}
                  {rec ? (
                    <div className="p-3 rounded-lg bg-indigo-950/60 border border-indigo-500/40 space-y-1 text-[11px]">
                      <div className="flex justify-between items-center text-indigo-300 font-bold">
                        <span>Recommended: {rec.responderName}</span>
                        <span className="text-emerald-400">ETA ~{rec.etaMinutes} mins ({rec.distanceKm} km)</span>
                      </div>
                      <p className="text-slate-300 text-[10px]">{rec.reasoning}</p>
                      <button
                        onClick={() => onAssignResponder(inc.id, rec.responderId)}
                        className="w-full mt-2 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/40"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Accept AI Dispatch Order
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleGenerateSmartDispatch(inc.id)}
                      disabled={smartDispatchLoading}
                      className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      {smartDispatchLoading ? 'Calculating Distance Matrix...' : 'Generate AI Dispatch Recommendation'}
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* 3. INCIDENT TRIAGE QUEUE & FILTER CONTROLS (Section 5 Requirement) */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold text-white">
              Incident Triage & Operations Queue ({filteredIncidents.length})
            </h3>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, area, keyword..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 text-[11px] font-semibold">Severity:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filterSeverity === sev
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}

          <span className="text-slate-500 text-[11px] font-semibold ml-2">Status:</span>
          {['ALL', 'REPORTED', 'VERIFIED', 'RESPONDER_ASSIGNED', 'RESCUE_IN_PROGRESS', 'RESCUED', 'RESOLVED'].map(
            (st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  filterStatus === st
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            )
          )}
        </div>

        {/* Incidents Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">ID / Time</th>
                <th className="py-2.5 px-3">Title & Area</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Affected</th>
                <th className="py-2.5 px-3">Assigned Unit</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredIncidents.map((inc) => (
                <tr
                  key={inc.id}
                  className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                  onClick={() => onSelectIncident(inc)}
                >
                  <td className="py-3 px-3 font-mono font-bold text-rose-400">
                    <div>{inc.id}</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      {new Date(inc.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-100">{inc.title}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {inc.location.address}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inc.severity === 'CRITICAL'
                          ? 'bg-red-600 text-white animate-pulse'
                          : inc.severity === 'HIGH'
                          ? 'bg-amber-500 text-slate-900'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {inc.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[11px]">
                    <div>Total: {inc.affectedCount}</div>
                    <div className="text-red-400 font-semibold">Trapped: {inc.trappedCount}</div>
                  </td>
                  <td className="py-3 px-3">
                    {inc.assignedResponderName ? (
                      <span className="font-semibold text-indigo-300">{inc.assignedResponderName}</span>
                    ) : (
                      <span className="text-rose-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 font-semibold">
                      {inc.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIncident(inc);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. EMERGENCY ALERT BROADCASTER & RESOURCE INVENTORY (Section 14 & 18) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Broadcast Emergency Alert */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
            <h3 className="text-base font-bold text-white">Broadcast Public Emergency Warning</h3>
          </div>

          <form onSubmit={handleBroadcastAlert} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Alert Headline / Title</label>
              <input
                type="text"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. SEVERE CYCLONIC STORM WARNING: Category 3 Storm Surge"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Target Disaster Zone</label>
                <input
                  type="text"
                  value={broadcastArea}
                  onChange={(e) => setBroadcastArea(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Alert Severity Level</label>
                <select
                  value={broadcastSeverity}
                  onChange={(e) => setBroadcastSeverity(e.target.value as SeverityLevel)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                >
                  <option value="CRITICAL">🔴 CRITICAL (Immediate Evacuation)</option>
                  <option value="HIGH">🟠 HIGH (Seek High Ground)</option>
                  <option value="MEDIUM">🟡 MEDIUM (Stand By for Updates)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Required Action Directive</label>
              <textarea
                rows={2}
                value={broadcastAction}
                onChange={(e) => setBroadcastAction(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {broadcastSuccess && (
                <span className="text-emerald-400 text-xs font-bold">
                  ✓ Broadcast sent to all citizen and responder terminals!
                </span>
              )}
              <button
                type="submit"
                disabled={isBroadcasting}
                className="ml-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-red-600/40"
              >
                <Send className="w-4 h-4" />
                {isBroadcasting ? 'Broadcasting Alert...' : 'Transmit Emergency Warning'}
              </button>
            </div>
          </form>
        </div>

        {/* Emergency Resources & Stock Levels */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Regional Emergency Logistics Reserves</h3>
            </div>
            <span className="text-xs text-slate-400">Real-time Stock Monitor</span>
          </div>

          <div className="space-y-3 text-xs">
            {resources.map((res) => {
              const available = res.available ?? res.quantity;
              const total = res.total ?? Math.max(res.quantity, res.minThreshold * 2);
              const pct = total > 0 ? Math.round((available / total) * 100) : 100;
              const isLow = pct < 30 || res.status === 'Critical' || res.status === 'Low';
              return (
                <div key={res.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200">{res.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded ${isLow ? 'bg-red-600 text-white' : 'text-slate-400'}`}>
                      {available} / {total} {res.unit}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${isLow ? 'bg-red-500' : 'bg-indigo-500'}`}
                      style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
