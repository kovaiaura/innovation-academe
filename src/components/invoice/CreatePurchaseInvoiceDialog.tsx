import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, X, FileText, Image as ImageIcon, Loader2, Check, AlertCircle, Calendar, AlertTriangle, Save } from 'lucide-react';
import { createPurchaseInvoice, fetchDefaultCompanyProfile, checkInvoiceNumberExists } from '@/services/invoice.service';
import type { CompanyProfile } from '@/types/invoice';
import { EXPENSE_CATEGORIES } from '@/types/payment';
import { toast } from 'sonner';
import { format, differenceInDays, addDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useInvoiceVendors, type InvoiceVendor } from '@/hooks/useInvoiceVendors';

interface CreatePurchaseInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const GST_PRESETS = [
  { label: 'GST 5% (2.5+2.5)', value: 'gst5', cgst: 2.5, sgst: 2.5, igst: 0 },
  { label: 'GST 12% (6+6)', value: 'gst12', cgst: 6, sgst: 6, igst: 0 },
  { label: 'GST 18% (9+9)', value: 'gst18', cgst: 9, sgst: 9, igst: 0 },
  { label: 'GST 28% (14+14)', value: 'gst28', cgst: 14, sgst: 14, igst: 0 },
  { label: 'IGST 5%', value: 'igst5', cgst: 0, sgst: 0, igst: 5 },
  { label: 'IGST 12%', value: 'igst12', cgst: 0, sgst: 0, igst: 12 },
  { label: 'IGST 18%', value: 'igst18', cgst: 0, sgst: 0, igst: 18 },
  { label: 'IGST 28%', value: 'igst28', cgst: 0, sgst: 0, igst: 28 },
  { label: 'No GST', value: 'none', cgst: 0, sgst: 0, igst: 0 },
  { label: 'Custom', value: 'custom', cgst: 0, sgst: 0, igst: 0 },
];

export function CreatePurchaseInvoiceDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreatePurchaseInvoiceDialogProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { vendors, addVendor } = useInvoiceVendors();
  
  // Invoice number state
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceNumberError, setInvoiceNumberError] = useState('');
  const [isCheckingNumber, setIsCheckingNumber] = useState(false);
  const [invoiceNumberValid, setInvoiceNumberValid] = useState(false);
  
  // Vendor selection
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  
  // Form state - Vendor Details
  const [vendorName, setVendorName] = useState('');
  const [vendorAddress, setVendorAddress] = useState('');
  const [vendorCity, setVendorCity] = useState('');
  const [vendorState, setVendorState] = useState('');
  const [vendorGstin, setVendorGstin] = useState('');
  const [vendorPan, setVendorPan] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  
  // Bill Details
  const [vendorInvoiceNumber, setVendorInvoiceNumber] = useState('');
  const [billDate, setBillDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [billReceiptDate, setBillReceiptDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState('');
  const [subtotalAmount, setSubtotalAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  
  // GST
  const [gstPreset, setGstPreset] = useState('none');
  const [cgstRate, setCgstRate] = useState(0);
  const [sgstRate, setSgstRate] = useState(0);
  const [igstRate, setIgstRate] = useState(0);
  
  // TDS
  const [tdsDeducted, setTdsDeducted] = useState(false);
  const [tdsAmount, setTdsAmount] = useState('');
  
  // Attachment
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  
  // Additional
  const [handledBy, setHandledBy] = useState('');
  const [remark, setRemark] = useState('');
  const [notes, setNotes] = useState('');

  // Calculated amounts
  const subtotal = parseFloat(subtotalAmount) || 0;
  const cgstAmount = (subtotal * cgstRate) / 100;
  const sgstAmount = (subtotal * sgstRate) / 100;
  const igstAmount = (subtotal * igstRate) / 100;
  const grossTotal = subtotal + cgstAmount + sgstAmount + igstAmount;
  const tdsDeductedAmount = parseFloat(tdsAmount) || 0;
  const netPayable = grossTotal - tdsDeductedAmount;

  const daysUntilDue = dueDate 
    ? differenceInDays(new Date(dueDate), new Date())
    : null;

  useEffect(() => {
    if (open) {
      loadCompanyProfile();
      setDueDate(format(addDays(new Date(), 30), 'yyyy-MM-dd'));
    }
  }, [open]);

  const loadCompanyProfile = async () => {
    try {
      const profile = await fetchDefaultCompanyProfile();
      setCompanyProfile(profile);
    } catch (error) {
      console.error('Error loading company profile:', error);
    }
  };

  const handleVendorSelect = (vendorId: string) => {
    setSelectedVendorId(vendorId);
    if (vendorId === 'manual') {
      return;
    }
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) {
      setVendorName(vendor.vendor_name);
      setVendorAddress(vendor.address || '');
      setVendorCity(vendor.city || '');
      setVendorState(vendor.state || '');
      setVendorGstin(vendor.gstin || '');
      setVendorPan(vendor.pan || '');
      setVendorPhone(vendor.phone || '');
      setVendorEmail(vendor.email || '');
    }
  };

  const handleSaveAsVendor = () => {
    if (!vendorName.trim()) {
      toast.error('Vendor name is required');
      return;
    }
    addVendor.mutate({
      vendor_name: vendorName,
      address: vendorAddress,
      city: vendorCity,
      state: vendorState,
      gstin: vendorGstin,
      pan: vendorPan,
      phone: vendorPhone,
      email: vendorEmail,
    });
  };

  const handleGstPresetChange = (preset: string) => {
    setGstPreset(preset);
    const found = GST_PRESETS.find(p => p.value === preset);
    if (found && preset !== 'custom') {
      setCgstRate(found.cgst);
      setSgstRate(found.sgst);
      setIgstRate(found.igst);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, JPG, PNG, or WEBP file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    setAttachmentFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setAttachmentPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setAttachmentPreview(null);
    }
  };

  const removeAttachment = () => {
    setAttachmentFile(null);
    setAttachmentPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadAttachment = async (): Promise<{ url: string; name: string; type: string } | null> => {
    if (!attachmentFile) return null;
    const fileExt = attachmentFile.name.split('.').pop();
    const filePath = `purchase-bills/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('invoice-assets').upload(filePath, attachmentFile);
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from('invoice-assets').getPublicUrl(filePath);
    return { url: publicUrl, name: attachmentFile.name, type: attachmentFile.type };
  };

  const handleValidateInvoiceNumber = async () => {
    if (!invoiceNumber.trim()) {
      setInvoiceNumberError('Invoice number is required');
      setInvoiceNumberValid(false);
      return;
    }
    try {
      setIsCheckingNumber(true);
      setInvoiceNumberError('');
      const exists = await checkInvoiceNumberExists(invoiceNumber.trim());
      if (exists) {
        setInvoiceNumberError('This invoice number is already in use');
        setInvoiceNumberValid(false);
      } else {
        setInvoiceNumberValid(true);
      }
    } catch {
      setInvoiceNumberError('Error validating invoice number');
      setInvoiceNumberValid(false);
    } finally {
      setIsCheckingNumber(false);
    }
  };

  const handleSubmit = async () => {
    if (!invoiceNumber.trim()) { toast.error('Please enter invoice number'); return; }
    if (invoiceNumberError) { toast.error('Please fix the invoice number error'); return; }
    if (!vendorName) { toast.error('Please enter vendor name'); return; }
    if (!subtotalAmount || subtotal <= 0) { toast.error('Please enter a valid amount'); return; }
    if (!attachmentFile) { toast.error('Please attach the vendor bill'); return; }

    const exists = await checkInvoiceNumberExists(invoiceNumber.trim());
    if (exists) {
      setInvoiceNumberError('This invoice number is already in use');
      toast.error('Invoice number is already in use');
      return;
    }

    try {
      setLoading(true);
      setUploading(true);
      const attachment = await uploadAttachment();
      if (!attachment) { toast.error('Failed to upload attachment'); return; }

      await createPurchaseInvoice({
        invoice_number: invoiceNumber.trim(),
        invoice_type: 'purchase',
        from_company_name: vendorName,
        from_company_address: vendorAddress,
        from_company_gstin: vendorGstin,
        from_company_phone: vendorPhone,
        to_company_name: companyProfile?.company_name || '',
        to_company_address: companyProfile?.address,
        to_company_city: companyProfile?.city,
        to_company_state: companyProfile?.state,
        to_company_state_code: companyProfile?.state_code,
        to_company_pincode: companyProfile?.pincode,
        to_company_gstin: companyProfile?.gstin,
        invoice_date: billDate,
        due_date: dueDate || undefined,
        reference_number: vendorInvoiceNumber,
        notes,
        total_amount: netPayable,
        attachment_url: attachment.url,
        attachment_name: attachment.name,
        attachment_type: attachment.type,
        vendor_pan: vendorPan || undefined,
        bill_receipt_date: billReceiptDate || undefined,
        expense_category: expenseCategory || undefined,
        handled_by: handledBy || undefined,
        remark: remark || undefined,
        tds_deducted: tdsDeducted,
        tds_amount: tdsDeducted ? tdsDeductedAmount : 0,
        cgst_rate: cgstRate,
        sgst_rate: sgstRate,
        igst_rate: igstRate,
        line_items: [{
          description: `Purchase from ${vendorName}`,
          quantity: 1,
          rate: subtotal,
          amount: subtotal,
        }],
      });
      
      toast.success('Purchase invoice created successfully');
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error creating purchase invoice:', error);
      toast.error('Failed to create purchase invoice');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const resetForm = () => {
    setInvoiceNumber(''); setInvoiceNumberError(''); setInvoiceNumberValid(false);
    setSelectedVendorId('');
    setVendorName(''); setVendorAddress(''); setVendorCity(''); setVendorState('');
    setVendorGstin(''); setVendorPan(''); setVendorPhone(''); setVendorEmail('');
    setVendorInvoiceNumber('');
    setBillDate(format(new Date(), 'yyyy-MM-dd'));
    setBillReceiptDate(format(new Date(), 'yyyy-MM-dd'));
    setDueDate(''); setSubtotalAmount(''); setExpenseCategory('');
    setGstPreset('none'); setCgstRate(0); setSgstRate(0); setIgstRate(0);
    setTdsDeducted(false); setTdsAmount('');
    setAttachmentFile(null); setAttachmentPreview(null);
    setHandledBy(''); setRemark(''); setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-xl">Record Purchase Invoice</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(95vh-140px)] px-6">
          <div className="space-y-6 py-4">
            {/* Two-column layout: Company + Vendor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bill To (Your Company - Read-only) */}
              <div className="bg-muted/50 p-4 rounded-lg border">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">Bill To (Your Company)</h3>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{companyProfile?.company_name || 'Loading...'}</p>
                  <p className="text-muted-foreground">{companyProfile?.address}</p>
                  <p className="text-muted-foreground">{companyProfile?.city}, {companyProfile?.state} {companyProfile?.pincode}</p>
                  <p className="text-muted-foreground">GSTIN: {companyProfile?.gstin}</p>
                </div>
              </div>

              {/* Vendor Details */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Vendor / Supplier</h3>
                  {vendorName && !selectedVendorId && (
                    <Button variant="ghost" size="sm" onClick={handleSaveAsVendor} disabled={addVendor.isPending}>
                      <Save className="h-3.5 w-3.5 mr-1" /> Save Vendor
                    </Button>
                  )}
                </div>
                
                <Select value={selectedVendorId} onValueChange={handleVendorSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select saved vendor or enter manually" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Enter Manually</SelectItem>
                    {vendors.map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.vendor_name} {v.gstin ? `(${v.gstin})` : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Vendor Name *</Label>
                    <Input value={vendorName} onChange={(e) => setVendorName(e.target.value)} placeholder="Vendor company name" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Address</Label>
                    <Input value={vendorAddress} onChange={(e) => setVendorAddress(e.target.value)} placeholder="Vendor address" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">GSTIN</Label>
                    <Input value={vendorGstin} onChange={(e) => setVendorGstin(e.target.value)} placeholder="Vendor GSTIN" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">PAN</Label>
                    <Input value={vendorPan} onChange={(e) => setVendorPan(e.target.value.toUpperCase())} placeholder="ABCDE1234F" maxLength={10} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Phone</Label>
                    <Input value={vendorPhone} onChange={(e) => setVendorPhone(e.target.value)} placeholder="Phone" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Email</Label>
                    <Input value={vendorEmail} onChange={(e) => setVendorEmail(e.target.value)} placeholder="Email" />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Bill Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Bill Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Our Reference Number *</Label>
                  <div className="relative">
                    <Input
                      value={invoiceNumber}
                      onChange={(e) => { setInvoiceNumber(e.target.value); setInvoiceNumberError(''); setInvoiceNumberValid(false); }}
                      onBlur={handleValidateInvoiceNumber}
                      placeholder="e.g., PUR/24-25/0001"
                      className={invoiceNumberError ? 'border-destructive pr-10' : invoiceNumberValid ? 'border-green-500 pr-10' : 'pr-10'}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isCheckingNumber && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      {!isCheckingNumber && invoiceNumberValid && <Check className="h-4 w-4 text-green-500" />}
                      {!isCheckingNumber && invoiceNumberError && <AlertCircle className="h-4 w-4 text-destructive" />}
                    </div>
                  </div>
                  {invoiceNumberError && <p className="text-xs text-destructive">{invoiceNumberError}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Vendor Invoice Number</Label>
                  <Input value={vendorInvoiceNumber} onChange={(e) => setVendorInvoiceNumber(e.target.value)} placeholder="Invoice # from vendor" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Expense Category</Label>
                  <Select value={expenseCategory} onValueChange={setExpenseCategory}>
                    <SelectTrigger><SelectValue placeholder="Select (optional)" /></SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Bill Date (on invoice) *</Label>
                  <Input type="date" value={billDate} onChange={(e) => setBillDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Bill Receipt Date</Label>
                  <Input type="date" value={billReceiptDate} onChange={(e) => setBillReceiptDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Due Date</Label>
                  <div className="flex items-center gap-2">
                    <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="flex-1" />
                    {daysUntilDue !== null && (
                      <Badge variant={daysUntilDue < 0 ? 'destructive' : daysUntilDue <= 7 ? 'secondary' : 'outline'} className="shrink-0 text-xs">
                        {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)}d overdue` : daysUntilDue === 0 ? 'Due today' : `${daysUntilDue}d left`}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Amount + GST + TDS Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Amount & GST */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Amount & GST</h3>
                
                <div className="space-y-1.5">
                  <Label className="text-xs">Subtotal (Base Amount) *</Label>
                  <Input
                    type="number"
                    value={subtotalAmount}
                    onChange={(e) => setSubtotalAmount(e.target.value)}
                    placeholder="₹ 0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">GST Preset</Label>
                  <Select value={gstPreset} onValueChange={handleGstPresetChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GST_PRESETS.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {gstPreset === 'custom' && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">CGST %</Label>
                      <Input type="number" value={cgstRate} onChange={(e) => { setCgstRate(parseFloat(e.target.value) || 0); setIgstRate(0); }} min="0" step="0.5" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">SGST %</Label>
                      <Input type="number" value={sgstRate} onChange={(e) => { setSgstRate(parseFloat(e.target.value) || 0); setIgstRate(0); }} min="0" step="0.5" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">IGST %</Label>
                      <Input type="number" value={igstRate} onChange={(e) => { setIgstRate(parseFloat(e.target.value) || 0); setCgstRate(0); setSgstRate(0); }} min="0" step="0.5" />
                    </div>
                  </div>
                )}

                {/* GST Breakdown */}
                {subtotal > 0 && (cgstRate > 0 || sgstRate > 0 || igstRate > 0) && (
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1.5 text-sm">
                    {cgstRate > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CGST @ {cgstRate}%</span>
                        <span>₹{cgstAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {sgstRate > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SGST @ {sgstRate}%</span>
                        <span>₹{sgstAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {igstRate > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">IGST @ {igstRate}%</span>
                        <span>₹{igstAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right: TDS & Total Summary */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">TDS & Summary</h3>
                
                <div className="flex items-center gap-3">
                  <Switch
                    id="tds-toggle"
                    checked={tdsDeducted}
                    onCheckedChange={setTdsDeducted}
                  />
                  <Label htmlFor="tds-toggle" className="cursor-pointer text-sm">TDS Deducted?</Label>
                  <Badge variant={tdsDeducted ? 'default' : 'secondary'}>{tdsDeducted ? 'Yes' : 'No'}</Badge>
                </div>

                {tdsDeducted && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">TDS Amount (₹)</Label>
                    <Input
                      type="number"
                      value={tdsAmount}
                      onChange={(e) => setTdsAmount(e.target.value)}
                      placeholder="₹ 0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}

                {/* Amount Summary */}
                <div className="border rounded-lg p-4 space-y-2 bg-muted/30">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {(cgstAmount > 0 || sgstAmount > 0 || igstAmount > 0) && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">GST Total</span>
                      <span>₹{(cgstAmount + sgstAmount + igstAmount).toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-sm font-medium">
                    <span>Gross Total</span>
                    <span>₹{grossTotal.toFixed(2)}</span>
                  </div>
                  {tdsDeducted && tdsDeductedAmount > 0 && (
                    <div className="flex justify-between text-sm text-destructive">
                      <span>TDS Deducted</span>
                      <span>- ₹{tdsDeductedAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Net Payable</span>
                    <span>₹{netPayable.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Attachment Upload */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Attach Vendor Bill *</h3>
              <p className="text-xs text-muted-foreground">Upload the original bill/invoice received from the vendor (PDF, JPG, PNG, or WEBP)</p>
              
              <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleFileSelect} className="hidden" />
              
              {!attachmentFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Click to upload</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG, WEBP (max 10MB)</p>
                </div>
              ) : (
                <div className="border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    {attachmentPreview ? (
                      <img src={attachmentPreview} alt="Preview" className="w-16 h-16 object-cover rounded border" />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{attachmentFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(attachmentFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={removeAttachment} className="shrink-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Additional Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Additional Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Handled By</Label>
                  <Input value={handledBy} onChange={(e) => setHandledBy(e.target.value)} placeholder="Person who handled this" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Remark</Label>
                  <Input value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Any remark..." />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs">Notes</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." rows={2} />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 px-6 pb-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || uploading}>
            {loading || uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {uploading ? 'Uploading...' : 'Creating...'}
              </>
            ) : (
              'Record Purchase Invoice'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
