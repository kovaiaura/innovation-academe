-- Add purchase-specific columns to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS tds_section text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS our_tan text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS is_self_deducted_tds boolean DEFAULT false;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS tds_rate numeric(5,2);

-- Add purchase-specific columns to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS bill_receipt_date date;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS expense_category text;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS vendor_pan text;

-- Add expense categories as comments for reference
COMMENT ON COLUMN invoices.expense_category IS 'Categories: Operations, Marketing, Technology, Infrastructure, HR, Travel, Utilities, Professional Services, Other';