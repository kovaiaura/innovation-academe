import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Quiz, QuizQuestion, QuizAttempt, QuizAnswer } from '@/types/course';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { autoGradeQuiz } from '@/utils/quizGrading';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { createNotification } from '@/hooks/useNotifications';

interface TakeQuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz: Quiz;
  questions: QuizQuestion[];
  studentId: string;
  studentName: string;
  courseId: string;
  officerId: string;
  attemptNumber: number;
  onSubmit: (attempt: QuizAttempt) => void;
}

export function TakeQuizDialog({
  open,
  onOpenChange,
  quiz,
  questions,
  studentId,
  studentName,
  courseId,
  officerId,
  attemptNumber,
  onSubmit
}: TakeQuizDialogProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string | number>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState(quiz.time_limit_minutes * 60);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [gradedAttempt, setGradedAttempt] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    if (open) {
      setTimeRemaining(quiz.time_limit_minutes * 60);
      setAnswers(new Map());
      setCurrentQuestionIndex(0);
      setShowResults(false);
      setGradedAttempt(null);
    }
  }, [open, quiz.time_limit_minutes]);

  useEffect(() => {
    if (!open || showResults) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, showResults]);

  const currentQuestion = questions[currentQuestionIndex];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, answer: string | number) => {
    setAnswers(new Map(answers).set(questionId, answer));
  };

  const handleAutoSubmit = () => {
    toast.info('Time\'s up! Submitting quiz automatically...');
    handleSubmit();
  };

  const handleSubmit = () => {
    const quizAnswers: QuizAnswer[] = questions.map(q => ({
      question_id: q.id,
      student_answer: answers.get(q.id) || '',
      is_correct: undefined,
      points_earned: undefined
    }));

    const attempt: QuizAttempt = {
      id: `attempt-${Date.now()}`,
      quiz_id: quiz.id,
      quiz_title: quiz.title,
      student_id: studentId,
      student_name: studentName,
      attempt_number: attemptNumber,
      started_at: new Date(Date.now() - (quiz.time_limit_minutes * 60 - timeRemaining) * 1000).toISOString(),
      submitted_at: new Date().toISOString(),
      time_taken_minutes: Math.round((quiz.time_limit_minutes * 60 - timeRemaining) / 60),
      status: 'submitted',
      answers: quizAnswers
    };

    // Auto-grade the quiz
    const graded = autoGradeQuiz(attempt, questions);
    
    // Store in localStorage
    const key = `quiz_attempts_${courseId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(graded);
    localStorage.setItem(key, JSON.stringify(existing));

    // Create notification for officer if manual grading needed
    const needsManualGrading = graded.status === 'submitted';
    if (needsManualGrading) {
      createNotification(
        officerId,
        'officer',
        'quiz_completion',
        'Quiz Needs Grading',
        `${studentName} completed "${quiz.title}" - Contains short answer questions`,
        `/tenant/springfield/officer/grading`,
        {
          quiz_id: quiz.id,
          student_id: studentId,
          attempt_id: graded.id,
          course_id: courseId
        }
      );
    }

    setGradedAttempt(graded);
    setShowResults(true);
    onSubmit(graded);
    
    const passed = (graded.percentage || 0) >= quiz.pass_percentage;
    toast.success(passed ? 'Quiz passed! 🎉' : 'Quiz submitted!');
  };

  const isQuestionAnswered = (questionId: string) => {
    return answers.has(questionId) && answers.get(questionId) !== '';
  };

  const answeredCount = questions.filter(q => isQuestionAnswered(q.id)).length;

  if (showResults && gradedAttempt) {
    const passed = (gradedAttempt.percentage || 0) >= quiz.pass_percentage;
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quiz Results</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className={`p-6 rounded-lg ${passed ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'}`}>
              <h3 className="text-2xl font-bold mb-2">
                {passed ? '✅ Passed!' : '❌ Not Passed'}
              </h3>
              <p className="text-4xl font-bold mb-4">
                {gradedAttempt.percentage?.toFixed(1)}%
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Score</p>
                  <p className="font-semibold">{gradedAttempt.score} points</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Time Taken</p>
                  <p className="font-semibold">{gradedAttempt.time_taken_minutes} minutes</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pass Mark</p>
                  <p className="font-semibold">{quiz.pass_percentage}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Attempt</p>
                  <p className="font-semibold">{attemptNumber} of {quiz.attempts_allowed}</p>
                </div>
              </div>
            </div>

            {gradedAttempt.status === 'submitted' && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⏳ Some questions require manual grading by your instructor. Your final score may change.
                </p>
              </div>
            )}

            {!passed && attemptNumber < quiz.attempts_allowed && (
              <p className="text-sm text-muted-foreground">
                You have {quiz.attempts_allowed - attemptNumber} attempt(s) remaining.
              </p>
            )}

            <Button onClick={() => onOpenChange(false)} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{quiz.title}</span>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <div className={`flex items-center gap-1 font-mono ${timeRemaining < 60 ? 'text-destructive' : ''}`}>
                  <Clock className="h-4 w-4" />
                  {formatTime(timeRemaining)}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex gap-4 overflow-hidden">
            {/* Question navigation sidebar */}
            <div className="w-48 border-r pr-4 overflow-y-auto">
              <p className="text-sm font-medium mb-2">Questions</p>
              <div className="grid grid-cols-4 gap-2">
                {questions.map((q, idx) => (
                  <Button
                    key={q.id}
                    size="sm"
                    variant={idx === currentQuestionIndex ? 'default' : isQuestionAnswered(q.id) ? 'secondary' : 'outline'}
                    className="w-full"
                    onClick={() => setCurrentQuestionIndex(idx)}
                  >
                    {idx + 1}
                  </Button>
                ))}
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                <p>{answeredCount} of {questions.length} answered</p>
              </div>
            </div>

            {/* Question content */}
            <div className="flex-1 overflow-y-auto">
              {currentQuestion && (
                <div className="space-y-6">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs text-muted-foreground">
                        {currentQuestion.question_type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-xs font-semibold">{currentQuestion.points} points</span>
                    </div>
                    <p className="font-medium">{currentQuestion.question_text}</p>
                  </div>

                  {/* MCQ */}
                  {currentQuestion.question_type === 'mcq' && currentQuestion.options && (
                    <RadioGroup
                      value={String(answers.get(currentQuestion.id) || '')}
                      onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                    >
                      {currentQuestion.options.map((option, idx) => (
                        <div key={idx} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted cursor-pointer">
                          <RadioGroupItem value={option} id={`option-${idx}`} />
                          <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {/* True/False */}
                  {currentQuestion.question_type === 'true_false' && (
                    <div className="space-y-3">
                      <Button
                        variant={answers.get(currentQuestion.id) === 'true' ? 'default' : 'outline'}
                        className="w-full"
                        onClick={() => handleAnswerChange(currentQuestion.id, 'true')}
                      >
                        True
                      </Button>
                      <Button
                        variant={answers.get(currentQuestion.id) === 'false' ? 'default' : 'outline'}
                        className="w-full"
                        onClick={() => handleAnswerChange(currentQuestion.id, 'false')}
                      >
                        False
                      </Button>
                    </div>
                  )}

                  {/* Short Answer */}
                  {currentQuestion.question_type === 'short_answer' && (
                    <Textarea
                      placeholder="Enter your answer..."
                      value={String(answers.get(currentQuestion.id) || '')}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      rows={6}
                    />
                  )}

                  {/* Fill in the Blank */}
                  {currentQuestion.question_type === 'fill_blank' && (
                    <Input
                      placeholder="Enter your answer..."
                      value={String(answers.get(currentQuestion.id) || '')}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              {answeredCount} / {questions.length} answered
            </div>

            {currentQuestionIndex < questions.length - 1 ? (
              <Button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => setShowSubmitConfirm(true)}
                variant="default"
              >
                Submit Quiz
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              {answeredCount < questions.length && (
                <p className="text-destructive mb-2">
                  You have answered {answeredCount} of {questions.length} questions.
                </p>
              )}
              Once submitted, you cannot change your answers. Are you sure you want to submit?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Quiz</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              Submit Quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
