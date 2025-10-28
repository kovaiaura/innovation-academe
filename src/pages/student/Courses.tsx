import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, User, PlayCircle } from 'lucide-react';

// Mock data
const mockCourses = [
  {
    id: '1',
    title: 'Advanced Mathematics',
    description: 'Calculus and Trigonometry',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
    teacher: { id: 't1', name: 'Prof. Kumar', avatar: '' },
    progress_percentage: 65,
    next_session: { date: '2024-03-26', time: '10:00' }
  },
  {
    id: '2',
    title: 'Physics - Mechanics',
    description: 'Newton\'s Laws and Motion',
    thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400',
    teacher: { id: 't2', name: 'Dr. Sharma', avatar: '' },
    progress_percentage: 45,
    next_session: { date: '2024-03-27', time: '14:00' }
  },
  {
    id: '3',
    title: 'Computer Science',
    description: 'Data Structures & Algorithms',
    thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400',
    teacher: { id: 't3', name: 'Prof. Patel', avatar: '' },
    progress_percentage: 80,
    next_session: { date: '2024-03-25', time: '15:30' }
  },
  {
    id: '4',
    title: 'Chemistry',
    description: 'Organic Chemistry Fundamentals',
    thumbnail: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=400',
    teacher: { id: 't4', name: 'Dr. Singh', avatar: '' },
    progress_percentage: 30,
    next_session: { date: '2024-03-28', time: '11:00' }
  }
];

export default function Courses() {
  const [courses] = useState(mockCourses);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">Access your enrolled courses and learning materials</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-40 overflow-hidden bg-gradient-to-br from-meta-dark to-meta-dark-lighter">
                {course.thumbnail ? (
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="h-full w-full object-cover opacity-70"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="h-16 w-16 text-meta-accent" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge className="bg-meta-accent text-meta-dark">
                    {course.progress_percentage}% Complete
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={course.progress_percentage} className="h-2" />
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{course.teacher.name}</span>
                </div>

                {course.next_session && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Next: {course.next_session.date} at {course.next_session.time}</span>
                  </div>
                )}

                <Button className="w-full bg-meta-dark hover:bg-meta-dark-lighter">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Continue Learning
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
