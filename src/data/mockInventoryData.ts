import { InventoryItem, StockLocation, AuditRecord, PurchaseRequest, ProjectComponent } from '@/types/inventory';

// ============= LOCALSTORAGE KEYS =============
const INVENTORY_STORAGE_KEY = 'inventory_items';
const PURCHASE_REQUESTS_STORAGE_KEY = 'purchase_requests';
const AUDIT_RECORDS_STORAGE_KEY = 'audit_records';
const COMPONENTS_STORAGE_KEY = 'project_components';

// ============= DEFAULT INVENTORY DATA =============
const defaultInventoryItems: Record<string, InventoryItem[]> = {
  'inst-msd-001': [
    {
      id: 'item_msd_001',
      item_code: 'TECH-MSD-001',
      name: '3D Printer - Ultimaker S5',
      category: 'technology',
      description: 'Professional 3D printer for prototyping and innovation projects',
      manufacturer: 'Ultimaker',
      model_number: 'S5',
      serial_number: 'UM-S5-2023-1234',
      quantity: 2,
      unit: 'units',
      location: 'Innovation Lab A',
      condition: 'good',
      unit_price: 350000,
      total_value: 700000,
      purchase_date: '2023-06-15',
      warranty_expiry: '2026-06-15',
      last_audited: '2024-11-15',
      assigned_to: 'Mr. Atif Ansari',
      maintenance_schedule: 'monthly',
      last_maintenance: '2024-11-05',
      status: 'active',
    },
    {
      id: 'item_msd_002',
      item_code: 'TECH-MSD-002',
      name: 'Arduino Mega Kits',
      category: 'technology',
      description: 'Microcontroller development boards with sensors',
      manufacturer: 'Arduino',
      model_number: 'Mega 2560',
      quantity: 25,
      unit: 'sets',
      location: 'Electronics Lab',
      condition: 'good',
      unit_price: 3500,
      total_value: 87500,
      purchase_date: '2023-08-20',
      warranty_expiry: '2025-08-20',
      last_audited: '2024-11-15',
      maintenance_schedule: 'quarterly',
      status: 'active',
    },
    {
      id: 'item_msd_003',
      item_code: 'TOOL-MSD-001',
      name: 'Soldering Stations - Weller',
      category: 'tools',
      description: 'Professional soldering stations for electronics work',
      manufacturer: 'Weller',
      model_number: 'WE 1010',
      quantity: 10,
      unit: 'units',
      location: 'Electronics Lab',
      condition: 'good',
      unit_price: 12000,
      total_value: 120000,
      purchase_date: '2023-05-10',
      warranty_expiry: '2026-05-10',
      last_audited: '2024-11-15',
      maintenance_schedule: 'monthly',
      status: 'active',
    },
    {
      id: 'item_msd_004',
      item_code: 'EQUIP-MSD-001',
      name: 'Oscilloscope - Tektronix',
      category: 'equipment',
      description: 'Digital storage oscilloscope for circuit testing',
      manufacturer: 'Tektronix',
      model_number: 'TBS2104',
      quantity: 5,
      unit: 'units',
      location: 'Electronics Lab',
      condition: 'good',
      unit_price: 85000,
      total_value: 425000,
      purchase_date: '2023-07-01',
      warranty_expiry: '2026-07-01',
      last_audited: '2024-11-15',
      maintenance_schedule: 'quarterly',
      status: 'active',
    },
    {
      id: 'item_msd_005',
      item_code: 'TECH-MSD-003',
      name: 'VR Headsets - Meta Quest 2',
      category: 'technology',
      description: 'Virtual reality headsets for immersive learning',
      manufacturer: 'Meta',
      model_number: 'Quest 2 256GB',
      quantity: 8,
      unit: 'units',
      location: 'Innovation Lab B',
      condition: 'good',
      unit_price: 35000,
      total_value: 280000,
      purchase_date: '2023-11-01',
      warranty_expiry: '2025-11-01',
      last_audited: '2024-11-15',
      status: 'active',
    },
    {
      id: 'item_msd_006',
      item_code: 'CONS-MSD-001',
      name: 'Safety Goggles',
      category: 'consumables',
      description: 'Protective eyewear for lab work',
      quantity: 50,
      unit: 'pieces',
      location: 'Store Room',
      condition: 'new',
      unit_price: 350,
      total_value: 17500,
      purchase_date: '2024-01-05',
      last_audited: '2024-11-15',
      status: 'active',
      notes: 'Reorder when quantity drops below 20',
    },
  ],
  'inst-kga-001': [
    {
      id: 'item_kga_001',
      item_code: 'TECH-KGA-001',
      name: 'Laser Cutter - Universal',
      category: 'technology',
      description: 'CO2 laser cutter for precision cutting',
      manufacturer: 'Universal Laser Systems',
      model_number: 'VLS3.50',
      serial_number: 'ULS-VLS-2023',
      quantity: 1,
      unit: 'units',
      location: 'Fabrication Lab',
      condition: 'good',
      unit_price: 450000,
      total_value: 450000,
      purchase_date: '2023-05-20',
      warranty_expiry: '2026-05-20',
      last_audited: '2024-11-20',
      assigned_to: 'Mr. Saran T',
      maintenance_schedule: 'monthly',
      last_maintenance: '2024-11-15',
      status: 'active',
    },
    {
      id: 'item_kga_002',
      item_code: 'TECH-KGA-002',
      name: 'Raspberry Pi 4 Model B (8GB)',
      category: 'technology',
      description: 'Single-board computer for IoT projects',
      manufacturer: 'Raspberry Pi Foundation',
      model_number: 'Pi 4B 8GB',
      quantity: 20,
      unit: 'units',
      location: 'Innovation Lab',
      condition: 'good',
      unit_price: 7500,
      total_value: 150000,
      purchase_date: '2023-09-10',
      warranty_expiry: '2024-09-10',
      last_audited: '2024-11-20',
      status: 'active',
    },
    {
      id: 'item_kga_003',
      item_code: 'EQUIP-KGA-001',
      name: 'CNC Router',
      category: 'equipment',
      description: 'Computer-controlled router for wood and plastic',
      manufacturer: 'ShopBot',
      model_number: 'Desktop MAX',
      quantity: 1,
      unit: 'units',
      location: 'Workshop',
      condition: 'good',
      unit_price: 350000,
      total_value: 350000,
      purchase_date: '2022-10-15',
      warranty_expiry: '2024-10-15',
      last_audited: '2024-11-20',
      assigned_to: 'Mr. Sreeram R',
      maintenance_schedule: 'monthly',
      last_maintenance: '2024-11-10',
      status: 'active',
    },
    {
      id: 'item_kga_004',
      item_code: 'TOOL-KGA-001',
      name: 'Digital Multimeters - Fluke',
      category: 'tools',
      description: 'Professional multimeters for electrical measurements',
      manufacturer: 'Fluke',
      model_number: '117',
      quantity: 15,
      unit: 'units',
      location: 'Electronics Lab',
      condition: 'good',
      unit_price: 15000,
      total_value: 225000,
      purchase_date: '2023-06-20',
      warranty_expiry: '2026-06-20',
      last_audited: '2024-11-20',
      status: 'active',
    },
    {
      id: 'item_kga_005',
      item_code: 'TECH-KGA-003',
      name: 'Drone Kit - DJI Tello EDU',
      category: 'technology',
      description: 'Educational drone for programming and aerial robotics',
      manufacturer: 'DJI',
      model_number: 'Tello EDU',
      quantity: 10,
      unit: 'units',
      location: 'Innovation Lab',
      condition: 'good',
      unit_price: 12000,
      total_value: 120000,
      purchase_date: '2024-02-15',
      warranty_expiry: '2025-02-15',
      last_audited: '2024-11-20',
      status: 'active',
    },
  ],
};

