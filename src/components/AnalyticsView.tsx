import React from 'react';
import { Incident, Shelter, Hospital, Responder } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Download,
  Clock,
  Shield,
  HeartPulse,
  Tent
} from 'lucide-react';

interface AnalyticsViewProps {
  incidents: Incident[];
  shelters: Shelter[];
  hospitals: Hospital[];
  responders: Responder[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  incidents,
  shelters,
  hospitals,
  responders
}) => {
  // 1. Incident Breakdown by Disaster Type
  const typeCounts: Record<string, number> = {};
  incidents.forEach((i) => {
    const formatted = i.type.replace('_', ' ').toUpperCase();
    typeCounts[formatted] = (typeCounts[formatted] || 0) + 1;
  });

  const typeData = Object.keys(typeCounts).map((key) => ({
    name: key,
    count: typeCounts[key]
  }));

  // 2. Incident Breakdown by Severity
  const severityColors: Record<string, string> = {
    CRITICAL: '#ef4444',
    HIGH: '#f59e0b',
    MEDIUM: '#fbbf24',
    LOW: '#3b82f6'
  };

  const severityCounts: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0
  };
  incidents.forEach((i) => {
    if (severityCounts[i.severity] !== undefined) {
      severityCounts[i.severity] += 1;
    }
  });

  const severityData = Object.keys(severityCounts).map((key) => ({
    name: key,
    value: severityCounts[key],
    color: severityColors[key]
  }));

  // 3. Shelter Capacity vs Occupancy Data
  const shelterData = shelters.map((s) => ({
    name: s.name.slice(0, 14),
    Occupancy: s.occupancy,
    Capacity: s.capacity
  }));

  // 4. Hospital Beds vs ICU Data
  const hospitalData = hospitals.map((h) => ({
    name: h.name.slice(0, 14),
    Beds: h.availableBeds,
    ICU: h.availableICU
  }));

  // Export JSON summary
  const handleExportData = () => {
    const exportObject = {
      timestamp: new Date().toISOString(),
      summary: {
        totalIncidents: incidents.length,
        criticalIncidents: incidents.filter((i) => i.severity === 'CRITICAL').length,
        activeResponders: responders.length,
        totalSheltered: shelters.reduce((a, b) => a + b.occupancy, 0),
        totalAvailableBeds: hospitals.reduce((a, b) => a + b.availableBeds, 0)
      },
      incidents,
      shelters,
      hospitals
    };

    const blob = new Blob([JSON.stringify(exportObject, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `disaster-intelligence-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Disaster Analytics & Tactical Intelligence</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Visual incident patterns, shelter saturation rates, and emergency response performance.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportData}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          Export Incident Intelligence (JSON)
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Incidents by Disaster Type */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-200">Incident Distribution by Disaster Type</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Severity Distribution Pie Chart */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-200">Incident Severity Breakdown</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  formatter={(value) => <span className="text-slate-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Shelter Occupancy vs Capacity */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">Relief Shelter Capacity & Saturation</h3>
            <Tent className="w-4 h-4 text-amber-400" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shelterData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Occupancy" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Capacity" fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Hospital Capacity & ICU Readiness */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">Hospital Emergency Beds & Ventilators</h3>
            <HeartPulse className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hospitalData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Beds" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ICU" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
