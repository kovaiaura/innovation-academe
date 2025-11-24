import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Clock, ChevronRight, ChevronLeft, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { mockAssignments, mockSubmissions } from '@/data/mockAssignmentManagement';
import { StandaloneAssignment, AssignmentAnswer } from '@/types/assignment-management';
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
import { cn } from '@/lib/utils';

export default function TakeAssignment() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<StandaloneAssignment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const foundAssignment = mockAssignments.find(a => a.id === assignmentId);
    if (foundAssignment) {
      setAssignment(foundAssignment);
      if (foundAssignment.duration_minutes) {
        setTimeRemaining(foundAssignment.duration_minutes * 60);
      }
    }
  }, [assignmentId]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && assignment?.duration_minutes) {
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
    }
  }, [timeRemaining, assignment]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, answer);
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (assignment?.questions && currentQuestionIndex < assignment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAutoSubmit = () => {
    toast.info('Time expired! Submitting assignment...');
    handleSubmit();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Create submission
    const assignmentAnswers: AssignmentAnswer[] = assignment?.questions?.map(q => ({
      question_id: q.id,
      answer: answers.get(q.id) || '',
      is_correct: q.correct_answer ? answers.get(q.id) === q.correct_answer : undefined,
      points_earned: q.correct_answer && answers.get(q.id) === q.correct_answer ? q.points : 0,
    })) || [];

    // Calculate auto-graded score
    const autoGradedScore = assignmentAnswers.reduce((sum, a) => sum + (a.points_earned || 0), 0);

    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Assignment submitted successfully! 🎉');
    setIsSubmitting(false);
    navigate(-1);
  };

  if (!assignment) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Assignment Not Found</CardTitle>
              <CardDescription>The assignment you're looking for doesn't exist.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate(-1)}>Go Back</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // File upload type
  if (assignment.assignment_type === 'file_upload') {
    return (
      <Layout>
        <div className="container mx-auto p-6 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>{assignment.title}</CardTitle>
              <CardDescription>{assignment.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {assignment.instructions && (
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Instructions</h3>
                  <p className="text-sm text-muted-foreground">{assignment.instructions}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-semibold">{new Date(assignment.due_date).toLocaleDateString()}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="font-semibold">{assignment.total_points}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Upload Your File</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop your file here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Allowed types: {assignment.allowed_file_types?.join(', ')} • Max size: {assignment.max_file_size_mb}MB
                  </p>
                  <Input type="file" className="mt-4" />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => navigate(-1)} variant="outline">Cancel</Button>
                <Button onClick={() => handleSubmit()}>Submit Assignment</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Text submission type
  if (assignment.assignment_type === 'text_submission') {
    return (
      <Layout>
        <div className="container mx-auto p-6 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>{assignment.title}</CardTitle>
              <CardDescription>{assignment.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {assignment.instructions && (
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Instructions</h3>
                  <p className="text-sm text-muted-foreground">{assignment.instructions}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Your Response</Label>
                <Textarea
                  placeholder="Type your response here..."
                  rows={15}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={() => navigate(-1)} variant="outline">Cancel</Button>
                <Button onClick={() => handleSubmit()}>Submit Assignment</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // URL submission type
  if (assignment.assignment_type === 'url_submission') {
    return (
      <Layout>
        <div className="container mx-auto p-6 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>{assignment.title}</CardTitle>
              <CardDescription>{assignment.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {assignment.instructions && (
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Instructions</h3>
                  <p className="text-sm text-muted-foreground">{assignment.instructions}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Video/Presentation URL</Label>
                <Input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                />
                <p className="text-xs text-muted-foreground">
                  Paste the URL of your video (YouTube, Vimeo, etc.) or presentation
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => navigate(-1)} variant="outline">Cancel</Button>
                <Button onClick={() => handleSubmit()}>Submit Assignment</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Multi-question type
  const currentQuestion = assignment.questions?.[currentQuestionIndex];
  const totalQuestions = assignment.questions?.length || 0;
  const answeredCount = assignment.questions?.filter(q => answers.has(q.id)).length || 0;
  const progress = (answeredCount / totalQuestions) * 100;

  return (
    <>
      <Layout>
        <div className="container mx-auto p-6 max-w-5xl">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{assignment.title}</CardTitle>
                  <CardDescription>
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </CardDescription>
                </div>
                {assignment.duration_minutes && (
                  <div className={cn(
                    "flex items-center gap-2 font-mono text-lg",
                    timeRemaining < 300 ? "text-destructive" : "text-foreground"
                  )}>
                    <Clock className="h-5 w-5" />
                    {formatTime(timeRemaining)}
                  </div>
                )}
              </div>
              <Progress value={progress} className="mt-4" />
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex gap-4">
                {/* Question navigation */}
                <div className="w-48 space-y-2">
                  <p className="text-sm font-medium">Questions</p>
                  <div className="grid grid-cols-4 gap-2">
                    {assignment.questions?.map((q, idx) => (
                      <Button
                        key={q.id}
                        size="sm"
                        variant={idx === currentQuestionIndex ? 'default' : answers.has(q.id) ? 'secondary' : 'outline'}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className="relative"
                      >
                        {idx + 1}
                        {answers.has(q.id) && <CheckCircle className="h-3 w-3 absolute -top-1 -right-1" />}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Question content */}
                <div className="flex-1 space-y-4">
                  {currentQuestion && (
                    <>
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">Question {currentQuestionIndex + 1}</h3>
                          <span className="text-sm text-muted-foreground">{currentQuestion.points} points</span>
                        </div>
                        <p>{currentQuestion.question_text}</p>
                      </div>

                      {/* MCQ */}
                      {currentQuestion.question_type === 'mcq' && (
                        <RadioGroup
                          value={answers.get(currentQuestion.id) || ''}
                          onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                        >
                          {currentQuestion.options?.map((option, idx) => (
                            <div key={idx} className="flex items-center space-x-2 p-3 border rounded-lg">
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
                        <RadioGroup
                          value={answers.get(currentQuestion.id) || ''}
                          onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                        >
                          <div className="flex items-center space-x-2 p-3 border rounded-lg">
                            <RadioGroupItem value="True" id="true" />
                            <Label htmlFor="true" className="flex-1 cursor-pointer">True</Label>
                          </div>
                          <div className="flex items-center space-x-2 p-3 border rounded-lg">
                            <RadioGroupItem value="False" id="false" />
                            <Label htmlFor="false" className="flex-1 cursor-pointer">False</Label>
                          </div>
                        </RadioGroup>
                      )}

                      {/* Short Answer */}
                      {currentQuestion.question_type === 'short_answer' && (
                        <Textarea
                          placeholder="Type your answer here..."
                          value={answers.get(currentQuestion.id) || ''}
                          onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                          rows={6}
                        />
                      )}

                      {/* File Upload */}
                      {currentQuestion.question_type === 'file_upload' && (
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-2">Upload your file</p>
                          <p className="text-xs text-muted-foreground">
                            Allowed: {currentQuestion.allowed_file_types?.join(', ')} • Max: {currentQuestion.max_file_size_mb}MB
                          </p>
                          <Input type="file" className="mt-3" />
                        </div>
                      )}
                    </>
                  )}

                  {/* Navigation buttons */}
                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>

                    {currentQuestionIndex < totalQuestions - 1 ? (
                      <Button onClick={handleNext}>
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button onClick={() => setShowSubmitConfirm(true)}>
                        Submit Assignment
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>

      {/* Submit confirmation dialog */}
      <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {answeredCount} out of {totalQuestions} questions.
              {answeredCount < totalQuestions && (
                <span className="block mt-2 text-yellow-600">
                  <AlertCircle className="inline h-4 w-4 mr-1" />
                  Some questions are unanswered. Are you sure you want to submit?
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Answers</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
