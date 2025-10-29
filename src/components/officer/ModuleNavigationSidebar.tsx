import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  FileQuestion,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { mockContent } from '@/data/mockCourseData';
import type { CourseModule, CourseContent } from '@/types/course';

interface ModuleNavigationSidebarProps {
  modules: CourseModule[];
  selectedModuleId: string | null;
  selectedContentId: string | null;
  onModuleSelect: (moduleId: string) => void;
  onContentSelect: (contentId: string, moduleId: string) => void;
}

export function ModuleNavigationSidebar({
  modules,
  selectedModuleId,
  selectedContentId,
  onModuleSelect,
  onContentSelect,
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

  return (
    <div className="w-72 border-r bg-muted/30 flex flex-col">
      <div className="p-4 border-b bg-card">
        <h2 className="font-semibold text-lg">Course Content</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {modules.length} modules
        </p>
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
                      <Badge variant="outline" className="ml-2">
                        {moduleContents.length}
                      </Badge>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="ml-4 mt-1 space-y-1">
                    {moduleContents.map((content) => {
                      const isContentSelected = selectedContentId === content.id;
                      return (
                        <Button
                          key={content.id}
                          variant={isContentSelected ? "secondary" : "ghost"}
                          size="sm"
                          className="w-full justify-start text-sm"
                          onClick={() => onContentSelect(content.id, module.id)}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {getContentIcon(content.type)}
                            <span className="truncate flex-1 text-left">
                              {content.title}
                            </span>
                          </div>
                        </Button>
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
