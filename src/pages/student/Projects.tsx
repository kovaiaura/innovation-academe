import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Eye, Award } from "lucide-react";
import { getProjectsByStudent, Project } from "@/data/mockProjectData";
import { ProjectDetailsDialog } from "@/components/project/ProjectDetailsDialog";
import { useAuth } from "@/contexts/AuthContext";

const sdgNames: Record<number, string> = {
  1: 'No Poverty',
  2: 'Zero Hunger',
  3: 'Good Health',
  4: 'Quality Education',
  6: 'Clean Water',
  7: 'Affordable Energy',
  8: 'Economic Growth',
  9: 'Industry Innovation',
  11: 'Sustainable Cities',
  12: 'Responsible Consumption',
  13: 'Climate Action',
};

export default function Projects() {
  const { user } = useAuth();
  const currentStudentId = user?.id || '';
  const projects = getProjectsByStudent(currentStudentId);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'in_progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'approved': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'proposal': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Innovation Projects</h1>
          <p className="text-muted-foreground">
            Track your innovation projects and collaborate with your team
          </p>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                You are not part of any innovation project yet. Contact your innovation officer to join a project.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {projects.map((project) => {
              const isLeader = project.team_members.find(m => m.id === currentStudentId)?.role === 'leader';
              
              return (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 flex-wrap">
                          {project.title}
                          {isLeader && (
                            <Badge variant="outline" className="text-xs">Team Leader</Badge>
                          )}
                          {project.is_showcase && (
                            <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                              ⭐ Showcase
                            </Badge>
                          )}
                          {project.event_id && project.event_title && (
                            <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs">
                              📅 Event: {project.event_title}
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Progress */}
                    {project.status !== 'proposal' && project.status !== 'rejected' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Project Progress</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} />
                      </div>
                    )}

                    {/* Project Details */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Team Members</h4>
                        <div className="space-y-1">
                          {project.team_members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between text-sm">
                              <span>{member.name}</span>
                              {member.role === 'leader' && (
                                <Badge variant="outline" className="text-xs">Leader</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold mb-2">Project Info</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Mentor:</span>
                            <span className="font-medium">{project.created_by_officer_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Category:</span>
                            <span className="font-medium">{project.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Started:</span>
                            <span className="font-medium">
                              {new Date(project.start_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SDG Goals */}
                    {project.sdg_goals.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">SDG Goals</h4>
                        <div className="flex flex-wrap gap-2">
                          {project.sdg_goals.map((goal) => (
                            <Badge key={goal} variant="outline">
                              SDG {goal}: {sdgNames[goal]}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Latest Update */}
                    {project.progress_updates.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Latest Update</h4>
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>{new Date(project.progress_updates[project.progress_updates.length - 1].date).toLocaleDateString()}</span>
                            <span>by {project.progress_updates[project.progress_updates.length - 1].updated_by}</span>
                          </div>
                          <p className="text-sm">{project.progress_updates[project.progress_updates.length - 1].notes}</p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedProject(project);
                          setIsDetailsDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Details
                      </Button>

                      {project.status === 'completed' && (
                        <Button variant="outline">
                          <Award className="h-4 w-4 mr-2" />
                          View Certificate
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <ProjectDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        project={selectedProject}
      />
    </Layout>
  );
}
