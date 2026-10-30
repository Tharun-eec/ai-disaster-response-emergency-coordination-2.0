import React, { useState } from 'react';
import {
  Incident,
  Shelter,
  Hospital,
  EmergencyAlert,
  MissingPerson,
  LanguageCode,
  ChatMessage,
  SeverityLevel,
  DisasterType
} from '../types';
import { translations } from '../data/translations';
import { apiUrl } from '../config';
import {
  AlertOctagon,
  MapPin,
  Camera,
  HeartPulse,
  Tent,
  Hospital as HospitalIcon,
  Bell,
  Search,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  Phone,
  Shield,
  Send,
  AlertTriangle,
  X,
  UserCheck,
  ChevronRight
} from 'lucide-react';

interface CitizenViewProps {
  incidents: Incident[];
  shelters: Shelter[];
  hospitals: Hospital[];
  alerts: EmergencyAlert[];
  missingPersons: MissingPerson[];
  chatMessages: ChatMessage[];
  onSubmitIncident: (data: Partial<Incident>) => Promise<Incident | null>;
  onSendMessage: (text: string, channel: ChatMessage['channel'], incidentId?: string, isPreset?: boolean, name?: string) => void;
  activeLanguage: LanguageCode;
  isOnline: boolean;
}

export const CitizenView: React.FC<CitizenViewProps> = ({
  incidents,
  shelters,
  hospitals,
  alerts,
  missingPersons,
  chatMessages,
  onSubmitIncident,
  onSendMessage,
  activeLanguage,
  isOnline
}) => {
  const t = translations[activeLanguage] || translations.en;

  // Modals & Panels
  const [showSOSConfirm, setShowSOSConfirm] = useState(false);
  const [sosCategory, setSosCategory] = useState<DisasterType>('rescue');
  const [activeSOSIncident, setActiveSOSIncident] = useState<Incident | null>(() => {
    // Find any active SOS in current incidents
    return incidents.find((i) => i.isSOS && i.status !== 'RESOLVED') || null;
  });

  const [activeModal, setActiveModal] = useState<
    'none' | 'report' | 'shelters' | 'hospitals' | 'alerts' | 'missing' | 'assistant' | 'myReports'
  >('none');

  // New Emergency Report State
  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState<DisasterType>('flood');
  const [reportDescription, setReportDescription] = useState('');
  const [affectedCount, setAffectedCount] = useState(2);
  const [injuredCount, setInjuredCount] = useState(0);
  const [trappedCount, setTrappedCount] = useState(0);
  const [reportLocation, setReportLocation] = useState('Central District, Chennai (GPS Auto)');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aiImageAnalysis, setAiImageAnalysis] = useState<{
    detectedCondition?: string;
    confidence?: number;
    hazardLevel?: string;
    recommendation?: string;
  } | null>(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);

  // Missing Person Report Form
  const [missingName, setMissingName] = useState('');
  const [missingAge, setMissingAge] = useState('');
  const [missingGender, setMissingGender] = useState('Male');
  const [missingLocation, setMissingLocation] = useState('');
  const [missingDesc, setMissingDesc] = useState('');
  const [missingClothing, setMissingClothing] = useState('');
  const [missingPhone, setMissingPhone] = useState('');

  // AI Assistant Chat
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Citizen-Responder Chat Input
  const [chatInput, setChatInput] = useState('');

  // Trigger Immediate SOS
  const handleConfirmSOS = async () => {
    setShowSOSConfirm(false);

    // Get real GPS coordinates if permitted
    let userLat = 13.0827;
    let userLng = 80.2707;
    let address = 'Civilian GPS Pin (Precision ±8m)';

    if ('geolocation' in navigator) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
        });
        userLat = pos.coords.latitude;
        userLng = pos.coords.longitude;
        address = `GPS Lat ${userLat.toFixed(4)}, Lng ${userLng.toFixed(4)}`;
      } catch {
        // use default fallback
      }
    }

    const created = await onSubmitIncident({
      title: `🚨 EMERGENCY SOS: ${sosCategory.toUpperCase()} RESCUE`,
      type: sosCategory,
      severity: 'CRITICAL',
      status: 'REPORTED',
      description: 'IMMEDIATE LIFE-THREATENING EMERGENCY SOS TRIGGERED BY CITIZEN.',
      location: {
        lat: userLat,
        lng: userLng,
        address,
        area: 'Citizen Location'
      },
      reportedBy: {
        name: 'Urgent Civilian (SOS)',
        phone: '+91 99000 11223'
      },
      affectedCount: 1,
      injuredCount: 0,
      trappedCount: 1,
      isSOS: true,
      aiClassification: {
        category: 'High-Priority Life Safety Emergency',
        confidence: 0.99,
        severity: 'CRITICAL',
        reasoning: 'Direct SOS broadcast from citizen device. Prioritize immediate forward rescue dispatch.',
        suggestedResponse: 'Immediate dispatch of nearest emergency responder unit with GPS trajectory guidance.',
        recommendedEquipment: ['Trauma First Aid Kit', 'All-Terrain Transport', 'Thermal Beacon']
      }
    });

    if (created) {
      setActiveSOSIncident(created);
    }
  };

  // Handle Photo Upload Simulation & AI Analysis
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      setAnalyzingImage(true);

      try {
        const res = await fetch(apiUrl('/api/ai/image-analysis'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 })
        });
        if (res.ok) {
          const data = await res.json();
          setAiImageAnalysis(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setAnalyzingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit standard report
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReport(true);

    const created = await onSubmitIncident({
      title: reportTitle || `${reportType.toUpperCase()} Incident Report`,
      type: reportType,
      severity: (trappedCount > 0 ? 'CRITICAL' : injuredCount > 0 ? 'HIGH' : 'MEDIUM') as SeverityLevel,
      description: reportDescription || 'Civilian emergency report submitted via application.',
      location: {
        lat: 13.0456 + (Math.random() - 0.5) * 0.08,
        lng: 80.2458 + (Math.random() - 0.5) * 0.08,
        address: reportLocation,
        area: 'Reported Area'
      },
      reportedBy: {
        name: 'Concerned Citizen',
        phone: '+91 98400 12345'
      },
      affectedCount,
      injuredCount,
      trappedCount,
      mediaUrl: imagePreview || undefined,
      isSOS: false
    });

    setSubmittingReport(false);
    if (created) {
      setActiveModal('myReports');
      setImagePreview(null);
      setAiImageAnalysis(null);
      setReportTitle('');
      setReportDescription('');
    }
  };

  // Submit Missing Person
  const handleMissingPersonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(apiUrl('/api/missing-persons'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: missingName,
          age: missingAge,
          gender: missingGender,
          lastKnownLocation: missingLocation,
          description: missingDesc,
          clothing: missingClothing,
          contactPhone: missingPhone,
          contactPerson: 'Family Member'
        })
      });
      alert('Missing Person report submitted. Dispatched to volunteer search teams and police control.');
      setMissingName('');
      setMissingAge('');
      setMissingDesc('');
      setMissingClothing('');
      setMissingPhone('');
      setActiveModal('none');
    } catch (err) {
      console.error(err);
    }
  };

  // Ask AI Emergency Assistant
  const handleAskAI = async (customQuery?: string) => {
    const q = customQuery || aiQuery;
    if (!q) return;

    setAiLoading(true);
    try {
      const res = await fetch(apiUrl('/api/ai/assistant'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, language: activeLanguage })
      });
      if (res.ok) {
        const data = await res.json();
        setAiResponse(data.answer);
      }
    } catch {
      setAiResponse('🚨 Immediate Rule: Move to higher ground, disconnect power switches, and call Emergency 112 / 108.');
    } finally {
      setAiLoading(false);
    }
  };

  const statusPipeline: { key: Incident['status']; label: string; step: number }[] = [
    { key: 'REPORTED', label: 'Reported', step: 1 },
    { key: 'VERIFIED', label: 'Verified', step: 2 },
    { key: 'RESPONDER_ASSIGNED', label: 'Team Assigned', step: 3 },
    { key: 'RESCUE_IN_PROGRESS', label: 'In Progress', step: 4 },
    { key: 'RESCUED', label: 'Rescued', step: 5 },
    { key: 'RESOLVED', label: 'Resolved', step: 6 }
  ];

  const getStepIndex = (status: Incident['status']) => {
    const idx = statusPipeline.findIndex((s) => s.key === status);
    return idx >= 0 ? idx + 1 : 1;
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. HUGE PROMINENT SOS BUTTON SECTION (Section 3 Requirement) */}
      <div id="sos-hero-card" className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-950 via-red-950 to-slate-950 border-2 border-red-500/80 shadow-[0_0_50px_rgba(239,68,68,0.35)] text-center overflow-hidden">
        {/* Pulsing background aura */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-red-600/20 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-rose-600/20 blur-3xl pointer-events-none animate-pulse" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold uppercase tracking-widest">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            Instant Life Safety Dispatch
          </span>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Facing an Immediate Disaster Threat?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            One tap broadcasts your exact GPS coordinates to the Disaster Operations Command and alerts the closest rescue squad.
          </p>

          {/* THE GIANT SOS BUTTON */}
          <div className="pt-2">
            <button
              id="citizen-sos-button"
              onClick={() => setShowSOSConfirm(true)}
              className="group relative inline-flex items-center justify-center gap-4 px-8 sm:px-14 py-5 sm:py-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xl sm:text-3xl tracking-wide shadow-[0_10px_35px_rgba(220,38,38,0.6)] hover:shadow-[0_15px_45px_rgba(220,38,38,0.85)] active:scale-95 transition-all duration-200 border-2 border-white/40 cursor-pointer"
            >
              <AlertOctagon className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-bounce" />
              <span>{t.sosButton}</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 flex items-center justify-center gap-4 flex-wrap pt-2">
            <span>🔒 Location secured</span>
            <span>⚡ Automated dispatch</span>
            <span>📞 112 / 108 bridge</span>
          </div>
        </div>
      </div>

      {/* SOS CONFIRMATION MODAL */}
      {showSOSConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-red-500/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-red-600/20 border border-red-500 text-red-400">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{t.sosConfirmTitle}</h3>
                <p className="text-xs text-slate-400">Immediate Forward Dispatch Protocol</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {t.sosConfirmDesc}
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                What type of emergency is happening?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'flood', label: 'Flood / Water' },
                  { id: 'building_collapse', label: 'Building Collapse' },
                  { id: 'fire', label: 'Fire Outbreak' },
                  { id: 'cyclone', label: 'Cyclone Storm' },
                  { id: 'medical', label: 'Critical Medical' },
                  { id: 'rescue', label: 'Trapped / Other' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSosCategory(cat.id as DisasterType)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                      sosCategory === cat.id
                        ? 'bg-rose-600 text-white border-rose-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowSOSConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSOS}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold shadow-lg shadow-red-600/50 transition-colors flex items-center justify-center gap-2"
              >
                <AlertOctagon className="w-4 h-4" />
                CONFIRM SOS RESCUE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE SOS TRACKING CARD (Section 3 & 7 Requirement) */}
      {activeSOSIncident && (
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border-2 border-emerald-500/60 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                ACTIVE SOS INCIDENT #{activeSOSIncident.id}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-600 text-white">
                {activeSOSIncident.severity}
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Reported: {new Date(activeSOSIncident.createdAt).toLocaleTimeString()}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-slate-400">Current Incident Status:</span>
              <div className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                {activeSOSIncident.status.replace('_', ' ')}
              </div>
              <p className="text-xs text-slate-400">{activeSOSIncident.location.address}</p>
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="text-xs text-slate-400">Assigned Rescue Responder:</span>
              <div className="text-base font-bold text-indigo-300">
                {activeSOSIncident.assignedResponderName || 'Emergency Dispatch in Progress...'}
              </div>
              {activeSOSIncident.etaMinutes && (
                <div className="text-xs font-semibold text-emerald-400 flex sm:justify-end items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Estimated Arrival: ~{activeSOSIncident.etaMinutes} minutes
                </div>
              )}
            </div>
          </div>

          {/* Status Pipeline Visualizer */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2 overflow-x-auto">
              {statusPipeline.map((step, idx) => {
                const currentStep = getStepIndex(activeSOSIncident.status);
                const isPassed = currentStep >= step.step;
                const isCurrent = currentStep === step.step;

                return (
                  <div
                    key={step.key}
                    className={`flex items-center gap-1 whitespace-nowrap ${
                      isCurrent
                        ? 'text-emerald-400 font-bold'
                        : isPassed
                        ? 'text-slate-300'
                        : 'text-slate-600'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                        isCurrent
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : isPassed
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {step.step}
                    </span>
                    <span>{step.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{
                  width: `${(getStepIndex(activeSOSIncident.status) / statusPipeline.length) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Quick Communication Presets with Responder */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-300">
              Quick One-Tap Updates to Responder Team:
            </span>
            <div className="flex flex-wrap gap-2">
              {t.quickResponses.map((msg, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onSendMessage(msg, 'citizen-responder', activeSOSIncident.id, true, 'SOS Citizen');
                    alert(`Status update sent to responder: "${msg}"`);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-colors"
                >
                  💬 {msg}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. CITIZEN QUICK ACTION TILES (Section 23 Requirement) */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Emergency Services & Lifeline Tools
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {/* Tile 1: Report Emergency */}
          <button
            id="btn-report-emergency"
            onClick={() => setActiveModal('report')}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-800/80 transition-all text-left flex flex-col justify-between group min-h-[110px]"
          >
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 w-fit group-hover:scale-110 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-100 text-sm">{t.reportEmergency}</div>
              <div className="text-[11px] text-slate-400">Photos, injuries, location</div>
            </div>
          </button>

          {/* Tile 2: Find Safe Shelter */}
          <button
            id="btn-find-shelter"
            onClick={() => setActiveModal('shelters')}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all text-left flex flex-col justify-between group min-h-[110px]"
          >
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 w-fit group-hover:scale-110 transition-transform">
              <Tent className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-100 text-sm">{t.findShelter}</div>
              <div className="text-[11px] text-slate-400">Capacity, food, water</div>
            </div>
          </button>

          {/* Tile 3: Find Hospital */}
          <button
            id="btn-find-hospital"
            onClick={() => setActiveModal('hospitals')}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all text-left flex flex-col justify-between group min-h-[110px]"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 w-fit group-hover:scale-110 transition-transform">
              <HospitalIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-100 text-sm">{t.findHospital}</div>
              <div className="text-[11px] text-slate-400">ICU beds & ambulances</div>
            </div>
          </button>

          {/* Tile 4: Emergency Alerts */}
          <button
            id="btn-emergency-alerts"
            onClick={() => setActiveModal('alerts')}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-red-500/50 hover:bg-slate-800/80 transition-all text-left flex flex-col justify-between group min-h-[110px]"
          >
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 w-fit group-hover:scale-110 transition-transform">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-100 text-sm">{t.emergencyAlerts}</div>
              <div className="text-[11px] text-slate-400">{alerts.length} Active Warnings</div>
            </div>
          </button>

          {/* Tile 5: Missing Persons */}
          <button
            id="btn-report-missing"
            onClick={() => setActiveModal('missing')}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/80 transition-all text-left flex flex-col justify-between group min-h-[110px]"
          >
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 w-fit group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-100 text-sm">{t.reportMissingPerson}</div>
              <div className="text-[11px] text-slate-400">Register or search family</div>
            </div>
          </button>

          {/* Tile 6: AI Emergency Assistant */}
          <button
            id="btn-ai-assistant"
            onClick={() => setActiveModal('assistant')}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all text-left flex flex-col justify-between group min-h-[110px]"
          >
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 w-fit group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-100 text-sm">{t.aiAssistant}</div>
              <div className="text-[11px] text-slate-400">Survival guidance & first aid</div>
            </div>
          </button>

          {/* Tile 7: My Reports */}
          <button
            id="btn-my-reports"
            onClick={() => setActiveModal('myReports')}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all text-left flex flex-col justify-between group min-h-[110px]"
          >
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 w-fit group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-100 text-sm">{t.myReports}</div>
              <div className="text-[11px] text-slate-400">Check rescue status</div>
            </div>
          </button>
        </div>
      </div>

      {/* 3. MODALS / SUB-VIEWS */}

      {/* A. REPORT EMERGENCY MODAL */}
      {activeModal === 'report' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 text-slate-100 my-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-500" />
                <h3 className="text-lg font-bold text-white">Report Disaster Emergency</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Disaster Category</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as DisasterType)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="flood">Flood / Rising Water</option>
                  <option value="building_collapse">Building Collapse</option>
                  <option value="fire">Fire / Toxic Smoke</option>
                  <option value="cyclone">Cyclone / Storm</option>
                  <option value="landslide">Landslide / Mudslide</option>
                  <option value="road_accident">Road Accident</option>
                  <option value="medical">Severe Medical Emergency</option>
                  <option value="rescue">Trapped Person Rescue</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Emergency Description</label>
                <textarea
                  rows={3}
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Describe what is happening: e.g. 4 people trapped on second floor, water at 4 feet, elderly person present..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Affected People</label>
                  <input
                    type="number"
                    min={1}
                    value={affectedCount}
                    onChange={(e) => setAffectedCount(Number(e.target.value))}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Injured Count</label>
                  <input
                    type="number"
                    min={0}
                    value={injuredCount}
                    onChange={(e) => setInjuredCount(Number(e.target.value))}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Trapped Count</label>
                  <input
                    type="number"
                    min={0}
                    value={trappedCount}
                    onChange={(e) => setTrappedCount(Number(e.target.value))}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Location Address / Landmark</label>
                <input
                  type="text"
                  value={reportLocation}
                  onChange={(e) => setReportLocation(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs"
                />
              </div>

              {/* Photo Upload & AI Image Analysis */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Upload Photo of Scene (Optional — AI Hazard Detection)
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer flex items-center gap-2">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <span>Choose Photo</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                  {analyzingImage && (
                    <span className="text-cyan-400 flex items-center gap-1 animate-pulse text-[11px]">
                      <Sparkles className="w-3.5 h-3.5" /> AI analyzing scene hazards...
                    </span>
                  )}
                </div>

                {imagePreview && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row gap-3 items-center">
                    <img
                      src={imagePreview}
                      alt="Uploaded Scene"
                      className="w-24 h-24 object-cover rounded-lg border border-slate-700"
                    />
                    {aiImageAnalysis && (
                      <div className="text-[11px] space-y-1 text-slate-300">
                        <div className="font-semibold text-emerald-400">
                          AI Detected: {aiImageAnalysis.detectedCondition} ({Math.round((aiImageAnalysis.confidence || 0.85) * 100)}% confidence)
                        </div>
                        <div className="text-slate-400">{aiImageAnalysis.recommendation}</div>
                        <div className="text-[9px] text-slate-500">{t.aiEstimateDisclaimer}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-rose-600/30"
                >
                  <Send className="w-4 h-4" />
                  {submittingReport ? 'Submitting...' : 'Transmit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* B. FIND SHELTER MODAL */}
      {activeModal === 'shelters' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-slate-100 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Tent className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">{t.findShelter}</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1 text-xs">
              {shelters.map((shlt) => {
                const available = shlt.capacity - shlt.occupancy;
                const pct = Math.round((shlt.occupancy / shlt.capacity) * 100);
                const isFull = available <= 0;

                return (
                  <div key={shlt.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm">{shlt.name}</h4>
                        <p className="text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-amber-400" /> {shlt.location.address}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${isFull ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'}`}>
                        {isFull ? 'CAPACITY REACHED' : `${available} SPACES AVAILABLE`}
                      </span>
                    </div>

                    {/* Visual Capacity Bar */}
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Capacity: {shlt.occupancy} / {shlt.capacity}</span>
                        <span>{pct}% Occupied</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${isFull ? 'bg-red-500' : pct > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                        🍲 Food: <strong>{shlt.foodAvailable}</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                        💧 Water: <strong>{shlt.waterAvailable}</strong>
                      </span>
                      {shlt.medicalAssistance && (
                        <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                          🩺 Medical Staff Present
                        </span>
                      )}
                      {shlt.accessible && (
                        <span className="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800">
                          ♿ Wheelchair Accessible
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                      <span className="text-slate-400">Contact: {shlt.contact}</span>
                      <a
                        href={`tel:${shlt.contact}`}
                        className="px-3 py-1 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" /> Call Shelter
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* C. FIND HOSPITAL MODAL */}
      {activeModal === 'hospitals' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-slate-100 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <HospitalIcon className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">{t.findHospital}</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1 text-xs">
              {hospitals.map((hosp) => (
                <div key={hosp.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">{hosp.name}</h4>
                      <p className="text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-400" /> {hosp.location.address}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      Emergency Load: {hosp.emergencyLoad}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center py-1">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-base font-bold text-emerald-400">{hosp.availableBeds}</div>
                      <div className="text-[10px] text-slate-400">Available Beds</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-base font-bold text-rose-400">{hosp.availableICU}</div>
                      <div className="text-[10px] text-slate-400">ICU Ventilators</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-base font-bold text-cyan-400">{hosp.availableAmbulances}</div>
                      <div className="text-[10px] text-slate-400">Ambulances Ready</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 text-[10px] text-slate-400">
                    {hosp.specializedServices.map((srv, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {srv}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                    <span className="text-slate-400">Direct Triage: {hosp.contact}</span>
                    <a
                      href={`tel:${hosp.contact}`}
                      className="px-3 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" /> Emergency Call
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* D. EMERGENCY ALERTS MODAL */}
      {activeModal === 'alerts' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-slate-100 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-bold text-white">{t.emergencyAlerts}</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 text-xs pr-1">
              {alerts.map((alt) => (
                <div key={alt.id} className="p-4 rounded-2xl bg-red-950/30 border border-red-500/50 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded font-black text-[10px] bg-red-600 text-white tracking-wide">
                      {alt.severity} ALERT
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      {new Date(alt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{alt.title}</h4>
                  <div className="text-slate-300 text-[11px]">
                    <strong>Target Area:</strong> {alt.area}
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-red-500/30 text-rose-300 font-semibold text-[11px]">
                    👉 Mandatory Action: {alt.actionRequired}
                  </div>
                  <div className="text-[10px] text-slate-500">Issued by: {alt.issuedBy}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* E. REPORT & SEARCH MISSING PERSONS MODAL (Section 12 Requirement) */}
      {activeModal === 'missing' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-slate-100 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Missing Persons Identification & Registry</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-5 pr-1 text-xs">
              {/* Form to submit */}
              <form onSubmit={handleMissingPersonSubmit} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200 text-sm">Register a Missing Family Member or Friend</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={missingName}
                      onChange={(e) => setMissingName(e.target.value)}
                      placeholder="e.g. Anand Kumar"
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Age & Gender</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={missingAge}
                        onChange={(e) => setMissingAge(e.target.value)}
                        placeholder="Age"
                        className="w-20 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
                      />
                      <select
                        value={missingGender}
                        onChange={(e) => setMissingGender(e.target.value)}
                        className="flex-1 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Child</option>
                        <option>Elderly</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Last Known Location / Landmark</label>
                  <input
                    type="text"
                    value={missingLocation}
                    onChange={(e) => setMissingLocation(e.target.value)}
                    placeholder="e.g. Near Saidapet Bridge bus stop during flood surge"
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Clothing & Appearance</label>
                    <input
                      type="text"
                      value={missingClothing}
                      onChange={(e) => setMissingClothing(e.target.value)}
                      placeholder="e.g. Blue check shirt, black trousers, spectacles"
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Your Contact Phone Number</label>
                    <input
                      type="tel"
                      value={missingPhone}
                      onChange={(e) => setMissingPhone(e.target.value)}
                      placeholder="+91 98401 XXXXX"
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4" /> Broadcast Missing Report
                </button>
              </form>

              {/* Directory of Missing Persons */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-300 text-sm">Active Missing Persons Directory</h4>
                <div className="space-y-2">
                  {missingPersons.map((mp) => (
                    <div key={mp.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-purple-400 bg-purple-950 px-1.5 py-0.5 rounded border border-purple-800">
                            {mp.id}
                          </span>
                          <span className="font-bold text-slate-100">{mp.name}</span>
                          <span className="text-slate-400">({mp.age} yrs, {mp.gender})</span>
                        </div>
                        <p className="text-slate-300 mt-1">
                          <strong>Last seen:</strong> {mp.lastKnownLocation} ({mp.lastSeenTime})
                        </p>
                        <p className="text-slate-400 text-[11px]">
                          <strong>Clothing:</strong> {mp.clothing}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        mp.status === 'SAFE'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : mp.status === 'LOCATED'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}>
                        {mp.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* F. AI EMERGENCY ASSISTANT MODAL (Section 4 Requirement) */}
      {activeModal === 'assistant' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-slate-100 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">{t.aiAssistant}</h3>
                  <p className="text-[11px] text-slate-400">Actionable Life Safety Survival Instructions</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Common quick questions from Section 4 */}
            <div className="space-y-1.5">
              <span className="text-xs text-slate-400 font-semibold">Tap a common emergency query:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'There is water entering my house. What should I do?',
                  'I am trapped inside a building.',
                  'Someone is unconscious.',
                  'There is a fire nearby.',
                  'How do I stay safe during a cyclone?',
                  'Where is the nearest shelter?'
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setAiQuery(q);
                      handleAskAI(q);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 text-left transition-colors"
                  >
                    💬 {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Question input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask emergency survival question..."
                className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
              />
              <button
                onClick={() => handleAskAI()}
                disabled={aiLoading || !aiQuery}
                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                {aiLoading ? 'Thinking...' : 'Ask'}
              </button>
            </div>

            {/* Answer Display */}
            {aiResponse && (
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 text-xs space-y-2 overflow-y-auto">
                <div className="flex items-center justify-between text-cyan-300 font-semibold border-b border-cyan-800/40 pb-1">
                  <span>AI Survival Directives</span>
                  <span className="text-[10px] text-cyan-400 font-mono">PRIORITY GUIDANCE</span>
                </div>
                <div className="text-slate-200 whitespace-pre-line leading-relaxed">
                  {aiResponse}
                </div>
                <div className="text-[10px] text-slate-400 border-t border-cyan-950 pt-1">
                  ⚠️ If life is in immediate danger, dial 112 / 108 or tap the SOS button immediately.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* G. MY REPORTS MODAL */}
      {activeModal === 'myReports' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-slate-100 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">{t.myReports}</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 text-xs pr-1">
              {incidents.slice(0, 5).map((inc) => (
                <div key={inc.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-rose-400 font-bold">{inc.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {inc.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-100 text-sm">{inc.title}</h4>
                  <p className="text-slate-400 text-[11px]">{inc.location.address}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px]">
                    <span className="text-slate-400">
                      Assigned: <strong>{inc.assignedResponderName || 'Pending dispatch'}</strong>
                    </span>
                    {inc.etaMinutes && (
                      <span className="text-emerald-400 font-semibold">ETA ~{inc.etaMinutes} mins</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
