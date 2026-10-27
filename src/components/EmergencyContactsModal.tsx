import React from 'react';
import { Phone, X, ShieldAlert, HeartPulse, Flame, Shield, Radio, LifeBuoy } from 'lucide-react';

interface EmergencyContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyContactsModal: React.FC<EmergencyContactsModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const contacts = [
    {
      number: '112',
      title: 'National Unified Emergency Lifeline',
      category: 'Police, Fire, Ambulance',
      icon: ShieldAlert,
      color: 'text-red-400 bg-red-500/10 border-red-500/30'
    },
    {
      number: '108',
      title: 'Emergency Medical & Ambulance Dispatch',
      category: 'Trauma & Medical',
      icon: HeartPulse,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    },
    {
      number: '101',
      title: 'Fire & Rescue Specialized Service',
      category: 'Fire & Hazmat',
      icon: Flame,
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/30'
    },
    {
      number: '100',
      title: 'Police Emergency Operations',
      category: 'Security & Law Enforcement',
      icon: Shield,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
    },
    {
      number: '1070',
      title: 'State Disaster Management Control Room',
      category: 'State Disaster Command',
      icon: Radio,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    },
    {
      number: '1077',
      title: 'District Emergency Operations Center',
      category: 'Local Flood & Evac Ops',
      icon: LifeBuoy,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
    },
    {
      number: '1554',
      title: 'Indian Coast Guard Maritime Search & Rescue',
      category: 'Maritime & Marine Flood',
      icon: LifeBuoy,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30'
    },
    {
      number: '011-24363260',
      title: 'National Disaster Response Force (NDRF) HQ',
      category: 'Federal Rescue Task Force',
      icon: Shield,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-slate-100 max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-rose-500" />
            <div>
              <h3 className="text-lg font-bold text-white">Emergency Lifeline Hotlines</h3>
              <p className="text-[11px] text-slate-400">One-Tap Direct Dial for Immediate Rescue</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-2.5 text-xs pr-1">
          {contacts.map((c, idx) => {
            const Icon = c.icon;
            return (
              <a
                key={idx}
                href={`tel:${c.number.replace(/[^0-9]/g, '')}`}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-900 transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${c.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-100 group-hover:text-white text-sm">{c.title}</div>
                    <div className="text-[10px] text-slate-400">{c.category}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-rose-400 text-base">{c.number}</span>
                  <div className="p-2 rounded-xl bg-rose-600 group-hover:bg-rose-500 text-white shadow-md shadow-rose-600/30">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};
