import { Link } from 'react-router-dom';
import { ArrowRight, Award, BookOpen, Flame, Loader2, Lock, Play, Sparkles, Target, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StorageImage } from '@/components/course/StorageImage';
import { useStudentCourses } from '@/hooks/useClassCourseAssignments';
import companion from '@/assets/student-learning-companion.png';

interface DashboardLearningHubProps {
  name?: string;
  userId?: string;
  classId?: string;
  tenantId?: string;
  assignmentIds: string[];
  coursesEnrolled: number;
  courseProgress: number;
  activeProjects: number;
  completedProjects: number;
  points: number;
  weeklyPoints: number;
  rank: number;
  streak: number;
  badgesEarned: number;
  badgesLocked: number;
  nextBadge?: { name: string; description: string; progress: number };
}

export function DashboardLearningHub(props: DashboardLearningHubProps) {
  const { data: courses = [], isLoading, isError, refetch } = useStudentCourses(props.userId, props.classId);
  const studentPath = props.tenantId ? `/tenant/${props.tenantId}/student` : '/student';
  const inYear = new Set(props.assignmentIds);
  const eligibleCourses = courses.filter(item => item.course && inYear.has(item.id));
  const unfinished = eligibleCourses.filter(item => item.progressPercentage < 100);
  const previews = [...unfinished].sort((a, b) => {
    const aStarted = a.progressPercentage > 0 ? 1 : 0;
    const bStarted = b.progressPercentage > 0 ? 1 : 0;
    return bStarted - aStarted || b.progressPercentage - a.progressPercentage || a.course.title.localeCompare(b.course.title);
  }).slice(0, 2);
  const firstName = props.name?.trim().split(/\s+/)[0] || 'Explorer';
  const stats = [
    { label: 'Total points', value: props.points.toLocaleString(), detail: `+${props.weeklyPoints} this week`, icon: Trophy, tone: 'gold' },
    { label: 'Learning streak', value: `${props.streak} ${props.streak === 1 ? 'day' : 'days'}`, detail: props.streak > 0 ? 'Keep your spark alive' : 'A fresh start awaits', icon: Flame, tone: 'coral' },
    { label: 'Class rank', value: props.rank ? `#${props.rank}` : '—', detail: 'In your class', icon: Target, tone: 'teal' },
    { label: 'Badges earned', value: String(props.badgesEarned), detail: `${props.badgesLocked} more to unlock`, icon: Award, tone: 'berry' },
  ];

  return (
    <>
      <section className="learning-welcome" aria-label="Welcome">
        <div className="learning-welcome-copy">
          <p className="learning-eyebrow"><Sparkles className="h-4 w-4" /> YOUR LEARNING ADVENTURE</p>
          <h1>Hey {firstName},<br />ready to explore?</h1>
          <p className="learning-welcome-subtitle">Small steps. Big discoveries.</p>
          <div className="learning-welcome-progress">
            <BookOpen className="h-4 w-4 shrink-0" />
            <span><strong>{props.coursesEnrolled}</strong> courses enrolled</span>
            <span className="learning-dot" aria-hidden="true">·</span>
            <span><strong>{props.courseProgress}%</strong> overall progress</span>
          </div>
        </div>
        <img src={companion} alt="Friendly learning robot holding a trophy" width={816} height={816} className="learning-companion" />
      </section>

      <section className="learning-stat-strip" aria-label="Your achievements">
        {stats.map(stat => (
          <div key={stat.label} className={`learning-stat learning-tone-${stat.tone}`}>
            <div className="learning-stat-icon"><stat.icon className="h-5 w-5" /></div>
            <div className="min-w-0">
              <p className="learning-stat-label">{stat.label}</p>
              <p className="learning-stat-value">{stat.value}</p>
              <p className="learning-stat-detail">{stat.detail}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="learning-main-grid">
        <section className="min-w-0" aria-labelledby="continue-learning-title">
          <div className="learning-section-heading">
            <div><p className="learning-kicker">YOUR NEXT DISCOVERY</p><h2 id="continue-learning-title">Continue learning</h2></div>
            <Button variant="ghost" size="sm" asChild><Link to={`${studentPath}/courses`}>All courses <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
          {isLoading ? (
            <div className="learning-course-empty" role="status"><Loader2 className="h-6 w-6 animate-spin" /><span>Loading your courses…</span></div>
          ) : isError ? (
            <div className="learning-course-empty"><p>Your courses couldn’t load.</p><Button variant="outline" size="sm" onClick={() => void refetch()}>Try again</Button></div>
          ) : previews.length === 0 ? (
            <div className="learning-course-empty"><BookOpen className="h-8 w-8" /><h3>{eligibleCourses.length > 0 ? 'All caught up!' : 'Your next adventure is on its way'}</h3><p>{eligibleCourses.length > 0 ? 'You’ve completed your courses for this academic year.' : 'No courses assigned in this academic year yet.'}</p><Button variant="outline" asChild><Link to={`${studentPath}/courses`}>View all courses <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div>
          ) : (
            <div className="learning-course-grid">
              {previews.map((item, index) => {
                const course = item.course;
                const hasUnlockedSession = item.modules.some(module => module.is_unlocked !== false && module.sessions.some(session => session.is_unlocked !== false));
                return (
                  <article key={item.id} className={`learning-course learning-tone-${index === 0 ? 'teal' : 'coral'}`}>
                    <div className="learning-course-image">
                      {course.thumbnail_url ? <StorageImage filePath={course.thumbnail_url} alt={course.title} className="h-full w-full object-cover" /> : <div className="learning-course-placeholder"><BookOpen className="h-12 w-12" /></div>}
                      <span className="learning-course-status">{hasUnlockedSession ? (item.progressPercentage > 0 ? 'In progress' : 'Ready to start') : 'Locked'}</span>
                    </div>
                    <div className="learning-course-body">
                      <p className="learning-kicker">{course.category || course.course_code || 'COURSE'}</p>
                      <h3>{course.title}</h3>
                      <div className="learning-course-progress-label"><span>{item.completedSessions}/{item.totalSessions} sessions</span><strong>{item.progressPercentage}%</strong></div>
                      <Progress value={item.progressPercentage} className="learning-progress h-1.5" />
                      <Button className="learning-course-action w-full" asChild><Link to={`${studentPath}/courses/${course.id}`}><span>{hasUnlockedSession ? (item.progressPercentage > 0 ? 'Continue Learning' : 'Start Learning') : 'View Course'}</span>{hasUnlockedSession ? <Play className="h-4 w-4" /> : <Lock className="h-4 w-4" />}</Link></Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="learning-side" aria-label="Achievement goals">
          <div className="learning-goal learning-tone-gold">
            <div className="learning-goal-top"><span className="learning-kicker">NEXT ACHIEVEMENT</span><Sparkles className="h-4 w-4" /></div>
            <div className="learning-goal-medal"><Award className="h-9 w-9" /></div>
            <h3>{props.nextBadge?.name || (props.badgesEarned > 0 ? 'Look at you shine!' : 'Your first badge awaits')}</h3>
            <p>{props.nextBadge?.description || (props.badgesEarned > 0 ? `${props.badgesEarned} badges earned on your learning journey.` : 'Every discovery is a step forward.')}</p>
            {props.nextBadge && <><div className="learning-course-progress-label"><span>Badge progress</span><strong>{props.nextBadge.progress}%</strong></div><Progress value={props.nextBadge.progress} className="learning-progress h-2" /></>}
            <Button variant="ghost" size="sm" asChild><Link to={`${studentPath}/gamification`}>Explore achievements <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
          <div className="learning-project-summary"><Target className="h-6 w-6 shrink-0" /><div><p><strong>{props.activeProjects}</strong> active projects</p><span>{props.completedProjects} completed</span></div><Button variant="ghost" size="icon" asChild><Link to={`${studentPath}/projects`} aria-label="View my projects"><ArrowRight className="h-4 w-4" /></Link></Button></div>
        </aside>
      </div>
    </>
  );
}