// ============= DEFAULT STOCK LOCATIONS =============
const defaultStockLocations: Record<string, StockLocation[]> = {
  'inst-msd-001': [
    {
      location_id: 'loc_msd_001',
      location_name: 'Innovation Lab A',
      type: 'lab',
      capacity: 150,
      current_items: 42,
      responsible_person: 'Mr. Atif Ansari',
    },
    {
      location_id: 'loc_msd_002',
      location_name: 'Electronics Lab',
      type: 'lab',
      capacity: 120,
      current_items: 98,
      responsible_person: 'Mr. Atif Ansari',
    },
    {
      location_id: 'loc_msd_003',
      location_name: 'Store Room',
      type: 'store',
      capacity: 200,
      current_items: 145,
      responsible_person: 'Mr. Atif Ansari',
    },
  ],
  'inst-kga-001': [
    {
      location_id: 'loc_kga_001',
      location_name: 'Fabrication Lab',
      type: 'lab',
      capacity: 80,
      current_items: 65,
      responsible_person: 'Mr. Saran T',
    },
    {
      location_id: 'loc_kga_002',
      location_name: 'Innovation Lab',
      type: 'lab',
      capacity: 140,
      current_items: 118,
      responsible_person: 'Mr. Sreeram R',
    },
    {
      location_id: 'loc_kga_003',
      location_name: 'Electronics Lab',
      type: 'lab',
      capacity: 100,
      current_items: 78,
      responsible_person: 'Mr. Saran T',
    },
  ],
};

