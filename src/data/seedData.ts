import {
  Incident,
  Responder,
  Hospital,
  Shelter,
  MissingPerson,
  EmergencyResource,
  EmergencyAlert,
  EmergencyRoute,
  DisasterZone
} from '../types';

export const initialIncidents: Incident[] = [
  {
    id: 'DR-1042',
    title: 'Commercial Complex Structural Collapse',
    type: 'building_collapse',
    severity: 'CRITICAL',
    status: 'RESPONDER_ASSIGNED',
    description: 'Ground floor pillar failure caused partial collapse. 5 civilians confirmed trapped under concrete slab, breathing space limited.',
    location: {
      lat: 13.0827,
      lng: 80.2707,
      address: 'Shop #14, Mount Road, Anna Salai',
      area: 'Central District'
    },
    reportedBy: {
      name: 'Ramesh Kumar',
      phone: '+91 98401 22345',
      isAnonymous: false
    },
    affectedCount: 14,
    injuredCount: 6,
    trappedCount: 5,
    mediaUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=60',
    aiClassification: {
      category: 'Structural Collapse / High Hazard Search & Rescue',
      confidence: 0.94,
      severity: 'CRITICAL',
      reasoning: 'Critical structural failure with live trapped victims requiring hydraulic cutters, acoustic listening devices, and triage stabilization.',
      suggestedResponse: 'CRITICAL — 5 people trapped inside building — immediate heavy rescue and trauma paramedics dispatched.',
      recommendedEquipment: ['Heavy Hydraulic Cutters', 'Life Locator Radar', 'Air Cushion Lifting Bags', 'ALS Ambulance']
    },
    assignedResponderId: 'RESP-01',
    assignedResponderName: 'NDRF Task Force 4 (Heavy Rescue)',
    etaMinutes: 8,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    isSOS: true
  },
  {
    id: 'DR-1043',
    title: 'Severe Flash Flooding & Residential Inundation',
    type: 'flood',
    severity: 'HIGH',
    status: 'RESCUE_IN_PROGRESS',
    description: 'River embankment breached after intense rainfall. Water level at 5.5 feet and rising. Elderly residents stranded on terrace.',
    location: {
      lat: 13.0112,
      lng: 80.2215,
      address: 'Riverside Enclave, Saidapet Lowlands',
      area: 'Adyar Basin'
    },
    reportedBy: {
      name: 'Priya Sundaram',
      phone: '+91 97910 88712',
      isAnonymous: false
    },
    affectedCount: 32,
    injuredCount: 2,
    trappedCount: 18,
    mediaUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=60',
    aiClassification: {
      category: 'Urban Flood Evacuation',
      confidence: 0.91,
      severity: 'HIGH',
      reasoning: 'Rising flood waters cut off road access. Power transformer submerged; risk of electrocution and hypothermia.',
      suggestedResponse: 'HIGH — Inundation risk with 18 stranded civilians. Inflatable motorized boats and life vests essential.',
      recommendedEquipment: ['Inflatable Zodiac Rescue Boats', 'PFD Life Vests', 'Thermal Blankets', 'High Clearance Trucks']
    },
    assignedResponderId: 'RESP-03',
    assignedResponderName: 'Coast Guard / Marine Evacuation Unit 2',
    etaMinutes: 12,
    createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    isSOS: true,
    clusterId: 'CLUSTER-FLOOD-01',
    clusterCount: 4
  },
  {
    id: 'DR-1044',
    title: 'Chemical Warehouse Electrical Fire & Toxic Smoke',
    type: 'fire',
    severity: 'CRITICAL',
    status: 'VERIFIED',
    description: 'Storage facility chemical drums ignited. Dense black smoke spreading towards nearby residential colony downwind.',
    location: {
      lat: 13.1255,
      lng: 80.2032,
      address: 'Sector 4, Ambattur Industrial Estate',
      area: 'Northwest Zone'
    },
    reportedBy: {
      name: 'Security Officer Murugan',
      phone: '+91 94440 33119',
      isAnonymous: false
    },
    affectedCount: 45,
    injuredCount: 8,
    trappedCount: 2,
    mediaUrl: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800&auto=format&fit=crop&q=60',
    aiClassification: {
      category: 'Hazmat Fire Incident',
      confidence: 0.89,
      severity: 'CRITICAL',
      reasoning: 'Presence of volatile industrial solvents. Toxic plume trajectory threatens dense settlements within 1.5km radius.',
      suggestedResponse: 'CRITICAL — Chemical fire requiring foam tenders, SCBA gear, and immediate 800m evacuation cordon.',
      recommendedEquipment: ['Foam Fire Tender', 'SCBA Breathing Apparatus', 'Chemical Hazmat Suits', 'Multi-Gas Detectors']
    },
    assignedResponderId: 'RESP-02',
    assignedResponderName: 'Fire & Rescue Hazmat Team 7',
    etaMinutes: 6,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    isSOS: false
  },
  {
    id: 'DR-1045',
    title: 'Arterial Flyover Multi-Vehicle Collision',
    type: 'road_accident',
    severity: 'MEDIUM',
    status: 'REPORTED',
    description: 'Heavy oil spill on highway flyover caused 4-vehicle pile-up. Northbound lanes completely obstructed.',
    location: {
      lat: 13.0456,
      lng: 80.2514,
      address: 'Gemini Flyover Junction',
      area: 'Central Corridor'
    },
    reportedBy: {
      name: 'Traffic Observer Unit',
      phone: '+91 98840 55432',
      isAnonymous: false
    },
    affectedCount: 8,
    injuredCount: 3,
    trappedCount: 0,
    aiClassification: {
      category: 'Major Highway Accident',
      confidence: 0.92,
      severity: 'MEDIUM',
      reasoning: 'No trapped casualties; road blockage causes heavy gridlock affecting other emergency vehicle response corridors.',
      suggestedResponse: 'MEDIUM — Dispatch tow cranes, sand dispersal crew, and traffic diversion police.',
      recommendedEquipment: ['Heavy Tow Crane', 'Sand Dispersal Truck', 'Basic Life Support Ambulance']
    },
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    isSOS: false
  },
  {
    id: 'DR-1046',
    title: 'Landslide Debris Blocking Mountain Access Road',
    type: 'landslide',
    severity: 'HIGH',
    status: 'REPORTED',
    description: 'Heavy mudslide covered 120m stretch of access road. 2 passenger buses isolated upstream without drinking water.',
    location: {
      lat: 13.1502,
      lng: 80.1245,
      address: 'Outer Bypass Km 18, Hillside Pass',
      area: 'Western Ridge'
    },
    reportedBy: {
      name: 'Bus Conductor Selvan',
      phone: '+91 94451 99201',
      isAnonymous: false
    },
    affectedCount: 65,
    injuredCount: 1,
    trappedCount: 0,
    aiClassification: {
      category: 'Geological Landslide Obstruction',
      confidence: 0.88,
      severity: 'HIGH',
      reasoning: 'Vulnerable slope could slide further with subsequent rainfall. Civilians isolated from essential supply lines.',
      suggestedResponse: 'HIGH — Deploy earth-moving excavators and helicopter emergency food/water airdrop if road remains blocked.',
      recommendedEquipment: ['JCB Excavators', 'Dumpers', 'Emergency Food & Water Packs']
    },
    createdAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    isSOS: false
  }
];

