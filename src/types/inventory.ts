export interface InventoryItem {
  id: string;
  item_code: string;
  name: string;
  category: 'technology' | 'tools' | 'furniture' | 'equipment' | 'consumables' | 'other';
  description: string;
  manufacturer?: string;
  model_number?: string;
  serial_number?: string;
  
  // Stock Information
  quantity: number;
  unit: string; // 'pieces', 'sets', 'units', 'kg', 'liters'
  location: string; // 'Lab A', 'Store Room', 'Workshop'
  condition: 'new' | 'good' | 'fair' | 'damaged' | 'missing';
  
  // Financial
  unit_price: number;
  total_value: number;
  purchase_date: string;
  warranty_expiry?: string;
  depreciation_rate?: number;
  
  // Tracking
  last_audited: string;
  assigned_to?: string;
  maintenance_schedule?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  last_maintenance?: string;
  
  // Status
  status: 'active' | 'under_maintenance' | 'retired' | 'disposed';
  notes?: string;
}

export interface StockLocation {
  location_id: string;
  location_name: string;
  type: 'lab' | 'store' | 'workshop' | 'classroom';
  capacity: number;
  current_items: number;
  responsible_person: string;
}

export interface AuditRecord {
  audit_id: string;
  audit_date: string;
  audited_by: string;
  items_checked: number;
  discrepancies: number;
  missing_items: string[]; // item IDs
  damaged_items: string[]; // item IDs
  newly_added: string[]; // item IDs
  notes: string;
  status: 'completed' | 'in_progress' | 'pending_review';
}
