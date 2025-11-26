import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CreateSurveyDialog } from '@/components/surveys/CreateSurveyDialog';
import { SurveyAnalytics } from '@/components/surveys/SurveyAnalytics';
import { FeedbackManagementCard } from '@/components/surveys/FeedbackManagementCard';
import { useState, useEffect } from 'react';
import { Survey, mockSurveys, saveSurveys, mockSurveyResponses } from '@/data/mockSurveyData';
import { Feedback, mockFeedback, saveFeedback } from '@/data/mockFeedbackData';
import { Plus, FileText, MessageCircle, TrendingUp, CheckCircle, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function SurveyFeedbackManagement() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [createSurveyOpen, setCreateSurveyOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  // Survey filters
  const [surveyStatusFilter, setSurveyStatusFilter] = useState<string>('all');
  const [surveyInstitutionFilter, setSurveyInstitutionFilter] = useState<string>('all');

  // Feedback filters
  const [feedbackInstitutionFilter, setFeedbackInstitutionFilter] = useState<string>('all');
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState<string>('all');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<string>('all');
  const [feedbackSearch, setFeedbackSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSurveys(mockSurveys);
    setFeedbackList(mockFeedback);
  };

  const handleCreateSurvey = (surveyData: Omit<Survey, 'id'>) => {
    const newSurvey: Survey = {
      ...surveyData,
      id: `survey-${Date.now()}`
    };
    const updatedSurveys = [...surveys, newSurvey];
    setSurveys(updatedSurveys);
    saveSurveys(updatedSurveys);
    toast.success('Survey created and published successfully!');
  };

  const handleCloseSurvey = (surveyId: string) => {
    const updatedSurveys = surveys.map(s =>
      s.id === surveyId ? { ...s, status: 'closed' as const } : s
    );
    setSurveys(updatedSurveys);
    saveSurveys(updatedSurveys);
    toast.success('Survey closed');
  };

  const handleDeleteSurvey = (surveyId: string) => {
    if (!confirm('Are you sure you want to delete this survey?')) return;
    const updatedSurveys = surveys.filter(s => s.id !== surveyId);
    setSurveys(updatedSurveys);
    saveSurveys(updatedSurveys);
    toast.success('Survey deleted');
  };

  const handleViewAnalytics = (survey: Survey) => {
    setSelectedSurvey(survey);
    setAnalyticsOpen(true);
  };

  const handleUpdateFeedback = (id: string, updates: Partial<Feedback>) => {
    const updatedFeedback = feedbackList.map(f =>
      f.id === id ? { ...f, ...updates } : f
    );
    setFeedbackList(updatedFeedback);
    saveFeedback(updatedFeedback);
  };

  // Filter surveys
  const filteredSurveys = surveys.filter(survey => {
    if (surveyStatusFilter !== 'all' && survey.status !== surveyStatusFilter) return false;
    if (surveyInstitutionFilter !== 'all') {
      if (survey.target_audience === 'all_students') return surveyInstitutionFilter === 'all';
      if (!survey.target_ids || !survey.target_ids.includes(surveyInstitutionFilter)) return false;
    }
    return true;
  });

  // Filter feedback
  const filteredFeedback = feedbackList.filter(feedback => {
    if (feedbackInstitutionFilter !== 'all' && feedback.institution_id !== feedbackInstitutionFilter) return false;
    if (feedbackCategoryFilter !== 'all' && feedback.category !== feedbackCategoryFilter) return false;
    if (feedbackStatusFilter !== 'all' && feedback.status !== feedbackStatusFilter) return false;
    if (feedbackSearch && !feedback.subject.toLowerCase().includes(feedbackSearch.toLowerCase()) &&
        !feedback.feedback_text.toLowerCase().includes(feedbackSearch.toLowerCase())) return false;
    return true;
  });

  // Calculate stats
  const totalSurveys = surveys.length;
  const activeSurveys = surveys.filter(s => s.status === 'active').length;
  const totalResponses = mockSurveyResponses.length;
  const avgCompletionRate = surveys.length > 0
    ? Math.round((mockSurveyResponses.filter(r => r.status === 'submitted').length / surveys.length) * 100)
    : 0;

  const totalFeedback = feedbackList.length;
  const pendingFeedback = feedbackList.filter(f => f.status === 'submitted').length;
  const resolvedFeedback = feedbackList.filter(f => f.status === 'resolved').length;
  const avgRating = feedbackList.filter(f => f.rating).length > 0
    ? (feedbackList.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbackList.filter(f => f.rating).length).toFixed(1)
    : 'N/A';

  const institutions = [
    { id: 'inst-msd-001', name: 'Modern School Vasant Vihar' },
    { id: 'inst-kga-001', name: 'Kikani Global Academy' }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Surveys & Feedback Management</h1>
          <p className="text-muted-foreground mt-1">
            Create surveys, manage student feedback, and track responses
          </p>
        </div>

        <Tabs defaultValue="surveys" className="space-y-6">
          <TabsList>
            <TabsTrigger value="surveys">
              <FileText className="h-4 w-4 mr-2" />
              Surveys
            </TabsTrigger>
            <TabsTrigger value="feedback">
              <MessageCircle className="h-4 w-4 mr-2" />
              Feedback
            </TabsTrigger>
          </TabsList>

          <TabsContent value="surveys" className="space-y-6">
            {/* Survey Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Surveys</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{totalSurveys}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Surveys</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span className="text-2xl font-bold">{activeSurveys}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Responses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-blue-500" />
                    <span className="text-2xl font-bold">{totalResponses}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-orange-500" />
                    <span className="text-2xl font-bold">{avgCompletionRate}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters & Create Button */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-3">
                <Select value={surveyStatusFilter} onValueChange={setSurveyStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={surveyInstitutionFilter} onValueChange={setSurveyInstitutionFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Institution" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Institutions</SelectItem>
                    {institutions.map(inst => (
                      <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => setCreateSurveyOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Survey
              </Button>
            </div>

            {/* Surveys List */}
            <div className="grid gap-4">
              {filteredSurveys.length > 0 ? (
                filteredSurveys.map((survey) => {
                  const responses = mockSurveyResponses.filter(r => r.survey_id === survey.id);
                  return (
                    <Card key={survey.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>{survey.title}</CardTitle>
                            <CardDescription className="mt-1">{survey.description}</CardDescription>
                          </div>
                          <Badge variant={survey.status === 'active' ? 'default' : 'secondary'}>
                            {survey.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {survey.target_audience === 'all_students' && <Badge variant="outline">All Students</Badge>}
                          {survey.target_institution_name && <Badge variant="outline">{survey.target_institution_name}</Badge>}
                        </div>

                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Created</p>
                              <p className="font-medium">{new Date(survey.created_at).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Deadline</p>
                              <p className="font-medium">{new Date(survey.deadline).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Responses</p>
                              <p className="font-medium">{responses.length} students</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewAnalytics(survey)}>
                              View Responses
                            </Button>
                            {survey.status === 'active' && (
                              <Button size="sm" variant="outline" onClick={() => handleCloseSurvey(survey.id)}>
                                Close Survey
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => handleDeleteSurvey(survey.id)}>
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No surveys found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            {/* Feedback Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{totalFeedback}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-orange-500" />
                    <span className="text-2xl font-bold">{pendingFeedback}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-2xl font-bold">{resolvedFeedback}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <span className="text-2xl font-bold">{avgRating}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feedback Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search feedback..."
                  value={feedbackSearch}
                  onChange={(e) => setFeedbackSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={feedbackInstitutionFilter} onValueChange={setFeedbackInstitutionFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Institution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Institutions</SelectItem>
                  {institutions.map(inst => (
                    <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={feedbackCategoryFilter} onValueChange={setFeedbackCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="officer">Officer</SelectItem>
                  <SelectItem value="facility">Facility</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={feedbackStatusFilter} onValueChange={setFeedbackStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Feedback List */}
            <div className="space-y-4">
              {filteredFeedback.length > 0 ? (
                filteredFeedback.map((feedback) => (
                  <FeedbackManagementCard
                    key={feedback.id}
                    feedback={feedback}
                    onUpdate={handleUpdateFeedback}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No feedback found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <CreateSurveyDialog
          open={createSurveyOpen}
          onOpenChange={setCreateSurveyOpen}
          onSubmit={handleCreateSurvey}
        />

        <SurveyAnalytics
          survey={selectedSurvey}
          open={analyticsOpen}
          onOpenChange={setAnalyticsOpen}
        />
      </div>
    </Layout>
  );
}
