-- Company Inventory Management System

-- 1. Create company_suppliers table
CREATE TABLE public.company_suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text,
  phone text,
  email text,
  address text,
  city text,
  state text,
  pincode text,
  gstin text,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create company_item_master table
CREATE TABLE public.company_item_master (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code text UNIQUE NOT NULL,
  item_name text NOT NULL,
  category text,
  unit_of_measure text NOT NULL DEFAULT 'Nos',
  gst_percentage numeric(5,2) DEFAULT 0,
  reorder_level integer DEFAULT 0,
  current_stock integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  description text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Create company_stock_entries table (Inward)
CREATE TABLE public.company_stock_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  item_id uuid NOT NULL REFERENCES company_item_master(id) ON DELETE RESTRICT,
  supplier_id uuid REFERENCES company_suppliers(id),
  invoice_number text,
  invoice_date date,
  quantity integer NOT NULL,
  rate numeric(12,2) NOT NULL DEFAULT 0,
  amount numeric(14,2) GENERATED ALWAYS AS (quantity * rate) STORED,
  batch_serial text,
  location_store text,
  notes text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- 4. Create company_stock_issues table (Outward)
CREATE TABLE public.company_stock_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  item_id uuid NOT NULL REFERENCES company_item_master(id) ON DELETE RESTRICT,
  quantity integer NOT NULL,
  issued_to_type text NOT NULL,
  issued_to_id uuid,
  issued_to_name text NOT NULL,
  purpose text,
  reference_number text,
  notes text,
  admin_override boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- 5. Create trigger function to update stock on entry
CREATE OR REPLACE FUNCTION public.update_company_stock_on_entry()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.company_item_master 
  SET current_stock = current_stock + NEW.quantity,
      updated_at = now()
  WHERE id = NEW.item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Create trigger function to update stock on issue
CREATE OR REPLACE FUNCTION public.update_company_stock_on_issue()
RETURNS TRIGGER AS $$
DECLARE
  v_current_stock integer;
BEGIN
  SELECT current_stock INTO v_current_stock 
  FROM public.company_item_master WHERE id = NEW.item_id;
  
  IF v_current_stock < NEW.quantity AND NOT COALESCE(NEW.admin_override, false) THEN
    RAISE EXCEPTION 'Insufficient stock. Current: %, Requested: %', v_current_stock, NEW.quantity;
  END IF;
  
  UPDATE public.company_item_master 
  SET current_stock = current_stock - NEW.quantity,
      updated_at = now()
  WHERE id = NEW.item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Create triggers
CREATE TRIGGER trigger_update_stock_on_entry
  AFTER INSERT ON public.company_stock_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_company_stock_on_entry();

CREATE TRIGGER trigger_update_stock_on_issue
  BEFORE INSERT ON public.company_stock_issues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_company_stock_on_issue();

-- 8. Enable RLS
ALTER TABLE public.company_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_item_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_stock_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_stock_issues ENABLE ROW LEVEL SECURITY;

-- 9. Create helper function to check company_inventory access (using JSONB contains)
CREATE OR REPLACE FUNCTION public.has_company_inventory_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    public.has_role(_user_id, 'super_admin'::public.app_role) OR
    public.has_role(_user_id, 'system_admin'::public.app_role) OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.positions pos ON pos.id = p.position_id
      WHERE p.id = _user_id 
        AND pos.visible_features IS NOT NULL
        AND pos.visible_features ? 'company_inventory'
    )
  );
$$;

-- 10. Create RLS policies for company_suppliers
CREATE POLICY "company_suppliers_select" ON public.company_suppliers
  FOR SELECT TO authenticated
  USING (public.has_company_inventory_access(auth.uid()));

CREATE POLICY "company_suppliers_insert" ON public.company_suppliers
  FOR INSERT TO authenticated
  WITH CHECK (public.has_company_inventory_access(auth.uid()));

CREATE POLICY "company_suppliers_update" ON public.company_suppliers
  FOR UPDATE TO authenticated
  USING (public.has_company_inventory_access(auth.uid()));

CREATE POLICY "company_suppliers_delete" ON public.company_suppliers
  FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_role(auth.uid(), 'system_admin'::public.app_role)
  );

-- 11. Create RLS policies for company_item_master
CREATE POLICY "company_item_master_select" ON public.company_item_master
  FOR SELECT TO authenticated
  USING (public.has_company_inventory_access(auth.uid()));

CREATE POLICY "company_item_master_insert" ON public.company_item_master
  FOR INSERT TO authenticated
  WITH CHECK (public.has_company_inventory_access(auth.uid()));

CREATE POLICY "company_item_master_update" ON public.company_item_master
  FOR UPDATE TO authenticated
  USING (public.has_company_inventory_access(auth.uid()));

CREATE POLICY "company_item_master_delete" ON public.company_item_master
  FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_role(auth.uid(), 'system_admin'::public.app_role)
  );

-- 12. Create RLS policies for company_stock_entries
CREATE POLICY "company_stock_entries_select" ON public.company_stock_entries
  FOR SELECT TO authenticated
  USING (public.has_company_inventory_access(auth.uid()));

CREATE POLICY "company_stock_entries_insert" ON public.company_stock_entries
  FOR INSERT TO authenticated
  WITH CHECK (public.has_company_inventory_access(auth.uid()));

-- 13. Create RLS policies for company_stock_issues
CREATE POLICY "company_stock_issues_select" ON public.company_stock_issues
  FOR SELECT TO authenticated
  USING (public.has_company_inventory_access(auth.uid()));

CREATE POLICY "company_stock_issues_insert" ON public.company_stock_issues
  FOR INSERT TO authenticated
  WITH CHECK (public.has_company_inventory_access(auth.uid()));

-- 14. Add updated_at triggers
CREATE TRIGGER update_company_suppliers_updated_at
  BEFORE UPDATE ON public.company_suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_item_master_updated_at
  BEFORE UPDATE ON public.company_item_master
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();