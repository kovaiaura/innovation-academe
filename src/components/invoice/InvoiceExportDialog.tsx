import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { exportToCSV, downloadCSV } from '@/services/invoice-export.service';
import type { Invoice, InvoiceType } from '@/types/invoice';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface InvoiceExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoices: Invoice[];
  invoiceType: InvoiceType;
}

type ExportType = 'register' | 'outstanding' | 'collection';

export function InvoiceExportDialog({
  open,
  onOpenChange,
  invoices,
  invoiceType,
}: InvoiceExportDialogProps) {
  const [exportType, setExportType] = useState<ExportType>('register');
  const [loading, setLoading] = useState(false);
  
  const isPurchase = invoiceType === 'purchase';

  const handleExport = async () => {
    setLoading(true);
    try {
      const csvContent = exportToCSV(invoices, exportType, invoiceType);
      const filename = `${invoiceType}-${exportType}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      downloadCSV(csvContent, filename);
      toast.success('Export downloaded successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const exportOptions = isPurchase
    ? [
        {
          value: 'register' as ExportType,
          label: 'Purchase Register',
          description: 'Complete list of all vendor bills with GST and payment details',
          icon: FileSpreadsheet,
        },
        {
          value: 'outstanding' as ExportType,
          label: 'Payables Report',
          description: 'Unpaid vendor bills with aging information',
          icon: FileText,
        },
      ]
    : [
        {
          value: 'register' as ExportType,
          label: 'Invoice Register',
          description: 'Complete list of all invoices with GST details',
          icon: FileSpreadsheet,
        },
        {
          value: 'outstanding' as ExportType,
          label: 'Outstanding Report',
          description: 'Unpaid invoices with aging information',
          icon: FileText,
        },
      ];

  const entityLabel = isPurchase ? 'vendor bills' : 'invoices';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export {isPurchase ? 'Purchase Bills' : 'Invoices'}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup
            value={exportType}
            onValueChange={(v) => setExportType(v as ExportType)}
            className="space-y-3"
          >
            {exportOptions.map((option) => (
              <div
                key={option.value}
                className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  exportType === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                }`}
                onClick={() => setExportType(option.value)}
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <div className="flex-1">
                  <Label
                    htmlFor={option.value}
                    className="font-medium cursor-pointer flex items-center gap-2"
                  >
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {option.description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>{invoices.length}</strong> {entityLabel} will be exported as CSV
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={loading}>
            {loading ? 'Exporting...' : 'Download CSV'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
