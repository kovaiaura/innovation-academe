import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, UserCheck, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface Assignment {
  officer_id: string;
  officer_name: string;
  institution_id: string;
  institution_name: string;
  assigned_date: string;
  status: 'active' | 'inactive';
}

const mockAssignments: Assignment[] = [
  {
    officer_id: '1',
    officer_name: 'John Smith',
    institution_id: 'inst1',
    institution_name: 'Springfield University',
    assigned_date: '2023-01-15',
    status: 'active',
  },
  {
    officer_id: '1',
    officer_name: 'John Smith',
    institution_id: 'inst2',
    institution_name: 'River College',
    assigned_date: '2023-02-20',
    status: 'active',
  },
  {
    officer_id: '2',
    officer_name: 'Sarah Johnson',
    institution_id: 'inst3',
    institution_name: 'Oakwood Institute',
    assigned_date: '2023-03-20',
    status: 'active',
  },
];

const mockOfficers = [
  { id: '1', name: 'John Smith' },
  { id: '2', name: 'Sarah Johnson' },
  { id: '3', name: 'Michael Chen' },
];

const mockInstitutions = [
  { id: 'inst1', name: 'Springfield University' },
  { id: 'inst2', name: 'River College' },
  { id: 'inst3', name: 'Oakwood Institute' },
  { id: 'inst4', name: 'Tech Valley School' },
  { id: 'inst5', name: 'Innovation Hub' },
];

export default function OfficerAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [selectedOfficer, setSelectedOfficer] = useState<string>('');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('');

  const handleAddAssignment = () => {
    if (!selectedOfficer || !selectedInstitution) {
      toast.error('Please select both officer and institution');
      return;
    }

    const officer = mockOfficers.find((o) => o.id === selectedOfficer);
    const institution = mockInstitutions.find((i) => i.id === selectedInstitution);

    if (!officer || !institution) return;

    const newAssignment: Assignment = {
      officer_id: officer.id,
      officer_name: officer.name,
      institution_id: institution.id,
      institution_name: institution.name,
      assigned_date: new Date().toISOString().split('T')[0],
      status: 'active',
    };

    setAssignments([...assignments, newAssignment]);
    setSelectedOfficer('');
    setSelectedInstitution('');
    toast.success(`${officer.name} assigned to ${institution.name}`);
  };

  const handleRemoveAssignment = (officerId: string, institutionId: string) => {
    setAssignments(
      assignments.filter(
        (a) => !(a.officer_id === officerId && a.institution_id === institutionId)
      )
    );
    toast.success('Assignment removed');
  };

  const groupedAssignments = assignments.reduce((acc, assignment) => {
    if (!acc[assignment.officer_name]) {
      acc[assignment.officer_name] = [];
    }
    acc[assignment.officer_name].push(assignment);
    return acc;
  }, {} as Record<string, Assignment[]>);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Officer Assignments</h1>
          <p className="text-muted-foreground mt-1">
            Manage officer-institution mappings
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assign Officer to Institution</CardTitle>
            <CardDescription>
              Create new officer-institution assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Select Officer</label>
                <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose officer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockOfficers.map((officer) => (
                      <SelectItem key={officer.id} value={officer.id}>
                        {officer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Select Institution</label>
                <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose institution..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockInstitutions.map((inst) => (
                      <SelectItem key={inst.id} value={inst.id}>
                        {inst.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddAssignment}>
                <Plus className="mr-2 h-4 w-4" />
                Assign
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {Object.entries(groupedAssignments).map(([officerName, officerAssignments]) => (
            <Card key={officerName}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    <CardTitle>{officerName}</CardTitle>
                  </div>
                  <Badge variant="secondary">
                    {officerAssignments.length} assignment{officerAssignments.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {officerAssignments.map((assignment) => (
                    <div
                      key={`${assignment.officer_id}-${assignment.institution_id}`}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{assignment.institution_name}</div>
                          <div className="text-sm text-muted-foreground">
                            Assigned: {new Date(assignment.assigned_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleRemoveAssignment(assignment.officer_id, assignment.institution_id)
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
