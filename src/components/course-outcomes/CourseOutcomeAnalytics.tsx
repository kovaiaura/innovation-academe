import { useMemo, useState } from 'react';
import { BookOpen, CheckCheck, Search, Target, Users, RotateCcw } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { OutcomeInsights } from './OutcomeInsights';
import { OutcomeCourseItem } from './OutcomeCourseItem';
import { isRevisionTopic } from '@/utils/courseOutcomeMetrics';
import { emptyOutcomes, type CourseOutcomeData } from '@/services/course-outcomes.service';
import './courseOutcomes.css';
interface Props { data?: CourseOutcomeData; isLoading: boolean; isError?: boolean; onRetry?: () => void; personal?: boolean; title?: string }
export const CourseOutcomeAnalytics = ({ data = emptyOutcomes(), isLoading, isError, onRetry, personal = false }: Props) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('name');
  const [expanded, setExpanded] = useState<string | null>(null);
  const { tenantId } = useParams();
  const studentPath = personal && tenantId ? `/tenant/${tenantId}/student` : undefined;
  const courses = useMemo(() => data.courseAccuracies.filter(c => c.course_title.toLowerCase().includes(search.toLowerCase()) && (filter === 'all' || (filter === 'revision' ? isRevisionTopic(c) : filter === 'unfinished' ? c.totalSessions > 0 && c.progress < 100 : !c.total_questions))).sort((a, b) => sort === 'completion' ? b.progress - a.progress || a.course_title.localeCompare(b.course_title) : sort === 'accuracy' ? (b.total_questions ? b.accuracy : -1) - (a.total_questions ? a.accuracy : -1) || a.course_title.localeCompare(b.course_title) : a.course_title.localeCompare(b.course_title)), [data, search, filter, sort]);
  const totalAnswers = data.courseAccuracies.reduce((n, c) => n + c.total_questions, 0);
  const correct = data.courseAccuracies.reduce((n, c) => n + c.correct_answers, 0);
  const allocated = data.courseAccuracies.filter(c => c.totalSessions > 0);
  const progress = allocated.length ? Math.round(allocated.reduce((n, c) => n + c.progress, 0) / allocated.length) : 0;
  if (isLoading) return <div className="course-outcomes space-y-6" aria-label="Loading course outcomes" role="status"><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(n => <Skeleton key={n} className="h-24" />)}</div><Skeleton className="h-40" /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[1,2,3].map(n => <Skeleton key={n} className="h-80" />)}</div></div>;
  if (isError) return <div className="py-12 text-center space-y-3" role="alert"><h2 className="font-semibold">Course insights couldn't be loaded</h2><p className="text-muted-foreground text-sm">Please try again. Your learning records are unchanged.</p><Button variant="outline" onClick={onRetry}><RotateCcw className="mr-2 h-4 w-4" />Retry</Button></div>;
  if (!data.courseAccuracies.length) return <div className="course-outcomes py-16 text-center space-y-3"><BookOpen className="mx-auto h-12 w-12 outcome-learning-text" /><h2 className="text-lg font-semibold">A fresh learning journey</h2><p className="text-muted-foreground text-sm">No allocated courses or mapped assessment evidence in this selection yet.</p></div>;
  const stats = [{ label: 'Courses', value: data.courseAccuracies.length, detail: 'In this selection', icon: BookOpen }, { label: 'Learning completion', value: `${progress}%`, detail: 'Average across courses · Cumulative', icon: CheckCheck }, { label: 'Assessment accuracy', value: totalAnswers ? `${Math.round(correct / totalAnswers * 100)}%` : '—', detail: `${totalAnswers.toLocaleString()} answers · Selected year`, icon: Target }, { label: personal ? 'Assessed courses' : 'Learners', value: personal ? data.courseAccuracies.filter(c => c.total_questions).length : data.studentCount.toLocaleString(), detail: personal ? 'With mapped answer evidence' : 'In this selection', icon: Users }];
  return <div className="course-outcomes space-y-7">
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-6" aria-label="Outcome overview">{stats.map(stat => <div key={stat.label} className="outcome-stat min-w-0 border-l-2 pl-4"><p className="flex gap-2 items-center text-sm text-muted-foreground"><stat.icon className="h-4 w-4 shrink-0" />{stat.label}</p><p className="text-3xl font-bold mt-2">{stat.value}</p><p className="text-xs text-muted-foreground mt-1">{stat.detail}</p></div>)}</section>
    <OutcomeInsights data={data} studentPath={studentPath} personal={personal} />
    <section aria-labelledby="outcome-courses-title" className="space-y-5">
      <div><h2 id="outcome-courses-title" className="text-xl font-semibold">{personal ? 'Your course journey' : 'Course insights'}</h2><p className="text-sm text-muted-foreground mt-1">{courses.length} of {data.courseAccuracies.length} courses</p></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_220px_200px]"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Search courses" placeholder="Search courses…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" /></div><Select value={filter} onValueChange={setFilter}><SelectTrigger aria-label="Filter courses"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All courses</SelectItem><SelectItem value="revision">Topics to revisit</SelectItem><SelectItem value="unfinished">Unfinished learning</SelectItem><SelectItem value="unassessed">Not assessed yet</SelectItem></SelectContent></Select><Select value={sort} onValueChange={setSort}><SelectTrigger aria-label="Sort courses"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="name">Course name</SelectItem><SelectItem value="completion">Highest completion</SelectItem><SelectItem value="accuracy">Highest accuracy</SelectItem></SelectContent></Select></div>
      {courses.length ? <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">{courses.map(course => <OutcomeCourseItem key={course.course_id} course={course} data={data} personal={personal} open={expanded === course.course_id} onToggle={() => setExpanded(expanded === course.course_id ? null : course.course_id)} />)}</div> : <div className="py-12 text-center"><p className="text-muted-foreground">No courses match this selection.</p><Button className="mt-3" variant="ghost" onClick={() => {setSearch(''); setFilter('all');}}>Clear filters</Button></div>}
    </section>
  </div>;
};
