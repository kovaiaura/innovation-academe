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
import { Checkbox } from '@/components/ui/checkbox';
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
import { useInvoiceParties, type CreatePartyInput, type InvoiceParty } from '@/hooks/useInvoiceParties';
import { INDIAN_STATES, COUNTRIES } from '@/constants/indianStates';

interface InvoicePartiesManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyParty: CreatePartyInput = {
  party_name: '',
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
  shipping_address: '',
  shipping_city: '',
  shipping_state: '',
  shipping_state_code: '',
  shipping_pincode: '',
  shipping_same_as_billing: true,
};

export function InvoicePartiesManager({ open, onOpenChange }: InvoicePartiesManagerProps) {
  const { parties, addParty, updateParty, deleteParty } = useInvoiceParties();
  const [editing, setEditing] = useState<InvoiceParty | null>(null);
  const [form, setForm] = useState<CreatePartyInput>(emptyParty);
  const [showForm, setShowForm] = useState(false);

  const handleSave = () => {
    if (!form.party_name.trim()) return;
    if (editing) {
      updateParty.mutate({ id: editing.id, ...form });
    } else {
      addParty.mutate(form);
    }
    setShowForm(false);
    setEditing(null);
    setForm(emptyParty);
  };

  const handleEdit = (party: InvoiceParty) => {
    setEditing(party);
    setForm({
      party_name: party.party_name,
      address: party.address || '',
      city: party.city || '',
      state: party.state || '',
      state_code: party.state_code || '',
      pincode: party.pincode || '',
      gstin: party.gstin || '',
      pan: party.pan || '',
      contact_person: party.contact_person || '',
      phone: party.phone || '',
      email: party.email || '',
      country: party.country || 'India',
      shipping_address: party.shipping_address || '',
      shipping_city: party.shipping_city || '',
      shipping_state: party.shipping_state || '',
      shipping_state_code: party.shipping_state_code || '',
      shipping_pincode: party.shipping_pincode || '',
      shipping_same_as_billing: party.shipping_same_as_billing ?? true,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyParty);
  };

  const handleBillingStateChange = (stateCode: string) => {
    const state = INDIAN_STATES.find(s => s.code === stateCode);
    if (state) {
      setForm(prev => ({ ...prev, state: state.name, state_code: state.code }));
    }
  };

  const handleShippingStateChange = (stateCode: string) => {
    const state = INDIAN_STATES.find(s => s.code === stateCode);
    if (state) {
      setForm(prev => ({ ...prev, shipping_state: state.name, shipping_state_code: state.code }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Manage Parties / Customers</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-100px)]">
          {showForm ? (
            <div className="space-y-5 p-1">
              <h3 className="font-semibold">{editing ? 'Edit Party' : 'Add New Party'}</h3>
              
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <Label>Party Name *</Label>
                  <Input value={form.party_name} onChange={(e) => setForm({ ...form, party_name: e.target.value })} placeholder="Company / Person name" />
                </div>
                <div className="space-y-1">
                  <Label>GSTIN</Label>
                  <Input value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>PAN</Label>
                  <Input value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value })} />
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

              {/* Billing Address */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Billing Address</h4>
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
                    <Select value={form.state_code || ''} onValueChange={handleBillingStateChange}>
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

              {/* Shipping Address */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Shipping Address</h4>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="same_as_billing"
                      checked={form.shipping_same_as_billing}
                      onCheckedChange={(checked) => setForm({ ...form, shipping_same_as_billing: checked as boolean })}
                    />
                    <Label htmlFor="same_as_billing" className="text-xs font-normal cursor-pointer">Same as Billing</Label>
                  </div>
                </div>
                {!form.shipping_same_as_billing && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1">
                      <Label>Address</Label>
                      <Input value={form.shipping_address} onChange={(e) => setForm({ ...form, shipping_address: e.target.value })} placeholder="Shipping address" />
                    </div>
                    <div className="space-y-1">
                      <Label>City</Label>
                      <Input value={form.shipping_city} onChange={(e) => setForm({ ...form, shipping_city: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label>State</Label>
                      <Select value={form.shipping_state_code || ''} onValueChange={handleShippingStateChange}>
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
                      <Input value={form.shipping_state_code} readOnly className="bg-muted" />
                    </div>
                    <div className="space-y-1">
                      <Label>Pincode</Label>
                      <Input value={form.shipping_pincode} onChange={(e) => setForm({ ...form, shipping_pincode: e.target.value })} />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={handleCancel}><X className="h-4 w-4 mr-1" /> Cancel</Button>
                <Button onClick={handleSave} disabled={!form.party_name.trim()}>
                  {editing ? 'Update' : 'Save'} Party
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 p-1">
              <div className="flex justify-end">
                <Button size="sm" onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add Party
                </Button>
              </div>
              {parties.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No parties added yet. Click "Add Party" to get started.</p>
              ) : (
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>GSTIN</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="w-20"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parties.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.party_name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{p.gstin || '-'}</TableCell>
                          <TableCell className="text-sm">{p.city || '-'}</TableCell>
                          <TableCell className="text-sm">{p.state || '-'}</TableCell>
                          <TableCell className="text-sm">{p.phone || '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(p)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteParty.mutate(p.id)}>
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