// ============= DEFAULT AUDIT RECORDS =============
const defaultAuditRecords: Record<string, AuditRecord[]> = {
  'inst-msd-001': [
    {
      audit_id: 'audit_msd_001',
      audit_date: '2024-11-15',
      audited_by: 'Mr. Atif Ansari',
      items_checked: 100,
      discrepancies: 2,
      missing_items: ['TECH-045'],
      damaged_items: ['EQUIP-112'],
      newly_added: ['TECH-MSD-003'],
      notes: 'Monthly audit completed. Minor discrepancies found in Lab B storage. VR headsets added to inventory.',
      status: 'completed',
    },
    {
      audit_id: 'audit_msd_002',
      audit_date: '2024-10-15',
      audited_by: 'Mr. Atif Ansari',
      items_checked: 95,
      discrepancies: 0,
      missing_items: [],
      damaged_items: [],
      newly_added: [],
      notes: 'Monthly audit completed. All items accounted for. Excellent inventory management.',
      status: 'completed',
    },
  ],
  'inst-kga-001': [
    {
      audit_id: 'audit_kga_001',
      audit_date: '2024-11-20',
      audited_by: 'Mr. Saran T',
      items_checked: 47,
      discrepancies: 1,
      missing_items: [],
      damaged_items: ['TOOL-023'],
      newly_added: ['TECH-KGA-003'],
      notes: 'Monthly audit completed. One multimeter needs calibration. Drone kits added to inventory.',
      status: 'completed',
    },
    {
      audit_id: 'audit_kga_002',
      audit_date: '2024-10-20',
      audited_by: 'Mr. Sreeram R',
      items_checked: 42,
      discrepancies: 0,
      missing_items: [],
      damaged_items: [],
      newly_added: [],
      notes: 'Monthly audit completed. All items in good condition.',
      status: 'completed',
    },
  ],
};

