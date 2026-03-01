import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InvoiceLineItemsEditor } from './InvoiceLineItemsEditor';
import { createInvoice, fetchDefaultCompanyProfile, calculateInvoiceTotals, calculateLineItemTaxes, checkInvoiceNumberExists, GSTRates } from '@/services/invoice.service';
import type { InvoiceLineItem, CompanyProfile, CreateInvoiceInput } from '@/types/invoice';
import { toast } from 'sonner';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useInvoiceParties, type InvoiceParty } from '@/hooks/useInvoiceParties';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { INDIAN_STATES } from '@/constants/indianStates';

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type GSTPreset = 'gst5' | 'gst12' | 'gst18' | 'gst28' | 'igst5' | 'igst12' | 'igst18' | 'igst28' | 'custom';

const gstPresetMap: Record<Exclude<GSTPreset, 'custom'>, GSTRates> = {
  gst5: { cgst_rate: 2.5, sgst_rate: 2.5, igst_rate: 0 },
  gst12: { cgst_rate: 6, sgst_rate: 6, igst_rate: 0 },
  gst18: { cgst_rate: 9, sgst_rate: 9, igst_rate: 0 },
  gst28: { cgst_rate: 14, sgst_rate: 14, igst_rate: 0 },
  igst5: { cgst_rate: 0, sgst_rate: 0, igst_rate: 5 },
  igst12: { cgst_rate: 0, sgst_rate: 0, igst_rate: 12 },
  igst18: { cgst_rate: 0, sgst_rate: 0, igst_rate: 18 },
  igst28: { cgst_rate: 0, sgst_rate: 0, igst_rate: 28 },
};

