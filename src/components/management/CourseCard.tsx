import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Users, TrendingUp } from "lucide-react";
import { CourseWithEnrollments } from "@/utils/courseHelpers";

interface CourseCardProps {
  course: CourseWithEnrollments;
  onViewDetails: (courseId: string) => void;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'advanced':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'ai_ml':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'web_dev':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'iot':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'robotics':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
    case 'data_science':
      return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
};

export function CourseCard({ course, onViewDetails }: CourseCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        {course.thumbnail_url && (
          <div className="w-full h-32 mb-3 rounded-md overflow-hidden bg-muted">
            <img 
              src={course.thumbnail_url} 
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">{course.course_code}</p>
              <h3 className="font-semibold text-base line-clamp-2">{course.title}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className={getDifficultyColor(course.difficulty)}>
              {course.difficulty}
            </Badge>
            <Badge variant="secondary" className={getCategoryColor(course.category)}>
              {course.category.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{course.duration_weeks} weeks</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="font-medium">{course.total_enrollments} students</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Avg Progress</span>
            <span className="font-medium">{course.avg_progress}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${course.avg_progress}%` }}
            />
          </div>
        </div>

        {course.classes.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Classes Enrolled:</p>
            <div className="flex flex-wrap gap-1">
              {course.classes.map((className, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {className}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Button 
          className="w-full" 
          variant="outline"
          onClick={() => onViewDetails(course.id)}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          View Performance
        </Button>
      </CardContent>
    </Card>
  );
}
