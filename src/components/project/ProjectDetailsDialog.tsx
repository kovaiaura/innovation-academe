import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Project } from "@/data/mockProjectData";
import { Calendar, Users, Target, DollarSign, TrendingUp } from "lucide-react";

interface ProjectDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
}

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

export function ProjectDetailsDialog({
  open,
  onOpenChange,
  project
}: ProjectDetailsDialogProps) {
  if (!project) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'in_progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'approved': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'proposal': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{project.title}</DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={getStatusColor(project.status)}>
              {project.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge variant="outline">{project.category}</Badge>
            {project.is_showcase && (
              <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                ⭐ Showcase
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{project.description}</p>
          </div>

          <Separator />

          {/* Key Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium">Start Date</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(project.start_date).toLocaleDateString()}
                </div>
              </div>
            </div>

            {project.completion_date && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Completion Date</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(project.completion_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium">Progress</div>
                <div className="text-sm text-muted-foreground">{project.progress}%</div>
              </div>
            </div>

            {project.funding_required && (
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Funding</div>
                  <div className="text-sm text-muted-foreground">
                    ₹{project.funding_required.toLocaleString()}
                    {project.funding_approved && ' (Approved)'}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Team Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Team Members</h3>
            </div>
            <div className="space-y-2">
              {project.team_members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">{member.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {member.role === 'leader' ? 'Team Leader' : 'Member'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Mentor */}
          <div>
            <h3 className="font-semibold mb-2">Innovation Officer</h3>
            <p className="text-sm text-muted-foreground">{project.created_by_officer_name}</p>
          </div>

          {/* Class */}
          <div>
            <h3 className="font-semibold mb-2">Class</h3>
            <p className="text-sm text-muted-foreground">{project.class}</p>
          </div>

          {/* SDG Goals */}
          {project.sdg_goals.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">SDG Goals</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.sdg_goals.map((goal) => (
                  <Badge key={goal} variant="outline">
                    SDG {goal}: {sdgNames[goal]}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Progress Updates */}
          {project.progress_updates.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Progress Timeline</h3>
                <div className="space-y-3">
                  {project.progress_updates.map((update, index) => (
                    <div key={index} className="border-l-2 border-primary pl-4 pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {new Date(update.date).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          by {update.updated_by}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{update.notes}</p>
                      {update.files && update.files.length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Attachments: {update.files.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Achievements & Awards */}
          {(project.achievements || project.awards) && (
            <>
              <Separator />
              <div className="space-y-4">
                {project.achievements && project.achievements.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Achievements</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {project.achievements.map((achievement, index) => (
                        <li key={index}>{achievement}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {project.awards && project.awards.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Awards</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {project.awards.map((award, index) => (
                        <li key={index}>{award}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
