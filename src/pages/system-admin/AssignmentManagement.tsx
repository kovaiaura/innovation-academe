import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AssignmentCard } from '@/components/assignment-management/AssignmentCard';
import { AssignmentPublishingSelector, PublishingSelection } from '@/components/assignment-management/AssignmentPublishingSelector';
import { AssignmentQuestionBuilder } from '@/components/assignment-management/AssignmentQuestionBuilder';
import { AssignmentDetailsDialog } from '@/components/assignment-management/AssignmentDetailsDialog';
import { DeleteAssignmentDialog } from '@/components/assignment-management/DeleteAssignmentDialog';
import { mockAssignments, mockAssignmentStats, getAssignmentsByStatus } from '@/data/mockAssignmentManagement';
import { mockInstitutionClasses } from '@/data/mockClassData';
import { StandaloneAssignment, AssignmentType, LateSubmissionPolicy, AssignmentQuestion } from '@/types/assignment-management';
import { FileText, ClipboardList, Calendar, TrendingUp, Plus, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function AssignmentManagement() {
  const [activeTab, setActiveTab] = useState('all');
  const [createStep, setCreateStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Assignment state
  const [assignments, setAssignments] = useState(mockAssignments);
  
  // View dialog state
  const [selectedAssignment, setSelectedAssignment] = useState<StandaloneAssignment | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  // Delete dialog state
  const [assignmentToDelete, setAssignmentToDelete] = useState<StandaloneAssignment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [assignmentType, setAssignmentType] = useState<AssignmentType>('file_upload');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');
  const [totalPoints, setTotalPoints] = useState(100);
  const [latePolicy, setLatePolicy] = useState<LateSubmissionPolicy>('allowed_with_penalty');
  const [latePenalty, setLatePenalty] = useState(10);
  const [allowedFileTypes, setAllowedFileTypes] = useState('pdf,docx');
  const [maxFileSize, setMaxFileSize] = useState(10);
  const [publishing, setPublishing] = useState<PublishingSelection[]>([]);
  const [questions, setQuestions] = useState<AssignmentQuestion[]>([]);

  const stats = mockAssignmentStats;
  
  // Filter assignments based on search and active tab
  const filteredAssignments = searchQuery
    ? assignments.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeTab === 'all'
      ? assignments
      : assignments.filter(a => a.status === activeTab);

  // Mock institutions with classes
  const institutions = [
    {
      id: '1',
      name: 'Central High School',
      classes: mockInstitutionClasses.filter(c => c.institution_id === '1').map(c => ({
        id: c.id,
        name: c.class_name,
      })),
    },
    {
      id: '2',
      name: 'Tech Institute',
      classes: mockInstitutionClasses.filter(c => c.institution_id === '2').map(c => ({
        id: c.id,
        name: c.class_name,
      })),
    },
  ];

  const handleNextStep = () => {
    if (createStep === 1) {
      if (!title || !description || !dueDate) {
        toast.error('Please fill in all required fields');
        return;
      }
    }

    if (createStep === 4 && assignmentType === 'multi_question' && questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    if (createStep === 5 && publishing.length === 0) {
      toast.error('Please select at least one institution and class');
      return;
    }

    if (createStep < 6) {
      setCreateStep(createStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (createStep > 1) {
      setCreateStep(createStep - 1);
    }
  };

  const handleViewAssignment = (assignment: StandaloneAssignment) => {
    setSelectedAssignment(assignment);
    setViewDialogOpen(true);
  };

  const handleEditAssignment = (assignment: StandaloneAssignment) => {
    // Pre-populate form with assignment data
    setTitle(assignment.title);
    setDescription(assignment.description);
    setInstructions(assignment.instructions || '');
    setAssignmentType(assignment.assignment_type);
    setDueDate(assignment.due_date);
    setDueTime(assignment.due_time || '23:59');
    setTotalPoints(assignment.total_points);
    setLatePolicy(assignment.late_submission_policy);
    setLatePenalty(assignment.late_penalty_percentage || 10);
    setAllowedFileTypes(assignment.allowed_file_types?.join(',') || 'pdf,docx');
    setMaxFileSize(assignment.max_file_size_mb || 10);
    setQuestions(assignment.questions || []);
    setPublishing(assignment.publishing.map(pub => ({
      institution_id: pub.institution_id,
      institution_name: pub.institution_name,
      class_ids: pub.class_ids,
    })));
    
    // Store the assignment being edited
    setSelectedAssignment(assignment);
    
    // Switch to create tab to show the wizard
    const createTab = document.querySelector('[value="create"]') as HTMLElement;
    createTab?.click();
    
    toast.info('Editing assignment in wizard');
  };

  const handleDeleteAssignment = (assignment: StandaloneAssignment) => {
    setAssignmentToDelete(assignment);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteAssignment = () => {
    if (!assignmentToDelete) return;
    
    setAssignments(assignments.filter(a => a.id !== assignmentToDelete.id));
    toast.success(`Assignment deleted: ${assignmentToDelete.title}`);
    setDeleteDialogOpen(false);
    setAssignmentToDelete(null);
  };

  const handleCreateAssignment = (isDraft: boolean) => {
    const newAssignment: Partial<StandaloneAssignment> = {
      title,
      description,
      instructions,
      assignment_type: assignmentType,
      submission_type: assignmentType,
      due_date: dueDate,
      due_time: dueTime,
      total_points: totalPoints,
      late_submission_policy: latePolicy,
      late_penalty_percentage: latePolicy === 'allowed_with_penalty' ? latePenalty : undefined,
      status: isDraft ? 'draft' : 'ongoing',
      questions: assignmentType === 'multi_question' ? questions : undefined,
      allowed_file_types: assignmentType === 'file_upload' ? allowedFileTypes.split(',').map(t => t.trim()) : undefined,
      max_file_size_mb: assignmentType === 'file_upload' ? maxFileSize : undefined,
    };

    console.log('Creating assignment:', newAssignment);
    toast.success(isDraft ? 'Assignment saved as draft' : 'Assignment created and published successfully');
    
    // Reset form
    setTitle('');
    setDescription('');
    setInstructions('');
    setCreateStep(1);
    setPublishing([]);
    setQuestions([]);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assignment Management</h1>
        <p className="text-muted-foreground mt-1">
          Create and manage standalone assignments for students
        </p>
      </div>

      <Tabs defaultValue="all-assignments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all-assignments">All Assignments</TabsTrigger>
          <TabsTrigger value="create">Create Assignment</TabsTrigger>
        </TabsList>

        {/* All Assignments Tab */}
        <TabsContent value="all-assignments" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">{stats.total}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ongoing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold">{stats.ongoing}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">{stats.upcoming}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">{stats.completed}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2 flex-wrap">
              {['all', 'ongoing', 'upcoming', 'completed', 'draft'].map((status) => (
                <Button
                  key={status}
                  variant={activeTab === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
            <Input
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
          </div>

          {/* Assignments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                mode="manage"
                onView={handleViewAssignment}
                onEdit={handleEditAssignment}
                onDelete={handleDeleteAssignment}
              />
            ))}
          </div>

          {filteredAssignments.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No assignments found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Create Assignment Tab */}
        <TabsContent value="create" className="space-y-6">
          {/* Progress Indicator */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4, 5, 6].map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step <= createStep
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {step}
                    </div>
                    {step < 6 && (
                      <div
                        className={`w-12 h-1 ${
                          step < createStep ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-muted-foreground">Basic Info</span>
                <span className="text-xs text-muted-foreground">Submission</span>
                <span className="text-xs text-muted-foreground">Grading</span>
                <span className="text-xs text-muted-foreground">Content</span>
                <span className="text-xs text-muted-foreground">Publishing</span>
                <span className="text-xs text-muted-foreground">Review</span>
              </div>
            </CardContent>
          </Card>

          {/* Step 1: Basic Information */}
          {createStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Basic Information</CardTitle>
                <CardDescription>Enter the core details of the assignment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter assignment title"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what students need to do"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Detailed Instructions (Optional)</Label>
                  <Textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Provide detailed instructions, requirements, and guidelines"
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Assignment Type *</Label>
                  <Select value={assignmentType} onValueChange={(v) => setAssignmentType(v as AssignmentType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="file_upload">File Upload</SelectItem>
                      <SelectItem value="text_submission">Text Submission</SelectItem>
                      <SelectItem value="url_submission">URL Submission</SelectItem>
                      <SelectItem value="multi_question">Multi-Question</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Due Date *</Label>
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Due Time *</Label>
                    <Input
                      type="time"
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Submission Settings */}
          {createStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Submission Settings</CardTitle>
                <CardDescription>Configure how students will submit their work</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {assignmentType === 'file_upload' && (
                  <>
                    <div className="space-y-2">
                      <Label>Allowed File Types (comma-separated)</Label>
                      <Input
                        value={allowedFileTypes}
                        onChange={(e) => setAllowedFileTypes(e.target.value)}
                        placeholder="pdf,docx,txt"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Max File Size (MB)</Label>
                      <Input
                        type="number"
                        value={maxFileSize}
                        onChange={(e) => setMaxFileSize(Number(e.target.value))}
                        min={1}
                        max={100}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label>Late Submission Policy</Label>
                  <Select value={latePolicy} onValueChange={(v) => setLatePolicy(v as LateSubmissionPolicy)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_allowed">Not Allowed</SelectItem>
                      <SelectItem value="allowed_with_penalty">Allowed with Penalty</SelectItem>
                      <SelectItem value="allowed_no_penalty">Allowed (No Penalty)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {latePolicy === 'allowed_with_penalty' && (
                  <div className="space-y-2">
                    <Label>Late Penalty (%)</Label>
                    <Input
                      type="number"
                      value={latePenalty}
                      onChange={(e) => setLatePenalty(Number(e.target.value))}
                      min={0}
                      max={100}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Grading Configuration */}
          {createStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 3: Grading Configuration</CardTitle>
                <CardDescription>Set up grading criteria and points</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Total Points</Label>
                  <Input
                    type="number"
                    value={totalPoints}
                    onChange={(e) => setTotalPoints(Number(e.target.value))}
                    min={1}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Add Content/Questions */}
          {createStep === 4 && (
            <div>
              {assignmentType === 'multi_question' ? (
                <AssignmentQuestionBuilder
                  questions={questions}
                  assignmentId="new-assignment"
                  onChange={setQuestions}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Step 4: Add Resources (Optional)</CardTitle>
                    <CardDescription>Upload reference materials or attachments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Drag and drop files here or click to browse
                      </p>
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Upload Files
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 5: Publishing */}
          {createStep === 5 && (
            <AssignmentPublishingSelector
              institutions={institutions}
              value={publishing}
              onChange={setPublishing}
            />
          )}

          {/* Step 6: Review & Create */}
          {createStep === 6 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 6: Review & Create</CardTitle>
                <CardDescription>Review your assignment before creating</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Basic Information</h3>
                  <p><strong>Title:</strong> {title}</p>
                  <p><strong>Type:</strong> {assignmentType}</p>
                  <p><strong>Due:</strong> {dueDate} at {dueTime}</p>
                  <p><strong>Points:</strong> {totalPoints}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Publishing</h3>
                  <p>
                    {publishing.length} institution(s),{' '}
                    {publishing.reduce((sum, p) => sum + p.class_ids.length, 0)} class(es)
                  </p>
                </div>

                {assignmentType === 'multi_question' && (
                  <div>
                    <h3 className="font-semibold mb-2">Questions</h3>
                    <p>{questions.length} question(s) added</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={createStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {createStep < 6 ? (
              <Button onClick={handleNextStep}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleCreateAssignment(true)}>
                  Save as Draft
                </Button>
                <Button onClick={() => handleCreateAssignment(false)}>
                  Create & Publish
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Dialogs */}
      <AssignmentDetailsDialog
        assignment={selectedAssignment}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />
      
      <DeleteAssignmentDialog
        assignment={assignmentToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteAssignment}
      />
    </div>
    </Layout>
  );
}
