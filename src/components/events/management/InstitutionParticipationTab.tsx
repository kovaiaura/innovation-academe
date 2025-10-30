import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { mockEventApplications, mockActivityEvents } from '@/data/mockEventsData';
import { ApplicationStatusBadge } from '../ApplicationStatusBadge';
import { Download, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export function InstitutionParticipationTab() {
  // Mock: Filter applications for current institution
  const [applications] = useState(
    mockEventApplications.filter(app => app.institution_id === 'springfield-high')
  );

  const getEventName = (eventId: string) => {
    return mockActivityEvents.find(e => e.id === eventId)?.title || 'Unknown Event';
  };

  // Group applications by event
  const eventStats = mockActivityEvents.map(event => {
    const eventApps = applications.filter(app => app.event_id === event.id);
    return {
      event,
      total: eventApps.length,
      pending: eventApps.filter(a => a.status === 'pending').length,
      approved: eventApps.filter(a => a.status === 'approved').length,
      rejected: eventApps.filter(a => a.status === 'rejected').length,
      shortlisted: eventApps.filter(a => a.status === 'shortlisted').length,
    };
  }).filter(stat => stat.total > 0);

  const overallStats = {
    totalApplications: applications.length,
    approved: applications.filter(a => a.status === 'approved').length,
    pending: applications.filter(a => a.status === 'pending').length,
    successRate: applications.length > 0 
      ? Math.round((applications.filter(a => a.status === 'approved').length / applications.length) * 100)
      : 0,
  };

  const handleExport = () => {
    console.log('Exporting participation data...');
  };

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalApplications}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overallStats.approved}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully accepted</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{overallStats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting decision</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {overallStats.successRate}%
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Approval percentage</p>
          </CardContent>
        </Card>
      </div>

      {/* Event-wise Participation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Event-wise Participation</CardTitle>
              <CardDescription>Application statistics for each event</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {eventStats.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No participation data available yet.</p>
              <p className="text-sm mt-2">Students haven't applied to any events from your institution.</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Name</TableHead>
                    <TableHead>Event Date</TableHead>
                    <TableHead className="text-center">Total Apps</TableHead>
                    <TableHead className="text-center">Pending</TableHead>
                    <TableHead className="text-center">Shortlisted</TableHead>
                    <TableHead className="text-center">Approved</TableHead>
                    <TableHead className="text-center">Rejected</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventStats.map((stat) => (
                    <TableRow key={stat.event.id}>
                      <TableCell className="font-medium">{stat.event.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(stat.event.event_start), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-center font-semibold">{stat.total}</TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/10 text-yellow-600 font-semibold">
                          {stat.pending}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 font-semibold">
                          {stat.shortlisted}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 text-green-600 font-semibold">
                          {stat.approved}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 text-red-600 font-semibold">
                          {stat.rejected}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>Latest 5 applications from your institution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Idea Title</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.slice(0, 5).map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">{application.student_name}</TableCell>
                    <TableCell className="text-sm">{getEventName(application.event_id)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{application.idea_title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(application.applied_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <ApplicationStatusBadge status={application.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
