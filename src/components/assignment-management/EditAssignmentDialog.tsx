import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AssignmentQuestionBuilder } from './AssignmentQuestionBuilder';
import { AssignmentPublishingSelector, PublishingSelection } from './AssignmentPublishingSelector';
import { StandaloneAssignment, AssignmentType, LateSubmissionPolicy, AssignmentQuestion } from '@/types/assignment-management';
import { toast } from 'sonner';

interface EditAssignmentDialogProps {
  assignment: StandaloneAssignment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (assignment: StandaloneAssignment) => void;
  institutions: Array<{
    id: string;
    name: string;
    classes: Array<{ id: string; name: string }>;
  }>;
}

export function EditAssignmentDialog({
  assignment,
  open,
  onOpenChange,
  onSave,
  institutions,
}: EditAssignmentDialogProps) {
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

  // Populate form when assignment changes
  useEffect(() => {
    if (assignment) {
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
      setPublishing(
        assignment.publishing.map((pub) => ({
          institution_id: pub.institution_id,
          institution_name: pub.institution_name,
          class_ids: pub.class_ids,
        }))
      );
    }
  }, [assignment]);

  const handleSave = () => {
    if (!assignment) return;

    if (!title || !description || !dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (assignmentType === 'multi_question' && questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    if (publishing.length === 0) {
      toast.error('Please select at least one institution and class');
      return;
    }

    const updatedAssignment: StandaloneAssignment = {
      ...assignment,
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
      questions: assignmentType === 'multi_question' ? questions : undefined,
      allowed_file_types: assignmentType === 'file_upload' ? allowedFileTypes.split(',').map((t) => t.trim()) : undefined,
      max_file_size_mb: assignmentType === 'file_upload' ? maxFileSize : undefined,
      publishing: publishing.map((pub) => {
        const existingPub = assignment.publishing.find(p => p.institution_id === pub.institution_id);
        return {
          id: existingPub?.id || `pub-${Date.now()}-${Math.random()}`,
          assignment_id: assignment.id,
          institution_id: pub.institution_id,
          institution_name: pub.institution_name,
          class_ids: pub.class_ids,
          class_names: existingPub?.class_names || [],
          published_at: existingPub?.published_at || new Date().toISOString(),
        };
      }),
    };

    onSave(updatedAssignment);
  };

  if (!assignment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Assignment: {assignment.title}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="submission">Submission</TabsTrigger>
              <TabsTrigger value="grading">Grading</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="publishing">Publishing</TabsTrigger>
            </TabsList>

            {/* Tab 1: Basic Info */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter assignment title" />
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
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Due Time *</Label>
                  <Input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Submission Settings */}
            <TabsContent value="submission" className="space-y-4 mt-4">
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
            </TabsContent>

            {/* Tab 3: Grading */}
            <TabsContent value="grading" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Total Points</Label>
                <Input
                  type="number"
                  value={totalPoints}
                  onChange={(e) => setTotalPoints(Number(e.target.value))}
                  min={1}
                />
              </div>
            </TabsContent>

            {/* Tab 4: Content/Questions */}
            <TabsContent value="content" className="mt-4">
              {assignmentType === 'multi_question' ? (
                <AssignmentQuestionBuilder
                  questions={questions}
                  assignmentId={assignment.id}
                  onChange={setQuestions}
                />
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                  <p>No additional content configuration needed for {assignmentType} type</p>
                </div>
              )}
            </TabsContent>

            {/* Tab 5: Publishing */}
            <TabsContent value="publishing" className="mt-4">
              <AssignmentPublishingSelector institutions={institutions} value={publishing} onChange={setPublishing} />
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
