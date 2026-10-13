import { useEffect, useState } from 'react';
import { CalendarRange, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AcademicYearPeriodConfig,
  AcademicYearPeriodsConfig,
  getDefaultAcademicYearPeriods,
  normalizeAcademicYear,
} from '@/utils/academicYear';

interface AcademicYearPeriodsTabProps {
  currentYear: string;
  periods?: AcademicYearPeriodsConfig;
  saving?: boolean;
  onSave: (current: AcademicYearPeriodConfig, previous: AcademicYearPeriodConfig) => Promise<void>;
}

const initialPeriod = (period?: AcademicYearPeriodConfig, fallback?: AcademicYearPeriodConfig) => ({
  academic_year: period?.academic_year || fallback?.academic_year || '',
  start_date: period?.start_date || fallback?.start_date || '',
  end_date: period?.end_date || fallback?.end_date || '',
});

export function AcademicYearPeriodsTab({ currentYear, periods, saving = false, onSave }: AcademicYearPeriodsTabProps) {
  const defaults = getDefaultAcademicYearPeriods(currentYear);
  const [current, setCurrent] = useState(() => initialPeriod(periods?.current, defaults.current));
  const [previous, setPrevious] = useState(() => initialPeriod(periods?.previous, defaults.previous));

  useEffect(() => {
    setCurrent(initialPeriod(periods?.current, defaults.current));
    setPrevious(initialPeriod(periods?.previous, defaults.previous));
  }, [periods, defaults.current.academic_year, defaults.previous.academic_year]);

  const save = async () => {
    const academicYearPattern = /^\d{4}-\d{2}$/;
    if (!academicYearPattern.test(current.academic_year.trim()) || !academicYearPattern.test(previous.academic_year.trim())) {
      toast.error('Use year labels such as 2026-27');
      return;
    }
    if (normalizeAcademicYear(current.academic_year) === normalizeAcademicYear(previous.academic_year)) {
      toast.error('Current and previous academic years must have different labels');
      return;
    }
    for (const period of [current, previous]) {
      if (!period.start_date || !period.end_date || period.end_date < period.start_date) {
        toast.error('Each academic year needs valid start and end dates');
        return;
      }
    }

    await onSave(
      { ...current, academic_year: current.academic_year.trim() },
      { ...previous, academic_year: previous.academic_year.trim() },
    );
  };

  const renderPeriod = (
    label: string,
    period: AcademicYearPeriodConfig,
    setPeriod: (period: AcademicYearPeriodConfig) => void,
    prefix: string,
  ) => (
    <section className="space-y-4 border-t pt-5 first:border-t-0 first:pt-0">
      <div>
        <h3 className="font-semibold">{label}</h3>
        <p className="text-sm text-muted-foreground">Set the year label and dates used to group activities.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor={`${prefix}-label`}>Academic year label</Label>
          <Input
            id={`${prefix}-label`}
            value={period.academic_year}
            placeholder="2026-27"
            onChange={(event) => setPeriod({ ...period, academic_year: event.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${prefix}-start`}>Start date</Label>
          <Input
            id={`${prefix}-start`}
            type="date"
            value={period.start_date}
            onChange={(event) => setPeriod({ ...period, start_date: event.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${prefix}-end`}>End date</Label>
          <Input
            id={`${prefix}-end`}
            type="date"
            value={period.end_date}
            onChange={(event) => setPeriod({ ...period, end_date: event.target.value })}
          />
        </div>
      </div>
    </section>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <CalendarRange className="mt-1 h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <div>
            <CardTitle>Academic year periods</CardTitle>
            <CardDescription>Configure date ranges for this institute. Activity reports use the activity date.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderPeriod('Current academic year', current, setCurrent, 'current-year')}
        {renderPeriod('Previous academic year', previous, setPrevious, 'previous-year')}
        <div className="flex justify-end border-t pt-4">
          <Button onClick={save} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            Save academic years
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}