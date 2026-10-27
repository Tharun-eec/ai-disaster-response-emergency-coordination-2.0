import React, { useState } from 'react';
import {
  Incident,
  Responder,
  Hospital,
  Shelter,
  EmergencyRoute,
  DisasterZone,
  UserRole
} from '../types';
import {
  AlertTriangle,
  Flame,
  Waves,
  Shield,
  Hospital as HospitalIcon,
  Tent,
  Navigation,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Clock,
  Users,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface DisasterMapProps {
  incidents: Incident[];
  responders: Responder[];
  hospitals: Hospital[];
  shelters: Shelter[];
  routes: EmergencyRoute[];
  zones: DisasterZone[];
  selectedIncident: Incident | null;
  onSelectIncident: (inc: Incident | null) => void;
  onAssignResponder?: (incidentId: string, responderId: string) => void;
  onUpdateStatus?: (id: string, status: Incident['status']) => void;
  activeRole: UserRole;
}

export const DisasterMap: React.FC<DisasterMapProps> = ({
  incidents,
  responders,
  hospitals,
  shelters,
  routes,
  zones,
  selectedIncident,
  onSelectIncident,
  onAssignResponder,
  onUpdateStatus,
  activeRole
}) => {
  // Layer toggles
  const [showIncidents, setShowIncidents] = useState(true);
  const [showResponders, setShowResponders] = useState(true);
  const [showMedical, setShowMedical] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'dispatch' | 'evidence'>('details');

  // Map coordinate conversion helper
  // Bounds around Chennai metropolitan area: Lat: 12.98 to 13.17, Lng: 80.12 to 80.30
  const latMin = 12.98;
  const latMax = 13.17;
  const lngMin = 80.11;
  const lngMax = 80.30;

  const toPercentX = (lng: number) => {
    return Math.max(5, Math.min(95, ((lng - lngMin) / (lngMax - lngMin)) * 100));
  };

  const toPercentY = (lat: number) => {
    // Invert latitude for screen Y coordinate (higher lat = lower Y)
    return Math.max(5, Math.min(95, (1 - (lat - latMin) / (latMax - latMin)) * 100));
  };

  const getSeverityBadge = (sev: Incident['severity']) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-500 text-white animate-pulse border-red-400';
      case 'HIGH':
        return 'bg-amber-500 text-slate-900 border-amber-400';
      case 'MEDIUM':
        return 'bg-amber-400/90 text-slate-900 border-amber-300';
      default:
        return 'bg-blue-500 text-white border-blue-400';
    }
  };

  const getDisasterIcon = (type: Incident['type']) => {
    switch (type) {
      case 'flood':
      case 'tsunami':
        return <Waves className="w-4 h-4 text-blue-300" />;
      case 'fire':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'building_collapse':
      case 'earthquake':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-amber-300" />;
    }
  };

  return (
    <div id="disaster-map-container" className="relative w-full rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
      {/* Top Map Action & Layer Controls */}
      <div className="p-3.5 bg-slate-900/90 backdrop-blur border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
            Live Tactical Grid
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Coordinates: 13.0827° N, 80.2707° E • Grid Precision: ±10m
          </span>
        </div>

        {/* Layer Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
          <button
            onClick={() => setShowIncidents(!showIncidents)}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${
              showIncidents
                ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                : 'bg-slate-800/60 text-slate-400 border border-slate-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Incidents ({incidents.length})
          </button>
          <button
            onClick={() => setShowResponders(!showResponders)}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${
              showResponders
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                : 'bg-slate-800/60 text-slate-400 border border-slate-700'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Responders ({responders.length})
          </button>
          <button
            onClick={() => setShowMedical(!showMedical)}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${
              showMedical
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                : 'bg-slate-800/60 text-slate-400 border border-slate-700'
            }`}
          >
            <HospitalIcon className="w-3.5 h-3.5" />
            Hospitals ({hospitals.length})
          </button>
          <button
            onClick={() => setShowShelters(!showShelters)}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${
              showShelters
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                : 'bg-slate-800/60 text-slate-400 border border-slate-700'
            }`}
          >
            <Tent className="w-3.5 h-3.5" />
            Shelters ({shelters.length})
          </button>
          <button
            onClick={() => setShowZones(!showZones)}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all ${
              showZones
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'bg-slate-800/60 text-slate-400 border border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Hazard Zones
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.85, z - 0.15))}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
            title="Reset Map"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative w-full h-[520px] sm:h-[600px] overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 select-none">
        <div
          className="absolute inset-0 transition-transform duration-300 ease-out origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* SVG Map Base with Stylized Topography & Coastline */}
          <svg className="w-full h-full pointer-events-none opacity-40" viewBox="0 0 1000 600" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(51, 65, 85, 0.4)" strokeWidth="0.8" />
              </pattern>
              <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="70%" stopColor="#0369a1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.7" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Ocean (Bay of Bengal coast on East / Right side) */}
            <path
              d="M 820 0 Q 780 200 830 350 T 800 600 L 1000 600 L 1000 0 Z"
              fill="url(#oceanGrad)"
            />

            {/* Coastline Shore border line */}
            <path
              d="M 820 0 Q 780 200 830 350 T 800 600"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Adyar River & Cooum River waterways */}
            <path
              d="M 120 400 Q 350 380 520 430 T 810 450"
              fill="none"
              stroke="#0284c7"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M 100 240 Q 300 220 540 250 T 815 260"
              fill="none"
              stroke="#0284c7"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Major Arterial Highway Network */}
            <path
              d="M 200 50 L 500 280 L 780 500"
              fill="none"
              stroke="#475569"
              strokeWidth="3"
            />
            <path
              d="M 500 50 L 520 550"
              fill="none"
              stroke="#475569"
              strokeWidth="3"
            />
            <path
              d="M 100 320 Q 450 300 780 340"
              fill="none"
              stroke="#475569"
              strokeWidth="2.5"
            />
          </svg>

          {/* Hazard & Evacuation Zones Overlay */}
          {showZones &&
            zones.map((zone) => {
              const cx = toPercentX(zone.center.lng);
              const cy = toPercentY(zone.center.lat);
              const size = zone.radiusKm * 32 * zoomLevel;

              let fillColor = 'rgba(59, 130, 246, 0.22)';
              let strokeColor = '#3b82f6';
              if (zone.type === 'fire') {
                fillColor = 'rgba(239, 68, 68, 0.25)';
                strokeColor = '#ef4444';
              } else if (zone.type === 'evacuation') {
                fillColor = 'rgba(249, 115, 22, 0.25)';
                strokeColor = '#f97316';
              } else if (zone.type === 'safe') {
                fillColor = 'rgba(16, 185, 129, 0.25)';
                strokeColor = '#10b981';
              }

              return (
                <div
                  key={zone.id}
                  className="absolute rounded-full border-2 transition-all pointer-events-none flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${cx}%`,
                    top: `${cy}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: fillColor,
                    borderColor: strokeColor
                  }}
                >
                  <span className="px-2 py-0.5 rounded bg-slate-900/80 text-[10px] text-slate-200 border border-slate-700 tracking-wider font-semibold">
                    {zone.name}
                  </span>
                </div>
              );
            })}

          {/* Blocked / Hazard Roads & Safe Routes */}
          {showRoutes && (
            <div className="absolute inset-0 pointer-events-none">
              {routes.map((rt) => (
                <div
                  key={rt.id}
                  className="absolute text-[10px] px-1.5 py-0.5 rounded border"
                  style={{
                    left: rt.id === 'RT-03' ? '48%' : rt.id === 'RT-01' ? '35%' : '60%',
                    top: rt.id === 'RT-03' ? '68%' : rt.id === 'RT-01' ? '42%' : '25%',
                    backgroundColor:
                      rt.status === 'FLOODED'
                        ? 'rgba(220, 38, 38, 0.9)'
                        : rt.status === 'CLEAR'
                        ? 'rgba(16, 185, 129, 0.9)'
                        : 'rgba(245, 158, 11, 0.9)',
                    borderColor: 'rgba(255,255,255,0.4)',
                    color: '#fff'
                  }}
                >
                  {rt.status === 'FLOODED' ? '⛔ ' : rt.status === 'CLEAR' ? '🟢 ' : '⚠️ '}
                  {rt.name} ({rt.status})
                </div>
              ))}
            </div>
          )}

          {/* Shelters Markers */}
          {showShelters &&
            shelters.map((shlt) => {
              const x = toPercentX(shlt.location.lng);
              const y = toPercentY(shlt.location.lat);
              const isFull = shlt.occupancy >= shlt.capacity;
              const pct = Math.round((shlt.occupancy / shlt.capacity) * 100);

              return (
                <button
                  key={shlt.id}
                  onClick={() => {
                    // Create view for shelter
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group z-10 transition-transform hover:scale-125 focus:outline-none"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <div className="p-1.5 rounded-xl bg-amber-950 border border-amber-500/60 shadow-lg shadow-amber-950/60 text-amber-300 flex items-center justify-center">
                    <Tent className="w-4 h-4" />
                  </div>
                  {/* Tooltip */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex flex-col items-center bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-xl z-30 pointer-events-none">
                    <span className="font-semibold text-amber-300">{shlt.name}</span>
                    <span className="text-[10px] text-slate-400">
                      Cap: {shlt.occupancy} / {shlt.capacity} ({pct}%)
                    </span>
                    <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full ${isFull ? 'bg-red-500' : 'bg-amber-400'}`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}

          {/* Hospital Markers */}
          {showMedical &&
            hospitals.map((hosp) => {
              const x = toPercentX(hosp.location.lng);
              const y = toPercentY(hosp.location.lat);

              return (
                <button
                  key={hosp.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group z-10 transition-transform hover:scale-125 focus:outline-none"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <div className="p-1.5 rounded-xl bg-emerald-950 border border-emerald-500/70 shadow-lg shadow-emerald-950/60 text-emerald-300 flex items-center justify-center">
                    <HospitalIcon className="w-4 h-4" />
                  </div>
                  {/* Tooltip */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex flex-col items-center bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-xl z-30 pointer-events-none">
                    <span className="font-semibold text-emerald-300">{hosp.name}</span>
                    <span className="text-[10px] text-slate-300">
                      Beds: {hosp.availableBeds} | ICU: {hosp.availableICU} | Ambulances: {hosp.availableAmbulances}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 mt-0.5 rounded bg-slate-800 text-slate-300">
                      Load: {hosp.emergencyLoad}
                    </span>
                  </div>
                </button>
              );
            })}

          {/* Responders Markers */}
          {showResponders &&
            responders.map((resp) => {
              const x = toPercentX(resp.location.lng);
              const y = toPercentY(resp.location.lat);
              const isBusy = resp.status !== 'AVAILABLE';

              return (
                <button
                  key={resp.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group z-10 transition-transform hover:scale-125 focus:outline-none"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <div
                    className={`p-1.5 rounded-xl border shadow-lg flex items-center justify-center ${
                      isBusy
                        ? 'bg-indigo-950 border-indigo-500 text-indigo-300'
                        : 'bg-teal-950 border-teal-400 text-teal-300 animate-bounce'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                  </div>
                  {/* Tooltip */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:flex flex-col items-center bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-xl z-30 pointer-events-none">
                    <span className="font-semibold text-indigo-300">{resp.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {resp.vehicle} • {resp.status}
                    </span>
                    <span className="text-[9px] text-emerald-400">
                      Rescues Completed: {resp.completedRescues}
                    </span>
                  </div>
                </button>
              );
            })}

          {/* Emergency Incidents Markers */}
          {showIncidents &&
            incidents.map((inc) => {
              const x = toPercentX(inc.location.lng);
              const y = toPercentY(inc.location.lat);
              const isSelected = selectedIncident?.id === inc.id;
              const isCritical = inc.severity === 'CRITICAL';

              return (
                <button
                  key={inc.id}
                  onClick={() => onSelectIncident(inc)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group z-20 transition-all focus:outline-none ${
                    isSelected ? 'scale-150 z-30' : 'hover:scale-125'
                  }`}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  title={`${inc.id}: ${inc.title}`}
                >
                  {/* Pulsing Radar Ring for Critical / High Incidents */}
                  {isCritical && (
                    <span className="absolute -inset-2 rounded-full bg-red-500/40 animate-ping pointer-events-none" />
                  )}

                  <div
                    className={`relative p-2 rounded-xl border flex items-center justify-center shadow-2xl transition-colors ${
                      isSelected
                        ? 'ring-4 ring-rose-400 ring-offset-2 ring-offset-slate-950 bg-rose-600 text-white'
                        : inc.severity === 'CRITICAL'
                        ? 'bg-red-600 border-red-400 text-white animate-pulse'
                        : inc.severity === 'HIGH'
                        ? 'bg-amber-600 border-amber-400 text-white'
                        : 'bg-blue-600 border-blue-400 text-white'
                    }`}
                  >
                    {getDisasterIcon(inc.type)}

                    {inc.isSOS && (
                      <span className="absolute -top-2.5 -right-2 px-1 py-0.2 bg-red-700 text-white text-[9px] font-black rounded border border-white">
                        SOS
                      </span>
                    )}

                    {inc.clusterCount && inc.clusterCount > 1 && (
                      <span className="absolute -bottom-2 -right-2 px-1.5 py-0.2 bg-purple-700 text-white text-[9px] font-bold rounded-full border border-purple-300">
                        x{inc.clusterCount}
                      </span>
                    )}
                  </div>

                  {/* Marker label */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-1.5 py-0.5 rounded bg-slate-950/90 border border-slate-700 text-[10px] text-slate-300 font-mono whitespace-nowrap pointer-events-none">
                    {inc.id}
                  </div>
                </button>
              );
            })}
        </div>

        {/* Map Legend (Bottom-Left) */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-2.5 text-[11px] text-slate-300 space-y-1.5 shadow-xl hidden sm:block z-10">
          <div className="font-semibold text-slate-200 text-xs border-b border-slate-800 pb-1 flex items-center justify-between">
            <span>Tactical Map Legend</span>
            <span className="text-[9px] text-rose-400 font-mono">LIVE FEED</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>Critical SOS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>High Severity</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
              <span>Rescue Team</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
              <span>Hospital (ICU)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" />
              <span>Shelter Camp</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 bg-red-500" />
              <span>Flooded Road</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Incident Tactical Detail Drawer / Bottom Panel */}
      {selectedIncident && (
        <div className="p-4 bg-slate-900 border-t border-slate-800 transition-all z-20">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                  {selectedIncident.id}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-semibold border ${getSeverityBadge(selectedIncident.severity)}`}>
                  {selectedIncident.severity}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                  {selectedIncident.type.replace('_', ' ')}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  STATUS: {selectedIncident.status.replace('_', ' ')}
                </span>
                {selectedIncident.clusterCount && (
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    👥 Crowd Cluster: {selectedIncident.clusterCount} Duplicate Reports
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-100 mt-1">{selectedIncident.title}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                {selectedIncident.location.address} ({selectedIncident.location.area})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectIncident(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                Close View
              </button>
            </div>
          </div>

          {/* Tab Navigation in Drawer */}
          <div className="flex border-b border-slate-800 text-xs mb-3">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-2 px-3 font-semibold transition-colors border-b-2 ${
                activeTab === 'details'
                  ? 'border-rose-500 text-rose-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Situation Assessment
            </button>
            <button
              onClick={() => setActiveTab('dispatch')}
              className={`pb-2 px-3 font-semibold transition-colors border-b-2 ${
                activeTab === 'dispatch'
                  ? 'border-rose-500 text-rose-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              Smart Dispatch & Assignment
            </button>
            {selectedIncident.mediaUrl && (
              <button
                onClick={() => setActiveTab('evidence')}
                className={`pb-2 px-3 font-semibold transition-colors border-b-2 ${
                  activeTab === 'evidence'
                    ? 'border-rose-500 text-rose-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                Photo / Video Evidence
              </button>
            )}
          </div>

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="text-slate-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  Casualties & Trapped Personnel:
                </div>
                <div className="flex items-center gap-3 text-slate-200">
                  <span>Affected: <strong>{selectedIncident.affectedCount}</strong></span>
                  <span>Injured: <strong className="text-amber-400">{selectedIncident.injuredCount}</strong></span>
                  <span>Trapped: <strong className="text-red-400">{selectedIncident.trappedCount}</strong></span>
                </div>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  Reported by: <strong>{selectedIncident.reportedBy.name}</strong> ({selectedIncident.reportedBy.phone})
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 md:col-span-2">
                <div className="flex items-center gap-1.5 text-rose-400 font-semibold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Classification & Tactical Guidance:
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {selectedIncident.aiClassification?.suggestedResponse || selectedIncident.description}
                </p>
                {selectedIncident.aiClassification?.recommendedEquipment && (
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    <span className="text-slate-400 text-[10px]">Required Equipment:</span>
                    {selectedIncident.aiClassification.recommendedEquipment.map((eq, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded text-[10px] border border-slate-700">
                        {eq}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dispatch Tab */}
          {activeTab === 'dispatch' && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-slate-400">Current Assigned Unit: </span>
                  <strong className="text-indigo-400">
                    {selectedIncident.assignedResponderName || 'None assigned (UNRESPONSED)'}
                  </strong>
                  {selectedIncident.etaMinutes && (
                    <span className="ml-2 text-emerald-400 font-semibold">
                      (Estimated ETA: ~{selectedIncident.etaMinutes} mins)
                    </span>
                  )}
                </div>

                {/* Status Advancement Controls */}
                {onUpdateStatus && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Advance Status:</span>
                    {(['REPORTED', 'VERIFIED', 'RESPONDER_ASSIGNED', 'RESCUE_IN_PROGRESS', 'RESCUED', 'RESOLVED'] as Incident['status'][]).map(
                      (st) => (
                        <button
                          key={st}
                          onClick={() => onUpdateStatus(selectedIncident.id, st)}
                          disabled={selectedIncident.status === st}
                          className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                            selectedIncident.status === st
                              ? 'bg-rose-600 text-white font-bold'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          {st.replace('_', ' ')}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Assign or Change Responder */}
              {onAssignResponder && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400 block mb-1 font-semibold">
                    Dispatch Available Rescue Units:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {responders.map((resp) => (
                      <div
                        key={resp.id}
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-semibold text-slate-200">{resp.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {resp.vehicle} • {resp.status}
                          </div>
                        </div>
                        <button
                          onClick={() => onAssignResponder(selectedIncident.id, resp.id)}
                          disabled={selectedIncident.assignedResponderId === resp.id}
                          className={`px-2.5 py-1 rounded text-xs font-semibold ${
                            selectedIncident.assignedResponderId === resp.id
                              ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 cursor-default'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                          }`}
                        >
                          {selectedIncident.assignedResponderId === resp.id ? 'Assigned' : 'Dispatch'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Evidence Tab */}
          {activeTab === 'evidence' && selectedIncident.mediaUrl && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row gap-4 items-center">
              <img
                src={selectedIncident.mediaUrl}
                alt="Incident Ground Photo"
                className="w-full sm:w-64 h-36 object-cover rounded-lg border border-slate-700"
                referrerPolicy="no-referrer"
              />
              <div className="text-xs space-y-1 text-slate-300">
                <div className="font-semibold text-slate-200">Incident Scene Photographic Capture</div>
                <p className="text-slate-400 text-[11px]">
                  Uploaded by civilian first-reporter. Processed by automated AI visual feature extraction engine.
                </p>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-amber-300">
                  ⚠️ AI Visual Marker: Severe structural fragmentation observed. Debris obstruction index: 84%.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
