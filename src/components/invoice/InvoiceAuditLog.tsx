import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { 
  FileEdit, 
  CheckCircle, 
  XCircle, 
  Send, 
  CreditCard,
  Clock,
  User
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  invoice_id: string;
  action: string;
  old_values: unknown;
  new_values: unknown;
  performed_by: string | null;
  performed_by_name: string | null;
  performed_at: string;
}

interface InvoiceAuditLogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  invoiceNumber: string;
}

export function InvoiceAuditLog({
  open,
  onOpenChange,
  invoiceId,
  invoiceNumber,
}: InvoiceAuditLogProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && invoiceId) {
      loadAuditLogs();
    }
  }, [open, invoiceId]);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoice_audit_log')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('performed_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <FileEdit className="h-4 w-4 text-primary" />;
      case 'status_changed':
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'updated':
        return <FileEdit className="h-4 w-4 text-muted-foreground" />;
      case 'deleted':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'sent':
        return <Send className="h-4 w-4 text-primary" />;
      case 'payment_recorded':
        return <CreditCard className="h-4 w-4 text-primary" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-primary/10 text-primary';
      case 'status_changed':
        return 'bg-primary/10 text-primary';
      case 'updated':
        return 'bg-muted text-muted-foreground';
      case 'deleted':
        return 'bg-destructive/10 text-destructive';
      case 'sent':
        return 'bg-primary/10 text-primary';
      case 'payment_recorded':
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatActionLabel = (action: string) => {
    return action
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getChangeSummary = (entry: AuditLogEntry) => {
    if (entry.action === 'created') {
      return 'Invoice was created';
    }

    if (entry.action === 'status_changed' && entry.old_values && entry.new_values) {
      const oldStatus = (entry.old_values as Record<string, unknown>).status;
      const newStatus = (entry.new_values as Record<string, unknown>).status;
      return `Status changed from "${oldStatus}" to "${newStatus}"`;
    }

    if (entry.action === 'updated' && entry.old_values && entry.new_values) {
      const changes: string[] = [];
      const newVals = entry.new_values as Record<string, unknown>;
      const oldVals = entry.old_values as Record<string, unknown>;

      Object.keys(newVals).forEach((key) => {
        if (
          key !== 'updated_at' &&
          key !== 'id' &&
          JSON.stringify(newVals[key]) !== JSON.stringify(oldVals[key])
        ) {
          changes.push(key.replace(/_/g, ' '));
        }
      });

      if (changes.length > 0) {
        return `Updated: ${changes.slice(0, 3).join(', ')}${
          changes.length > 3 ? ` and ${changes.length - 3} more fields` : ''
        }`;
      }
      return 'Invoice details updated';
    }

    if (entry.action === 'deleted') {
      return 'Invoice was deleted';
    }

    return 'Invoice was modified';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Audit Log - {invoiceNumber}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading audit history...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No audit history available
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

              <div className="space-y-6">
                {logs.map((entry, index) => (
                  <div key={entry.id} className="relative pl-10">
                    {/* Timeline dot */}
                    <div className="absolute left-0 w-8 h-8 rounded-full bg-background border-2 flex items-center justify-center">
                      {getActionIcon(entry.action)}
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getActionBadgeColor(entry.action)}>
                              {formatActionLabel(entry.action)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(
                                new Date(entry.performed_at),
                                'dd MMM yyyy, hh:mm a'
                              )}
                            </span>
                          </div>
                          <p className="text-sm">{getChangeSummary(entry)}</p>
                        </div>
                      </div>

                      {/* User info */}
                      <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>
                          {entry.performed_by_name || 'System'}
                        </span>
                      </div>

                      {/* Show detailed changes for status_changed */}
                      {entry.action === 'status_changed' &&
                        entry.old_values &&
                        entry.new_values && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-muted-foreground">Previous:</span>
                                <Badge variant="outline" className="ml-2">
                                  {String((entry.old_values as Record<string, unknown>).status)}
                                </Badge>
                              </div>
                              <div>
                                <span className="text-muted-foreground">New:</span>
                                <Badge variant="outline" className="ml-2">
                                  {String((entry.new_values as Record<string, unknown>).status)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
