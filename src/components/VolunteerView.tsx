import React, { useState } from 'react';
import { MissingPerson, Shelter, EmergencyResource } from '../types';
import {
  Users,
  Search,
  Tent,
  Droplet,
  Package,
  CheckCircle2,
  Phone,
  Heart,
  AlertCircle
} from 'lucide-react';

interface VolunteerViewProps {
  missingPersons: MissingPerson[];
  shelters: Shelter[];
  resources: EmergencyResource[];
}

export const VolunteerView: React.FC<VolunteerViewProps> = ({
  missingPersons,
  shelters,
  resources
}) => {
  const [isAvailable, setIsAvailable] = useState(true);
  const [activeVolunteerTab, setActiveVolunteerTab] = useState<'tasks' | 'missing' | 'supplies'>('tasks');
  const [claimedTasks, setClaimedTasks] = useState<string[]>(['VOL-01']);

  const volunteerTasks = [
    {
      id: 'VOL-01',
      title: 'Distribute Drinking Water & Food Rations',
      location: 'Saidapet High School Relief Shelter',
      urgency: 'HIGH',
      assignedQuota: '250 Families',
      type: 'Distribution',
      description: 'Packaged water cartons arrived from Red Cross warehouse. Need 4 volunteers to distribute systematically.'
    },
    {
      id: 'VOL-02',
      title: 'Assisted Evacuation for Elderly Citizens',
      location: 'Sector 4, Kotturpuram Riverbank',
      urgency: 'CRITICAL',
      assignedQuota: '8 Senior Citizens',
      type: 'Assistance',
      description: 'Coordinate with rescue boats to guide elderly and mobility-impaired residents from ground floor to upper staging.'
    },
    {
      id: 'VOL-03',
      title: 'Missing Child Identification Patrol',
      location: 'Guindy Central Evacuation Center',
      urgency: 'HIGH',
      assignedQuota: 'Area Radius 1km',
      type: 'Search',
      description: 'Patrol community shelter halls with missing child identification flyers to verify lost children.'
    },
    {
      id: 'VOL-04',
      title: 'Emergency Medical Bed Sanitation & Setup',
      location: 'Tambaram Community Center',
      urgency: 'MEDIUM',
      assignedQuota: '60 Bed Units',
      type: 'Shelter',
      description: 'Unpack cots, distribute sterile blankets, and setup temporary medical examination station.'
    }
  ];

  const handleToggleTask = (id: string) => {
    if (claimedTasks.includes(id)) {
      setClaimedTasks(claimedTasks.filter((t) => t !== id));
    } else {
      setClaimedTasks([...claimedTasks, id]);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Volunteer Header & Status */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Volunteer & NGO Coordination Desk</h2>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
                COMMUNITY NETWORK ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Food distribution, missing family ground search, shelter support, and community relief.
            </p>
          </div>
        </div>

        {/* Status Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-300 font-semibold">My Duty Status:</span>
          <button
            onClick={() => setIsAvailable(!isAvailable)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              isAvailable
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-white animate-pulse' : 'bg-slate-500'}`} />
            {isAvailable ? 'AVAILABLE FOR DEPLOYMENT' : 'OFF DUTY / RESTING'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 text-xs">
        <button
          onClick={() => setActiveVolunteerTab('tasks')}
          className={`pb-3 px-4 font-bold border-b-2 transition-colors ${
            activeVolunteerTab === 'tasks'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Relief Task Board ({volunteerTasks.length})
        </button>
        <button
          onClick={() => setActiveVolunteerTab('missing')}
          className={`pb-3 px-4 font-bold border-b-2 transition-colors ${
            activeVolunteerTab === 'missing'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Ground Search for Missing Persons ({missingPersons.length})
        </button>
        <button
          onClick={() => setActiveVolunteerTab('supplies')}
          className={`pb-3 px-4 font-bold border-b-2 transition-colors ${
            activeVolunteerTab === 'supplies'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Food & Water Logistics Status
        </button>
      </div>

      {/* Tasks Tab */}
      {activeVolunteerTab === 'tasks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {volunteerTasks.map((task) => {
            const isClaimed = claimedTasks.includes(task.id);
            return (
              <div
                key={task.id}
                className={`p-5 rounded-2xl border transition-all space-y-3 ${
                  isClaimed
                    ? 'bg-slate-900 border-purple-500 shadow-lg shadow-purple-950/40'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                      {task.id} • {task.type}
                    </span>
                    <h4 className="font-bold text-slate-100 text-sm mt-1">{task.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{task.location}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      task.urgency === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {task.urgency}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{task.description}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">Target: <strong>{task.assignedQuota}</strong></span>
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className={`px-4 py-1.5 rounded-xl font-semibold transition-all ${
                      isClaimed
                        ? 'bg-emerald-600 text-white flex items-center gap-1.5'
                        : 'bg-purple-600 hover:bg-purple-500 text-white'
                    }`}
                  >
                    {isClaimed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Claimed by Me
                      </>
                    ) : (
                      'Accept Assignment'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Missing Persons Search Tab */}
      {activeVolunteerTab === 'missing' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200">
            💡 <strong>Search Protocol:</strong> Match individuals in community shelters with the profiles below. If you locate a person, click <strong>"Report Found / Located"</strong> to notify family and control room immediately.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {missingPersons.map((mp) => (
              <div key={mp.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-slate-500">{mp.id}</span>
                    <h4 className="font-bold text-slate-100 text-sm">{mp.name}</h4>
                    <span className="text-slate-400">{mp.age} yrs • {mp.gender}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">
                    {mp.status}
                  </span>
                </div>

                <div className="space-y-1 text-slate-300">
                  <p><strong>Last Known:</strong> {mp.lastKnownLocation}</p>
                  <p><strong>Clothing:</strong> {mp.clothing}</p>
                  <p className="text-slate-400 text-[11px]">{mp.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Contact: {mp.contactPhone}</span>
                  <button
                    onClick={() => alert(`Location confirmation transmitted for ${mp.name}. Dispatching verification team.`)}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px]"
                  >
                    Found Person
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Supplies Tab */}
      {activeVolunteerTab === 'supplies' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {resources.map((res) => {
              const available = res.available ?? res.quantity;
              const total = res.total ?? Math.max(res.quantity, res.minThreshold * 2);
              const pct = total > 0 ? Math.round((available / total) * 100) : 100;
              const isLow = pct < 25 || res.status === 'Critical' || res.status === 'Low';
              return (
                <div key={res.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200 text-sm">{res.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isLow ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500/20 text-emerald-300'}`}>
                      {isLow ? 'CRITICAL SHORTAGE' : 'STOCKED'}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white">
                    {available} <span className="text-xs text-slate-400 font-normal">{res.unit}</span>
                  </div>
                  <div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${isLow ? 'bg-red-500' : 'bg-purple-500'}`}
                        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>Available: {available}</span>
                      <span>Capacity: {total} {res.unit}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
