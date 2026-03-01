import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns';

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface InvoiceDateFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

type Preset = 'all' | 'month' | 'quarter' | 'year' | 'custom';

export function InvoiceDateFilter({ dateRange, onDateRangeChange }: InvoiceDateFilterProps) {
  const [activePreset, setActivePreset] = useState<Preset>('all');
  const [customFromOpen, setCustomFromOpen] = useState(false);
  const [customToOpen, setCustomToOpen] = useState(false);

  const handlePreset = (preset: Preset) => {
    setActivePreset(preset);
    const now = new Date();
    switch (preset) {
      case 'all':
        onDateRangeChange({ from: null, to: null });
        break;
      case 'month':
        onDateRangeChange({ from: startOfMonth(now), to: endOfMonth(now) });
        break;
      case 'quarter':
        onDateRangeChange({ from: startOfQuarter(now), to: endOfQuarter(now) });
        break;
      case 'year':
        onDateRangeChange({ from: startOfYear(now), to: endOfYear(now) });
        break;
      case 'custom':
        // Keep existing range, user will pick dates
        break;
    }
  };

  const presets: { key: Preset; label: string }[] = [
    { key: 'all', label: 'All Time' },
    { key: 'month', label: 'This Month' },
    { key: 'quarter', label: 'This Quarter' },
    { key: 'year', label: 'This Year' },
    { key: 'custom', label: 'Custom' },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {presets.map(p => (
        <Button
          key={p.key}
          variant={activePreset === p.key ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePreset(p.key)}
          className="h-8"
        >
          {p.label}
        </Button>
      ))}

      {activePreset === 'custom' && (
        <div className="flex items-center gap-1">
          <Popover open={customFromOpen} onOpenChange={setCustomFromOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                <CalendarIcon className="h-3 w-3" />
                {dateRange.from ? format(dateRange.from, 'dd MMM yyyy') : 'From'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRange.from || undefined}
                onSelect={(d) => {
                  onDateRangeChange({ ...dateRange, from: d || null });
                  setCustomFromOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <span className="text-xs text-muted-foreground">—</span>
          <Popover open={customToOpen} onOpenChange={setCustomToOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                <CalendarIcon className="h-3 w-3" />
                {dateRange.to ? format(dateRange.to, 'dd MMM yyyy') : 'To'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRange.to || undefined}
                onSelect={(d) => {
                  onDateRangeChange({ ...dateRange, to: d || null });
                  setCustomToOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}
