import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { mockAssessments, mockAssessmentQuestions } from '@/data/mockAssessmentData';
import { AssessmentAnswer } from '@/types/assessment';
import { formatTimeRemaining } from '@/utils/assessmentHelpers';
import { Clock, CheckCircle, Circle, AlertTriangle, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function TakeAssessment() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  
  const assessment = mockAssessments.find(a => a.id === assessmentId);
  const questions = mockAssessmentQuestions.filter(q => q.assessment_id === assessmentId);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState(assessment ? assessment.duration_minutes * 60 : 0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        // Show warning at 5 minutes and 1 minute
        if (prev === 300 || prev === 60) {
          setShowTimeWarning(true);
          setTimeout(() => setShowTimeWarning(false), 5000);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!assessment || questions.length === 0) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Assessment Not Found</h2>
            <p className="text-muted-foreground">The assessment you're looking for doesn't exist.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = answers.size;
  const progress = (answeredCount / questions.length) * 100;

  const handleAnswerSelect = (optionId: string) => {
    const newAnswers = new Map(answers);
    newAnswers.set(currentQuestion.id, optionId);
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionJump = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmit = () => {
    const assessmentAnswers: AssessmentAnswer[] = questions.map(q => {
      const selectedOptionId = answers.get(q.id);
      const isCorrect = selectedOptionId === q.correct_option_id;
      return {
        question_id: q.id,
        selected_option_id: selectedOptionId,
        is_correct: isCorrect,
        points_earned: isCorrect ? q.points : 0,
        time_spent_seconds: 0 // Would be tracked in real implementation
      };
    });

    toast.success('Assessment submitted successfully!');
    navigate('/tenant/default/student/assessments');
  };

  const handleAutoSubmit = () => {
    toast.info('Time is up! Assessment auto-submitted.');
    handleSubmit();
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{assessment.title}</h1>
            <p className="text-muted-foreground">{assessment.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <Badge variant={timeRemaining < 300 ? 'destructive' : 'secondary'} className="text-lg font-mono">
                {formatTimeRemaining(timeRemaining)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Time Warning */}
        {showTimeWarning && (
          <div className="bg-amber-100 border border-amber-300 text-amber-900 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">
              {timeRemaining <= 60 ? '1 minute' : '5 minutes'} remaining!
            </span>
          </div>
        )}

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{answeredCount} / {questions.length} answered</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-sm">Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {questions.map((q, index) => {
                  const isAnswered = answers.has(q.id);
                  const isCurrent = index === currentQuestionIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => handleQuestionJump(index)}
                      className={`
                        aspect-square rounded-md flex items-center justify-center text-sm font-medium
                        transition-colors
                        ${isCurrent ? 'bg-primary text-primary-foreground' : ''}
                        ${!isCurrent && isAnswered ? 'bg-green-100 text-green-700' : ''}
                        ${!isCurrent && !isAnswered ? 'bg-muted hover:bg-muted/80' : ''}
                      `}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Question Display */}
          <div className="col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Question {currentQuestion.question_number} of {questions.length}
                  </CardTitle>
                  <Badge variant="outline">{currentQuestion.points} points</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg">{currentQuestion.question_text}</p>

                {currentQuestion.code_snippet && (
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>{currentQuestion.code_snippet}</code>
                  </pre>
                )}

                <RadioGroup
                  value={answers.get(currentQuestion.id)}
                  onValueChange={handleAnswerSelect}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option) => (
                    <div
                      key={option.id}
                      className={`
                        flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer
                        ${answers.get(currentQuestion.id) === option.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                        }
                      `}
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                        <span className="font-medium mr-2">{option.option_label}.</span>
                        {option.option_text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
              <div className="flex gap-2">
                {currentQuestionIndex === questions.length - 1 ? (
                  <Button onClick={() => setShowSubmitDialog(true)}>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Assessment
                  </Button>
                ) : (
                  <Button onClick={handleNext}>
                    Next
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Assessment?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {answeredCount} out of {questions.length} questions.
              {answeredCount < questions.length && (
                <span className="block mt-2 text-amber-600 font-medium">
                  {questions.length - answeredCount} questions are unanswered and will be marked as incorrect.
                </span>
              )}
              <span className="block mt-2">
                Are you sure you want to submit? This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Answers</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              Submit Assessment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
