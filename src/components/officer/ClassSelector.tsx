import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, BookOpen, Clock } from 'lucide-react';
import { mockInstitutionClasses } from '@/data/mockClassData';
import { mockClassCourseProgress } from '@/data/mockClassTeachingProgress';
import { getStudentsByClass } from '@/data/mockClassStudents';
import { getTeachingStatusColor, getTeachingStatusText } from '@/utils/classTeachingHelpers';
import { format } from 'date-fns';

interface ClassSelectorProps {
  officerId: string;
  institutionId?: string;
  onClassSelect: (classId: string, className: string) => void;
  selectedClassId?: string;
}

export function ClassSelector({ 
  officerId, 
  institutionId = '1', 
  onClassSelect, 
  selectedClassId 
}: ClassSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Get classes for the institution
  const institutionClasses = mockInstitutionClasses.filter(
    c => c.institution_id === institutionId && c.status === 'active'
  );

  // Filter by search query
  const filteredClasses = institutionClasses.filter(c =>
    c.class_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Select a Class</h2>
          <p className="text-muted-foreground mt-1">
            Choose a class to start teaching or continue where you left off
          </p>
        </div>
      </div>

      <Input
        placeholder="Search classes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClasses.map((classItem) => {
          // Get progress data for this class
          const classProgress = mockClassCourseProgress.filter(
            p => p.class_id === classItem.id && p.officer_id === officerId
          );
          
          const studentCount = getStudentsByClass(classItem.id).length;

          const inProgressCourses = classProgress.filter(p => p.status === 'in_progress');
          const lastSession = classProgress
            .filter(p => p.last_session_date)
            .sort((a, b) => 
              new Date(b.last_session_date!).getTime() - new Date(a.last_session_date!).getTime()
            )[0];

          const hasProgress = classProgress.length > 0 && classProgress.some(p => p.total_sessions > 0);
          const status = hasProgress ? 'in_progress' : 'not_started';

          return (
            <Card
              key={classItem.id}
              className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                selectedClassId === classItem.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onClassSelect(classItem.id, classItem.class_name)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{classItem.class_name}</CardTitle>
                    <CardDescription>{classItem.room_number}</CardDescription>
                  </div>
                  <Badge variant={getTeachingStatusColor(status) as any}>
                    {getTeachingStatusText(status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{studentCount} Students</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>
                      {classProgress.length} {classProgress.length === 1 ? 'Course' : 'Courses'} Assigned
                    </span>
                  </div>

                  {lastSession?.last_session_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        Last taught: {format(new Date(lastSession.last_session_date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}

                  {inProgressCourses.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Courses in progress:
                      </p>
                      <div className="space-y-1">
                        {inProgressCourses.slice(0, 2).map(course => (
                          <p key={course.course_id} className="text-xs">
                            • {course.course_code} - {course.completion_percentage}%
                          </p>
                        ))}
                        {inProgressCourses.length > 2 && (
                          <p className="text-xs text-muted-foreground">
                            +{inProgressCourses.length - 2} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No classes found</p>
        </div>
      )}
    </div>
  );
}
