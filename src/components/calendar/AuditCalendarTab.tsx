import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Search, Download, Eye } from 'lucide-react';
import { mockAudits } from '@/data/mockCalendarData';
import { Audit } from '@/types/calendar';
import { getAuditStatusColor, exportAuditsToCSV } from '@/utils/calendarHelpers';
import { format } from 'date-fns';
import { AuditDialog } from './AuditDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function AuditCalendarTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [audits] = useState<Audit[]>(mockAudits);
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<Audit | undefined>();

  const filteredAudits = audits.filter((audit) => {
    const matchesSearch =
      audit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audit.institution_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || audit.status === statusFilter;
    const matchesType = typeFilter === 'all' || audit.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalAudits = audits.length;
  const pendingAudits = audits.filter((a) => a.status === 'scheduled' || a.status === 'confirmed').length;
  const completedAudits = audits.filter((a) => a.status === 'completed').length;

  const handleScheduleAudit = () => {
    setSelectedAudit(undefined);
    setIsAuditDialogOpen(true);
  };

  const handleViewAudit = (audit: Audit) => {
    setSelectedAudit(audit);
    setIsAuditDialogOpen(true);
  };

  const handleExport = () => {
    exportAuditsToCSV(filteredAudits);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Audits</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAudits}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Audits</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAudits}</div>
            <p className="text-xs text-muted-foreground">Scheduled/Confirmed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedAudits}</div>
            <p className="text-xs text-muted-foreground">Finalized</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audit Types</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Audit Management */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search audits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button onClick={handleScheduleAudit}>
                <Plus className="mr-2 h-4 w-4" />
                Schedule Audit
              </Button>
            </div>
          </div>

          {/* Audits Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Audit Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Auditors</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAudits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No audits found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAudits.map((audit) => {
                    const statusColors = getAuditStatusColor(audit.status);
                    return (
                      <TableRow key={audit.id}>
                        <TableCell className="font-medium">{audit.title}</TableCell>
                        <TableCell className="capitalize">{audit.type}</TableCell>
                        <TableCell>{audit.institution_name}</TableCell>
                        <TableCell>
                          {format(new Date(audit.audit_date), 'MMM dd, yyyy')}
                          <br />
                          <span className="text-xs text-muted-foreground">{audit.start_time}</span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {audit.auditors.slice(0, 2).join(', ')}
                          {audit.auditors.length > 2 && ` +${audit.auditors.length - 2}`}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${statusColors.bg} ${statusColors.text} border ${statusColors.border}`}
                          >
                            {audit.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleViewAudit(audit)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AuditDialog
        audit={selectedAudit}
        isOpen={isAuditDialogOpen}
        onClose={() => setIsAuditDialogOpen(false)}
      />
    </div>
  );
}