// ============= DEFAULT PURCHASE REQUESTS =============
const defaultPurchaseRequests: PurchaseRequest[] = [
  // Pending System Admin Review (First Stage - Officer just created)
  {
    id: 'pr-001',
    request_code: 'PR-2024-001',
    officer_id: 'off-msd-001',
    officer_name: 'Mr. Atif Ansari',
    institution_id: 'inst-msd-001',
    institution_name: 'Modern School Vasant Vihar',
    items: [
      {
        item_name: '3D Printer Filament (PLA)',
        category: 'consumables',
        quantity: 10,
        unit: 'rolls',
        estimated_unit_price: 500,
        estimated_total: 5000,
        justification: 'Required for upcoming robotics workshop with Class 8A and 8B',
      },
    ],
    total_estimated_cost: 5000,
    justification: 'Current stock depleted. Essential for planned workshops this month.',
    priority: 'normal',
    status: 'pending_system_admin',
    created_at: '2024-11-25T10:00:00Z',
    updated_at: '2024-11-25T10:00:00Z',
  },
  {
    id: 'pr-002',
    request_code: 'PR-2024-002',
    officer_id: 'off-msd-001',
    officer_name: 'Mr. Atif Ansari',
    institution_id: 'inst-msd-001',
    institution_name: 'Modern School Vasant Vihar',
    items: [
      {
        item_name: 'Arduino Mega Boards',
        category: 'technology',
        quantity: 15,
        unit: 'units',
        estimated_unit_price: 1200,
        estimated_total: 18000,
      },
      {
        item_name: 'Motor Driver Shields',
        category: 'technology',
        quantity: 15,
        unit: 'units',
        estimated_unit_price: 350,
        estimated_total: 5250,
      },
    ],
    total_estimated_cost: 23250,
    justification: 'Expanding IoT course capacity. Current Arduino Uno kits insufficient for advanced projects.',
    priority: 'urgent',
    status: 'pending_system_admin',
    created_at: '2024-11-26T14:30:00Z',
    updated_at: '2024-11-26T14:30:00Z',
  },

  // Approved by System Admin, Pending Institution (Second Stage)
  {
    id: 'pr-003',
    request_code: 'PR-2024-003',
    officer_id: 'off-kga-001',
    officer_name: 'Mr. Saran T',
    institution_id: 'inst-kga-001',
    institution_name: 'Kikani Global Academy',
    items: [
      {
        item_name: 'Ultrasonic Sensors (HC-SR04)',
        category: 'equipment',
        quantity: 25,
        unit: 'units',
        estimated_unit_price: 150,
        estimated_total: 3750,
      },
      {
        item_name: 'Breadboards',
        category: 'equipment',
        quantity: 25,
        unit: 'units',
        estimated_unit_price: 200,
        estimated_total: 5000,
      },
    ],
    total_estimated_cost: 8750,
    justification: 'Robotics project requirements for semester-end exhibition.',
    priority: 'normal',
    status: 'pending_institution_approval',
    system_admin_reviewed_by: 'sysadmin-001',
    system_admin_reviewed_by_name: 'John Doe',
    system_admin_reviewed_at: '2024-11-20T09:00:00Z',
    system_admin_review_comments: 'Request verified. Forwarding to institution for budget approval.',
    created_at: '2024-11-18T09:00:00Z',
    updated_at: '2024-11-20T09:00:00Z',
  },

  // Approved by Institution (Third Stage - Ready for System Admin to Process)
  {
    id: 'pr-004',
    request_code: 'PR-2024-004',
    officer_id: 'off-msd-001',
    officer_name: 'Mr. Atif Ansari',
    institution_id: 'inst-msd-001',
    institution_name: 'Modern School Vasant Vihar',
    items: [
      {
        item_name: 'Raspberry Pi 4 Model B (8GB)',
        category: 'technology',
        quantity: 10,
        unit: 'units',
        estimated_unit_price: 7500,
        estimated_total: 75000,
      },
    ],
    total_estimated_cost: 75000,
    justification: 'AI/ML course requires edge computing devices for hands-on projects.',
    priority: 'normal',
    status: 'approved_by_institution',
    system_admin_reviewed_by: 'sysadmin-001',
    system_admin_reviewed_by_name: 'John Doe',
    system_admin_reviewed_at: '2024-11-15T08:00:00Z',
    system_admin_review_comments: 'Good justification. Forwarding to institution.',
    institution_approved_by: 'mgmt-msd-001',
    institution_approved_by_name: 'Dr. Kavita Sharma',
    institution_approved_at: '2024-11-17T10:00:00Z',
    institution_comments: 'Approved for AI/ML course expansion.',
    created_at: '2024-11-14T08:00:00Z',
    updated_at: '2024-11-17T10:00:00Z',
  },

  // In Progress (System Admin Processing Order)
  {
    id: 'pr-005',
    request_code: 'PR-2024-005',
    officer_id: 'off-kga-002',
    officer_name: 'Mr. Sreeram R',
    institution_id: 'inst-kga-001',
    institution_name: 'Kikani Global Academy',
    items: [
      {
        item_name: 'Soldering Kits',
        category: 'tools',
        quantity: 20,
        unit: 'sets',
        estimated_unit_price: 2500,
        estimated_total: 50000,
      },
    ],
    total_estimated_cost: 50000,
    justification: 'Electronics lab expansion for new batch of students.',
    priority: 'normal',
    status: 'in_progress',
    system_admin_reviewed_by: 'sysadmin-001',
    system_admin_reviewed_by_name: 'John Doe',
    system_admin_reviewed_at: '2024-11-10T09:00:00Z',
    system_admin_review_comments: 'Verified specifications. Forwarding to institution.',
    institution_approved_by: 'mgmt-kga-001',
    institution_approved_by_name: 'Mr. Suresh Kikani',
    institution_approved_at: '2024-11-12T10:00:00Z',
    institution_comments: 'Approved. Budget allocated.',
    system_admin_processed_by: 'sysadmin-001',
    system_admin_processed_by_name: 'John Doe',
    system_admin_processed_at: '2024-11-20T14:00:00Z',
    system_admin_processing_comments: 'Order placed with supplier. Expected delivery in 7-10 days.',
    created_at: '2024-11-08T08:00:00Z',
    updated_at: '2024-11-20T14:00:00Z',
  },

  // Fulfilled
  {
    id: 'pr-006',
    request_code: 'PR-2024-006',
    officer_id: 'off-msd-001',
    officer_name: 'Mr. Atif Ansari',
    institution_id: 'inst-msd-001',
    institution_name: 'Modern School Vasant Vihar',
    items: [
      {
        item_name: 'Safety Goggles',
        category: 'consumables',
        quantity: 50,
        unit: 'pieces',
        estimated_unit_price: 350,
        estimated_total: 17500,
      },
    ],
    total_estimated_cost: 17500,
    justification: 'Mandatory safety equipment for all lab activities.',
    priority: 'urgent',
    status: 'fulfilled',
    system_admin_reviewed_by: 'sysadmin-001',
    system_admin_reviewed_by_name: 'John Doe',
    system_admin_reviewed_at: '2024-10-19T09:00:00Z',
    system_admin_review_comments: 'Safety equipment priority. Forwarding immediately.',
    institution_approved_by: 'mgmt-msd-001',
    institution_approved_by_name: 'Dr. Kavita Sharma',
    institution_approved_at: '2024-10-20T09:00:00Z',
    institution_comments: 'Approved. Critical safety requirement.',
    system_admin_processed_by: 'sysadmin-001',
    system_admin_processed_by_name: 'John Doe',
    system_admin_processed_at: '2024-10-21T10:00:00Z',
    system_admin_processing_comments: 'Expedited order placed.',
    fulfillment_details: 'Items delivered and added to Modern School inventory. Stock updated.',
    fulfillment_date: '2024-10-25T15:00:00Z',
    created_at: '2024-10-18T10:00:00Z',
    updated_at: '2024-10-25T15:00:00Z',
  },

  // Rejected by Institution
  {
    id: 'pr-007',
    request_code: 'PR-2024-007',
    officer_id: 'off-kga-001',
    officer_name: 'Mr. Saran T',
    institution_id: 'inst-kga-001',
    institution_name: 'Kikani Global Academy',
    items: [
      {
        item_name: 'VR Headsets (Meta Quest 3)',
        category: 'technology',
        quantity: 5,
        unit: 'units',
        estimated_unit_price: 45000,
        estimated_total: 225000,
      },
    ],
    total_estimated_cost: 225000,
    justification: 'Upgrade existing VR equipment for immersive learning experiences.',
    priority: 'low',
    status: 'rejected_by_institution',
    system_admin_reviewed_by: 'sysadmin-001',
    system_admin_reviewed_by_name: 'John Doe',
    system_admin_reviewed_at: '2024-10-11T09:00:00Z',
    system_admin_review_comments: 'Specifications verified. Forwarding to institution for budget approval.',
    institution_rejection_reason: 'Budget constraints. Current VR headsets are sufficient. Re-evaluate next fiscal year.',
    created_at: '2024-10-10T11:00:00Z',
    updated_at: '2024-10-12T14:00:00Z',
  },

  // Rejected by System Admin
  {
    id: 'pr-008',
    request_code: 'PR-2024-008',
    officer_id: 'off-msd-001',
    officer_name: 'Mr. Atif Ansari',
    institution_id: 'inst-msd-001',
    institution_name: 'Modern School Vasant Vihar',
    items: [
      {
        item_name: 'CNC Router (Industrial Grade)',
        category: 'equipment',
        quantity: 1,
        unit: 'unit',
        estimated_unit_price: 750000,
        estimated_total: 750000,
      },
    ],
    total_estimated_cost: 750000,
    justification: 'Advanced fabrication capabilities for engineering projects.',
    priority: 'normal',
    status: 'rejected_by_system_admin',
    system_admin_reviewed_by: 'sysadmin-001',
    system_admin_reviewed_by_name: 'John Doe',
    system_admin_reviewed_at: '2024-09-15T10:00:00Z',
    system_admin_rejection_reason: 'Central procurement policy requires tendering process for equipment above ₹500,000. Please submit formal tender request.',
    created_at: '2024-09-10T09:00:00Z',
    updated_at: '2024-09-15T10:00:00Z',
  },
];

