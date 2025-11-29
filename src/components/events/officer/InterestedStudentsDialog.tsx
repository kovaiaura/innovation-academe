import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getEventInterestsByEventAndInstitution, getEventById } from '@/data/mockEventsData';
import { EventInterest } from '@/types/events';
import { Search, Download, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface InterestedStudentsDialogProps {
  eventId: string;
  institutionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InterestedStudentsDialog({ 
  eventId, 
  institutionId, 
  open, 
  onOpenChange 
}: InterestedStudentsDialogProps) {
  const [interests, setInterests] = useState<EventInterest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  
  const event = getEventById(eventId);

  useEffect(() => {
    if (open) {
      const data = getEventInterestsByEventAndInstitution(eventId, institutionId);
      setInterests(data);
    }
  }, [open, eventId, institutionId]);

  const filteredInterests = interests.filter(interest =>
    interest.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    interest.class_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    // In real app, export to CSV
    const csvContent = [
      ['Student Name', 'Class', 'Section', 'Student ID', 'Registered At'].join(','),
      ...filteredInterests.map(i => [
        i.student_name,
        i.class_name,
        i.section,
        i.student_id,
        format(new Date(i.registered_at), 'yyyy-MM-dd HH:mm')
      ].join(','))
    ].join('\n');
    
    console.log('Exporting CSV:', csvContent);
    toast({
      title: 'Export Started',
      description: `Exporting ${filteredInterests.length} student records.`,
    });
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Interested Students
          </DialogTitle>
          <DialogDescription>
            Students from your institution who expressed interest in "{event.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stats */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <div className="text-2xl font-bold">{interests.length}</div>
              <div className="text-sm text-muted-foreground">Total Interested</div>
            </div>
          </div>

          {/* Search and Export */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Registered At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInterests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {interests.length === 0 
                        ? 'No students have expressed interest yet.' 
                        : 'No students match your search.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInterests.map((interest) => (
                    <TableRow key={interest.id}>
                      <TableCell className="font-medium">{interest.student_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{interest.class_name}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{interest.section}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {interest.student_id}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(interest.registered_at), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
