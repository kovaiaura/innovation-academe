import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { useInvoiceVendors, type CreateVendorInput, type InvoiceVendor } from '@/hooks/useInvoiceVendors';
import { INDIAN_STATES, COUNTRIES } from '@/constants/indianStates';

interface InvoiceVendorsManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyVendor: CreateVendorInput = {
  vendor_name: '',
  address: '',
  city: '',
  state: '',
  state_code: '',
  pincode: '',
  gstin: '',
  pan: '',
  contact_person: '',
  phone: '',
  email: '',
  country: 'India',
};

export function InvoiceVendorsManager({ open, onOpenChange }: InvoiceVendorsManagerProps) {
  const { vendors, addVendor, updateVendor, deleteVendor } = useInvoiceVendors();
  const [editing, setEditing] = useState<InvoiceVendor | null>(null);
  const [form, setForm] = useState<CreateVendorInput>(emptyVendor);
  const [showForm, setShowForm] = useState(false);

  const handleSave = () => {
    if (!form.vendor_name.trim()) return;
    if (editing) {
      updateVendor.mutate({ id: editing.id, ...form });
    } else {
      addVendor.mutate(form);
    }
    setShowForm(false);
    setEditing(null);
    setForm(emptyVendor);
  };

  const handleEdit = (vendor: InvoiceVendor) => {
    setEditing(vendor);
    setForm({
      vendor_name: vendor.vendor_name,
      address: vendor.address || '',
      city: vendor.city || '',
      state: vendor.state || '',
      state_code: vendor.state_code || '',
      pincode: vendor.pincode || '',
      gstin: vendor.gstin || '',
      pan: vendor.pan || '',
      contact_person: vendor.contact_person || '',
      phone: vendor.phone || '',
      email: vendor.email || '',
      country: vendor.country || 'India',
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyVendor);
  };

  const handleStateChange = (stateCode: string) => {
    const state = INDIAN_STATES.find(s => s.code === stateCode);
    if (state) {
      setForm(prev => ({ ...prev, state: state.name, state_code: state.code }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Manage Vendors / Suppliers</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-100px)]">
          {showForm ? (
            <div className="space-y-5 p-1">
              <h3 className="font-semibold">{editing ? 'Edit Vendor' : 'Add New Vendor'}</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <Label>Vendor Name *</Label>
                  <Input value={form.vendor_name} onChange={(e) => setForm({ ...form, vendor_name: e.target.value })} placeholder="Company / Person name" />
                </div>
                <div className="space-y-1">
                  <Label>GSTIN</Label>
                  <Input value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>PAN</Label>
                  <Input value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })} maxLength={10} />
                </div>
                <div className="space-y-1">
                  <Label>Contact Person</Label>
                  <Input value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Country</Label>
                  <Select value={form.country || 'India'} onValueChange={(v) => setForm({ ...form, country: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Address</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1">
                    <Label>Address</Label>
                    <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street address" />
                  </div>
                  <div className="space-y-1">
                    <Label>City</Label>
                    <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>State</Label>
                    <Select value={form.state_code || ''} onValueChange={handleStateChange}>
                      <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map(s => (
                          <SelectItem key={s.code} value={s.code}>{s.name} ({s.code})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>State Code</Label>
                    <Input value={form.state_code} readOnly className="bg-muted" />
                  </div>
                  <div className="space-y-1">
                    <Label>Pincode</Label>
                    <Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={handleCancel}><X className="h-4 w-4 mr-1" /> Cancel</Button>
                <Button onClick={handleSave} disabled={!form.vendor_name.trim()}>
                  {editing ? 'Update' : 'Save'} Vendor
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 p-1">
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add Vendor
                </Button>
              </div>
              {vendors.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No vendors added yet. Click "Add Vendor" to get started.</p>
              ) : (
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>GSTIN</TableHead>
                        <TableHead>PAN</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="w-20"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendors.map((v) => (
                        <TableRow key={v.id}>
                          <TableCell className="font-medium">{v.vendor_name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{v.gstin || '-'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{v.pan || '-'}</TableCell>
                          <TableCell className="text-sm">{v.city || '-'}</TableCell>
                          <TableCell className="text-sm">{v.phone || '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(v)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteVendor.mutate(v.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
