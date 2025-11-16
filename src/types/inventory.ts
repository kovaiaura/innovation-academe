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

export interface PurchaseRequestItem {
  item_name: string;
  category: 'technology' | 'tools' | 'furniture' | 'equipment' | 'consumables' | 'other';
  quantity: number;
  unit: string;
  estimated_unit_price: number;
  estimated_total: number;
  justification?: string;
}

export interface PurchaseRequest {
  id: string;
  request_code: string;
  
  // Who requested
  officer_id: string;
  officer_name: string;
  institution_id: string;
  institution_name: string;
  
  // What is being requested
  items: PurchaseRequestItem[];
  total_estimated_cost: number;
  justification: string;
  priority: 'urgent' | 'normal' | 'low';
  
  // Approval workflow status (New Flow: Officer → System Admin → Institution)
  status: 
    | 'pending_system_admin'           // First stage: Waiting for System Admin review
    | 'approved_by_system_admin'       // System Admin approved, forwarded to Institution
    | 'rejected_by_system_admin'       // System Admin rejected
    | 'pending_institution_approval'   // Second stage: Waiting for Institution approval
    | 'approved_by_institution'        // Institution approved, ready for fulfillment
    | 'rejected_by_institution'        // Institution rejected
    | 'in_progress'                    // System Admin processing order
    | 'fulfilled';                     // Completed
  
  // System Admin initial review (First stage)
  system_admin_reviewed_by?: string;
  system_admin_reviewed_by_name?: string;
  system_admin_reviewed_at?: string;
  system_admin_review_comments?: string;
  system_admin_rejection_reason?: string;
  
  // Institution approval details (Second stage)
  institution_approved_by?: string;
  institution_approved_by_name?: string;
  institution_approved_at?: string;
  institution_comments?: string;
  institution_rejection_reason?: string;
  
  // Final processing/fulfillment details (Third stage)
  system_admin_processed_by?: string;
  system_admin_processed_by_name?: string;
  system_admin_processed_at?: string;
  system_admin_processing_comments?: string;
  fulfillment_details?: string;
  fulfillment_date?: string;
  
  // Tracking
  created_at: string;
  updated_at: string;
}

export interface ProjectComponent {
  id: string;
  component_code: string;
  name: string;
  category: 'electronics' | 'sensors' | 'actuators' | 'mechanical' | 'software' | 'other';
  
  // Project Association
  project_id?: string;
  project_name?: string;
  
  // Specifications
  description: string;
  specifications?: string;
  manufacturer?: string;
  part_number?: string;
  
  // Quantity & Cost
  required_quantity: number;
  unit: string;
  estimated_unit_price: number;
  estimated_total: number;
  
  // Status
  status: 'needed' | 'requested' | 'approved' | 'purchased' | 'received';
  
  // Purchase Request Link
  purchase_request_id?: string;
  purchase_request_code?: string;
  
  // Tracking
  added_by_officer_id: string;
  added_by_officer_name: string;
  created_at: string;
  updated_at: string;
  
  // Priority
  priority: 'urgent' | 'high' | 'medium' | 'low';
  justification?: string;
  
  // Notes
  notes?: string;
}
