import React, { useState } from 'react';
import { BookOpen, X, Waves, Flame, Building2, Wind, HeartPulse, AlertTriangle } from 'lucide-react';

interface OfflineHandbookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineHandbookModal: React.FC<OfflineHandbookModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeCategory, setActiveCategory] = useState<'flood' | 'cyclone' | 'earthquake' | 'fire' | 'collapse' | 'cpr'>('flood');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-slate-100 max-h-[88vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-lg font-bold text-white">Offline Emergency Survival Handbook</h3>
              <p className="text-[11px] text-slate-400">Available 100% Offline Without Internet Connectivity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'flood', label: 'Flood / Water', icon: Waves },
            { id: 'cyclone', label: 'Cyclone / Wind', icon: Wind },
            { id: 'earthquake', label: 'Earthquake', icon: AlertTriangle },
            { id: 'fire', label: 'Fire & Smoke', icon: Flame },
            { id: 'collapse', label: 'Building Collapse', icon: Building2 },
            { id: 'cpr', label: 'CPR & First Aid', icon: HeartPulse }
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Content Box */}
        <div className="overflow-y-auto space-y-4 text-xs pr-1 text-slate-300 leading-relaxed">
          {activeCategory === 'flood' && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-amber-300">Floods & Rising Water Survival Protocol</h4>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Turn Off Main Power Switch:</strong> Disconnect the main electrical circuit immediately before water reaches electrical sockets to prevent electrocution.</li>
                <li><strong>Move to Highest Level:</strong> Move to upper floors or rooftop. Do not enter closed attic spaces where you could become trapped by rising water; ensure you have access to roof exterior.</li>
                <li><strong>Avoid Walking or Driving in Water:</strong> Just 6 inches (15 cm) of fast-moving water can knock you down, and 12 inches (30 cm) can sweep away a vehicle.</li>
                <li><strong>Boil Drinking Water:</strong> Flood water carries severe pathogens and sewage contamination. Never drink tap water until verified safe by authorities.</li>
                <li><strong>Signal for Air/Boat Rescue:</strong> Hang a bright colored cloth (red, orange, white) or use a flashlight / whistle to attract rescuers.</li>
              </ul>
            </div>
          )}

          {activeCategory === 'cyclone' && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-amber-300">Cyclone & Hurricane Survival Protocol</h4>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Stay Indoors:</strong> Remain in the strongest, central room of the building away from glass windows and external doors.</li>
                <li><strong>Beware of the Eye of the Storm:</strong> If the wind suddenly dies down and the sky clears, you may be in the cyclone's center. Stay inside; severe destructive winds will reverse and hit suddenly.</li>
                <li><strong>Unplug Sensitive Electrical Appliances:</strong> Protect against severe power line voltage spikes and lightning strikes.</li>
                <li><strong>Secure Flying Objects:</strong> Bring inside all loose items (bicycles, metal sheets, potted plants) that could turn into lethal airborne projectiles.</li>
              </ul>
            </div>
          )}

          {activeCategory === 'earthquake' && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-amber-300">Earthquake: Drop, Cover, and Hold On</h4>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>DROP:</strong> Drop to your hands and knees to prevent being knocked over.</li>
                <li><strong>COVER:</strong> Take cover beneath a sturdy desk or table. Protect your head and neck with your arms. If no table is nearby, crawl next to an interior wall.</li>
                <li><strong>HOLD ON:</strong> Hold on to your shelter until shaking stops. Be prepared for shelter to shift.</li>
                <li><strong>Do NOT Use Elevators:</strong> Power failure will leave you trapped inside elevator shafts. Always use stairwells after tremors cease.</li>
                <li><strong>If Outdoors:</strong> Move away from buildings, power lines, overpasses, and trees.</li>
              </ul>
            </div>
          )}

          {activeCategory === 'fire' && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-amber-300">Fire & Toxic Smoke Protocol</h4>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>CRAWL LOW UNDER SMOKE:</strong> Smoke and lethal gases rise toward the ceiling. Cleaner, cooler air is near the floor (within 30 cm of ground).</li>
                <li><strong>Feel Closed Doors:</strong> Feel the door handle with the back of your hand before opening. If hot, do not open — find an alternate exit.</li>
                <li><strong>STOP, DROP, AND ROLL:</strong> If clothing catches fire, immediately stop, drop to the floor, cover face, and roll back and forth.</li>
                <li><strong>Seal Door Cracks:</strong> If trapped in a room, seal bottom cracks with wet towels or clothes to block smoke infiltration.</li>
              </ul>
            </div>
          )}

          {activeCategory === 'collapse' && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-amber-300">Building Collapse & Trapped Under Debris</h4>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Protect Airway:</strong> Cover mouth and nose with a cloth, handkerchief, or clothing to avoid inhaling suffocating dust and silica particles.</li>
                <li><strong>Conserve Energy:</strong> Do not shout continuously. Shouting exhausts oxygen and fills lungs with toxic dust.</li>
                <li><strong>Tap on Metal Pipes or Beams:</strong> Rescuers with acoustic listening devices can hear tapping from hundreds of meters away. Tap in groups of three: TAP-TAP-TAP.</li>
                <li><strong>Signal with Flashlight:</strong> If you have a phone or light, flash in intervals rather than keeping continuous beam to conserve battery.</li>
              </ul>
            </div>
          )}

          {activeCategory === 'cpr' && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-amber-300">Hands-Only CPR & Immediate First Aid</h4>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Check Responsiveness:</strong> Tap the victim's shoulders firmly and shout "Are you okay?". Check if chest is rising and falling.</li>
                <li><strong>Call for Help:</strong> Designate someone: "You, call 112 / 108 immediately and get an automated defibrillator (AED)!"</li>
                <li><strong>Hand Placement:</strong> Place heel of one hand in center of victim's chest (lower half of sternum). Place other hand on top, interlocking fingers.</li>
                <li><strong>Compression Rate:</strong> Push hard and fast in center of chest at a rate of 100–120 compressions per minute (to the rhythm of song "Stayin' Alive"). Compress at least 2 inches (5 cm) deep. Allow chest to recoil completely.</li>
                <li><strong>Severe Bleeding:</strong> Apply continuous direct pressure over wound using clean gauze or cloth. Do not remove soaked gauze; layer fresh cloth on top.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
