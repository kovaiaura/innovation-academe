import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, MapPin, Users, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';

const mockSessions = [
  {
    id: '1',
    title: 'AI & Machine Learning Workshop',
    description: 'Hands-on workshop covering fundamentals of ML and AI applications',
    date: '2024-12-25',
    start_time: '10:00',
    end_time: '13:00',
    mentor: 'Dr. Sarah Johnson',
    location: 'Innovation Lab A',
    max_participants: 50,
    registered_count: 45,
    status: 'upcoming' as const,
    type: 'workshop' as const,
  },
  {
    id: '2',
    title: 'Startup Pitch Session',
    description: 'Practice pitching your startup ideas to potential investors',
    date: '2024-12-26',
    start_time: '14:00',
    end_time: '17:00',
    mentor: 'John Entrepreneur',
    location: 'Auditorium',
    max_participants: 30,
    registered_count: 28,
    status: 'upcoming' as const,
    type: 'mentorship' as const,
  },
];

export default function Sessions() {
  const [sessions, setSessions] = useState(mockSessions);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);

  const handleCreateSession = () => {
    toast.success('Session created successfully!');
    setIsDialogOpen(false);
  };

  const handleDeleteSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
    toast.success('Session deleted successfully!');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      upcoming: 'bg-blue-500/10 text-blue-500',
      ongoing: 'bg-green-500/10 text-green-500',
      completed: 'bg-gray-500/10 text-gray-500',
      cancelled: 'bg-red-500/10 text-red-500',
    };
    return variants[status] || variants.upcoming;
  };

  return (
    <Layout>
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sessions & Mentorship</h1>
          <p className="text-muted-foreground">Manage workshops, mentorship sessions, and events</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSession(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingSession ? 'Edit Session' : 'Schedule New Session'}</DialogTitle>
              <DialogDescription>
                Create a new workshop, mentorship session, or event for students
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Session title" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe the session" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="mentorship">Mentorship</SelectItem>
                      <SelectItem value="hackathon">Hackathon</SelectItem>
                      <SelectItem value="seminar">Seminar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mentor">Mentor/Speaker</Label>
                  <Input id="mentor" placeholder="Name" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input id="start_time" type="time" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input id="end_time" type="time" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="Venue" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="max_participants">Max Participants</Label>
                  <Input id="max_participants" type="number" placeholder="50" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSession}>
                {editingSession ? 'Update' : 'Create'} Session
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {sessions.map((session) => (
          <Card key={session.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle>{session.title}</CardTitle>
                    <Badge className={getStatusBadge(session.status)}>{session.status}</Badge>
                    <Badge variant="outline">{session.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{session.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setEditingSession(session);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteSession(session.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(session.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {session.start_time} - {session.end_time}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{session.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {session.registered_count}/{session.max_participants} registered
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <span>Mentor: {session.mentor}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      </div>
    </Layout>
  );
}
