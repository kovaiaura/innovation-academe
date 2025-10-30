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
    id: '1',
    name: 'Delhi Public School - Vasant Kunj',
    slug: 'dps-vk',
    code: 'DPS-VK-001',
    type: 'school',
    location: 'New Delhi, India',
    established_year: 1995,
    contact_email: 'admin@dpsvk.edu.in',
    contact_phone: '+91-11-2345-6789',
    admin_name: 'Dr. Rajesh Kumar',
    admin_email: 'rajesh.kumar@dpsvk.edu.in',
    total_students: 2450,
    total_faculty: 180,
    total_users: 2630,
    storage_used_gb: 125,
    subscription_status: 'active',
    subscription_plan: 'premium',
    license_type: 'premium',
    license_expiry: '2025-12-31',
    max_users: 3000,
    current_users: 2630,
    features: ['Innovation Lab', 'Project Management', 'Advanced Analytics', 'Priority Support'],
    contract_type: 'Annual MoU',
    contract_start_date: '2025-01-01',
    contract_expiry_date: '2025-12-31',
    contract_value: 500000,
    mou_document_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    created_at: '2024-01-15'
  },
  {
    id: '2',
    name: 'Ryan International School',
    slug: 'ryan-int',
    code: 'RIS-MUM-002',
    type: 'school',
    location: 'Mumbai, India',
    established_year: 1989,
    contact_email: 'info@ryanmumbai.edu.in',
    contact_phone: '+91-22-3456-7890',
    admin_name: 'Mrs. Priya Sharma',
    admin_email: 'priya.sharma@ryanmumbai.edu.in',
    total_students: 3800,
    total_faculty: 250,
    total_users: 4050,
    storage_used_gb: 180,
    subscription_status: 'active',
    subscription_plan: 'enterprise',
    license_type: 'enterprise',
    license_expiry: '2026-03-15',
    max_users: 5000,
    current_users: 4050,
    features: ['All Premium Features', 'Custom Integrations', 'Dedicated Account Manager', 'SLA Guarantee'],
    contract_type: 'Multi-Year Agreement',
    contract_start_date: '2024-03-15',
    contract_expiry_date: '2026-03-15',
    contract_value: 1200000,
    mou_document_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    created_at: '2024-02-01'
  },
  {
    id: '3',
    name: 'Innovation Hub Chennai',
    slug: 'innohub-chennai',
    code: 'IHC-CHN-003',
    type: 'institute',
    location: 'Chennai, India',
    established_year: 2020,
    contact_email: 'contact@innohubchennai.org',
    contact_phone: '+91-44-4567-8901',
    admin_name: 'Mr. Arjun Patel',
    admin_email: 'arjun.patel@innohubchennai.org',
    total_students: 450,
    total_faculty: 35,
    total_users: 485,
    storage_used_gb: 45,
    subscription_status: 'active',
    subscription_plan: 'basic',
    license_type: 'basic',
    license_expiry: '2025-06-30',
    max_users: 500,
    current_users: 485,
    features: ['Innovation Lab', 'Basic Analytics', 'Email Support'],
    contract_type: 'Annual Contract',
    contract_start_date: '2024-07-01',
    contract_expiry_date: '2025-06-30',
    contract_value: 150000,
    mou_document_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    created_at: '2024-06-15'
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
