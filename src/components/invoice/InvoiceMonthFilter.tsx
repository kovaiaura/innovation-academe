import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth } from 'date-fns';

interface InvoiceMonthFilterProps {
  selectedMonth: Date | null;
  onMonthChange: (date: Date | null) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function InvoiceMonthFilter({ selectedMonth, onMonthChange }: InvoiceMonthFilterProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const handlePrevMonth = () => {
    if (selectedMonth) {
      onMonthChange(subMonths(selectedMonth, 1));
    } else {
      onMonthChange(startOfMonth(subMonths(new Date(), 1)));
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth) {
      onMonthChange(addMonths(selectedMonth, 1));
    } else {
      onMonthChange(startOfMonth(addMonths(new Date(), 1)));
    }
  };

  const handleMonthSelect = (monthIndex: string) => {
    const year = selectedMonth?.getFullYear() || currentYear;
    onMonthChange(new Date(year, parseInt(monthIndex), 1));
  };

  const handleYearSelect = (year: string) => {
    const month = selectedMonth?.getMonth() || new Date().getMonth();
    onMonthChange(new Date(parseInt(year), month, 1));
  };

  const handleClearFilter = () => {
    onMonthChange(null);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevMonth}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Select 
          value={selectedMonth ? selectedMonth.getMonth().toString() : ''} 
          onValueChange={handleMonthSelect}
        >
          <SelectTrigger className="w-28 h-8">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((month, index) => (
              <SelectItem key={month} value={index.toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select 
          value={selectedMonth ? selectedMonth.getFullYear().toString() : ''} 
          onValueChange={handleYearSelect}
        >
          <SelectTrigger className="w-20 h-8">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map(year => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextMonth}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {selectedMonth && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilter}
          className="text-muted-foreground"
        >
          Clear filter
        </Button>
      )}

      {selectedMonth && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Showing: {format(selectedMonth, 'MMMM yyyy')}</span>
        </div>
      )}
    </div>
  );
}
