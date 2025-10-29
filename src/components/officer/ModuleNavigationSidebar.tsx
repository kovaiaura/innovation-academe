import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Video,
  Link as LinkIcon,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { mockContent } from '@/data/mockCourseData';
import type { CourseModule, CourseContent } from '@/types/course';
import type { ContentCompletion, CourseProgress } from '@/types/contentCompletion';

interface ModuleNavigationSidebarProps {
  modules: CourseModule[];
  selectedModuleId: string | null;
  selectedContentId: string | null;
  onModuleSelect: (moduleId: string) => void;
  onContentSelect: (contentId: string, moduleId: string) => void;
  completions: ContentCompletion[];
  courseProgress: CourseProgress;
}

export function ModuleNavigationSidebar({
  modules,
  selectedModuleId,
  selectedContentId,
  onModuleSelect,
  onContentSelect,
  completions,
  courseProgress,
}: ModuleNavigationSidebarProps) {
  const [openModules, setOpenModules] = useState<string[]>(
    selectedModuleId ? [selectedModuleId] : []
  );

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
    onModuleSelect(moduleId);
  };

  const getContentIcon = (type: CourseContent['type']) => {
    const iconClass = "h-4 w-4";
    switch (type) {
      case 'pdf':
        return <FileText className={iconClass} />;
      case 'video':
      case 'youtube':
        return <Video className={iconClass} />;
      case 'ppt':
        return <FileText className={iconClass} />;
      case 'link':
      case 'simulation':
        return <LinkIcon className={iconClass} />;
      default:
        return <FileText className={iconClass} />;
    }
  };

  const isContentCompleted = (contentId: string) => {
    return completions.some(c => c.content_id === contentId && c.completed);
  };

  const getCompletionTime = (contentId: string) => {
    const completion = completions.find(c => c.content_id === contentId && c.completed);
    if (!completion) return null;
    try {
      return formatDistanceToNow(new Date(completion.completed_at), { addSuffix: true });
    } catch {
      return null;
    }
  };

  return (
    <div className="w-72 border-r bg-muted/30 flex flex-col">
      <div className="p-4 border-b bg-card">
        <h2 className="font-semibold text-lg">Course Content</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {modules.length} modules
        </p>
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{Math.round(courseProgress.percentage)}%</span>
          </div>
          <Progress value={courseProgress.percentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {courseProgress.completed_content} of {courseProgress.total_content} completed
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {modules
            .sort((a, b) => a.order - b.order)
            .map((module) => {
              const moduleContents = mockContent
                .filter(c => c.module_id === module.id)
                .sort((a, b) => a.order - b.order);
              const isOpen = openModules.includes(module.id);
              const isSelected = selectedModuleId === module.id;
              const moduleProgressData = courseProgress.modules.find(m => m.module_id === module.id);
              const completedCount = moduleProgressData?.completed_content || 0;
              const totalCount = moduleProgressData?.total_content || 0;

              return (
                <Collapsible
                  key={module.id}
                  open={isOpen}
                  onOpenChange={() => toggleModule(module.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant={isSelected ? "secondary" : "ghost"}
                      className="w-full justify-start font-medium"
                    >
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 mr-2" />
                      ) : (
                        <ChevronRight className="h-4 w-4 mr-2" />
                      )}
                      <span className="flex-1 text-left truncate">
                        {module.title}
                      </span>
                      <div className="flex items-center gap-1">
                        {completedCount === totalCount && totalCount > 0 && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                        <Badge variant="outline" className="ml-1">
                          {completedCount}/{totalCount}
                        </Badge>
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="ml-4 mt-1 space-y-1">
                    {moduleContents.map((content) => {
                      const isContentSelected = selectedContentId === content.id;
                      const completed = isContentCompleted(content.id);
                      const completionTime = getCompletionTime(content.id);
                      
                      return (
                        <div key={content.id} className="space-y-0.5">
                          <Button
                            variant={isContentSelected ? "secondary" : "ghost"}
                            size="sm"
                            className="w-full justify-start text-sm"
                            onClick={() => onContentSelect(content.id, module.id)}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {completed ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              )}
                              {getContentIcon(content.type)}
                              <span className="truncate flex-1 text-left">
                                {content.title}
                              </span>
                            </div>
                          </Button>
                          {completed && completionTime && (
                            <p className="text-xs text-muted-foreground ml-11 px-2">
                              Completed {completionTime}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
        </div>
      </ScrollArea>
    </div>
  );
}
