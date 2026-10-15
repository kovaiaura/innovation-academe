import { Atom, Bot, CircuitBoard, Cpu, ChevronDown, Layers, Leaf, LockKeyhole, Radio, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { OutcomeProgress } from './OutcomeProgress';
import { isRevisionTopic } from '@/utils/courseOutcomeMetrics';
import type { CourseOutcomeData, OutcomeCourse } from '@/services/course-outcomes.service';

const topicIcon = (title: string) => {
  const lower = title.toLowerCase();
  if (lower.includes('electronic') || lower.includes('circuit')) return CircuitBoard;
  if (lower.includes('robot')) return Bot;
  if (lower.includes('internet') || lower.includes('iot')) return Radio;
  if (lower.includes('intelligence') || lower.includes('coding')) return Cpu;
  if (lower.includes('drone') || lower.includes('space')) return Rocket;
  if (lower.includes('environment')) return Leaf;
  return Atom;
};

export function OutcomeCourseItem({ course, data, open, onToggle, personal }: { course: OutcomeCourse; data: CourseOutcomeData; open: boolean; onToggle: () => void; personal: boolean }) {
  const Icon = topicIcon(course.course_title);
  const modules = data.moduleAccuracies.filter(m => m.course_id === course.course_id);
  const status = !course.total_questions ? 'Not assessed yet' : course.total_questions < 5 ? 'Early assessment evidence' : isRevisionTopic(course) ? 'Revision focus' : 'Strong understanding';
  return <Collapsible open={open} onOpenChange={onToggle} className="rounded-lg border bg-card min-w-0 overflow-hidden">
    <div className="p-5 space-y-5">
      <div className="flex items-start gap-3"><div className="outcome-topic-icon shrink-0"><Icon className="h-6 w-6" /></div><div className="min-w-0 flex-1"><h3 className="font-semibold text-base break-words">{course.course_title}</h3><Badge variant="outline" className="mt-2 font-normal whitespace-normal">{status}</Badge></div></div>
      <OutcomeProgress metric={course} />
      <div className="flex items-center justify-between gap-2 border-t pt-3"><span className="text-xs text-muted-foreground">{personal ? 'Your learning' : `${course.studentCount} learners · Average completion`}</span><Button variant="ghost" size="sm" aria-expanded={open} aria-label={`${open ? 'Hide' : 'Explore'} ${course.course_title} details`} onClick={onToggle}>Details <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} /></Button></div>
    </div>
    <CollapsibleContent className="border-t bg-muted/20 p-5 space-y-5">
      {modules.length ? modules.map(mod => <section key={mod.module_id} className="space-y-3 min-w-0"><h4 className="flex items-start gap-2 text-sm font-semibold"><Layers className="h-4 w-4 shrink-0 mt-0.5" /><span className="break-words">{mod.module_title}</span></h4><OutcomeProgress metric={mod} compact />
        <ul className="space-y-2">{data.sessionAccuracies.filter(s => s.module_id === mod.module_id).map(session => <li key={session.session_id} className="border-t pt-3 text-sm"><p className="break-words font-medium">{session.session_title}</p><div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"><span>{session.totalSessions ? `${session.completedSessions}/${session.totalSessions} completed` : 'No allocated sessions'}</span><span>{session.total_questions ? `${session.accuracy}% accuracy · ${session.correct_answers}/${session.total_questions} correct` : 'Not assessed yet'}</span></div></li>)}</ul>
      </section>) : <p className="text-sm text-muted-foreground flex gap-2"><LockKeyhole className="h-4 w-4 shrink-0" />No level or session breakdown is available for this course.</p>}
    </CollapsibleContent>
  </Collapsible>;
}