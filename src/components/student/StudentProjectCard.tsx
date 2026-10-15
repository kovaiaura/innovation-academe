import { ArrowUpRight, Award, FolderKanban, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ProjectWithRelations } from '@/hooks/useProjects';

interface StudentProjectCardProps {
  project: ProjectWithRelations;
  isLeader: boolean;
  onSelect: () => void;
}

const statuses = {
  yet_to_start: { label: 'Yet to Start', variant: 'secondary' as const },
  ongoing: { label: 'Ongoing', variant: 'default' as const },
  completed: { label: 'Completed', variant: 'outline' as const },
};

export function StudentProjectCard({ project, isLeader, onSelect }: StudentProjectCardProps) {
  const status = statuses[project.status] || statuses.yet_to_start;
  const awards = project.project_achievements?.length || 0;

  return (
    <Card className="group relative flex min-w-0 flex-col overflow-hidden rounded-lg transition-shadow hover:shadow-md motion-reduce:transition-none">
      <CardHeader className="space-y-4 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <FolderKanban className="h-5 w-5" aria-hidden="true" />
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <div className="space-y-2">
          <p className="break-words text-xs font-medium text-muted-foreground">{project.category}</p>
          <CardTitle className="line-clamp-3 break-words text-lg leading-snug">{project.title}</CardTitle>
          <p className="line-clamp-2 break-words text-sm leading-relaxed text-muted-foreground">{project.description || 'Innovation project'}</p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 pt-1">
        <div className="flex flex-wrap gap-2">
          {isLeader && <Badge variant="secondary">Team Leader</Badge>}
          {project.is_showcase && <Badge variant="outline"><Award className="mr-1 h-3 w-3" />Showcase</Badge>}
        </div>
        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{project.project_members?.length || 0} members</span>
          {awards > 0 && <span className="flex items-center gap-1.5"><Award className="h-4 w-4" />{awards} {awards === 1 ? 'award' : 'awards'}</span>}
        </div>
        <div className="flex items-center justify-between border-t pt-4 text-sm font-medium text-primary" aria-hidden="true">
          <span>View Details</span><ArrowUpRight className="h-4 w-4" />
        </div>
      </CardContent>
      <Button variant="ghost" className="absolute inset-0 h-full w-full rounded-lg hover:bg-transparent focus-visible:ring-inset" aria-label={`View details for ${project.title}`} onClick={onSelect}>
        <span className="sr-only">View details for {project.title}</span>
      </Button>
    </Card>
  );
}