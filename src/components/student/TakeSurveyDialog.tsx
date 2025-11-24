import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Survey, SurveyResponse } from "@/data/mockSurveyData";
import { SurveyQuestion } from "./SurveyQuestion";
import { useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

interface TakeSurveyDialogProps {
  survey: Survey | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (response: Omit<SurveyResponse, 'id' | 'submitted_at'>) => void;
}

export function TakeSurveyDialog({ survey, open, onClose, onSubmit }: TakeSurveyDialogProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string | string[] | number>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!survey) return null;

  const currentQuestion = survey.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / survey.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === survey.questions.length - 1;
  const currentAnswer = responses[currentQuestion.id];

  const canProceed = !currentQuestion.required || (
    currentAnswer !== undefined && 
    currentAnswer !== '' && 
    (Array.isArray(currentAnswer) ? currentAnswer.length > 0 : true)
  );

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleAnswerChange = (questionId: string, value: string | string[] | number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = () => {
    // Check if all required questions are answered
    const unansweredRequired = survey.questions.filter(q => {
      const answer = responses[q.id];
      return q.required && (
        answer === undefined || 
        answer === '' ||
        (Array.isArray(answer) && answer.length === 0)
      );
    });

    if (unansweredRequired.length > 0) {
      toast.error("Please answer all required questions");
      return;
    }

    const surveyResponse: Omit<SurveyResponse, 'id' | 'submitted_at'> = {
      survey_id: survey.id,
      student_id: 'student-1', // This would come from auth context
      responses: Object.entries(responses).map(([question_id, answer]) => ({
        question_id,
        answer
      })),
      status: 'submitted'
    };

    onSubmit(surveyResponse);
    setSubmitted(true);
    toast.success("Survey submitted successfully!");
    
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const handleClose = () => {
    setCurrentQuestionIndex(0);
    setResponses({});
    setSubmitted(false);
    onClose();
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
            <p className="text-muted-foreground">
              Your responses have been submitted successfully.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{survey.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-auto">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestionIndex + 1} of {survey.questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>

          <div className="py-6">
            <SurveyQuestion
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              value={currentAnswer}
              onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            />
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed}
          >
            {isLastQuestion ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Submit
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
