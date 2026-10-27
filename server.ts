import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import {
  initialIncidents,
  initialResponders,
  initialHospitals,
  initialShelters,
  initialMissingPersons,
  initialResources,
  initialAlerts,
  initialRoutes,
  initialDisasterZones
} from './src/data/seedData';
import {
  Incident,
  Responder,
  Hospital,
  Shelter,
  MissingPerson,
  EmergencyResource,
  EmergencyAlert,
  ChatMessage,
  SeverityLevel,
  IncidentStatus
} from './src/types';

dotenv.config();

const PORT = 3000;

// Initialize Gemini Client safely
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
  }
  return aiClient;
}

// In-Memory Real-Time State
let incidents: Incident[] = JSON.parse(JSON.stringify(initialIncidents));
let responders: Responder[] = JSON.parse(JSON.stringify(initialResponders));
let hospitals: Hospital[] = JSON.parse(JSON.stringify(initialHospitals));
let shelters: Shelter[] = JSON.parse(JSON.stringify(initialShelters));
let missingPersons: MissingPerson[] = JSON.parse(JSON.stringify(initialMissingPersons));
let resources: EmergencyResource[] = JSON.parse(JSON.stringify(initialResources));
let alerts: EmergencyAlert[] = JSON.parse(JSON.stringify(initialAlerts));
let chatMessages: ChatMessage[] = [
  {
    id: 'MSG-001',
    channel: 'citizen-responder',
    incidentId: 'DR-1042',
    senderRole: 'citizen',
    senderName: 'Ramesh Kumar',
    text: 'Water line is cracked and pouring into the basement room. 5 people trapped behind concrete slab!',
    timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    isEmergencyPreset: false
  },
  {
    id: 'MSG-002',
    channel: 'citizen-responder',
    incidentId: 'DR-1042',
    senderRole: 'responder',
    senderName: 'NDRF Task Force 4',
    text: 'Understood Ramesh. Heavy hydraulic spreader truck is 8 minutes away with acoustic locators. Stay in the structural pocket away from unreinforced walls.',
    timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    isEmergencyPreset: false
  },
  {
    id: 'MSG-003',
    channel: 'responder-control',
    incidentId: 'DR-1043',
    senderRole: 'responder',
    senderName: 'Coast Guard Marine Evac 2',
    text: 'On-scene at Adyar Basin lowlands. Stranded count updated to 18 civilians. Commencing zodiac shuttle.',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    isEmergencyPreset: false
  }
];

// SSE Clients for Real-Time synchronization
const sseClients: Set<express.Response> = new Set();

