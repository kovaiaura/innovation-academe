import { CalendarDays } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYear } from '@/contexts/AcademicYearContext';

export function AcademicYearSelector() {
  const { institutionId, currentYear, previousYear, selectedYear, isLoading, setSelectedYear } = useAcademicYear();

  if (!institutionId || isLoading) return null;

  return (
    <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 shadow-sm">
      <CalendarDays className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <span className="text-sm font-medium text-foreground">Academic year</span>
      <Select value={selectedYear} onValueChange={setSelectedYear}>
        <SelectTrigger className="h-8 w-[152px] border-0 bg-transparent px-2 shadow-none focus:ring-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={currentYear}>{currentYear} (Current)</SelectItem>
          <SelectItem value={previousYear}>{previousYear} (Previous)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}