export const initialResponders: Responder[] = [
  {
    id: 'RESP-01',
    name: 'NDRF Task Force 4',
    agency: 'National Disaster Response Force',
    status: 'DISPATCHED',
    location: {
      lat: 13.0805,
      lng: 80.2655,
      address: 'Central Station Sub-base',
      area: 'Central'
    },
    contact: '+91 44 2859 0001',
    currentIncidentId: 'DR-1042',
    skills: ['Collapse Search & Rescue', 'Trench Rescue', 'Acoustic Sound Detection'],
    vehicle: 'Heavy Rescue Tender 4x4',
    completedRescues: 48
  },
  {
    id: 'RESP-02',
    name: 'Hazmat Fire Brigade 7',
    agency: 'State Fire & Rescue Service',
    status: 'DISPATCHED',
    location: {
      lat: 13.1189,
      lng: 80.2104,
      address: 'Ambattur Industrial Fire Post',
      area: 'Northwest'
    },
    contact: '+91 44 2658 0101',
    currentIncidentId: 'DR-1044',
    skills: ['Chemical Hazards', 'Thermal Imaging', 'Foam Containment'],
    vehicle: 'High Capacity Foam Crash Tender',
    completedRescues: 62
  },
  {
    id: 'RESP-03',
    name: 'Coast Guard Marine Evac 2',
    agency: 'Indian Coast Guard & Marine Police',
    status: 'ON_SCENE',
    location: {
      lat: 13.0135,
      lng: 80.2241,
      address: 'Adyar Estuary Boat Station',
      area: 'Adyar Basin'
    },
    contact: '+91 44 2490 2200',
    currentIncidentId: 'DR-1043',
    skills: ['Swift Water Rescue', 'Boat Operations', 'Flood Evacuation'],
    vehicle: 'Twin-Engine Zodiac Inflatable Boats (x3)',
    completedRescues: 95
  },
  {
    id: 'RESP-04',
    name: 'EMS Trauma Quick Response Unit',
    agency: 'State Emergency Medical Services 108',
    status: 'AVAILABLE',
    location: {
      lat: 13.0722,
      lng: 80.2458,
      address: 'Kilpauk Medical Hub',
      area: 'Kilpauk'
    },
    contact: '+91 44 2836 1080',
    skills: ['Advanced Cardiac Life Support', 'Triage Assessment', 'Trauma Stabilization'],
    vehicle: 'Advance Life Support Ambulance #108-A',
    completedRescues: 134
  },
  {
    id: 'RESP-05',
    name: 'Civil Defense Mountain Rescue Alpha',
    agency: 'State Disaster Management Authority',
    status: 'AVAILABLE',
    location: {
      lat: 13.1412,
      lng: 80.1389,
      address: 'Avadi Camp Base',
      area: 'Western Ridge'
    },
    contact: '+91 44 2638 4400',
    skills: ['Rope Evacuation', 'Earthmover Coordination', 'All-Terrain Transport'],
    vehicle: 'All-Terrain Rapid Unimog',
    completedRescues: 37
  }
];

