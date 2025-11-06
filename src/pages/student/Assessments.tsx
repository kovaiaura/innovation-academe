import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssessmentCard } from '@/components/assessment/AssessmentCard';
import { mockAssessments, mockAssessmentAttempts } from '@/data/mockAssessmentData';
import { getAssessmentStatus } from '@/utils/assessmentHelpers';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function StudentAssessments() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock student data - in real app, get from user context
  const studentClassId = 'class-1-9a'; // Mock class ID
  const studentId = user?.id || 'student-1';
  
  // Filter assessments published to student's class
  const studentAssessments = mockAssessments.filter(a => 
    a.published_to.some(p => p.class_ids.includes(studentClassId))
  );

  // Get student's attempts
  const studentAttempts = mockAssessmentAttempts.filter(a => a.student_id === studentId);

  // Available assessments (ongoing or upcoming, not yet attempted or can retake)
  const availableAssessments = studentAssessments.filter(a => {
    const status = getAssessmentStatus(a);
    const hasAttempt = studentAttempts.some(attempt => 
      attempt.assessment_id === a.id && attempt.status !== 'in_progress'
    );
    return (status === 'ongoing' || status === 'upcoming') && !hasAttempt;
  }).filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Completed assessments
  const completedAssessments = studentAttempts.filter(attempt => 
    attempt.status === 'evaluated' || attempt.status === 'submitted'
  ).map(attempt => {
    const assessment = mockAssessments.find(a => a.id === attempt.assessment_id);
    return { attempt, assessment };
  }).filter(({ assessment }) => 
    assessment && assessment.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Upcoming assessments
  const upcomingAssessments = studentAssessments.filter(a => {
    const status = getAssessmentStatus(a);
    return status === 'upcoming';
  }).filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Assessments</h1>
          <p className="text-muted-foreground">View and take your assigned assessments</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assessments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available">
              Available ({availableAssessments.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedAssessments.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingAssessments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            {availableAssessments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No available assessments at the moment
              </div>
            ) : (
              <div className="grid gap-4">
                {availableAssessments.map((assessment) => (
                  <AssessmentCard 
                    key={assessment.id} 
                    assessment={assessment}
                    mode="take"
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedAssessments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No completed assessments yet
              </div>
            ) : (
              <div className="grid gap-4">
                {completedAssessments.map(({ attempt, assessment }) => 
                  assessment && (
                    <AssessmentCard 
                      key={attempt.id} 
                      assessment={assessment}
                      attempt={attempt}
                      mode="review"
                    />
                  )
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingAssessments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No upcoming assessments scheduled
              </div>
            ) : (
              <div className="grid gap-4">
                {upcomingAssessments.map((assessment) => (
                  <AssessmentCard 
                    key={assessment.id} 
                    assessment={assessment}
                    mode="upcoming"
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
