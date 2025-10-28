import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Plus } from 'lucide-react';
import { mockAcademicYears } from '@/data/mockCalendarData';
import { AcademicYear } from '@/types/calendar';
import { calculateAcademicYearProgress } from '@/utils/calendarHelpers';
import { format } from 'date-fns';
import { TimelineVisualization } from './TimelineVisualization';

export function AcademicYearPlannerTab() {
  const [academicYears] = useState<AcademicYear[]>(mockAcademicYears);
  const currentYear = academicYears.find((year) => year.is_current);

  const progress = currentYear
    ? calculateAcademicYearProgress(currentYear.start_date, currentYear.end_date)
    : 0;

  return (
    <div className="space-y-6">
      {/* Current Academic Year Overview */}
      {currentYear && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Academic Year: {currentYear.year_label}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(new Date(currentYear.start_date), 'MMM dd, yyyy')} -{' '}
                  {format(new Date(currentYear.end_date), 'MMM dd, yyyy')}
                </p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Year Progress</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <TimelineVisualization academicYear={currentYear} />

            {/* Terms Overview */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Terms</h3>
              <div className="grid gap-4 md:grid-cols-3">
                {currentYear.terms.map((term) => (
                  <Card key={term.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{term.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="text-sm font-medium">
                          {format(new Date(term.start_date), 'MMM dd')} -{' '}
                          {format(new Date(term.end_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      {term.exam_start && term.exam_end && (
                        <div>
                          <p className="text-sm text-muted-foreground">Exams</p>
                          <p className="text-sm font-medium">
                            {format(new Date(term.exam_start), 'MMM dd')} -{' '}
                            {format(new Date(term.exam_end), 'MMM dd')}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Key Dates */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Key Dates</h3>
              <div className="space-y-3">
                {currentYear.key_dates.map((keyDate) => (
                  <div
                    key={keyDate.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                  >
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">{keyDate.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(keyDate.date), 'MMMM dd, yyyy')}
                      </p>
                      {keyDate.description && (
                        <p className="text-sm text-muted-foreground mt-1">{keyDate.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Year Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Academic Year
            </Button>
            <Button variant="outline">View Past Years</Button>
            <Button variant="outline">Apply Template</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
