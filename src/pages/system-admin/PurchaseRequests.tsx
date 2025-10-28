import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface PurchaseRequest {
  id: string;
  institution_name: string;
  requested_by: string;
  items: Array<{ name: string; quantity: number; unit_price: number }>;
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requested_date: string;
  category: string;
}

const mockRequests: PurchaseRequest[] = [
  {
    id: '1',
    institution_name: 'Springfield University',
    requested_by: 'Dr. James Wilson',
    items: [
      { name: 'VR Headsets', quantity: 10, unit_price: 400 },
      { name: 'Wireless Keyboards', quantity: 20, unit_price: 50 },
    ],
    total_amount: 5000,
    status: 'pending',
    requested_date: '2024-01-20',
    category: 'Technology',
  },
  {
    id: '2',
    institution_name: 'River College',
    requested_by: 'Prof. Emily Carter',
    items: [
      { name: '3D Printers', quantity: 2, unit_price: 2500 },
      { name: 'Filament Spools', quantity: 50, unit_price: 25 },
    ],
    total_amount: 6250,
    status: 'pending',
    requested_date: '2024-01-18',
    category: 'Equipment',
  },
  {
    id: '3',
    institution_name: 'Oakwood Institute',
    requested_by: 'Sarah Martinez',
    items: [{ name: 'Laptop Computers', quantity: 15, unit_price: 800 }],
    total_amount: 12000,
    status: 'approved',
    requested_date: '2024-01-15',
    category: 'Technology',
  },
];

export default function PurchaseRequests() {
  const [requests, setRequests] = useState<PurchaseRequest[]>(mockRequests);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleApprove = (id: string) => {
    setRequests(
      requests.map((req) => (req.id === id ? { ...req, status: 'approved' as const } : req))
    );
    toast.success('Purchase request approved');
  };

  const handleReject = (id: string) => {
    setRequests(
      requests.map((req) => (req.id === id ? { ...req, status: 'rejected' as const } : req))
    );
    toast.success('Purchase request rejected');
  };

  const filteredRequests = requests.filter((req) =>
    filterStatus === 'all' ? true : req.status === filterStatus
  );

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const pendingValue = requests
    .filter((r) => r.status === 'pending')
    .reduce((sum, r) => sum + r.total_amount, 0);
  const approvedValue = requests
    .filter((r) => r.status === 'approved')
    .reduce((sum, r) => sum + r.total_amount, 0);

  const getStatusBadge = (status: PurchaseRequest['status']) => {
    const variants = {
      pending: 'default',
      approved: 'secondary',
      rejected: 'destructive',
      completed: 'outline',
    };
    return <Badge variant={variants[status] as any}>{status}</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Purchase Requests</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve multi-institution purchase requests
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${pendingValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total pending amount</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${approvedValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Budget allocated</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Purchase Requests</CardTitle>
                <CardDescription>Review and manage purchase approvals</CardDescription>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.institution_name}</TableCell>
                    <TableCell>{request.requested_by}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {request.items.map((item, idx) => (
                          <div key={idx}>
                            {item.name} x{item.quantity}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${request.total_amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{new Date(request.requested_date).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right">
                      {request.status === 'pending' && (
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(request.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(request.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