// ============= DEFAULT PROJECT COMPONENTS =============
const defaultProjectComponents: ProjectComponent[] = [
  {
    id: 'comp-001',
    component_code: 'COMP-MSD-001',
    name: 'Arduino Uno R3',
    category: 'electronics',
    description: 'Microcontroller board for IoT projects',
    specifications: 'ATmega328P, 14 digital I/O pins, 6 analog inputs',
    manufacturer: 'Arduino',
    part_number: 'A000066',
    required_quantity: 15,
    unit: 'pieces',
    estimated_unit_price: 450,
    estimated_total: 6750,
    status: 'needed',
    project_id: 'proj-001',
    project_name: 'IoT-Based Smart Home Automation',
    priority: 'high',
    justification: 'Required for student project prototyping',
    added_by_officer_id: 'off-msd-001',
    added_by_officer_name: 'Mr. Atif Ansari',
    created_at: '2024-10-25',
    updated_at: '2024-10-25'
  },
  {
    id: 'comp-002',
    component_code: 'COMP-MSD-002',
    name: 'DHT22 Temperature & Humidity Sensor',
    category: 'sensors',
    description: 'Digital temperature and humidity sensor',
    specifications: '-40°C to 80°C, 0-100% RH',
    required_quantity: 20,
    unit: 'pieces',
    estimated_unit_price: 150,
    estimated_total: 3000,
    status: 'needed',
    project_id: 'proj-001',
    project_name: 'IoT-Based Smart Home Automation',
    priority: 'medium',
    added_by_officer_id: 'off-msd-001',
    added_by_officer_name: 'Mr. Atif Ansari',
    created_at: '2024-10-26',
    updated_at: '2024-10-26'
  },
  {
    id: 'comp-003',
    component_code: 'COMP-KGA-001',
    name: 'Servo Motor SG90',
    category: 'actuators',
    description: 'Micro servo motor for robotics',
    specifications: '180° rotation, 4.8V-6V',
    required_quantity: 25,
    unit: 'pieces',
    estimated_unit_price: 120,
    estimated_total: 3000,
    status: 'requested',
    purchase_request_id: 'pr-003',
    purchase_request_code: 'PR-2024-003',
    priority: 'high',
    added_by_officer_id: 'off-kga-001',
    added_by_officer_name: 'Mr. Saran T',
    created_at: '2024-10-20',
    updated_at: '2024-10-27'
  },
  {
    id: 'comp-004',
    component_code: 'COMP-KGA-002',
    name: 'NodeMCU ESP8266',
    category: 'electronics',
    description: 'WiFi development board',
    specifications: 'ESP8266 SoC, WiFi 802.11 b/g/n',
    manufacturer: 'Espressif',
    required_quantity: 10,
    unit: 'pieces',
    estimated_unit_price: 350,
    estimated_total: 3500,
    status: 'needed',
    project_id: 'proj-002',
    project_name: 'Smart Attendance System',
    priority: 'urgent',
    justification: 'Critical for WiFi connectivity in attendance system',
    added_by_officer_id: 'off-kga-002',
    added_by_officer_name: 'Mr. Sreeram R',
    created_at: '2024-10-28',
    updated_at: '2024-10-28'
  },
];