export const initialHospitals: Hospital[] = [
  {
    id: 'HOSP-01',
    name: 'Rajiv Gandhi Government General Hospital',
    location: {
      lat: 13.0818,
      lng: 80.2785,
      address: 'EVR Periyar Salai, Park Town',
      area: 'Central'
    },
    totalBeds: 500,
    availableBeds: 84,
    totalICU: 80,
    availableICU: 11,
    availableAmbulances: 8,
    bloodBankStatus: 'Normal',
    emergencyLoad: 'High',
    contact: '+91 44 2530 5000',
    specializedServices: ['Level 1 Trauma Center', 'Burn Intensive Care', 'Hyperbaric Oxygen', '24/7 Neurosurgery']
  },
  {
    id: 'HOSP-02',
    name: 'Apollo Speciality Emergency Trauma Center',
    location: {
      lat: 13.0569,
      lng: 80.2527,
      address: 'Greams Road, Thousand Lights',
      area: 'Central South'
    },
    totalBeds: 350,
    availableBeds: 42,
    totalICU: 60,
    availableICU: 9,
    availableAmbulances: 6,
    bloodBankStatus: 'Normal',
    emergencyLoad: 'Moderate',
    contact: '+91 44 2829 0200',
    specializedServices: ['Pediatric ICU', 'Toxicology & Poison Center', 'Cardiac Emergency']
  },
  {
    id: 'HOSP-03',
    name: 'Stanley Medical College & Disaster Ward',
    location: {
      lat: 13.1072,
      lng: 80.2878,
      address: 'Old Jail Road, Royapuram',
      area: 'North'
    },
    totalBeds: 420,
    availableBeds: 112,
    totalICU: 50,
    availableICU: 14,
    availableAmbulances: 5,
    bloodBankStatus: 'Low',
    emergencyLoad: 'Moderate',
    contact: '+91 44 2528 1351',
    specializedServices: ['Mass Casualty Treatment', 'Infectious Disease Ward', 'Orthopedic Surgery']
  },
  {
    id: 'HOSP-04',
    name: 'Fortis Malar Emergency Center',
    location: {
      lat: 13.0063,
      lng: 80.2575,
      address: 'Gandhi Nagar, Adyar',
      area: 'South Adyar'
    },
    totalBeds: 180,
    availableBeds: 21,
    totalICU: 30,
    availableICU: 3,
    availableAmbulances: 4,
    bloodBankStatus: 'Normal',
    emergencyLoad: 'Overcapacity',
    contact: '+91 44 4289 2222',
    specializedServices: ['Vascular Emergency', 'Emergency Dialysis', 'Triage Station']
  }
];

