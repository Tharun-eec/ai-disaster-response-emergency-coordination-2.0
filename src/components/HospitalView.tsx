import React, { useState } from 'react';
import { Hospital, Incident } from '../types';
import {
  Hospital as HospitalIcon,
  HeartPulse,
  Truck,
  AlertTriangle,
  Users,
  CheckCircle2,
  RefreshCw,
  Droplet
} from 'lucide-react';

interface HospitalViewProps {
  hospitals: Hospital[];
  incidents: Incident[];
  onUpdateHospital?: (updated: Hospital) => void;
}

export const HospitalView: React.FC<HospitalViewProps> = ({
  hospitals,
  incidents
}) => {
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(
    hospitals[0]?.id || 'HOSP-01'
  );

  const currentHospital = hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];

  // Local editable capacities
  const [beds, setBeds] = useState(currentHospital?.availableBeds || 45);
  const [icu, setIcu] = useState(currentHospital?.availableICU || 8);
  const [ambulances, setAmbulances] = useState(currentHospital?.availableAmbulances || 5);
  const [load, setLoad] = useState(currentHospital?.emergencyLoad || 'High');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state when selection changes
  const handleSelectHospital = (id: string) => {
    setSelectedHospitalId(id);
    const target = hospitals.find((h) => h.id === id);
    if (target) {
      setBeds(target.availableBeds);
      setIcu(target.availableICU);
      setAmbulances(target.availableAmbulances);
      setLoad(target.emergencyLoad);
    }
  };

  // Save hospital updates to backend
  const handleSaveHospital = async () => {
    try {
      const res = await fetch(`/api/hospitals/${selectedHospitalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availableBeds: Number(beds),
          availableICU: Number(icu),
          availableAmbulances: Number(ambulances),
          emergencyLoad: load
        })
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Incoming patient triage candidates (incidents with injured people)
  const incomingCasualties = incidents.filter(
    (i) => i.injuredCount > 0 && i.status !== 'RESOLVED'
  );

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <HospitalIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Hospital & Emergency Trauma Triage</h2>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                TRAUMA NETWORK CONNECTED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live capacity monitoring, ICU ventilator availability, and casualty triage intake.
            </p>
          </div>
        </div>

        {/* Hospital facility switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Select Facility:</span>
          <select
            value={selectedHospitalId}
            onChange={(e) => handleSelectHospital(e.target.value)}
            className="p-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-emerald-300 font-semibold focus:outline-none"
          >
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Facility Live Management Card */}
      {currentHospital && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">{currentHospital.name}</h3>
              <p className="text-xs text-slate-400">{currentHospital.location.address} • Triage Line: {currentHospital.contact}</p>
            </div>

            <div className="flex items-center gap-3">
              {savedSuccess && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Capacity Broadcasted!
                </span>
              )}
              <button
                onClick={handleSaveHospital}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 transition-colors"
              >
                Broadcast Real-Time Capacity
              </button>
            </div>
          </div>

          {/* Sliders / Inputs for Live Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {/* General Beds */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="font-semibold">Available Emergency Beds</span>
                <HeartPulse className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400">{beds}</div>
              <input
                type="range"
                min="0"
                max="100"
                value={beds}
                onChange={(e) => setBeds(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0 Full</span>
                <span>100 Max</span>
              </div>
            </div>

            {/* ICU Beds */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="font-semibold">ICU Ventilators</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-black text-rose-400">{icu}</div>
              <input
                type="range"
                min="0"
                max="25"
                value={icu}
                onChange={(e) => setIcu(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0 Critical</span>
                <span>25 Max</span>
              </div>
            </div>

            {/* Ambulances */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="font-semibold">Standby Ambulances</span>
                <Truck className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-cyan-400">{ambulances}</div>
              <input
                type="range"
                min="0"
                max="15"
                value={ambulances}
                onChange={(e) => setAmbulances(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0 Busy</span>
                <span>15 Ready</span>
              </div>
            </div>

            {/* Emergency Load */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="font-semibold">Trauma Load Rating</span>
                <RefreshCw className="w-4 h-4 text-amber-400" />
              </div>
              <select
                value={load}
                onChange={(e) => setLoad(e.target.value as Hospital['emergencyLoad'])}
                className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200"
              >
                <option value="Normal">🟢 Normal Capacity</option>
                <option value="Moderate">🟡 Moderate Load</option>
                <option value="High">🟠 High Strain</option>
                <option value="Overcapacity">🔴 Overcapacity / Divert</option>
              </select>
              <div className="text-[10px] text-slate-500">
                Automated triage redirect applies if Overcapacity.
              </div>
            </div>
          </div>

          {/* Blood Bank Reserve & Specialized Trauma Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-rose-500" />
                Blood Bank Reserves (Emergency Stock)
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <div className="font-bold text-rose-400">O+</div>
                  <div className="text-slate-400">38 Units</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <div className="font-bold text-rose-400">O-</div>
                  <div className="text-amber-400">8 Units (Low)</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <div className="font-bold text-rose-400">A+</div>
                  <div className="text-slate-400">24 Units</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <div className="font-bold text-rose-400">B+</div>
                  <div className="text-slate-400">19 Units</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-semibold text-slate-200">
                Specialized Emergency Medical Capabilities
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentHospital.specializedServices.map((service, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 text-[11px]"
                  >
                    ✓ {service}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Incoming Casualties Triage List */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          Incoming Field Casualties En Route to Medical Centers ({incomingCasualties.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {incomingCasualties.map((inc) => (
            <div key={inc.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                  {inc.id}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  INJURED: {inc.injuredCount} CASUALTIES
                </span>
              </div>
              <h4 className="font-bold text-slate-200">{inc.title}</h4>
              <p className="text-slate-400 text-[11px]">{inc.location.address}</p>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-[11px]">
                🩺 <strong>AI Triage Note:</strong> Prepare Level 1 trauma resuscitation bay. Trapped victims undergoing extrication.
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
