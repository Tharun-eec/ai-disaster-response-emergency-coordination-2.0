import React, { useState } from 'react';
import { useDisasterState } from './hooks/useDisasterState';
import { DisasterMap } from './components/DisasterMap';
import { CitizenView } from './components/CitizenView';
import { ResponderView } from './components/ResponderView';
import { HospitalView } from './components/HospitalView';
import { VolunteerView } from './components/VolunteerView';
import { AdminControlView } from './components/AdminControlView';
import { AnalyticsView } from './components/AnalyticsView';
import { OfflineHandbookModal } from './components/OfflineHandbookModal';
import { EmergencyContactsModal } from './components/EmergencyContactsModal';
import { translations } from './data/translations';
import { UserRole, LanguageCode } from './types';
import {
  ShieldAlert,
  Globe,
  Radio,
  Wifi,
  WifiOff,
  Phone,
  BookOpen,
  Zap,
  RotateCcw,
  Users,
  Shield,
  Hospital,
  Heart,
  LayoutDashboard,
  BarChart3,
  Map as MapIcon,
  Bell,
  X,
  AlertTriangle
} from 'lucide-react';

export default function App() {
  const {
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
    isOnline,
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
    resetSimulation
  } = useDisasterState();

  const [showHandbook, setShowHandbook] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showTacticalMap, setShowTacticalMap] = useState(true);

  const t = translations[activeLanguage] || translations.en;

  const roleNavItems: { role: UserRole; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { role: 'citizen', label: t.citizen || 'Citizen', icon: ShieldAlert },
    { role: 'responder', label: t.responder || 'Responder', icon: Shield },
    { role: 'hospital', label: t.hospital || 'Hospital', icon: Hospital },
    { role: 'volunteer', label: t.volunteer || 'Volunteer', icon: Heart },
    { role: 'admin', label: t.admin || 'Command Room', icon: LayoutDashboard },
    { role: 'analytics', label: 'Analytics & Insights', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Emergency Simulation & Disclaimer Bar */}
      <aside aria-label="System status bar" className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-b border-red-500/30 px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between text-xs gap-2 z-40">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[10px] tracking-wider uppercase flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            {t.demoSimulation || 'SIMULATION MODE'}
          </span>
          <span className="text-slate-300 hidden md:inline font-medium">
            AI Disaster Response & Emergency Coordination System
          </span>
          <span className="text-amber-400/90 text-[11px] hidden lg:inline">
            • {t.aiEstimateDisclaimer}
          </span>
        </div>

        {/* Simulation Controls & Network Simulator */}
        <div className="flex items-center gap-2">
          {/* Offline simulator toggle button */}
          <button
            onClick={() => setIsOfflineModeSimulated(!isOfflineModeSimulated)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
              isOfflineModeSimulated
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
            }`}
            title="Toggle offline simulated mode to test local caching and offline reporting"
          >
            {isOfflineModeSimulated ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulated Offline</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Live SSE Connected</span>
              </>
            )}
          </button>

          {/* Trigger Simulation Button (Section 21) */}
          <button
            id="btn-trigger-simulation"
            onClick={triggerSimulation}
            disabled={isSimulating}
            className="px-3 py-1 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-md shadow-rose-900/50 active:scale-95 transition-all"
          >
            <Zap className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Injecting Disaster Scenario...' : '⚡ Inject Disaster Scenario'}</span>
          </button>

          {/* Reset simulation */}
          <button
            onClick={resetSimulation}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
            title="Reset to Initial Disaster State"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Header */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-3 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-lg shadow-red-900/40 border border-red-400/40">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  DISASTER COMMAND AI
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold tracking-wider uppercase hidden sm:inline">
                  LIVE GRID
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Emergency Lifeline & Multi-Agency Coordination Platform
              </p>
            </div>
          </div>

          {/* Quick Lifeline Actions: Hotlines, Handbook, Map Toggle, Language */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Map Toggle Button */}
            <button
              onClick={() => setShowTacticalMap(!showTacticalMap)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                showTacticalMap
                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{showTacticalMap ? 'Hide Map' : 'Tactical Map'}</span>
            </button>

            {/* Offline Handbook Button (Section 16) */}
            <button
              id="btn-offline-handbook"
              onClick={() => setShowHandbook(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Survival Handbook</span>
            </button>

            {/* Emergency Hotlines Button (Section 22) */}
            <button
              id="btn-emergency-hotlines"
              onClick={() => setShowContacts(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-900/40 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>112 / 108 Hotlines</span>
            </button>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
              <button
                onClick={() => setActiveLanguage('en')}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                  activeLanguage === 'en'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setActiveLanguage('ta')}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                  activeLanguage === 'ta'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                தமிழ்
              </button>
              <button
                onClick={() => setActiveLanguage('hi')}
                className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                  activeLanguage === 'hi'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>

        {/* Role Navigation Bar (Section 2 Requirement) */}
        <div className="max-w-7xl mx-auto mt-3 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs py-1">
          {roleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRole === item.role;
            return (
              <button
                key={item.role}
                id={`role-tab-${item.role}`}
                onClick={() => setActiveRole(item.role)}
                className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white border-rose-400/50 shadow-lg shadow-rose-950/50'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-6">
        {/* Real-Time Tactical Map Section */}
        {showTacticalMap && (
          <div className="transition-all animate-in fade-in duration-300">
            <DisasterMap
              incidents={incidents}
              responders={responders}
              hospitals={hospitals}
              shelters={shelters}
              routes={routes}
              zones={zones}
              selectedIncident={selectedIncident}
              onSelectIncident={setSelectedIncident}
              onAssignResponder={assignResponder}
              onUpdateStatus={updateIncidentStatus}
              activeRole={activeRole}
            />
          </div>
        )}

        {/* Dynamic Role Dashboard View */}
        {activeRole === 'citizen' && (
          <CitizenView
            incidents={incidents}
            shelters={shelters}
            hospitals={hospitals}
            alerts={alerts}
            missingPersons={missingPersons}
            chatMessages={chatMessages}
            onSubmitIncident={submitIncident}
            onSendMessage={sendChatMessage}
            activeLanguage={activeLanguage}
            isOnline={isOnline}
          />
        )}

        {activeRole === 'responder' && (
          <ResponderView
            incidents={incidents}
            responders={responders}
            chatMessages={chatMessages}
            onUpdateIncidentStatus={updateIncidentStatus}
            onSendMessage={sendChatMessage}
          />
        )}

        {activeRole === 'hospital' && (
          <HospitalView
            hospitals={hospitals}
            incidents={incidents}
          />
        )}

        {activeRole === 'volunteer' && (
          <VolunteerView
            missingPersons={missingPersons}
            shelters={shelters}
            resources={resources}
          />
        )}

        {activeRole === 'admin' && (
          <AdminControlView
            incidents={incidents}
            responders={responders}
            hospitals={hospitals}
            shelters={shelters}
            resources={resources}
            alerts={alerts}
            onAssignResponder={assignResponder}
            onUpdateStatus={updateIncidentStatus}
            onSelectIncident={setSelectedIncident}
          />
        )}

        {activeRole === 'analytics' && (
          <AnalyticsView
            incidents={incidents}
            shelters={shelters}
            hospitals={hospitals}
            responders={responders}
          />
        )}
      </main>

      {/* Floating Real-Time Emergency Notification Toast */}
      {notification && (
        <div className="fixed bottom-5 right-5 max-w-md bg-slate-900 border-2 border-red-500 rounded-2xl p-4 shadow-2xl z-50 flex items-start justify-between gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/40">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {notification.title}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">{notification.message}</p>
            </div>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Offline Survival Handbook Modal */}
      <OfflineHandbookModal
        isOpen={showHandbook}
        onClose={() => setShowHandbook(false)}
      />

      {/* Emergency Contacts Modal */}
      <EmergencyContactsModal
        isOpen={showContacts}
        onClose={() => setShowContacts(false)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500 space-y-1">
        <div>
          AI Disaster Response & Emergency Coordination System • State Disaster Management Unified Framework
        </div>
        <div className="text-[10px] text-slate-600">
          Built with real-time SSE telemetry, Gemini AI disaster assessment, and offline resilient caching.
        </div>
      </footer>
    </div>
  );
}