export const initialShelters: Shelter[] = [
  {
    id: 'SHLT-01',
    name: 'Jawaharlal Nehru Indoor Relief Complex',
    location: {
      lat: 13.0845,
      lng: 80.2731,
      address: 'Sydenhams Road, Periamet',
      area: 'Central'
    },
    capacity: 1200,
    occupancy: 640,
    foodAvailable: 'Abundant',
    waterAvailable: 'Abundant',
    medicalAssistance: true,
    accessible: true,
    contact: '+91 44 2561 9901',
    manager: 'Officer S. Anbarasu (Revenue Dept)'
  },
  {
    id: 'SHLT-02',
    name: 'Guindy Higher Secondary School Camp',
    location: {
      lat: 13.0084,
      lng: 80.2144,
      address: 'Race Course Road, Guindy',
      area: 'South Inland'
    },
    capacity: 650,
    occupancy: 510,
    foodAvailable: 'Adequate',
    waterAvailable: 'Adequate',
    medicalAssistance: true,
    accessible: true,
    contact: '+91 44 2235 8812',
    manager: 'K. Meenakshi (SDMA Volunteer Lead)'
  },
  {
    id: 'SHLT-03',
    name: 'Anna Community Center & Evacuation Shelter',
    location: {
      lat: 13.0882,
      lng: 80.2163,
      address: '2nd Avenue, Anna Nagar',
      area: 'Northwest'
    },
    capacity: 500,
    occupancy: 210,
    foodAvailable: 'Abundant',
    waterAvailable: 'Abundant',
    medicalAssistance: true,
    accessible: false,
    contact: '+91 44 2621 3340',
    manager: 'V. Sundaram (Corporation Official)'
  },
  {
    id: 'SHLT-04',
    name: 'St. Thomas Mount Parish Relief Hall',
    location: {
      lat: 12.9984,
      lng: 80.1925,
      address: 'Hilltop Church Ground, St. Thomas Mount',
      area: 'Elevated High Ground'
    },
    capacity: 400,
    occupancy: 385,
    foodAvailable: 'Low',
    waterAvailable: 'Adequate',
    medicalAssistance: false,
    accessible: false,
    contact: '+91 44 2232 1109',
    manager: 'Father George Mathew'
  }
];

export const initialMissingPersons: MissingPerson[] = [
  {
    id: 'MP-401',
    name: 'Aarav Nathan',
    age: 9,
    gender: 'Male',
    lastKnownLocation: 'Near Riverside Park, Saidapet when flood warning sounded',
    lastSeenTime: 'Today, 2:30 PM',
    description: 'Wearing school uniform (blue polo shirt, khaki shorts). Carrying a black backpack with dinosaur sticker.',
    clothing: 'Navy blue polo, khaki shorts, blue sports shoes',
    contactPhone: '+91 98410 77334',
    contactPerson: 'Kavitha Nathan (Mother)',
    status: 'MISSING',
    reportedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  },
  {
    id: 'MP-402',
    name: 'Mrs. Lakshmi Narayanan',
    age: 72,
    gender: 'Female',
    lastKnownLocation: 'Mount Road Bus Stop during evacuation commotion',
    lastSeenTime: 'Today, 11:15 AM',
    description: 'Requires cardiac medication. Speaks Tamil. Hard of hearing.',
    clothing: 'Maroon Kanjeevaram cotton saree, silver eyeglasses, walking cane',
    contactPhone: '+91 94441 55092',
    contactPerson: 'Dr. S. Narayanan (Son)',
    status: 'LOCATED',
    reportedAt: new Date(Date.now() - 7 * 3600 * 1000).toISOString()
  },
  {
    id: 'MP-403',
    name: 'Deepak Sharma',
    age: 26,
    gender: 'Male',
    lastKnownLocation: 'Ambattur Industrial Estate Warehouse loading dock',
    lastSeenTime: 'Today, 3:45 PM',
    description: 'Electrical engineer on duty before the industrial fire broke out.',
    clothing: 'Yellow high-visibility jacket, denim jeans, work boots',
    contactPhone: '+91 99620 44101',
    contactPerson: 'Anjali Sharma (Wife)',
    status: 'SAFE',
    reportedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  }
];

