import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Phone, Mail, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface CommunicationLog {
  id: string;
  contact_name: string;
  institution_name: string;
  type: 'call' | 'meeting' | 'email' | 'follow_up';
  subject: string;
  notes: string;
  date: string;
  next_action: string;
  next_action_date: string;
}

const mockLogs: CommunicationLog[] = [
  {
    id: '1',
    contact_name: 'Dr. James Wilson',
    institution_name: 'Springfield University',
    type: 'meeting',
    subject: 'Contract renewal discussion',
    notes: 'Discussed renewal terms and new features. Client interested in AI module.',
    date: '2024-01-15',
    next_action: 'Send proposal with AI module pricing',
    next_action_date: '2024-01-22',
  },
  {
    id: '2',
    contact_name: 'Prof. Emily Carter',
    institution_name: 'River College',
    type: 'call',
    subject: 'Technical support escalation',
    notes: 'Resolved database performance issues. Client satisfied with solution.',
    date: '2024-01-18',
    next_action: 'Follow-up call in 2 weeks',
    next_action_date: '2024-02-01',
  },
  {
    id: '3',
    contact_name: 'Sarah Martinez',
    institution_name: 'Tech Valley School',
    type: 'email',
    subject: 'Initial inquiry about platform',
    notes: 'Sent product brochure and pricing details. Potential lead for Q2.',
    date: '2024-01-20',
    next_action: 'Schedule demo call',
    next_action_date: '2024-01-27',
  },
];

export default function CommunicationLog() {
  const [logs, setLogs] = useState<CommunicationLog[]>(mockLogs);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    contact_name: '',
    institution_name: '',
    type: 'call',
    subject: '',
    notes: '',
    next_action: '',
    next_action_date: '',
  });

  const handleAddLog = () => {
    const newLog: CommunicationLog = {
      id: String(logs.length + 1),
      contact_name: formData.contact_name,
      institution_name: formData.institution_name,
      type: formData.type as CommunicationLog['type'],
      subject: formData.subject,
      notes: formData.notes,
      date: new Date().toISOString().split('T')[0],
      next_action: formData.next_action,
      next_action_date: formData.next_action_date,
    };

    setLogs([newLog, ...logs]);
    setIsAddDialogOpen(false);
    setFormData({
      contact_name: '',
      institution_name: '',
      type: 'call',
      subject: '',
      notes: '',
      next_action: '',
      next_action_date: '',
    });
    toast.success('Communication logged successfully');
  };

  const getTypeIcon = (type: CommunicationLog['type']) => {
    const icons = {
      call: <Phone className="h-4 w-4" />,
      meeting: <Users className="h-4 w-4" />,
      email: <Mail className="h-4 w-4" />,
      follow_up: <Calendar className="h-4 w-4" />,
    };
    return icons[type];
  };

  const getTypeBadge = (type: CommunicationLog['type']) => {
    return (
      <Badge variant="outline" className="gap-1">
        {getTypeIcon(type)}
        {type.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Communication Log</h1>
            <p className="text-muted-foreground mt-1">
              Record and track all client interactions
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Log Communication
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Log New Communication</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact">Contact Name</Label>
                    <Input
                      id="contact"
                      value={formData.contact_name}
                      onChange={(e) =>
                        setFormData({ ...formData, contact_name: e.target.value })
                      }
                      placeholder="Dr. John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="institution">Institution</Label>
                    <Input
                      id="institution"
                      value={formData.institution_name}
                      onChange={(e) =>
                        setFormData({ ...formData, institution_name: e.target.value })
                      }
                      placeholder="University Name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="type">Communication Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Phone Call</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief summary of interaction"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Detailed notes about the communication..."
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="next_action">Next Action</Label>
                    <Input
                      id="next_action"
                      value={formData.next_action}
                      onChange={(e) =>
                        setFormData({ ...formData, next_action: e.target.value })
                      }
                      placeholder="What needs to be done next?"
                    />
                  </div>
                  <div>
                    <Label htmlFor="next_action_date">Next Action Date</Label>
                    <Input
                      id="next_action_date"
                      type="date"
                      value={formData.next_action_date}
                      onChange={(e) =>
                        setFormData({ ...formData, next_action_date: e.target.value })
                      }
                    />
                  </div>
                </div>
                <Button onClick={handleAddLog} className="w-full">
                  Log Communication
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeBadge(log.type)}
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.date).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{log.subject}</CardTitle>
                    <CardDescription className="mt-1">
                      {log.contact_name} • {log.institution_name}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium mb-1">Notes:</div>
                    <p className="text-sm text-muted-foreground">{log.notes}</p>
                  </div>
                  {log.next_action && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">Next Action:</div>
                          <div className="text-sm text-muted-foreground">{log.next_action}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Due: {new Date(log.next_action_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
