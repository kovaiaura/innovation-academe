import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { AssessmentStatusBadge } from '@/components/assessment/AssessmentStatusBadge';
import { QuestionBuilder } from '@/components/assessment/QuestionBuilder';
import { QuestionList } from '@/components/assessment/QuestionList';
import { PublishingSelector } from '@/components/assessment/PublishingSelector';
import { mockAssessments, mockAssessmentQuestions } from '@/data/mockAssessmentData';
import { Assessment, AssessmentQuestion, AssessmentPublishing } from '@/types/assessment';
import { getAssessmentStatus, formatDuration } from '@/utils/assessmentHelpers';
import { Search, Plus, Clock, Award, Users, FileText, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function OfficerAssessmentManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get officer's institution ID from user context
  const officerInstitutionId = user?.tenant_id || '1';
  
  // Filter assessments for this institution only
  const institutionAssessments = mockAssessments.filter(a => {
    // Show generic assessments published to this institution
    const publishedToThisInstitution = a.published_to.some(p => p.institution_id === officerInstitutionId);
    // Show assessments created by officers of this institution
    const createdByThisInstitution = a.created_by_role === 'officer' && a.institution_id === officerInstitutionId;
    return publishedToThisInstitution || createdByThisInstitution;
  });

  // Create Assessment State
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [passPercentage, setPassPercentage] = useState([70]);
  const [autoSubmit, setAutoSubmit] = useState(true);
  const [autoEvaluate, setAutoEvaluate] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [showResultsImmediately, setShowResultsImmediately] = useState(true);
  const [allowReview, setAllowReview] = useState(true);
  const [questions, setQuestions] = useState<Partial<AssessmentQuestion>[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Partial<AssessmentQuestion> | null>(null);
  const [showQuestionBuilder, setShowQuestionBuilder] = useState(false);
  const [publishing, setPublishing] = useState<AssessmentPublishing[]>([]);

  const filteredAssessments = institutionAssessments.filter((assessment) => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const currentStatus = getAssessmentStatus(assessment);
    const matchesFilter = filterStatus === 'all' || currentStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all: institutionAssessments.length,
    draft: institutionAssessments.filter(a => a.status === 'draft').length,
    upcoming: institutionAssessments.filter(a => getAssessmentStatus(a) === 'upcoming').length,
    ongoing: institutionAssessments.filter(a => getAssessmentStatus(a) === 'ongoing').length,
    completed: institutionAssessments.filter(a => getAssessmentStatus(a) === 'completed').length
  };

  const handleAddQuestion = (question: Partial<AssessmentQuestion>) => {
    if (editingQuestion) {
      setQuestions(questions.map(q => q.id === question.id ? question : q));
      toast.success('Question updated');
    } else {
      setQuestions([...questions, { ...question, question_number: questions.length + 1 }]);
      toast.success('Question added');
    }
    setEditingQuestion(null);
    setShowQuestionBuilder(false);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
    toast.success('Question deleted');
  };

  const handleCreateAssessment = () => {
    toast.success('Assessment created successfully');
    setStep(1);
    setTitle('');
    setDescription('');
    setQuestions([]);
    setPublishing([]);
    setActiveTab('all');
  };

  const canEdit = (assessment: Assessment) => {
    return assessment.created_by_role === 'officer' && assessment.institution_id === officerInstitutionId;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Assessment Management</h1>
          <p className="text-muted-foreground">Create and manage assessments for your institution</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Assessments</TabsTrigger>
            <TabsTrigger value="create">Create Assessment</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{statusCounts.all}</div>
                  <p className="text-sm text-muted-foreground">Total</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{statusCounts.ongoing}</div>
                  <p className="text-sm text-muted-foreground">Ongoing</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{statusCounts.upcoming}</div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{statusCounts.completed}</div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              {['all', 'draft', 'upcoming', 'ongoing', 'completed'].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Assessment Grid */}
            <div className="grid gap-4">
              {filteredAssessments.map((assessment) => {
                const currentStatus = getAssessmentStatus(assessment);
                const totalClasses = assessment.published_to.reduce((sum, pub) => sum + pub.class_ids.length, 0);
                const isOfficerCreated = assessment.created_by_role === 'officer';

                return (
                  <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold">{assessment.title}</h3>
                              <AssessmentStatusBadge status={currentStatus} />
                              {isOfficerCreated && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                  Institution Specific
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{assessment.description}</p>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span>{assessment.question_count} questions</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Award className="h-4 w-4 text-muted-foreground" />
                              <span>{assessment.total_points} points</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{formatDuration(assessment.duration_minutes)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{totalClasses} classes</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canEdit(assessment) && (
                            <>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {s}
                  </div>
                  {s < 5 && <div className={`w-20 h-1 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
                </div>
              ))}
            </div>

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <Card>
                <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Duration (minutes) *</Label>
                      <Input type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Date & Time *</Label>
                      <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date & Time *</Label>
                      <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                    </div>
                  </div>
                  <Button onClick={() => setStep(2)} disabled={!title || !description}>Next</Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Settings */}
            {step === 2 && (
              <Card>
                <CardHeader><CardTitle>Scoring & Settings</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Pass Percentage: {passPercentage[0]}%</Label>
                    <Slider value={passPercentage} onValueChange={setPassPercentage} max={100} step={5} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Auto Submit</Label>
                    <Switch checked={autoSubmit} onCheckedChange={setAutoSubmit} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Auto Evaluate</Label>
                    <Switch checked={autoEvaluate} onCheckedChange={setAutoEvaluate} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Shuffle Questions</Label>
                    <Switch checked={shuffleQuestions} onCheckedChange={setShuffleQuestions} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Show Results Immediately</Label>
                    <Switch checked={showResultsImmediately} onCheckedChange={setShowResultsImmediately} />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                    <Button onClick={() => setStep(3)}>Next</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Questions */}
            {step === 3 && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Add Questions ({questions.length} added)</CardTitle>
                      <Button onClick={() => { setEditingQuestion(null); setShowQuestionBuilder(true); }}>
                        <Plus className="h-4 w-4 mr-2" /> Add Question
                      </Button>
                    </div>
                  </CardHeader>
                </Card>

                {showQuestionBuilder && (
                  <QuestionBuilder
                    question={editingQuestion || undefined}
                    questionNumber={editingQuestion ? editingQuestion.question_number! : questions.length + 1}
                    onSave={handleAddQuestion}
                    onCancel={() => { setShowQuestionBuilder(false); setEditingQuestion(null); }}
                  />
                )}

                {!showQuestionBuilder && (
                  <QuestionList
                    questions={questions as AssessmentQuestion[]}
                    onEdit={(q) => { setEditingQuestion(q); setShowQuestionBuilder(true); }}
                    onDelete={handleDeleteQuestion}
                  />
                )}

                {!showQuestionBuilder && (
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                    <Button onClick={() => setStep(4)} disabled={questions.length === 0}>Next</Button>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Publishing */}
            {step === 4 && (
              <Card>
                <CardHeader><CardTitle>Publishing</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <PublishingSelector 
                    value={publishing} 
                    onChange={setPublishing}
                    restrictToInstitution={officerInstitutionId}
                  />
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                    <Button 
                      onClick={() => setStep(5)} 
                      disabled={publishing.length === 0}
                    >
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Review */}
            {step === 5 && (
              <Card>
                <CardHeader><CardTitle>Review & Create</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div><strong>Title:</strong> {title}</div>
                    <div><strong>Duration:</strong> {formatDuration(durationMinutes)}</div>
                    <div><strong>Questions:</strong> {questions.length}</div>
                    <div><strong>Pass Percentage:</strong> {passPercentage[0]}%</div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(4)}>Back</Button>
                    <Button onClick={handleCreateAssessment}>Create Assessment</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