export const initialResources: EmergencyResource[] = [
  {
    id: 'RES-01',
    name: 'Packaged Mineral Water (1L)',
    category: 'Food & Water',
    quantity: 14500,
    unit: 'Bottles',
    status: 'Available',
    minThreshold: 3000,
    location: 'Central Civil Supplies Godown'
  },
  {
    id: 'RES-02',
    name: 'Ready-to-Eat Emergency Food Packs',
    category: 'Food & Water',
    quantity: 8200,
    unit: 'Meals',
    status: 'Available',
    minThreshold: 2500,
    location: 'Central Civil Supplies Godown'
  },
  {
    id: 'RES-03',
    name: 'Thermal Blankets & Sleeping Mats',
    category: 'Shelter Supplies',
    quantity: 3400,
    unit: 'Sets',
    status: 'Available',
    minThreshold: 1000,
    location: 'Red Cross Depot'
  },
  {
    id: 'RES-04',
    name: 'Inflatable Zodiac Rescue Boats',
    category: 'Rescue Equipment',
    quantity: 14,
    unit: 'Boats',
    status: 'Low',
    minThreshold: 10,
    location: 'Marina Marine Station'
  },
  {
    id: 'RES-05',
    name: 'O-Negative Emergency Blood Units',
    category: 'Medical',
    quantity: 18,
    unit: 'Units',
    status: 'Critical',
    minThreshold: 25,
    location: 'Central Blood Bank'
  },
  {
    id: 'RES-06',
    name: 'Portable Silent Diesel Generators (15kVA)',
    category: 'Power & Fuel',
    quantity: 8,
    unit: 'Generators',
    status: 'Low',
    minThreshold: 12,
    location: 'Disaster Logistics Depot'
  },
  {
    id: 'RES-07',
    name: 'Trauma First-Aid Sterile Kits',
    category: 'Medical',
    quantity: 650,
    unit: 'Kits',
    status: 'Available',
    minThreshold: 200,
    location: 'Medical Supply Hub'
  }
];

export const initialAlerts: EmergencyAlert[] = [
  {
    id: 'ALT-01',
    title: 'Severe Cyclone & Coastal Storm Surge Warning',
    type: 'Cyclone Warning',
    severity: 'EXTREME',
    area: 'Coastal Belts & Low-Lying Districts (0 - 5 km from shoreline)',
    actionRequired: 'Move to designated cyclone shelters immediately. Switch off main gas and power circuits. Avoid low bridges.',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    issuedBy: 'National Disaster Management Authority (NDMA)'
  },
  {
    id: 'ALT-02',
    title: 'Flash Flood Alert & River Embankment Spillover',
    type: 'Flood Warning',
    severity: 'CRITICAL',
    area: 'Adyar & Saidapet River Corridor',
    actionRequired: 'Ground floor residents evacuate to upper floors or nearest designated relief camp (Guindy / Nehru Complex).',
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    issuedBy: 'State Emergency Operations Center'
  },
  {
    id: 'ALT-03',
    title: 'Chemical Fire Plume & Road Closure Notice',
    type: 'Road Closure',
    severity: 'WARNING',
    area: 'Ambattur Industrial Estate 1.5km Radius',
    actionRequired: 'Ambattur Main Highway closed. Keep windows sealed, use N95 masks if outdoors, divert via Outer Bypass.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    issuedBy: 'Fire & Rescue Incident Command'
  }
];

