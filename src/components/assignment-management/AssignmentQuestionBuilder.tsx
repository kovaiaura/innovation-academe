import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AssignmentQuestion, AssignmentQuestionType } from '@/types/assignment-management';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface AssignmentQuestionBuilderProps {
  questions: AssignmentQuestion[];
  assignmentId: string;
  onChange: (questions: AssignmentQuestion[]) => void;
}

export function AssignmentQuestionBuilder({
  questions,
  assignmentId,
  onChange,
}: AssignmentQuestionBuilderProps) {
  const [questionType, setQuestionType] = useState<AssignmentQuestionType>('mcq');
  const [questionText, setQuestionText] = useState('');
  const [points, setPoints] = useState(10);
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [allowedFileTypes, setAllowedFileTypes] = useState('pdf,docx');

  const resetForm = () => {
    setQuestionText('');
    setPoints(10);
    setOptions(['', '', '', '']);
    setCorrectAnswer('');
    setExplanation('');
    setAllowedFileTypes('pdf,docx');
  };

  const handleAddQuestion = () => {
    if (!questionText.trim()) {
      toast.error('Please enter a question');
      return;
    }

    if ((questionType === 'mcq' || questionType === 'true_false') && !correctAnswer) {
      toast.error('Please select the correct answer');
      return;
    }

    if (questionType === 'mcq' && options.filter(o => o.trim()).length < 2) {
      toast.error('Please add at least 2 options');
      return;
    }

    const newQuestion: AssignmentQuestion = {
      id: `q-${Date.now()}`,
      assignment_id: assignmentId,
      question_type: questionType,
      question_text: questionText,
      order_number: questions.length + 1,
      points,
      required: true,
    };

    if (questionType === 'mcq') {
      newQuestion.options = options.filter(o => o.trim());
      newQuestion.correct_answer = correctAnswer;
    }

    if (questionType === 'true_false') {
      newQuestion.options = ['True', 'False'];
      newQuestion.correct_answer = correctAnswer;
    }

    if (questionType === 'file_upload') {
      newQuestion.allowed_file_types = allowedFileTypes.split(',').map(t => t.trim());
      newQuestion.max_file_size_mb = 10;
    }

    if (explanation.trim()) {
      newQuestion.explanation = explanation;
    }

    onChange([...questions, newQuestion]);
    resetForm();
    toast.success('Question added');
  };

  const handleDeleteQuestion = (questionId: string) => {
    onChange(questions.filter(q => q.id !== questionId));
    toast.success('Question removed');
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      toast.error('At least 2 options are required');
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Question List */}
      {questions.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Added Questions ({questions.length})</h3>
          {questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1">
                    <GripVertical className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <CardTitle className="text-sm">
                        Question {index + 1} ({question.points} pts)
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {question.question_text}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{question.question_type}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Add Question Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Question</CardTitle>
          <CardDescription>Create a new question for this assignment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select value={questionType} onValueChange={(v) => setQuestionType(v as AssignmentQuestionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">Multiple Choice</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                  <SelectItem value="short_answer">Short Answer</SelectItem>
                  <SelectItem value="file_upload">File Upload</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Points</Label>
              <Input
                type="number"
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                min={1}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Question Text</Label>
            <Textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter your question"
              rows={3}
            />
          </div>

          {questionType === 'mcq' && (
            <div className="space-y-3">
              <Label>Answer Options</Label>
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                  {options.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addOption}>
                <Plus className="h-4 w-4 mr-1" />
                Add Option
              </Button>

              <div className="space-y-2">
                <Label>Correct Answer</Label>
                <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select correct answer" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.filter(o => o.trim()).map((option, index) => (
                      <SelectItem key={index} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {questionType === 'true_false' && (
            <div className="space-y-2">
              <Label>Correct Answer</Label>
              <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select correct answer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="True">True</SelectItem>
                  <SelectItem value="False">False</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {questionType === 'file_upload' && (
            <div className="space-y-2">
              <Label>Allowed File Types (comma-separated)</Label>
              <Input
                value={allowedFileTypes}
                onChange={(e) => setAllowedFileTypes(e.target.value)}
                placeholder="pdf,docx,txt"
              />
              <p className="text-xs text-muted-foreground">
                Example: pdf,docx,txt,jpg,png
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Explanation (Optional)</Label>
            <Textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Add explanation or hints for this question"
              rows={2}
            />
          </div>

          <Button onClick={handleAddQuestion}>
            <Plus className="h-4 w-4 mr-1" />
            Add Question
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
