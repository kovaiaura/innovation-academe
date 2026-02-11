import { useState, useEffect } from 'react';
import { AssessmentQuestion } from '@/types/assessment';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, GripVertical, Clock, Award, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface QuestionListProps {
  questions: AssessmentQuestion[];
  onEdit: (question: AssessmentQuestion) => void;
  onDelete: (questionId: string) => void;
}

export const QuestionList = ({ questions, onEdit, onDelete }: QuestionListProps) => {
  const [courseNames, setCourseNames] = useState<Record<string, string>>({});

  // Fetch course/module/session names for display
  useEffect(() => {
    const courseIds = [...new Set(questions.map(q => q.course_id).filter(Boolean))] as string[];
    const moduleIds = [...new Set(questions.map(q => q.module_id).filter(Boolean))] as string[];
    const sessionIds = [...new Set(questions.map(q => q.session_id).filter(Boolean))] as string[];

    if (courseIds.length === 0 && moduleIds.length === 0 && sessionIds.length === 0) return;

    const fetchNames = async () => {
      const names: Record<string, string> = {};
      const [courses, modules, sessions] = await Promise.all([
        courseIds.length > 0 ? supabase.from('courses').select('id, title').in('id', courseIds) : { data: [] },
        moduleIds.length > 0 ? supabase.from('course_modules').select('id, title').in('id', moduleIds) : { data: [] },
        sessionIds.length > 0 ? supabase.from('course_sessions').select('id, title').in('id', sessionIds) : { data: [] },
      ]);
      (courses.data || []).forEach(c => { names[c.id] = c.title; });
      (modules.data || []).forEach(m => { names[m.id] = m.title; });
      (sessions.data || []).forEach(s => { names[s.id] = s.title; });
      setCourseNames(names);
    };
    fetchNames();
  }, [questions]);

  const getCourseMappingLabel = (q: AssessmentQuestion): string | null => {
    const parts: string[] = [];
    if (q.course_id && courseNames[q.course_id]) parts.push(courseNames[q.course_id]);
    if (q.module_id && courseNames[q.module_id]) parts.push(courseNames[q.module_id]);
    if (q.session_id && courseNames[q.session_id]) parts.push(courseNames[q.session_id]);
    return parts.length > 0 ? parts.join(' > ') : null;
  };

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No questions added yet</p>
          <p className="text-sm text-muted-foreground mt-2">Click "Add Question" to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {questions.map((question) => (
        <Card key={question.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {/* Drag Handle */}
              <div className="flex items-center text-muted-foreground cursor-move">
                <GripVertical className="h-5 w-5" />
              </div>

              {/* Question Number Badge */}
              <div className="flex-shrink-0">
                <Badge variant="outline" className="h-8 w-8 rounded-full flex items-center justify-center p-0">
                  {question.question_number}
                </Badge>
              </div>

              {/* Question Content */}
              <div className="flex-1 space-y-2">
                <p className="font-medium">{question.question_text}</p>
                
                {/* Options Preview */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      className={`p-2 rounded border ${
                        option.id === question.correct_option_id
                          ? 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400'
                          : 'border-border'
                      }`}
                    >
                      <span className="font-medium">{option.option_label}.</span> {option.option_text}
                    </div>
                  ))}
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    <span>{question.points} points</span>
                  </div>
                  {question.time_limit_seconds && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{question.time_limit_seconds}s</span>
                    </div>
                  )}
                  {question.image_url && (
                    <Badge variant="secondary" className="text-xs">Has Image</Badge>
                  )}
                  {question.code_snippet && (
                    <Badge variant="secondary" className="text-xs">Has Code</Badge>
                  )}
                </div>
                {/* Course Mapping */}
                {(() => {
                  const label = getCourseMappingLabel(question);
                  return label ? (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <BookOpen className="h-3 w-3" />
                      <span>{label}</span>
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(question)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(question.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
