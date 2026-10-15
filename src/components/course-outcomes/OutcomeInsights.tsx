import { ArrowRight, Compass, Sparkles, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { CourseOutcomeData } from '@/services/course-outcomes.service';

export function OutcomeInsights({ data, studentPath, personal = false }: { data: CourseOutcomeData; studentPath?: string; personal?: boolean }) {
  const next = data.courseAccuracies.find(c => c.nextSession);
  return <section aria-label="Learning insights" className="grid gap-6 border-y py-6 lg:grid-cols-3">
    {[{ title: 'Strong topics', icon: Sparkles, topics: data.strengths, tone: 'outcome-success', empty: personal ? 'More assessment evidence will reveal your strengths.' : 'More assessment evidence will reveal strengths in this group.' }, { title: 'Topics to revisit', icon: Target, topics: data.weaknesses, tone: 'outcome-attention', empty: data.strengths.length ? 'No revision priorities in the assessed topics.' : 'Revision priorities will appear after mapped assessments.' }].map(group => <div key={group.title} className="min-w-0">
      <h2 className="flex items-center gap-2 font-semibold"><group.icon className={`h-5 w-5 shrink-0 ${group.tone}`} />{group.title}</h2>
      {group.topics.length ? <ul className="mt-3 space-y-3">{group.topics.map((topic, index) => <li key={`${topic.type}-${topic.title}-${index}`} className="flex items-start justify-between gap-3 text-sm"><div className="min-w-0"><p className="font-medium break-words">{topic.title}</p><p className="text-xs text-muted-foreground mt-1">{topic.type} · {topic.answers} {topic.answers === 1 ? 'answer' : 'answers'}{topic.answers < 5 ? ' · Small sample' : ''}</p></div><strong className={`shrink-0 ${group.tone}`}>{topic.accuracy}%</strong></li>)}</ul> : <p className="text-sm text-muted-foreground mt-3">{group.empty}</p>}
    </div>)}
    <div className="min-w-0"><h2 className="flex items-center gap-2 font-semibold"><Compass className="h-5 w-5 outcome-learning-text" />{personal ? 'Your next discovery' : 'Learning focus'}</h2>
      {studentPath && next ? <><p className="mt-3 font-medium text-sm break-words">{next.nextSession}</p><p className="text-xs text-muted-foreground mt-1 break-words">{next.course_title}</p><Button asChild variant="outline" size="sm" className="mt-3"><Link to={`${studentPath}/courses/${next.course_id}`}>Continue learning <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></> : <p className="text-sm text-muted-foreground mt-3">{personal ? 'No unfinished unlocked sessions available right now.' : `${data.courseAccuracies.filter(c => c.totalSessions && c.progress < 100).length} courses have unfinished learning. ${data.courseAccuracies.filter(c => !c.total_questions).length} courses have no assessment evidence in this period.`}</p>}
    </div>
  </section>;
}