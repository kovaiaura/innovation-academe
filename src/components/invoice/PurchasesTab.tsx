import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, Trash2, ExternalLink, ShoppingCart, CheckCircle2, Clock } from 'lucide-react';
import type { Invoice } from '@/types/invoice';
import { Skeleton } from '@/components/ui/skeleton';

interface PurchasesTabProps {
  purchases: Invoice[];
  loading: boolean;
  onDelete: (id: string) => void;
}

export function PurchasesTab({ purchases, loading, onDelete }: PurchasesTabProps) {
  const stats = useMemo(() => {
    const total = purchases.reduce((sum, p) => sum + (p.total_amount || 0), 0);
    const settled = purchases.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.total_amount || 0), 0);
    const pending = total - settled;
    const settledCount = purchases.filter(p => p.status === 'paid').length;
    const pendingCount = purchases.length - settledCount;
    return { total, settled, pending, settledCount, pendingCount };
  }, [purchases]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-8 w-24" /></CardContent></Card>
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.total)}</div>
            <p className="text-xs text-muted-foreground">{purchases.length} bills</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Settled</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.settled)}</div>
            <p className="text-xs text-muted-foreground">{stats.settledCount} bills</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pending)}</div>
            <p className="text-xs text-muted-foreground">{stats.pendingCount} bills</p>
          </CardContent>
        </Card>
      </div>

      {/* Purchases Table */}
      {purchases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No purchases recorded</p>
            <p className="text-sm">Click "Add Purchase" to record your first purchase bill.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier Name</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>GST</TableHead>
                <TableHead>TDS</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Handled By</TableHead>
                <TableHead>Remark</TableHead>
                <TableHead>Bill</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => {
                const gstTotal = (purchase.cgst_amount || 0) + (purchase.sgst_amount || 0) + (purchase.igst_amount || 0);
                const isSettled = purchase.status === 'paid';
                const tdsDeducted = !!(purchase as any).tds_deducted || (purchase.tds_amount && purchase.tds_amount > 0);

                return (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">{purchase.from_company_name}</TableCell>
                    <TableCell className="text-sm">{purchase.invoice_number}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(purchase.total_amount)}
                    </TableCell>
                    <TableCell>
                      {gstTotal > 0 ? (
                        <span className="text-sm">{formatCurrency(gstTotal)}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tdsDeducted ? 'default' : 'secondary'} className="text-xs">
                        {tdsDeducted ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={isSettled ? 'default' : 'secondary'}
                        className={isSettled ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'}
                      >
                        {isSettled ? 'Settled' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {(purchase as any).handled_by || <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-sm max-w-[150px] truncate">
                      {(purchase as any).remark || <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      {purchase.attachment_url ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-8 w-8"
                        >
                          <a href={purchase.attachment_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onDelete(purchase.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
