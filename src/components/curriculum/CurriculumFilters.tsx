import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';

interface Course {
  id: string;
  title: string;
}

interface Module {
  id: string;
  title: string;
  display_order: number;
}

interface CurriculumFiltersProps {
  courses: Course[];
  modules: Module[];
  selectedCourseId: string;
  selectedModuleId: string;
  onCourseChange: (value: string) => void;
  onModuleChange: (value: string) => void;
  onDownloadPDF: () => void;
  onReset: () => void;
  isDownloading: boolean;
}

export function CurriculumFilters({
  courses,
  modules,
  selectedCourseId,
  selectedModuleId,
  onCourseChange,
  onModuleChange,
  onDownloadPDF,
  onReset,
  isDownloading,
}: CurriculumFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="min-w-[200px]">
        <label className="text-sm font-medium text-muted-foreground mb-1 block">Filter by Course</label>
        <Select value={selectedCourseId} onValueChange={onCourseChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[200px]">
        <label className="text-sm font-medium text-muted-foreground mb-1 block">Filter by Level</label>
        <Select value={selectedModuleId} onValueChange={onModuleChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {modules.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" size="sm" onClick={onReset}>
        <RefreshCw className="h-4 w-4 mr-1" /> Reset
      </Button>

      <Button onClick={onDownloadPDF} disabled={isDownloading} size="sm">
        <Download className="h-4 w-4 mr-1" /> {isDownloading ? 'Generating...' : 'Download PDF'}
      </Button>
    </div>
  );
}