// ============= LOCALSTORAGE FUNCTIONS =============

// Load inventory items from localStorage or use defaults
export function loadInventoryItems(): Record<string, InventoryItem[]> {
  try {
    const stored = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading inventory from localStorage:', e);
  }
  return { ...defaultInventoryItems };
}

// Save inventory items to localStorage
export function saveInventoryItems(items: Record<string, InventoryItem[]>): void {
  try {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving inventory to localStorage:', e);
  }
}

// Load purchase requests from localStorage or use defaults
export function loadPurchaseRequests(): PurchaseRequest[] {
  try {
    const stored = localStorage.getItem(PURCHASE_REQUESTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading purchase requests from localStorage:', e);
  }
  return [...defaultPurchaseRequests];
}

// Save purchase requests to localStorage
export function savePurchaseRequests(requests: PurchaseRequest[]): void {
  try {
    localStorage.setItem(PURCHASE_REQUESTS_STORAGE_KEY, JSON.stringify(requests));
  } catch (e) {
    console.error('Error saving purchase requests to localStorage:', e);
  }
}

// Load audit records from localStorage or use defaults
export function loadAuditRecords(): Record<string, AuditRecord[]> {
  try {
    const stored = localStorage.getItem(AUDIT_RECORDS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading audit records from localStorage:', e);
  }
  return { ...defaultAuditRecords };
}

// Save audit records to localStorage
export function saveAuditRecords(records: Record<string, AuditRecord[]>): void {
  try {
    localStorage.setItem(AUDIT_RECORDS_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving audit records to localStorage:', e);
  }
}

// Load project components from localStorage or use defaults
export function loadProjectComponents(): ProjectComponent[] {
  try {
    const stored = localStorage.getItem(COMPONENTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading components from localStorage:', e);
  }
  return [...defaultProjectComponents];
}

// Save project components to localStorage
export function saveProjectComponents(components: ProjectComponent[]): void {
  try {
    localStorage.setItem(COMPONENTS_STORAGE_KEY, JSON.stringify(components));
  } catch (e) {
    console.error('Error saving components to localStorage:', e);
  }
}

// ============= INVENTORY HELPER FUNCTIONS =============

export function getInventoryByInstitution(institutionId: string): InventoryItem[] {
  const allInventory = loadInventoryItems();
  return allInventory[institutionId] || [];
}

export function addInventoryItem(institutionId: string, item: InventoryItem): void {
  const allInventory = loadInventoryItems();
  if (!allInventory[institutionId]) {
    allInventory[institutionId] = [];
  }
  allInventory[institutionId].push(item);
  saveInventoryItems(allInventory);
}

export function updateInventoryItem(institutionId: string, itemId: string, updates: Partial<InventoryItem>): InventoryItem | null {
  const allInventory = loadInventoryItems();
  const items = allInventory[institutionId] || [];
  const index = items.findIndex(item => item.id === itemId);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    allInventory[institutionId] = items;
    saveInventoryItems(allInventory);
    return items[index];
  }
  return null;
}

export function deleteInventoryItem(institutionId: string, itemId: string): boolean {
  const allInventory = loadInventoryItems();
  const items = allInventory[institutionId] || [];
  const index = items.findIndex(item => item.id === itemId);
  if (index !== -1) {
    items.splice(index, 1);
    allInventory[institutionId] = items;
    saveInventoryItems(allInventory);
    return true;
  }
  return false;
}

// ============= STOCK LOCATIONS HELPER FUNCTIONS =============

export function getStockLocationsByInstitution(institutionId: string): StockLocation[] {
  return defaultStockLocations[institutionId] || [];
}

// ============= AUDIT RECORDS HELPER FUNCTIONS =============

export function getAuditRecordsByInstitution(institutionId: string): AuditRecord[] {
  const allRecords = loadAuditRecords();
  return allRecords[institutionId] || [];
}

export function addAuditRecord(institutionId: string, record: AuditRecord): void {
  const allRecords = loadAuditRecords();
  if (!allRecords[institutionId]) {
    allRecords[institutionId] = [];
  }
  allRecords[institutionId].unshift(record); // Add to beginning (newest first)
  saveAuditRecords(allRecords);
}

// ============= PURCHASE REQUEST HELPER FUNCTIONS =============

export function getPurchaseRequestsByInstitution(institutionId: string): PurchaseRequest[] {
  const requests = loadPurchaseRequests();
  return requests.filter(req => req.institution_id === institutionId);
}

export function getPurchaseRequestsByOfficer(officerId: string): PurchaseRequest[] {
  const requests = loadPurchaseRequests();
  return requests.filter(req => req.officer_id === officerId);
}

export function getPurchaseRequestsByStatus(status: PurchaseRequest['status']): PurchaseRequest[] {
  const requests = loadPurchaseRequests();
  return requests.filter(req => req.status === status);
}

export function addPurchaseRequest(request: PurchaseRequest): void {
  const requests = loadPurchaseRequests();
  requests.push(request);
  savePurchaseRequests(requests);
}

export function updatePurchaseRequest(requestId: string, updates: Partial<PurchaseRequest>): PurchaseRequest | null {
  const requests = loadPurchaseRequests();
  const index = requests.findIndex(req => req.id === requestId);
  if (index !== -1) {
    requests[index] = {
      ...requests[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    savePurchaseRequests(requests);
    return requests[index];
  }
  return null;
}

// Legacy function for backward compatibility
export const updateMockPurchaseRequest = updatePurchaseRequest;

// ============= PROJECT COMPONENTS HELPER FUNCTIONS =============

export function getComponentsByOfficer(officerId: string): ProjectComponent[] {
  const components = loadProjectComponents();
  return components.filter(c => c.added_by_officer_id === officerId);
}

export function getComponentsByInstitution(institutionId: string): ProjectComponent[] {
  // Components are officer-based, so we need to filter by officer's institution
  // For now, we'll use a simple mapping
  const components = loadProjectComponents();
  const institutionOfficerMap: Record<string, string[]> = {
    'inst-msd-001': ['off-msd-001'],
    'inst-kga-001': ['off-kga-001', 'off-kga-002'],
  };
  const officerIds = institutionOfficerMap[institutionId] || [];
  return components.filter(c => officerIds.includes(c.added_by_officer_id));
}

export function getComponentsByProject(projectId: string): ProjectComponent[] {
  const components = loadProjectComponents();
  return components.filter(c => c.project_id === projectId);
}

export function getComponentsByStatus(status: ProjectComponent['status']): ProjectComponent[] {
  const components = loadProjectComponents();
  return components.filter(c => c.status === status);
}

export function addComponent(component: ProjectComponent): void {
  const components = loadProjectComponents();
  components.push(component);
  saveProjectComponents(components);
}

export function updateComponent(componentId: string, updates: Partial<ProjectComponent>): ProjectComponent | null {
  const components = loadProjectComponents();
  const index = components.findIndex(c => c.id === componentId);
  if (index !== -1) {
    components[index] = { 
      ...components[index], 
      ...updates, 
      updated_at: new Date().toISOString() 
    };
    saveProjectComponents(components);
    return components[index];
  }
  return null;
}

export function deleteComponent(componentId: string): boolean {
  const components = loadProjectComponents();
  const index = components.findIndex(c => c.id === componentId);
  if (index !== -1) {
    components.splice(index, 1);
    saveProjectComponents(components);
    return true;
  }
  return false;
}

// Legacy exports for backward compatibility
export const mockInventoryItems = defaultInventoryItems;
export const mockStockLocations = defaultStockLocations;
export const mockAuditRecords = defaultAuditRecords;
export const mockPurchaseRequests = defaultPurchaseRequests;
export const mockProjectComponents = defaultProjectComponents;
export const addMockComponent = addComponent;
export const updateMockComponent = updateComponent;
export const deleteMockComponent = deleteComponent;
