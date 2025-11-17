import React, { createContext, useContext, useState, ReactNode } from 'react';
import { mockInventoryItems, mockStockLocations, mockAuditRecords } from '@/data/mockInventoryData';

// Institution type from InstitutionManagement
export interface Institution {
  id: string;
  name: string;
  slug: string;
  code: string;
  type: 'university' | 'college' | 'school' | 'institute';
  location: string;
  established_year: number;
  contact_email: string;
  contact_phone: string;
  admin_name: string;
  admin_email: string;
  total_students: number;
  total_faculty: number;
  total_users: number;
  storage_used_gb: number;
  subscription_status: 'active' | 'inactive' | 'suspended';
  subscription_plan: 'basic' | 'standard' | 'premium' | 'enterprise';
  license_type: 'basic' | 'standard' | 'premium' | 'enterprise';
  license_expiry: string;
  max_users: number;
  current_users: number;
  features: string[];
  contract_type: string;
  contract_start_date: string;
  contract_expiry_date: string;
  contract_value: number;
  mou_document_url?: string;
  created_at: string;
  // GPS Attendance Configuration
  gps_location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  attendance_radius_meters?: number; // Validation radius, default 200m
  normal_working_hours?: number; // Default 8 hours per day
  // Detailed Pricing Model
  pricing_model?: {
    per_student_cost: number;
    lms_cost?: number;
    lap_setup_cost: number;
    monthly_recurring_cost: number;
    trainer_monthly_fee: number;
  };
}

// Inventory Summary type from InventoryManagement
export interface InventorySummary {
  institution_id: string;
  institution_name: string;
  total_items: number;
  missing_items: number;
  damaged_items: number;
  last_audit_date: string;
  value: number;
  status: 'good' | 'needs_review' | 'critical';
  categories: {
    technology: { count: number; value: number };
    tools: { count: number; value: number };
    furniture: { count: number; value: number };
    equipment: { count: number; value: number };
    consumables: { count: number; value: number };
    other: { count: number; value: number };
  };
}

// Initial mock institutions
const mockInstitutions: Institution[] = [
  {
    id: 'inst-msd-001',
    name: 'Modern School Vasant Vihar',
    slug: 'modern-school-vasant-vihar',
    code: 'MSD-VV-001',
    type: 'school',
    location: 'Vasant Vihar, New Delhi, India',
    established_year: 1920,
    contact_email: 'admin@modernschool.edu.in',
    contact_phone: '+91-11-2614-9884',
    admin_name: 'Dr. Vijay Datta',
    admin_email: 'principal@modernschool.edu.in',
    total_students: 350,
    total_faculty: 45,
    total_users: 395,
    storage_used_gb: 85,
    subscription_status: 'active',
    subscription_plan: 'premium',
    license_type: 'premium',
    license_expiry: '2026-03-31',
    max_users: 500,
    current_users: 395,
    features: ['Innovation Lab', 'Atal Tinkering Lab', 'Project Management', 'STEM Education'],
    contract_type: 'Annual Agreement',
    contract_start_date: '2025-04-01',
    contract_expiry_date: '2026-03-31',
    contract_value: 600000,
    created_at: '2025-04-01',
    gps_location: {
      latitude: 28.5672,
      longitude: 77.1615,
      address: 'Barakhamba Road, Vasant Vihar, New Delhi - 110057'
    },
    attendance_radius_meters: 200,
    normal_working_hours: 7,
    pricing_model: {
      per_student_cost: 1200,
      lms_cost: 60000,
      lap_setup_cost: 350000,
      monthly_recurring_cost: 20000,
      trainer_monthly_fee: 55000,
    },
  },
  {
    id: 'inst-kga-001',
    name: 'Kikani Global Academy',
    slug: 'kikani-global-academy',
    code: 'KGA-CBE-001',
    type: 'school',
    location: 'Pachapalayam, Coimbatore',
    established_year: 2010,
    contact_email: 'info@kikaniacademy.com',
    contact_phone: '+91-422-2345-6789',
    admin_name: 'Mr. Rajesh Kikani',
    admin_email: 'principal@kikaniacademy.com',
    total_students: 520,
    total_faculty: 68,
    total_users: 588,
    storage_used_gb: 142,
    subscription_status: 'active',
    subscription_plan: 'enterprise',
    license_type: 'enterprise',
    license_expiry: '2026-03-31',
    max_users: 700,
    current_users: 588,
    features: ['Innovation Lab', 'Atal Tinkering Lab', 'Project Management', 'STEM Education', 'Robotics Lab'],
    contract_type: 'Annual Agreement',
    contract_start_date: '2025-04-01',
    contract_expiry_date: '2026-03-31',
    contract_value: 950000,
    created_at: '2025-04-01',
    gps_location: {
      latitude: 11.0168,
      longitude: 76.9558,
      address: 'Pachapalayam, Coimbatore - 641037, Tamil Nadu'
    },
    attendance_radius_meters: 250,
    normal_working_hours: 7,
    pricing_model: {
      per_student_cost: 1100,
      lms_cost: 75000,
      lap_setup_cost: 400000,
      monthly_recurring_cost: 30000,
      trainer_monthly_fee: 105000,
    },
  }
];

