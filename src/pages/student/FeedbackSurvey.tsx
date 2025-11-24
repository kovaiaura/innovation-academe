import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SurveyCard } from "@/components/student/SurveyCard";
import { TakeSurveyDialog } from "@/components/student/TakeSurveyDialog";
import { FeedbackForm } from "@/components/student/FeedbackForm";
import { FeedbackItem } from "@/components/student/FeedbackItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MessageSquare, CheckCircle2, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { Survey, mockSurveys, SurveyResponse, mockSurveyResponses } from "@/data/mockSurveyData";
import { Feedback, mockFeedback } from "@/data/mockFeedbackData";

export default function FeedbackSurvey() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>([]);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [takeSurveyOpen, setTakeSurveyOpen] = useState(false);

  useEffect(() => {
    // Load data from localStorage or use mock data
    const storedResponses = localStorage.getItem('survey_responses');
    const storedFeedback = localStorage.getItem('student_feedback');

    setSurveys(mockSurveys);
    setSurveyResponses(storedResponses ? JSON.parse(storedResponses) : mockSurveyResponses);
    setFeedbackList(storedFeedback ? JSON.parse(storedFeedback) : mockFeedback.filter(f => f.student_id === 'student-1'));
  }, []);

  const isSurveyCompleted = (surveyId: string) => {
    return surveyResponses.some(r => r.survey_id === surveyId && r.status === 'submitted');
  };

  const handleTakeSurvey = (survey: Survey) => {
    setSelectedSurvey(survey);
    setTakeSurveyOpen(true);
  };

  const handleSubmitSurvey = (response: Omit<SurveyResponse, 'id' | 'submitted_at'>) => {
    const newResponse: SurveyResponse = {
      ...response,
      id: `response-${Date.now()}`,
      submitted_at: new Date().toISOString()
    };

    const updatedResponses = [...surveyResponses, newResponse];
    setSurveyResponses(updatedResponses);
    localStorage.setItem('survey_responses', JSON.stringify(updatedResponses));
    setTakeSurveyOpen(false);
  };

  const handleSubmitFeedback = (feedback: Omit<Feedback, 'id' | 'submitted_at' | 'status'>) => {
    const newFeedback: Feedback = {
      ...feedback,
      id: `feedback-${Date.now()}`,
      submitted_at: new Date().toISOString(),
      status: 'submitted'
    };

    const updatedFeedback = [newFeedback, ...feedbackList];
    setFeedbackList(updatedFeedback);
    
    // In a real app, this would be saved to the server
    localStorage.setItem('student_feedback', JSON.stringify(updatedFeedback));
  };

  const activeSurveys = surveys.filter(s => s.status === 'active' && !isSurveyCompleted(s.id));
  const completedSurveys = surveys.filter(s => isSurveyCompleted(s.id));

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Feedback & Surveys</h1>
          <p className="text-muted-foreground">
            Complete surveys and share your feedback to help us improve
          </p>
        </div>

        <Tabs defaultValue="surveys" className="space-y-6">
          <TabsList>
            <TabsTrigger value="surveys">
              <FileText className="h-4 w-4 mr-2" />
              Surveys
            </TabsTrigger>
            <TabsTrigger value="feedback">
              <MessageSquare className="h-4 w-4 mr-2" />
              Feedback
            </TabsTrigger>
          </TabsList>

          <TabsContent value="surveys" className="space-y-6">
            {activeSurveys.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Pending Surveys</h2>
                <div className="grid gap-4">
                  {activeSurveys.map((survey) => (
                    <SurveyCard
                      key={survey.id}
                      survey={survey}
                      isCompleted={false}
                      onTakeSurvey={handleTakeSurvey}
                    />
                  ))}
                </div>
              </div>
            )}

            {completedSurveys.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Completed Surveys</h2>
                <div className="grid gap-4">
                  {completedSurveys.map((survey) => (
                    <SurveyCard
                      key={survey.id}
                      survey={survey}
                      isCompleted={true}
                      onTakeSurvey={handleTakeSurvey}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeSurveys.length === 0 && completedSurveys.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No surveys available at the moment</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <FeedbackForm onSubmit={handleSubmitFeedback} />
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Feedback History</CardTitle>
                    <CardDescription>
                      Track the status of your submitted feedback
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[600px] pr-4">
                      {feedbackList.length > 0 ? (
                        <div className="space-y-4">
                          {feedbackList.map((feedback) => (
                            <FeedbackItem key={feedback.id} feedback={feedback} />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground">No feedback submitted yet</p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <TakeSurveyDialog
          survey={selectedSurvey}
          open={takeSurveyOpen}
          onClose={() => setTakeSurveyOpen(false)}
          onSubmit={handleSubmitSurvey}
        />
      </div>
    </Layout>
  );
}