export function CreateInvoiceDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateInvoiceDialogProps) {
  const [loading, setLoading] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [gstPreset, setGstPreset] = useState<GSTPreset>('igst18');
  const [gstRates, setGstRates] = useState<GSTRates>({ cgst_rate: 0, sgst_rate: 0, igst_rate: 18 });
  
  const { parties } = useInvoiceParties();
  const { getNextNumber, incrementAndGetNumber } = useInvoiceSettings();
  
  // Invoice number
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceNumberError, setInvoiceNumberError] = useState('');
  const [isCheckingNumber, setIsCheckingNumber] = useState(false);
  const [invoiceNumberValid, setInvoiceNumberValid] = useState(false);
  const [useAutoNumber, setUseAutoNumber] = useState(true);
  
  // Bill To (billing address from party)
  const [toCompanyName, setToCompanyName] = useState('');
  const [toCompanyAddress, setToCompanyAddress] = useState('');
  const [toCompanyCity, setToCompanyCity] = useState('');
  const [toCompanyState, setToCompanyState] = useState('');
  const [toCompanyStateCode, setToCompanyStateCode] = useState('');
  const [toCompanyPincode, setToCompanyPincode] = useState('');
  const [toCompanyGstin, setToCompanyGstin] = useState('');
  const [toCompanyContactPerson, setToCompanyContactPerson] = useState('');
  const [toCompanyPhone, setToCompanyPhone] = useState('');
  
  const [invoiceDate, setInvoiceDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState('');
  const [terms, setTerms] = useState('Custom');
  const [placeOfSupply, setPlaceOfSupply] = useState('Tamil Nadu (33)');
  const [notes, setNotes] = useState('');
  
  const [lineItems, setLineItems] = useState<Omit<InvoiceLineItem, 'id' | 'invoice_id'>[]>([
    { description: '', hsn_sac_code: '998311', quantity: 1, unit: 'Nos', rate: 0, amount: 0 },
  ]);

  useEffect(() => {
    if (open) {
      loadCompanyProfile();
      const nextNum = getNextNumber();
      setInvoiceNumber(nextNum);
      setUseAutoNumber(true);
      setInvoiceNumberValid(false);
      setInvoiceNumberError('');
    }
  }, [open]);

  const loadCompanyProfile = async () => {
    try {
      const profile = await fetchDefaultCompanyProfile();
      setCompanyProfile(profile);
      if (profile?.default_notes) setNotes(profile.default_notes);
    } catch (error) {
      console.error('Error loading company profile:', error);
    }
  };

  const handlePartySelect = (partyId: string) => {
    const party = parties.find(p => p.id === partyId);
    if (!party) return;
    // Use billing address fields
    setToCompanyName(party.party_name);
    setToCompanyAddress(party.address || '');
    setToCompanyCity(party.city || '');
    setToCompanyState(party.state || '');
    setToCompanyStateCode(party.state_code || '');
    setToCompanyPincode(party.pincode || '');
    setToCompanyGstin(party.gstin || '');
    setToCompanyContactPerson(party.contact_person || '');
    setToCompanyPhone(party.phone || '');
    if (party.state) {
      setPlaceOfSupply(`${party.state} (${party.state_code || ''})`);
    }
  };

  const handleGstPresetChange = (value: GSTPreset) => {
    setGstPreset(value);
    if (value !== 'custom') {
      setGstRates(gstPresetMap[value]);
    }
  };

  const handleStateChange = (stateCode: string) => {
    const state = INDIAN_STATES.find((s) => s.code === stateCode);
    if (state) {
      setToCompanyState(state.name);
      setToCompanyStateCode(state.code);
      setPlaceOfSupply(`${state.name} (${state.code})`);
    }
  };

  const isInterState = gstRates.igst_rate > 0;

  const calculatedItems = lineItems.map((item) => calculateLineItemTaxes(item, isInterState, gstRates));
  const totals = calculateInvoiceTotals(calculatedItems, isInterState, 0, gstRates);

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
    if (!toCompanyName) { toast.error('Please enter customer name'); return; }
    if (lineItems.some((item) => !item.description || item.rate <= 0)) {
      toast.error('Please fill in all line items with valid amounts'); return;
    }

    try {
      setLoading(true);

      let finalInvoiceNumber = invoiceNumber.trim();
      if (useAutoNumber) {
        finalInvoiceNumber = await incrementAndGetNumber();
      } else {
        if (!finalInvoiceNumber) { toast.error('Please enter invoice number'); return; }
        const exists = await checkInvoiceNumberExists(finalInvoiceNumber);
        if (exists) { setInvoiceNumberError('Invoice number already in use'); toast.error('Invoice number already in use'); return; }
      }

      const input: CreateInvoiceInput = {
        invoice_number: finalInvoiceNumber,
        invoice_type: 'sales',
        from_company_name: companyProfile?.company_name || '',
        from_company_address: companyProfile?.address,
        from_company_city: companyProfile?.city,
        from_company_state: companyProfile?.state,
        from_company_state_code: companyProfile?.state_code,
        from_company_pincode: companyProfile?.pincode,
        from_company_gstin: companyProfile?.gstin,
        from_company_phone: companyProfile?.phone,
        from_company_email: companyProfile?.email,
        from_company_website: companyProfile?.website,
        to_company_name: toCompanyName,
        to_company_address: toCompanyAddress,
        to_company_city: toCompanyCity,
        to_company_state: toCompanyState,
        to_company_state_code: toCompanyStateCode,
        to_company_pincode: toCompanyPincode,
        to_company_gstin: toCompanyGstin,
        to_company_contact_person: toCompanyContactPerson,
        to_company_phone: toCompanyPhone,
        invoice_date: invoiceDate,
        due_date: dueDate || undefined,
        terms,
        place_of_supply: placeOfSupply,
        notes,
        terms_and_conditions: companyProfile?.terms_and_conditions,
        bank_details: companyProfile?.bank_details,
        line_items: lineItems,
      };

      await createInvoice(input);
      toast.success('Invoice created successfully');
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setInvoiceNumber('');
    setInvoiceNumberError('');
    setInvoiceNumberValid(false);
    setUseAutoNumber(true);
    setToCompanyName('');
    setToCompanyAddress('');
    setToCompanyCity('');
    setToCompanyState('');
    setToCompanyStateCode('');
    setToCompanyPincode('');
    setToCompanyGstin('');
    setToCompanyContactPerson('');
    setToCompanyPhone('');
    setInvoiceDate(format(new Date(), 'yyyy-MM-dd'));
    setDueDate('');
    setTerms('Custom');
    setGstPreset('igst18');
    setGstRates({ cgst_rate: 0, sgst_rate: 0, igst_rate: 18 });
    setLineItems([{ description: '', hsn_sac_code: '998311', quantity: 1, unit: 'Nos', rate: 0, amount: 0 }]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-none !w-full !h-full !translate-x-0 !translate-y-0 !top-0 !left-0 !rounded-none flex flex-col p-0">
        <div className="flex-shrink-0 border-b px-6 py-4">
          <DialogTitle>Create Invoice</DialogTitle>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6">
          <div className="max-w-4xl mx-auto space-y-6 py-6">
            {/* Bill From */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Bill From</h3>
              <div className="text-sm space-y-1">
                <p className="font-medium">{companyProfile?.company_name || 'Loading...'}</p>
                <p className="text-muted-foreground">{companyProfile?.address}</p>
                <p className="text-muted-foreground">{companyProfile?.city}, {companyProfile?.state} {companyProfile?.pincode}</p>
                <p className="text-muted-foreground">GSTIN: {companyProfile?.gstin}</p>
              </div>
            </div>

            {/* Bill To with Party Selector */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-semibold">Bill To</h3>
                {parties.length > 0 && (
                  <Select onValueChange={handlePartySelect}>
                    <SelectTrigger className="w-56">
                      <SelectValue placeholder="Select saved party..." />
                    </SelectTrigger>
                    <SelectContent>
                      {parties.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.party_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label>Company Name *</Label>
                  <Input value={toCompanyName} onChange={(e) => setToCompanyName(e.target.value)} placeholder="Customer company name" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Address</Label>
                  <Textarea value={toCompanyAddress} onChange={(e) => setToCompanyAddress(e.target.value)} placeholder="Street address" rows={2} />
                </div>
                <div className="space-y-1.5">
                  <Label>City</Label>
                  <Input value={toCompanyCity} onChange={(e) => setToCompanyCity(e.target.value)} placeholder="City" />
                </div>
                <div className="space-y-1.5">
                  <Label>State</Label>
                  <Select value={toCompanyStateCode} onValueChange={handleStateChange}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((state) => (
                        <SelectItem key={state.code} value={state.code}>{state.name} ({state.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Pincode</Label>
                  <Input value={toCompanyPincode} onChange={(e) => setToCompanyPincode(e.target.value)} placeholder="Pincode" />
                </div>
                <div className="space-y-1.5">
                  <Label>GSTIN</Label>
                  <Input value={toCompanyGstin} onChange={(e) => setToCompanyGstin(e.target.value)} placeholder="GSTIN" />
                </div>
                <div className="space-y-1.5">
                  <Label>Contact Person</Label>
                  <Input value={toCompanyContactPerson} onChange={(e) => setToCompanyContactPerson(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input value={toCompanyPhone} onChange={(e) => setToCompanyPhone(e.target.value)} />
                </div>
              </div>
            </div>

            <Separator />

            {/* Invoice Details */}
            <div className="space-y-4">
              <h3 className="font-semibold">Invoice Details</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Label>Invoice Number</Label>
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => { setUseAutoNumber(!useAutoNumber); setInvoiceNumberError(''); }}>
                      {useAutoNumber ? 'Enter manually' : 'Use auto-number'}
                    </Button>
                  </div>
                  {useAutoNumber ? (
                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-md">
                      <span className="font-mono text-sm">{invoiceNumber}</span>
                      <span className="text-xs text-muted-foreground">(auto-generated on save)</span>
                    </div>
                  ) : (
                    <div className="relative">
                      <Input
                        value={invoiceNumber}
                        onChange={(e) => { setInvoiceNumber(e.target.value); setInvoiceNumberError(''); setInvoiceNumberValid(false); }}
                        onBlur={handleValidateInvoiceNumber}
                        placeholder="e.g., INV/001"
                        className={invoiceNumberError ? 'border-destructive pr-10' : invoiceNumberValid ? 'border-green-500 pr-10' : 'pr-10'}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isCheckingNumber && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                        {!isCheckingNumber && invoiceNumberValid && <Check className="h-4 w-4 text-green-500" />}
                        {!isCheckingNumber && invoiceNumberError && <AlertCircle className="h-4 w-4 text-destructive" />}
                      </div>
                      {invoiceNumberError && <p className="text-sm text-destructive mt-1">{invoiceNumberError}</p>}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Invoice Date *</Label>
                    <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Due Date</Label>
                    <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Terms</Label>
                    <Input value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="e.g., Net 30" />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* GST Configuration */}
            <div className="space-y-3">
              <h3 className="font-semibold">GST Configuration</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>GST Preset</Label>
                  <Select value={gstPreset} onValueChange={(v) => handleGstPresetChange(v as GSTPreset)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gst5">GST 5% (CGST 2.5% + SGST 2.5%)</SelectItem>
                      <SelectItem value="gst12">GST 12% (CGST 6% + SGST 6%)</SelectItem>
                      <SelectItem value="gst18">GST 18% (CGST 9% + SGST 9%)</SelectItem>
                      <SelectItem value="gst28">GST 28% (CGST 14% + SGST 14%)</SelectItem>
                      <SelectItem value="igst5">IGST 5%</SelectItem>
                      <SelectItem value="igst12">IGST 12%</SelectItem>
                      <SelectItem value="igst18">IGST 18%</SelectItem>
                      <SelectItem value="igst28">IGST 28%</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Place of Supply</Label>
                  <Input value={placeOfSupply} onChange={(e) => setPlaceOfSupply(e.target.value)} />
                </div>
              </div>
              {gstPreset === 'custom' && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">CGST %</Label>
                    <Input type="number" min="0" step="0.5" value={gstRates.cgst_rate} onChange={(e) => setGstRates(prev => ({ ...prev, cgst_rate: parseFloat(e.target.value) || 0 }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">SGST %</Label>
                    <Input type="number" min="0" step="0.5" value={gstRates.sgst_rate} onChange={(e) => setGstRates(prev => ({ ...prev, sgst_rate: parseFloat(e.target.value) || 0 }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">IGST %</Label>
                    <Input type="number" min="0" step="0.5" value={gstRates.igst_rate} onChange={(e) => setGstRates(prev => ({ ...prev, igst_rate: parseFloat(e.target.value) || 0 }))} />
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Line Items */}
            <div className="space-y-4">
              <h3 className="font-semibold">Line Items</h3>
              <InvoiceLineItemsEditor items={lineItems} onChange={setLineItems} showTaxColumns={false} />
            </div>

            <Separator />

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-80 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sub Total:</span>
                  <span>₹{totals.sub_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                {isInterState ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IGST ({gstRates.igst_rate}%):</span>
                    <span>₹{totals.igst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CGST ({gstRates.cgst_rate}%):</span>
                      <span>₹{totals.cgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SGST ({gstRates.sgst_rate}%):</span>
                      <span>₹{totals.sgst_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total:</span>
                  <span>₹{totals.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." rows={2} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Invoice'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
