import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { mockEventApplications, mockActivityEvents } from '@/data/mockEventsData';
import { ApplicationStatus } from '@/types/events';
import { Download } from 'lucide-react';

// Institution name mapping
const getInstitutionName = (institutionId: string) => {
  const institutionMap: Record<string, string> = {
    'springfield-high': 'Springfield High School',
    'riverside-academy': 'Riverside Academy',
    'oakwood-school': 'Oakwood School',
    'tech-valley-high': 'Tech Valley High School',
  };
  return institutionMap[institutionId] || institutionId;
};

interface InstitutionSummary {
  institutionId: string;
  institutionName: string;
  total: number;
  pending: number;
  shortlisted: number;
  approved: number;
  rejected: number;
}

export function ApplicationsOverviewTab() {
  const [applications] = useState(mockEventApplications);
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'all'>('all');
  const [filterEvent, setFilterEvent] = useState<string>('all');

  // Group applications by institution and calculate statistics
  const institutionSummaries = useMemo(() => {
    // First filter applications by event if needed
    const eventFilteredApps = filterEvent === 'all' 
      ? applications 
      : applications.filter(app => app.event_id === filterEvent);

    // Group by institution
    const groupedByInstitution = eventFilteredApps.reduce((acc, app) => {
      if (!acc[app.institution_id]) {
        acc[app.institution_id] = {
          institutionId: app.institution_id,
          institutionName: getInstitutionName(app.institution_id),
          total: 0,
          pending: 0,
          shortlisted: 0,
          approved: 0,
          rejected: 0,
        };
      }
      
      acc[app.institution_id].total++;
      acc[app.institution_id][app.status]++;
      
      return acc;
    }, {} as Record<string, InstitutionSummary>);

    // Convert to array and filter by status if needed
    let summaries = Object.values(groupedByInstitution);
    
    if (filterStatus !== 'all') {
      summaries = summaries.filter(summary => summary[filterStatus] > 0);
    }

    return summaries.sort((a, b) => b.total - a.total);
  }, [applications, filterEvent, filterStatus]);

  // Calculate statistics
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
  };

  const handleExport = () => {
    // In real app, this would export institution summaries to CSV/Excel
    console.log('Exporting institution summaries...', institutionSummaries);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Shortlisted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.shortlisted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Applications</CardTitle>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={filterEvent} onValueChange={setFilterEvent}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {mockActivityEvents.map(event => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as ApplicationStatus | 'all')}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Has Pending</SelectItem>
                <SelectItem value="shortlisted">Has Shortlisted</SelectItem>
                <SelectItem value="approved">Has Approved</SelectItem>
                <SelectItem value="rejected">Has Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution Name</TableHead>
                  <TableHead className="text-center">Total Applications</TableHead>
                  <TableHead className="text-center">Pending</TableHead>
                  <TableHead className="text-center">Shortlisted</TableHead>
                  <TableHead className="text-center">Approved</TableHead>
                  <TableHead className="text-center">Rejected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {institutionSummaries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No institutions found with matching applications
                    </TableCell>
                  </TableRow>
                ) : (
                  institutionSummaries.map((summary) => (
                    <TableRow key={summary.institutionId}>
                      <TableCell className="font-medium">{summary.institutionName}</TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                          {summary.total}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 font-semibold">
                          {summary.pending}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">
                          {summary.shortlisted}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-semibold">
                          {summary.approved}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-semibold">
                          {summary.rejected}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
