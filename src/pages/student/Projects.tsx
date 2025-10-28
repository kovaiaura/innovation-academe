import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Target, Users, Upload, Award } from 'lucide-react';

// Mock data
const mockProjects = [
  {
    id: '1',
    title: 'Solar Water Purifier',
    description: 'Low-cost water purification using solar energy',
    sdg_goals: [6, 7],
    team_members: [
      { id: 'u1', name: 'Jane Smith', role: 'leader' as const },
      { id: 'u2', name: 'John Doe', role: 'member' as const }
    ],
    mentor: { id: 'm1', name: 'Dr. Sharma' },
    status: 'ongoing' as const,
    progress_percentage: 45,
    last_update: '2024-03-18T14:30:00Z'
  },
  {
    id: '2',
    title: 'Smart Agriculture System',
    description: 'IoT-based crop monitoring and irrigation',
    sdg_goals: [2, 9, 12],
    team_members: [
      { id: 'u1', name: 'Jane Smith', role: 'member' as const },
      { id: 'u3', name: 'Mike Johnson', role: 'leader' as const }
    ],
    mentor: { id: 'm2', name: 'Prof. Kumar' },
    status: 'approved' as const,
    progress_percentage: 100,
    last_update: '2024-03-20T10:00:00Z'
  }
];

const sdgNames: Record<number, string> = {
  2: 'Zero Hunger',
  6: 'Clean Water',
  7: 'Affordable Energy',
  9: 'Industry Innovation',
  12: 'Responsible Consumption'
};

export default function Projects() {
  const [projects] = useState(mockProjects);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [progressNotes, setProgressNotes] = useState('');

  const handleSubmitProgress = () => {
    toast.success('Progress update submitted successfully');
    setIsUploadOpen(false);
    setProgressNotes('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'bg-blue-500';
      case 'submitted': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Projects</h1>
          <p className="text-muted-foreground">Track your innovation projects and submissions</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-meta-accent" />
                      {project.title}
                    </CardTitle>
                    <CardDescription className="mt-2">{project.description}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress_percentage}%</span>
                  </div>
                  <Progress value={project.progress_percentage} className="h-2" />
                </div>

                <div>
                  <div className="mb-2 text-sm font-medium">SDG Goals</div>
                  <div className="flex flex-wrap gap-2">
                    {project.sdg_goals.map((goal) => (
                      <Badge key={goal} variant="outline">
                        SDG {goal}: {sdgNames[goal]}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Users className="h-4 w-4" />
                    Team Members
                  </div>
                  <div className="space-y-1">
                    {project.team_members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between text-sm">
                        <span>{member.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {member.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Mentor:</span> {project.mentor.name}
                </div>

                {project.status === 'ongoing' && (
                  <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-meta-dark hover:bg-meta-dark-lighter">
                        <Upload className="mr-2 h-4 w-4" />
                        Submit Progress Update
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Submit Progress Update</DialogTitle>
                        <DialogDescription>
                          Upload your work progress, photos, and reports
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="notes">Progress Notes</Label>
                          <Textarea
                            id="notes"
                            placeholder="Describe what you've accomplished..."
                            value={progressNotes}
                            onChange={(e) => setProgressNotes(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="files">Upload Files</Label>
                          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-meta-accent transition-colors cursor-pointer">
                            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Photos, PDFs, or Reports
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSubmitProgress} className="bg-meta-dark hover:bg-meta-dark-lighter">
                          Submit Update
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                {project.status === 'approved' && (
                  <Button className="w-full" variant="outline">
                    <Award className="mr-2 h-4 w-4" />
                    View Certificate
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