export const initialRoutes: EmergencyRoute[] = [
  {
    id: 'RT-01',
    name: 'Poonamallee High Road Medical Corridor',
    status: 'CLEAR',
    description: 'Designated high-speed emergency green corridor connecting central hospitals. Police escort available.',
    distanceKm: 8.4,
    estimatedMinutes: 14,
    recommendedFor: ['Ambulances', 'First Responders', 'Civilian Evacuees'],
    safeForAmbulance: true
  },
  {
    id: 'RT-02',
    name: 'Mount Road (Anna Salai) - Central Segment',
    status: 'HAZARDOUS',
    description: 'Heavy traffic slowdown near collapse site (#DR-1042). Reduced to single lane.',
    distanceKm: 6.2,
    estimatedMinutes: 28,
    recommendedFor: ['Light Vehicles Only'],
    safeForAmbulance: false
  },
  {
    id: 'RT-03',
    name: 'Adyar Causeway & Low Causeway Bridge',
    status: 'FLOODED',
    description: 'Submerged under 4.5 feet water. Completely impassable to vehicular traffic. Boats deployed.',
    distanceKm: 3.1,
    estimatedMinutes: 0,
    recommendedFor: ['Rescue Boats Only - NO VEHICLES'],
    safeForAmbulance: false
  },
  {
    id: 'RT-04',
    name: 'Outer Ring Expressway Evacuation Highway',
    status: 'CLEAR',
    description: 'Elevated multi-lane arterial road open for mass outbound evacuation and heavy logistics convoys.',
    distanceKm: 22.5,
    estimatedMinutes: 20,
    recommendedFor: ['Evacuation Convoys', 'Supply Trucks', 'General Public'],
    safeForAmbulance: true
  }
];

export const initialDisasterZones: DisasterZone[] = [
  {
    id: 'ZONE-01',
    name: 'Adyar River Flood Inundation Zone',
    type: 'flood',
    radiusKm: 3.2,
    center: { lat: 13.0112, lng: 80.2215 },
    color: '#3b82f6',
    severity: 'HIGH'
  },
  {
    id: 'ZONE-02',
    name: 'Ambattur Hazmat Smoke Dispersion Perimeter',
    type: 'fire',
    radiusKm: 2.0,
    center: { lat: 13.1255, lng: 80.2032 },
    color: '#ef4444',
    severity: 'CRITICAL'
  },
  {
    id: 'ZONE-03',
    name: 'Coastal Low-lying Cyclone Evacuation Belt',
    type: 'evacuation',
    radiusKm: 4.8,
    center: { lat: 13.0456, lng: 80.2820 },
    color: '#f97316',
    severity: 'CRITICAL'
  },
  {
    id: 'ZONE-04',
    name: 'St. Thomas Mount High Altitude Safe Zone',
    type: 'safe',
    radiusKm: 2.5,
    center: { lat: 12.9984, lng: 80.1925 },
    color: '#10b981',
    severity: 'LOW'
  }
];

export const emergencyContactsList = [
  { category: 'National Emergency Number', number: '112', description: 'Single all-in-one emergency helpline', free: true },
  { category: 'Police Control Room', number: '100', description: 'Rapid police dispatch & security', free: true },
  { category: 'Fire & Disaster Rescue', number: '101', description: 'Fire tenders, collapse rescue, extraction', free: true },
  { category: 'Ambulance & Medical Emergency', number: '108', description: 'Government trauma & ALS ambulance', free: true },
  { category: 'Disaster Management Helpline', number: '1070', description: 'State Disaster Management Authority (SDMA)', free: true },
  { category: 'District Control Room', number: '1077', description: 'Local Collectorate emergency coordination', free: true },
  { category: 'Women & Child Helpline', number: '1091', description: 'Specialized support & vulnerable citizen aid', free: true },
  { category: 'Coast Guard Emergency', number: '1554', description: 'Marine search & maritime flood rescue', free: true }
];
