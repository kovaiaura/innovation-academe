import { Card, CardContent } from '@/components/ui/card';

export interface CurriculumLevel {
  moduleId: string;
  moduleTitle: string;
  courses: {
    courseId: string;
    courseTitle: string;
    sessions: { id: string; title: string; display_order: number }[];
  }[];
}

interface CurriculumDisplayProps {
  data: CurriculumLevel[];
}

export function CurriculumDisplay({ data }: CurriculumDisplayProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No curriculum data found for the selected filters.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {data.map((level) => (
        <Card key={level.moduleId} className="overflow-hidden">
          <div className="bg-primary px-6 py-3">
            <h2 className="text-xl font-bold text-primary-foreground uppercase tracking-wide">
              {level.moduleTitle}
            </h2>
          </div>
          <CardContent className="p-6 space-y-6">
            {level.courses.map((course) => (
              <div key={course.courseId}>
                <h3 className="text-lg font-semibold text-foreground mb-2">{course.courseTitle}</h3>
                {course.sessions.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    {course.sessions
                      .sort((a, b) => a.display_order - b.display_order)
                      .map((s, idx) => (
                        <li key={s.id}>Session {idx + 1}: {s.title}</li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic ml-2">No sessions</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
