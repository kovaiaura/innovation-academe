import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Survey, SurveyResponse, mockSurveyResponses } from '@/data/mockSurveyData';
import { Download, Users, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SurveyAnalyticsProps {
  survey: Survey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SurveyAnalytics({ survey, open, onOpenChange }: SurveyAnalyticsProps) {
  if (!survey) return null;

  const responses = mockSurveyResponses.filter(r => r.survey_id === survey.id);
  const completedResponses = responses.filter(r => r.status === 'submitted');

  const handleExportCSV = () => {
    // Simple CSV export implementation
    const headers = ['Student ID', 'Submitted At', ...survey.questions.map(q => q.question_text)];
    const rows = completedResponses.map(response => [
      response.student_id,
      new Date(response.submitted_at).toLocaleString(),
      ...survey.questions.map(q => {
        const answer = response.answers.find(a => a.question_id === q.id);
        return answer?.answer || '';
      })
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${survey.title.replace(/\s+/g, '_')}_responses.csv`;
    a.click();
    
    toast.success('Survey responses exported successfully!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{survey.title} - Analytics</DialogTitle>
          <DialogDescription>
            View and analyze survey responses
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 pr-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Responses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{completedResponses.length}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-2xl font-bold">
                      {completedResponses.length > 0 ? '100%' : '0%'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={survey.status === 'active' ? 'default' : 'secondary'}>
                    {survey.status}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Question Analysis */}
            <div className="space-y-4">
              {survey.questions.map((question, index) => (
                <Card key={question.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Q{index + 1}. {question.question_text}
                    </CardTitle>
                    <Badge variant="outline" className="w-fit">{question.question_type}</Badge>
                  </CardHeader>
                  <CardContent>
                    {question.question_type === 'multiple_choice' && question.options && (
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => {
                          const count = completedResponses.filter(r => 
                            r.answers.find(a => a.question_id === question.id)?.answer === option
                          ).length;
                          const percentage = completedResponses.length > 0 
                            ? Math.round((count / completedResponses.length) * 100) 
                            : 0;

                          return (
                            <div key={optIndex}>
                              <div className="flex justify-between text-sm mb-1">
                                <span>{option}</span>
                                <span className="text-muted-foreground">{count} ({percentage}%)</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary transition-all" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {question.question_type === 'rating' && (
                      <div>
                        {completedResponses.length > 0 ? (
                          <div className="text-center">
                            <p className="text-3xl font-bold text-primary">
                              {(completedResponses.reduce((sum, r) => {
                                const answer = r.answers.find(a => a.question_id === question.id);
                                return sum + (Number(answer?.answer) || 0);
                              }, 0) / completedResponses.length).toFixed(1)}
                            </p>
                            <p className="text-sm text-muted-foreground">Average Rating (out of 5)</p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No responses yet</p>
                        )}
                      </div>
                    )}

                    {question.question_type === 'linear_scale' && (
                      <div>
                        {completedResponses.length > 0 ? (
                          <div className="text-center">
                            <p className="text-3xl font-bold text-primary">
                              {(completedResponses.reduce((sum, r) => {
                                const answer = r.answers.find(a => a.question_id === question.id);
                                return sum + (Number(answer?.answer) || 0);
                              }, 0) / completedResponses.length).toFixed(1)}
                            </p>
                            <p className="text-sm text-muted-foreground">Average Score (out of 10)</p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No responses yet</p>
                        )}
                      </div>
                    )}

                    {question.question_type === 'text' && (
                      <div className="space-y-2">
                        {completedResponses.length > 0 ? (
                          completedResponses.map((response) => {
                            const answer = response.answers.find(a => a.question_id === question.id);
                            if (!answer?.answer) return null;
                            return (
                              <div key={response.id} className="p-3 bg-muted rounded-md">
                                <p className="text-sm">{answer.answer}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  - Student {response.student_id}
                                </p>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-sm text-muted-foreground">No responses yet</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleExportCSV} disabled={completedResponses.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