// Initialize inventory summaries from existing mock data
const initializeInventorySummaries = (): Record<string, InventorySummary> => {
  return {
    '1': {
      institution_id: '1',
      institution_name: 'Delhi Public School - Vasant Kunj',
      total_items: 342,
      missing_items: 5,
      damaged_items: 8,
      last_audit_date: '2024-01-10',
      value: 145000,
      status: 'good',
      categories: {
        technology: { count: 80, value: 45000 },
        tools: { count: 50, value: 15000 },
        furniture: { count: 120, value: 35000 },
        equipment: { count: 72, value: 28000 },
        consumables: { count: 15, value: 4000 },
        other: { count: 5, value: 18000 },
      },
    },
    '2': {
      institution_id: '2',
      institution_name: 'Ryan International School',
      total_items: 218,
      missing_items: 12,
      damaged_items: 15,
      last_audit_date: '2023-11-25',
      value: 89000,
      status: 'needs_review',
      categories: {
        technology: { count: 60, value: 28000 },
        tools: { count: 35, value: 10000 },
        furniture: { count: 80, value: 25000 },
        equipment: { count: 28, value: 15000 },
        consumables: { count: 10, value: 3000 },
        other: { count: 5, value: 8000 },
      },
    },
    '3': {
      institution_id: '3',
      institution_name: 'Innovation Hub Chennai',
      total_items: 156,
      missing_items: 25,
      damaged_items: 18,
      last_audit_date: '2023-09-15',
      value: 62000,
      status: 'critical',
      categories: {
        technology: { count: 40, value: 20000 },
        tools: { count: 25, value: 8000 },
        furniture: { count: 60, value: 18000 },
        equipment: { count: 20, value: 10000 },
        consumables: { count: 8, value: 2000 },
        other: { count: 3, value: 4000 },
      },
    },
  };
};

interface InstitutionDataContextType {
  institutions: Institution[];
  inventorySummaries: Record<string, InventorySummary>;
  addInstitution: (institution: Institution) => void;
  updateInstitution: (id: string, updates: Partial<Institution>) => void;
  updateInventorySummary: (institutionId: string, summary: InventorySummary) => void;
}

const InstitutionDataContext = createContext<InstitutionDataContextType | undefined>(undefined);

export const InstitutionDataProvider = ({ children }: { children: ReactNode }) => {
  const [institutions, setInstitutions] = useState<Institution[]>(mockInstitutions);
  const [inventorySummaries, setInventorySummaries] = useState<Record<string, InventorySummary>>(
    initializeInventorySummaries()
  );

  const addInstitution = (institution: Institution) => {
    setInstitutions((prev) => [...prev, institution]);

    // Auto-initialize empty inventory summary
    const emptyInventory: InventorySummary = {
      institution_id: institution.id,
      institution_name: institution.name,
      total_items: 0,
      missing_items: 0,
      damaged_items: 0,
      last_audit_date: new Date().toISOString().split('T')[0],
      value: 0,
      status: 'good',
      categories: {
        technology: { count: 0, value: 0 },
        tools: { count: 0, value: 0 },
        furniture: { count: 0, value: 0 },
        equipment: { count: 0, value: 0 },
        consumables: { count: 0, value: 0 },
        other: { count: 0, value: 0 },
      },
    };

    setInventorySummaries((prev) => ({
      ...prev,
      [institution.id]: emptyInventory,
    }));

    // Initialize empty arrays in mock data
    mockInventoryItems[institution.id] = [];
    mockStockLocations[institution.id] = [];
    mockAuditRecords[institution.id] = [];
  };

  const updateInstitution = (id: string, updates: Partial<Institution>) => {
    setInstitutions((prev) =>
      prev.map((inst) => (inst.id === id ? { ...inst, ...updates } : inst))
    );

    // Update inventory summary if name changed
    if (updates.name) {
      setInventorySummaries((prev) => {
        const existing = prev[id];
        if (existing) {
          return {
            ...prev,
            [id]: { ...existing, institution_name: updates.name },
          };
        }
        return prev;
      });
    }
  };

  const updateInventorySummary = (institutionId: string, summary: InventorySummary) => {
    setInventorySummaries((prev) => ({
      ...prev,
      [institutionId]: summary,
    }));
  };

  return (
    <InstitutionDataContext.Provider
      value={{
        institutions,
        inventorySummaries,
        addInstitution,
        updateInstitution,
        updateInventorySummary,
      }}
    >
      {children}
    </InstitutionDataContext.Provider>
  );
};

export const useInstitutionData = () => {
  const context = useContext(InstitutionDataContext);
  if (context === undefined) {
    throw new Error('useInstitutionData must be used within an InstitutionDataProvider');
  }
  return context;
};
