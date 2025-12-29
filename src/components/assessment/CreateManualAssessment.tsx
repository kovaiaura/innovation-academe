import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { assessmentService } from '@/services/assessment.service';
import { Assessment } from '@/types/assessment';
import { toast } from 'sonner';
import { Loader2, Save, Plus, ArrowLeft } from 'lucide-react';

interface CreateManualAssessmentProps {
  restrictToInstitutionId?: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

interface Student {
  id: string;
  name: string;
  email: string;
}

interface ManualResult {
  student_id: string;
  student_name: string;
  score: number;
  passed: boolean;
  notes: string;
}

export function CreateManualAssessment({ restrictToInstitutionId, onComplete, onCancel }: CreateManualAssessmentProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [classes, setClasses] = useState<{ id: string; class_name: string; institution_id: string }[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [conductedAt, setConductedAt] = useState(new Date().toISOString().slice(0, 10));
  const [manualNotes, setManualNotes] = useState('');
  const [results, setResults] = useState<ManualResult[]>([]);

  useEffect(() => {
    loadData();
  }, [restrictToInstitutionId]);

  useEffect(() => {
    if (selectedClassId) {
      loadStudents(selectedClassId);
    }
  }, [selectedClassId]);

  const loadData = async () => {
    setIsLoading(true);
    
    // Load assessments
    const assessmentsData = await assessmentService.getAssessments();
    setAssessments(assessmentsData);

    // Load classes
    let classQuery = supabase.from('classes').select('id, class_name, institution_id');
    if (restrictToInstitutionId) {
      classQuery = classQuery.eq('institution_id', restrictToInstitutionId);
    }
    const { data: classesData } = await classQuery;
    setClasses(classesData || []);

    setIsLoading(false);
  };

  const loadStudents = async (classId: string) => {
    const { data: studentsData } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('class_id', classId);

    const studentsList = studentsData || [];
    setStudents(studentsList);

    // Initialize results
    const selectedAssessment = assessments.find(a => a.id === selectedAssessmentId);
    const passPercentage = selectedAssessment?.pass_percentage || 70;
    const totalPoints = selectedAssessment?.total_points || 100;

    setResults(studentsList.map(student => ({
      student_id: student.id,
      student_name: student.name,
      score: 0,
      passed: false,
      notes: ''
    })));
  };

  const handleScoreChange = (studentId: string, score: number) => {
    const selectedAssessment = assessments.find(a => a.id === selectedAssessmentId);
    const passPercentage = selectedAssessment?.pass_percentage || 70;
    const totalPoints = selectedAssessment?.total_points || 100;
    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    const passed = percentage >= passPercentage;

    setResults(results.map(r => 
      r.student_id === studentId ? { ...r, score, passed } : r
    ));
  };

  const handlePassedChange = (studentId: string, passed: boolean) => {
    setResults(results.map(r => 
      r.student_id === studentId ? { ...r, passed } : r
    ));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setResults(results.map(r => 
      r.student_id === studentId ? { ...r, notes } : r
    ));
  };

  const handleSubmit = async () => {
    if (!selectedAssessmentId || !selectedClassId || !conductedAt) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);

    const selectedAssessment = assessments.find(a => a.id === selectedAssessmentId);
    const selectedClass = classes.find(c => c.id === selectedClassId);
    const totalPoints = selectedAssessment?.total_points || 100;

    try {
      for (const result of results) {
        const percentage = totalPoints > 0 ? (result.score / totalPoints) * 100 : 0;
        
        await assessmentService.createManualAttempt({
          assessment_id: selectedAssessmentId,
          student_id: result.student_id,
          class_id: selectedClassId,
          institution_id: selectedClass?.institution_id || restrictToInstitutionId || '',
          score: result.score,
          total_points: totalPoints,
          percentage,
          passed: result.passed,
          conducted_at: new Date(conductedAt).toISOString(),
          manual_notes: result.notes || manualNotes
        });
      }

      toast.success('Manual assessment results saved successfully');
      onComplete?.();
    } catch (error) {
      console.error('Error saving manual results:', error);
      toast.error('Failed to save results');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {onCancel && (
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div>
          <h2 className="text-2xl font-bold">Create Manual Assessment Entry</h2>
          <p className="text-muted-foreground">Record offline assessment results for students</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assessment Details</CardTitle>
          <CardDescription>Select the assessment and class for which you're recording results</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assessment">Assessment *</Label>
              <Select value={selectedAssessmentId} onValueChange={setSelectedAssessmentId}>
                <SelectTrigger id="assessment">
                  <SelectValue placeholder="Select assessment" />
                </SelectTrigger>
                <SelectContent>
                  {assessments.map(assessment => (
                    <SelectItem key={assessment.id} value={assessment.id}>
                      {assessment.title} ({assessment.total_points} pts)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="class">Class *</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger id="class">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date Conducted *</Label>
              <Input
                id="date"
                type="date"
                value={conductedAt}
                onChange={(e) => setConductedAt(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">General Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any notes about this assessment..."
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedClassId && students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Student Results</CardTitle>
            <CardDescription>
              Enter scores for each student. Pass mark is automatically calculated based on assessment settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="w-32">Score</TableHead>
                  <TableHead className="w-24">Passed</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.student_id}>
                    <TableCell className="font-medium">{result.student_name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        max={assessments.find(a => a.id === selectedAssessmentId)?.total_points || 100}
                        value={result.score}
                        onChange={(e) => handleScoreChange(result.student_id, parseInt(e.target.value) || 0)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={result.passed}
                        onCheckedChange={(checked) => handlePassedChange(result.student_id, checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Individual notes..."
                        value={result.notes}
                        onChange={(e) => handleNotesChange(result.student_id, e.target.value)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Manual Results
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedClassId && students.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No students found in this class
          </CardContent>
        </Card>
      )}
    </div>
  );
}