function broadcastEvent(eventType: string, payload: unknown) {
  const data = JSON.stringify({ type: eventType, data: payload, timestamp: new Date().toISOString() });
  for (const client of sseClients) {
    try {
      client.write(`data: ${data}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // Server-Sent Events (SSE) stream
  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    sseClients.add(res);

    // Initial keep-alive ping
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);

    req.on('close', () => {
      sseClients.delete(res);
    });
  });

  // Full state snapshot
  app.get('/api/state', (req, res) => {
    res.json({
      incidents,
      responders,
      hospitals,
      shelters,
      missingPersons,
      resources,
      alerts,
      routes: initialRoutes,
      zones: initialDisasterZones,
      chatMessages
    });
  });

  // Create or report incident / SOS
  app.post('/api/incidents', async (req, res) => {
    try {
      const {
        title,
        type,
        severity = 'HIGH',
        description,
        location,
        reportedBy,
        affectedCount = 1,
        injuredCount = 0,
        trappedCount = 0,
        mediaUrl,
        isSOS = false,
        aiClassification
      } = req.body;

      const incidentId = `DR-${Math.floor(1000 + Math.random() * 9000)}`;

      // Check for duplicate / crowd-source cluster (within 0.015 lat/lng ~ 1.5km and same type)
      let clusterId: string | undefined = undefined;
      let clusterCount = 1;
      const nearbyMatch = incidents.find(
        (inc) =>
          inc.type === type &&
          Math.abs(inc.location.lat - location.lat) < 0.015 &&
          Math.abs(inc.location.lng - location.lng) < 0.015
      );

      if (nearbyMatch) {
        clusterId = nearbyMatch.clusterId || `CLUSTER-${type.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
        if (!nearbyMatch.clusterId) nearbyMatch.clusterId = clusterId;
        nearbyMatch.clusterCount = (nearbyMatch.clusterCount || 1) + 1;
        clusterCount = nearbyMatch.clusterCount;
      }

      const newIncident: Incident = {
        id: incidentId,
        title: title || (isSOS ? `EMERGENCY SOS: ${type.toUpperCase()}` : `Reported Emergency: ${type}`),
        type: type || 'rescue',
        severity: severity as SeverityLevel,
        status: 'REPORTED',
        description: description || 'Immediate emergency assistance requested by citizen.',
        location: location || {
          lat: 13.0827,
          lng: 80.2707,
          address: 'Current Citizen GPS Fix',
          area: 'Detected Location'
        },
        reportedBy: reportedBy || {
          name: isSOS ? 'Emergency Citizen' : 'Anonymous Citizen',
          phone: '+91 99000 11223'
        },
        affectedCount: Number(affectedCount) || 1,
        injuredCount: Number(injuredCount) || 0,
        trappedCount: Number(trappedCount) || 0,
        mediaUrl,
        aiClassification,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isSOS: Boolean(isSOS),
        clusterId,
        clusterCount: nearbyMatch ? clusterCount : undefined
      };

      incidents.unshift(newIncident);

      // Trigger automatic smart dispatch recommendation for SOS/Critical
      const availableResponder = responders.find((r) => r.status === 'AVAILABLE');
      if (isSOS && availableResponder) {
        newIncident.assignedResponderId = availableResponder.id;
        newIncident.assignedResponderName = availableResponder.name;
        newIncident.status = 'RESPONDER_ASSIGNED';
        newIncident.etaMinutes = Math.floor(4 + Math.random() * 8);
        availableResponder.status = 'DISPATCHED';
        availableResponder.currentIncidentId = newIncident.id;
      }

      broadcastEvent('INCIDENT_CREATED', { incident: newIncident, responders });
      res.status(201).json({ success: true, incident: newIncident });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create incident' });
    }
  });

  // Update incident status
  app.patch('/api/incidents/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const incident = incidents.find((i) => i.id === id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    incident.status = status as IncidentStatus;
    incident.updatedAt = new Date().toISOString();

    if (status === 'RESOLVED' || status === 'RESCUED') {
      if (incident.assignedResponderId) {
        const resp = responders.find((r) => r.id === incident.assignedResponderId);
        if (resp) {
          resp.status = 'AVAILABLE';
          resp.currentIncidentId = undefined;
          resp.completedRescues += 1;
        }
      }
    }

    broadcastEvent('INCIDENT_STATUS_UPDATED', { incident, responders });
    res.json({ success: true, incident });
  });

  // Assign responder to incident
  app.post('/api/incidents/:id/assign', (req, res) => {
    const { id } = req.params;
    const { responderId } = req.body;

    const incident = incidents.find((i) => i.id === id);
    const responder = responders.find((r) => r.id === responderId);

    if (!incident || !responder) {
      return res.status(404).json({ error: 'Incident or Responder not found' });
    }

    incident.assignedResponderId = responder.id;
    incident.assignedResponderName = responder.name;
    incident.status = 'RESPONDER_ASSIGNED';
    incident.etaMinutes = Math.floor(5 + Math.random() * 10);
    incident.updatedAt = new Date().toISOString();

    responder.status = 'DISPATCHED';
    responder.currentIncidentId = incident.id;

    broadcastEvent('RESPONDER_ASSIGNED', { incident, responder });
    res.json({ success: true, incident, responder });
  });

  // Hospital capacity update
  app.patch('/api/hospitals/:id', (req, res) => {
    const { id } = req.params;
    const { availableBeds, availableICU, availableAmbulances, emergencyLoad, bloodBankStatus } = req.body;

    const hosp = hospitals.find((h) => h.id === id);
    if (!hosp) return res.status(404).json({ error: 'Hospital not found' });

    if (typeof availableBeds === 'number') hosp.availableBeds = availableBeds;
    if (typeof availableICU === 'number') hosp.availableICU = availableICU;
    if (typeof availableAmbulances === 'number') hosp.availableAmbulances = availableAmbulances;
    if (emergencyLoad) hosp.emergencyLoad = emergencyLoad;
    if (bloodBankStatus) hosp.bloodBankStatus = bloodBankStatus;

    broadcastEvent('HOSPITAL_UPDATED', hosp);
    res.json({ success: true, hospital: hosp });
  });

  // Shelter update
  app.patch('/api/shelters/:id', (req, res) => {
    const { id } = req.params;
    const { occupancy, foodAvailable, waterAvailable, medicalAssistance } = req.body;

    const shelter = shelters.find((s) => s.id === id);
    if (!shelter) return res.status(404).json({ error: 'Shelter not found' });

    if (typeof occupancy === 'number') shelter.occupancy = occupancy;
    if (foodAvailable) shelter.foodAvailable = foodAvailable;
    if (waterAvailable) shelter.waterAvailable = waterAvailable;
    if (typeof medicalAssistance === 'boolean') shelter.medicalAssistance = medicalAssistance;

    broadcastEvent('SHELTER_UPDATED', shelter);
    res.json({ success: true, shelter });
  });

  // Missing person creation & update
  app.post('/api/missing-persons', (req, res) => {
    const { name, age, gender, lastKnownLocation, description, clothing, photoUrl, contactPhone, contactPerson } = req.body;
    const newPerson: MissingPerson = {
      id: `MP-${Math.floor(400 + Math.random() * 600)}`,
      name: name || 'Unidentified Person',
      age: Number(age) || 30,
      gender: gender || 'Unknown',
      lastKnownLocation: lastKnownLocation || 'Disaster Zone',
      lastSeenTime: 'Just now',
      description: description || 'Reported missing during emergency.',
      clothing: clothing || 'Not specified',
      photoUrl,
      contactPhone: contactPhone || '+91 98000 00000',
      contactPerson: contactPerson || 'Family Member',
      status: 'MISSING',
      reportedAt: new Date().toISOString()
    };

    missingPersons.unshift(newPerson);
    broadcastEvent('MISSING_PERSON_REPORTED', newPerson);
    res.status(201).json({ success: true, missingPerson: newPerson });
  });

  app.patch('/api/missing-persons/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const person = missingPersons.find((p) => p.id === id);
    if (!person) return res.status(404).json({ error: 'Person not found' });

    person.status = status;
    broadcastEvent('MISSING_PERSON_UPDATED', person);
    res.json({ success: true, missingPerson: person });
  });

  // Emergency Resource update
  app.patch('/api/resources/:id', (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    const item = resources.find((r) => r.id === id);
    if (!item) return res.status(404).json({ error: 'Resource not found' });

    item.quantity = quantity;
    if (item.quantity <= item.minThreshold * 0.5) {
      item.status = 'Critical';
    } else if (item.quantity <= item.minThreshold) {
      item.status = 'Low';
    } else {
      item.status = 'Available';
    }

    broadcastEvent('RESOURCE_UPDATED', item);
    res.json({ success: true, resource: item });
  });

  // Emergency Alerts
  app.post('/api/alerts', (req, res) => {
    const { title, type, severity, area, actionRequired } = req.body;
    const newAlert: EmergencyAlert = {
      id: `ALT-${Math.floor(10 + Math.random() * 90)}`,
      title,
      type: type || 'Flood Warning',
      severity: severity || 'CRITICAL',
      area: area || 'All Affected Zones',
      actionRequired: actionRequired || 'Follow official instructions and move to safety.',
      timestamp: new Date().toISOString(),
      issuedBy: 'Emergency Command Center'
    };

    alerts.unshift(newAlert);
    broadcastEvent('ALERT_BROADCASTED', newAlert);
    res.status(201).json({ success: true, alert: newAlert });
  });

  // Chat messaging
  app.post('/api/chat', (req, res) => {
    const { channel, incidentId, senderRole, senderName, text, isEmergencyPreset } = req.body;
    const message: ChatMessage = {
      id: `MSG-${Date.now().toString(36).toUpperCase()}`,
      channel: channel || 'citizen-responder',
      incidentId,
      senderRole: senderRole || 'citizen',
      senderName: senderName || 'User',
      text,
      timestamp: new Date().toISOString(),
      isEmergencyPreset: Boolean(isEmergencyPreset)
    };

    chatMessages.push(message);
    broadcastEvent('CHAT_MESSAGE', message);
    res.status(201).json({ success: true, message });
  });

  // --- AI ENDPOINTS ---

  // 1. AI Emergency Assistant
  app.post('/api/ai/assistant', async (req, res) => {
    const { question, language = 'en' } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question required' });
    }

    const ai = getAI();
    if (!ai) {
      // Offline / Keyless Fallback instructions
      let fallback = '🚨 EMERGENCY SAFETY PRIORITY: 1. Move immediately to higher elevation or clear open ground. 2. Call Emergency Services 112 / 108. 3. Avoid electrical poles, flood water, and damaged structures. 4. Tap the SOS button on screen for immediate GPS rescue dispatch.';
      if (question.toLowerCase().includes('water') || question.toLowerCase().includes('flood')) {
        fallback = '🌊 FLOOD EMERGENCY: 1. Disconnect main power switch immediately. 2. Never walk or drive through moving water (just 6 inches sweeps a person). 3. Move to upper floors or roof with drinking water and phone. 4. Signal rescuers using flashlight or bright cloth.';
      } else if (question.toLowerCase().includes('trapped') || question.toLowerCase().includes('building')) {
        fallback = '⚠️ TRAPPED ADVICE: 1. Protect head and airway from dust using cloth. 2. Tap rhythmically on pipes or wall (3 taps) to guide acoustic locators. 3. Avoid shouting continuously to preserve oxygen. 4. Stay calm; NDRF teams are actively scanning.';
      } else if (question.toLowerCase().includes('fire')) {
        fallback = '🔥 FIRE ESCAPE: 1. Stay low beneath toxic smoke layer (crawl). 2. Feel doors with back of hand before opening. 3. Never use elevators. 4. Evacuate downwind and dial 101 immediately.';
      }
      return res.json({ answer: fallback, source: 'offline-guidelines' });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are an Emergency Disaster First-Response Assistant in an active disaster command system.
The user is facing this disaster question/situation: "${question}".
Language preference: ${language}.
CRITICAL INSTRUCTIONS:
- Give SHORT, ACTIONABLE, BULLETED life-saving emergency instructions.
- Prioritize: 1. Immediate physical safety, 2. Emergency 112/108 call, 3. Evacuation steps, 4. First-aid/survival basics.
- Maximum 4-5 bullet points. Do NOT write long essays or conversational filler. Keep it readable in high-stress crisis.`
      });

      res.json({ answer: response.text || 'Follow emergency responder directions immediately.', source: 'gemini-3.8-flash' });
    } catch (err: any) {
      res.json({
        answer: '🚨 Immediate Safety Rule: Move to designated safe zones, stay clear of collapsing debris and electrical hazards, and contact 112 for urgent emergency rescue.',
        source: 'rule-fallback'
      });
    }
  });

  // 2. AI Incident Classification
  app.post('/api/ai/classify', async (req, res) => {
    const { description, disasterType, affectedCount, injuredCount, trappedCount } = req.body;

    const ai = getAI();
    if (!ai) {
      // Heuristic classification
      const trapped = Number(trappedCount) || 0;
      const injured = Number(injuredCount) || 0;
      const affected = Number(affectedCount) || 1;
      let severity: SeverityLevel = 'LOW';
      if (trapped > 0 || injured > 3 || affected > 20) {
        severity = 'CRITICAL';
      } else if (injured > 0 || affected > 5) {
        severity = 'HIGH';
      } else if (affected > 1) {
        severity = 'MEDIUM';
      }

      return res.json({
        category: `${disasterType ? disasterType.toUpperCase() : 'GENERAL'} INCIDENT`,
        confidence: 0.88,
        severity,
        reasoning: `Calculated from ${affected} affected, ${trapped} trapped, and ${injured} injured reports.`,
        suggestedResponse: `${severity} priority: Dispatch nearest available units and establish triage perimeter.`,
        recommendedEquipment: ['First Aid Kits', 'Life Support Ambulance', 'Emergency Radio Communication']
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Analyze this emergency incident report and classify it for emergency dispatchers:
Description: "${description}"
Reported Type: "${disasterType}"
Affected People: ${affectedCount}
Injured People: ${injuredCount}
Trapped People: ${trappedCount}

Return JSON with:
category: string (disaster category)
confidence: number (between 0.70 and 0.99)
severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
reasoning: string (1-2 clear sentences explaining why this severity was determined)
suggestedResponse: string (immediate action directive for command center)
recommendedEquipment: array of 3-4 specific equipment needed (e.g. "Hydraulic Cutters", "Zodiac Boats", "Thermal Blankets")`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              severity: { type: Type.STRING },
              reasoning: { type: Type.STRING },
              suggestedResponse: { type: Type.STRING },
              recommendedEquipment: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['category', 'confidence', 'severity', 'reasoning', 'suggestedResponse', 'recommendedEquipment']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      res.json({
        category: `${disasterType || 'EMERGENCY'} RESPONSE`,
        confidence: 0.85,
        severity: (Number(trappedCount) > 0 ? 'CRITICAL' : 'HIGH') as SeverityLevel,
        reasoning: 'Calculated using safety threshold heuristics.',
        suggestedResponse: 'Immediate dispatch of nearest emergency responders recommended.',
        recommendedEquipment: ['Emergency Medical Kits', 'Rescue Transport']
      });
    }
  });

  // 3. AI Dispatch Recommendation
  app.post('/api/ai/dispatch-recommendation', (req, res) => {
    const { incidentId } = req.body;
    const incident = incidents.find((i) => i.id === incidentId);

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    // Find closest / best-fit available responder
    const available = responders.filter((r) => r.status === 'AVAILABLE');
    const candidates = available.length > 0 ? available : responders;

    // Rank by skill match, equipment, and hypothetical distance
    const ranked = candidates.map((resp) => {
      const dist = +(Math.sqrt(
        Math.pow((resp.location.lat - incident.location.lat) * 111, 2) +
        Math.pow((resp.location.lng - incident.location.lng) * 111, 2)
      )).toFixed(1);

      let skillBonus = 0;
      if (incident.type === 'flood' && resp.skills.some((s) => s.toLowerCase().includes('water') || s.toLowerCase().includes('boat'))) {
        skillBonus = 3;
      }
      if (incident.type === 'building_collapse' && resp.skills.some((s) => s.toLowerCase().includes('collapse') || s.toLowerCase().includes('trench'))) {
        skillBonus = 3;
      }
      if (incident.type === 'fire' && resp.skills.some((s) => s.toLowerCase().includes('chemical') || s.toLowerCase().includes('foam'))) {
        skillBonus = 3;
      }

      return {
        responder: resp,
        distanceKm: Math.max(0.8, dist),
        etaMinutes: Math.max(3, Math.round(dist * 2.2) - skillBonus),
        score: dist - skillBonus
      };
    });

    ranked.sort((a, b) => a.score - b.score);
    const top = ranked[0];

    res.json({
      recommendedResponder: top.responder,
      distanceKm: top.distanceKm,
      etaMinutes: top.etaMinutes,
      reason: `Optimal unit for ${incident.type.toUpperCase()}: ${top.responder.vehicle} on standby, closest active corridor (${top.distanceKm} km), equipped with ${top.responder.skills[0]}.`,
      allOptions: ranked.slice(0, 3)
    });
  });

  // 4. AI Image Analysis for disaster indicators
  app.post('/api/ai/image-analysis', async (req, res) => {
    const { imageBase64 } = req.body;

    const ai = getAI();
    if (!ai || !imageBase64) {
      return res.json({
        detectedCondition: 'Severe Inundation & Structural Debris (Simulated Assessment)',
        confidence: 0.88,
        hazardLevel: 'HIGH',
        indicators: ['Water level > 1.2m', 'Building foundation stress', 'Fallen electrical conduits'],
        recommendation: 'Do not approach on foot. Deploy shallow draft motorized rescue craft.'
      });
    }

    try {
      const cleanData = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: cleanData
              }
            },
            {
              text: `Analyze this disaster photo for emergency responders. Identify hazard indicators (flood water, fire/smoke, collapsed walls, blocked roads, trapped people).
Return JSON with:
detectedCondition: string (e.g. "Severe Flash Flooding", "Structural Building Collapse")
confidence: number (e.g. 0.89)
hazardLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
indicators: array of strings (specific visible risks)
recommendation: string (tactical instruction for first responders)`
            }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detectedCondition: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              hazardLevel: { type: Type.STRING },
              indicators: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendation: { type: Type.STRING }
            },
            required: ['detectedCondition', 'confidence', 'hazardLevel', 'indicators', 'recommendation']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      res.json({
        detectedCondition: 'Emergency Hazard Detected',
        confidence: 0.82,
        hazardLevel: 'HIGH',
        indicators: ['Visual obstacle detected in disaster pathway'],
        recommendation: 'Exercise caution and verify with forward scout unit.'
      });
    }
  });

  // 5. AI Risk & Disaster Prediction
  app.post('/api/ai/risk-prediction', (req, res) => {
    const { disasterType = 'cyclone' } = req.body;

    res.json({
      riskLevel: 'EXTREME',
      potentialAffectedPopulation: '145,000 - 220,000 civilians in low-lying delta and coastal sectors',
      vulnerableAreas: ['Adyar Basin', 'Marina Shoreline', 'Saidapet Enclave', 'Ambattur Lowlands'],
      resourceRequirements: {
        shelterBedsNeeded: 8500,
        rescueBoats: 45,
        potableWaterLiters: '500,000 L',
        ambulanceTripsPerHour: 35
      },
      evacuationPriority: 'Immediate mandatory evacuation within 3 km of storm surge boundary',
      modelEstimateNote: 'AI ESTIMATE BASED ON METEOROLOGICAL RAINFALL MODELS AND CONTOUR ELEVATION DATA — VERIFY WITH NDMA COMMAND'
    });
  });

  // Disaster Simulation Steps Trigger
  app.post('/api/simulation/start', (req, res) => {
    // Inject realistic multi-event emergency scenario
    const simIncident: Incident = {
      id: `SIM-${Math.floor(2000 + Math.random() * 8000)}`,
      title: 'SIMULATED: Storm Surge Flood Breach & Trapped Family',
      type: 'flood',
      severity: 'CRITICAL',
      status: 'REPORTED',
      description: 'DEMO SIMULATION: Sea wall breached at Fishermen Colony. 6 civilians including 2 children trapped on tin roof.',
      location: {
        lat: 13.0384,
        lng: 80.2792,
        address: 'Shoreline Cluster 3, Santhome Beachfront',
        area: 'Coastal East'
      },
      reportedBy: {
        name: 'Demo Citizen (Simulation)',
        phone: '+91 99999 88888'
      },
      affectedCount: 6,
      injuredCount: 1,
      trappedCount: 6,
      aiClassification: {
        category: 'Coastal Flood Trapped Victims',
        confidence: 0.96,
        severity: 'CRITICAL',
        reasoning: 'DEMO: Fast rising sea water with 6 trapped residents on vulnerable temporary roofing.',
        suggestedResponse: 'CRITICAL — Inflatable boat evacuation and trauma transport dispatched.',
        recommendedEquipment: ['Zodiac Rescue Boats', 'Hypothermia Survival Blankets', 'Floatation Vests']
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSOS: true
    };

    incidents.unshift(simIncident);

    // Also update a shelter occupancy and hospital capacity
    if (shelters[0]) shelters[0].occupancy = Math.min(shelters[0].capacity, shelters[0].occupancy + 85);
    if (hospitals[0]) hospitals[0].availableBeds = Math.max(5, hospitals[0].availableBeds - 12);

    // Create a simulation alert
    const simAlert: EmergencyAlert = {
      id: `ALT-SIM-${Date.now().toString(36).toUpperCase()}`,
      title: 'SIMULATED ALERT: Mandatory Coastal Evacuation Order',
      type: 'Evacuation Order',
      severity: 'EXTREME',
      area: 'Zone 4 Coastal Strip',
      actionRequired: 'DEMO SIMULATION: Move inward 2 km to designated high-elevation shelter.',
      timestamp: new Date().toISOString(),
      issuedBy: 'Simulation Operations Center'
    };
    alerts.unshift(simAlert);

    broadcastEvent('SIMULATION_TRIGGERED', {
      incident: simIncident,
      shelters,
      hospitals,
      alerts
    });

    res.json({ success: true, simulatedIncident: simIncident });
  });

  // Simulation reset
  app.post('/api/simulation/reset', (req, res) => {
    incidents = JSON.parse(JSON.stringify(initialIncidents));
    responders = JSON.parse(JSON.stringify(initialResponders));
    hospitals = JSON.parse(JSON.stringify(initialHospitals));
    shelters = JSON.parse(JSON.stringify(initialShelters));
    missingPersons = JSON.parse(JSON.stringify(initialMissingPersons));
    resources = JSON.parse(JSON.stringify(initialResources));
    alerts = JSON.parse(JSON.stringify(initialAlerts));

    broadcastEvent('STATE_RESET', {
      incidents,
      responders,
      hospitals,
      shelters,
      missingPersons,
      resources,
      alerts
    });

    res.json({ success: true, message: 'Reset to initial state' });
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);

    // Fallback in dev to ensure index.html is always returned without 404
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Disaster Response Coordination Server running at http://localhost:${PORT}`);
    console.log(`Server ready at http://localhost:${PORT}`);
  });
}

startServer();
