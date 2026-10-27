export type DisasterType =
  | 'flood'
  | 'cyclone'
  | 'fire'
  | 'earthquake'
  | 'landslide'
  | 'tsunami'
  | 'industrial'
  | 'building_collapse'
  | 'road_accident'
  | 'medical'
  | 'rescue'
  | 'missing_person'
  | 'other';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus =
  | 'REPORTED'
  | 'VERIFIED'
  | 'RESPONDER_ASSIGNED'
  | 'RESCUE_IN_PROGRESS'
  | 'RESCUED'
  | 'RESOLVED';

export type UserRole = 'citizen' | 'responder' | 'hospital' | 'volunteer' | 'admin' | 'analytics';

export type LanguageCode = 'en' | 'ta' | 'hi';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  address: string;
  area: string;
}

export interface AIClassificationResult {
  category: string;
  confidence: number;
  severity: SeverityLevel;
  reasoning: string;
  suggestedResponse: string;
  recommendedEquipment: string[];
}

export interface Incident {
  id: string;
  title: string;
  type: DisasterType;
  severity: SeverityLevel;
  status: IncidentStatus;
  description: string;
  location: LocationCoordinates;
  reportedBy: {
    name: string;
    phone: string;
    isAnonymous?: boolean;
  };
  affectedCount: number;
  injuredCount: number;
  trappedCount: number;
  mediaUrl?: string;
  aiClassification?: AIClassificationResult;
  assignedResponderId?: string;
  assignedResponderName?: string;
  etaMinutes?: number;
  createdAt: string;
  updatedAt: string;
  isSOS?: boolean;
  clusterId?: string;
  clusterCount?: number;
}

export interface Responder {
  id: string;
  name: string;
  agency: string;
  status: 'AVAILABLE' | 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE' | 'BUSY';
  location: LocationCoordinates;
  contact: string;
  currentIncidentId?: string;
  skills: string[];
  vehicle: string;
  completedRescues: number;
}

export interface Hospital {
  id: string;
  name: string;
  location: LocationCoordinates;
  totalBeds: number;
  availableBeds: number;
  totalICU: number;
  availableICU: number;
  availableAmbulances: number;
  bloodBankStatus: 'Normal' | 'Low' | 'Critical';
  emergencyLoad: 'Normal' | 'Moderate' | 'High' | 'Overcapacity';
  contact: string;
  specializedServices: string[];
}

export interface Shelter {
  id: string;
  name: string;
  location: LocationCoordinates;
  capacity: number;
  occupancy: number;
  foodAvailable: 'Abundant' | 'Adequate' | 'Low' | 'Depleted';
  waterAvailable: 'Abundant' | 'Adequate' | 'Low' | 'Depleted';
  medicalAssistance: boolean;
  accessible: boolean;
  contact: string;
  manager: string;
}

export interface MissingPerson {
  id: string;
  name: string;
  age: number;
  gender: string;
  lastKnownLocation: string;
  lastSeenTime: string;
  description: string;
  clothing: string;
  photoUrl?: string;
  contactPhone: string;
  contactPerson: string;
  status: 'MISSING' | 'LOCATED' | 'SAFE';
  reportedAt: string;
}

export interface EmergencyResource {
  id: string;
  name: string;
  category: 'Medical' | 'Food & Water' | 'Rescue Equipment' | 'Shelter Supplies' | 'Power & Fuel';
  quantity: number;
  available?: number;
  total?: number;
  unit: string;
  status: 'Available' | 'Low' | 'Critical';
  minThreshold: number;
  location: string;
}

export interface EmergencyAlert {
  id: string;
  title: string;
  type:
    | 'Flood Warning'
    | 'Cyclone Warning'
    | 'Evacuation Order'
    | 'Shelter Announcement'
    | 'Road Closure'
    | 'Missing Person Alert'
    | 'Medical Emergency'
    | 'All-Clear';
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'EXTREME';
  area: string;
  actionRequired: string;
  timestamp: string;
  issuedBy: string;
}

export interface EmergencyRoute {
  id: string;
  name: string;
  status: 'CLEAR' | 'HAZARDOUS' | 'BLOCKED' | 'FLOODED';
  description: string;
  distanceKm: number;
  estimatedMinutes: number;
  recommendedFor: string[];
  safeForAmbulance: boolean;
}

export interface ChatMessage {
  id: string;
  channel: 'citizen-responder' | 'responder-control' | 'hospital-control' | 'volunteer-control';
  incidentId?: string;
  senderRole: UserRole;
  senderName: string;
  text: string;
  timestamp: string;
  isEmergencyPreset?: boolean;
}

export interface DisasterZone {
  id: string;
  name: string;
  type: 'flood' | 'fire' | 'evacuation' | 'safe';
  radiusKm: number;
  center: { lat: number; lng: number };
  color: string;
  severity: SeverityLevel;
}
