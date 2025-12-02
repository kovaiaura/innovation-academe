import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Trash2, Printer } from 'lucide-react';
import { PerformanceAppraisal, ProjectSummary, addPerformanceAppraisal, updatePerformanceAppraisal } from '@/data/mockPerformanceData';
import { loadOfficers } from '@/data/mockOfficerData';
import { mockInstitutions } from '@/data/mockInstitutionData';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appraisal: PerformanceAppraisal | null;
  onSuccess: () => void;
}

const LAB_DOMAINS = ['IoT', 'AI', 'Robotics', 'AR/VR', 'Drones', 'Digital Media'] as const;

export function PerformanceAppraisalForm({ open, onOpenChange, appraisal, onSuccess }: Props) {
  const { user } = useAuth();
  const officers = loadOfficers();
  const institutions = mockInstitutions;
  
  const [formData, setFormData] = useState({
    trainer_id: '',
    trainer_name: '',
    employee_id: '',
    institution_id: '',
    institution_name: '',
    reporting_period_from: '',
    reporting_period_to: '',
    lab_domains: [] as typeof LAB_DOMAINS[number][],
    total_projects_mentored: 0,
    total_instructional_hours: 0,
    projects_summary: [] as ProjectSummary[],
    key_contributions: ['', '', ''],
    innovations_introduced: ['', '', ''],
    student_mentorship_experience: '',
    collaboration_coordination: '',
    student_feedback: {
      concept_clarity: 0,
      responsiveness: 0,
      mentorship_quality: 0,
      contest_preparation: 0,
      overall_satisfaction: 0
    },
    student_comments_summary: '',
    future_goals: ['', '', ''],
    planned_trainings: ['', '', ''],
    support_needed: '',
    status: 'draft' as PerformanceAppraisal['status']
  });

  useEffect(() => {
    if (appraisal) {
      setFormData({
        trainer_id: appraisal.trainer_id,
        trainer_name: appraisal.trainer_name,
        employee_id: appraisal.employee_id,
        institution_id: appraisal.institution_id,
        institution_name: appraisal.institution_name,
        reporting_period_from: appraisal.reporting_period_from,
        reporting_period_to: appraisal.reporting_period_to,
        lab_domains: appraisal.lab_domains,
        total_projects_mentored: appraisal.total_projects_mentored,
        total_instructional_hours: appraisal.total_instructional_hours,
        projects_summary: appraisal.projects_summary,
        key_contributions: [...appraisal.key_contributions, '', '', ''].slice(0, 3),
        innovations_introduced: [...appraisal.innovations_introduced, '', '', ''].slice(0, 3),
        student_mentorship_experience: appraisal.student_mentorship_experience,
        collaboration_coordination: appraisal.collaboration_coordination,
        student_feedback: appraisal.student_feedback,
        student_comments_summary: appraisal.student_comments_summary,
        future_goals: [...appraisal.future_goals, '', '', ''].slice(0, 3),
        planned_trainings: [...appraisal.planned_trainings, '', '', ''].slice(0, 3),
        support_needed: appraisal.support_needed,
        status: appraisal.status
      });
    } else {
      // Reset form
      setFormData({
        trainer_id: '',
        trainer_name: '',
        employee_id: '',
        institution_id: '',
        institution_name: '',
        reporting_period_from: '',
        reporting_period_to: '',
        lab_domains: [],
        total_projects_mentored: 0,
        total_instructional_hours: 0,
        projects_summary: [],
        key_contributions: ['', '', ''],
        innovations_introduced: ['', '', ''],
        student_mentorship_experience: '',
        collaboration_coordination: '',
        student_feedback: {
          concept_clarity: 0,
          responsiveness: 0,
          mentorship_quality: 0,
          contest_preparation: 0,
          overall_satisfaction: 0
        },
        student_comments_summary: '',
        future_goals: ['', '', ''],
        planned_trainings: ['', '', ''],
        support_needed: '',
        status: 'draft'
      });
    }
  }, [appraisal, open]);

  const handleOfficerChange = (officerId: string) => {
    const officer = officers.find(o => o.id === officerId);
    if (officer) {
      const institutionId = officer.assigned_institutions?.[0] || '';
      const institution = institutions.find(i => i.id === institutionId);
      setFormData(prev => ({
        ...prev,
        trainer_id: officer.id,
        trainer_name: officer.name,
        employee_id: officer.employee_id || `EMP-${officer.id}`,
        institution_id: institutionId,
        institution_name: institution?.name || ''
      }));
    }
  };

  const handleDomainToggle = (domain: typeof LAB_DOMAINS[number]) => {
    setFormData(prev => ({
      ...prev,
      lab_domains: prev.lab_domains.includes(domain)
        ? prev.lab_domains.filter(d => d !== domain)
        : [...prev.lab_domains, domain]
    }));
  };

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects_summary: [...prev.projects_summary, {
        id: `proj-${Date.now()}`,
        project_title: '',
        grade_level: '',
        domain: '',
        contest_name: '',
        level: 'school',
        result: ''
      }]
    }));
  };

  const updateProject = (index: number, field: keyof ProjectSummary, value: string) => {
    setFormData(prev => ({
      ...prev,
      projects_summary: prev.projects_summary.map((p, i) => 
        i === index ? { ...p, [field]: value } : p
      )
    }));
  };

  const removeProject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      projects_summary: prev.projects_summary.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    if (!formData.trainer_id) {
      toast({ title: 'Please select a trainer', variant: 'destructive' });
      return;
    }

    const cleanedData = {
      ...formData,
      key_contributions: formData.key_contributions.filter(c => c.trim()),
      innovations_introduced: formData.innovations_introduced.filter(i => i.trim()),
      future_goals: formData.future_goals.filter(g => g.trim()),
      planned_trainings: formData.planned_trainings.filter(t => t.trim()),
      manager_review: appraisal?.manager_review || null,
      principal_review: appraisal?.principal_review || null,
      hr_review: appraisal?.hr_review || null,
      created_by: user?.id || 'system'
    };

    if (appraisal) {
      updatePerformanceAppraisal(appraisal.id, cleanedData);
      toast({ title: 'Appraisal updated successfully' });
    } else {
      addPerformanceAppraisal(cleanedData);
      toast({ title: 'Appraisal created successfully' });
    }

    onSuccess();
    onOpenChange(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {appraisal ? 'Edit Performance Appraisal' : 'Create Performance Appraisal'}
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <Accordion type="multiple" defaultValue={['profile', 'domains', 'projects', 'reflection', 'feedback', 'future']} className="space-y-2">
            {/* Section 1: Trainer Profile */}
            <AccordionItem value="profile">
              <AccordionTrigger className="text-base font-semibold">
                1. Trainer Profile & Project Engagement Overview
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Select Trainer</Label>
                    <Select value={formData.trainer_id} onValueChange={handleOfficerChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trainer" />
                      </SelectTrigger>
                      <SelectContent>
                        {officers.map(officer => (
                          <SelectItem key={officer.id} value={officer.id}>
                            {officer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Employee ID</Label>
                    <Input value={formData.employee_id} disabled />
                  </div>
                  <div>
                    <Label>Institution</Label>
                    <Input value={formData.institution_name} disabled />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Period From</Label>
                      <Input 
                        type="date" 
                        value={formData.reporting_period_from}
                        onChange={e => setFormData(prev => ({ ...prev, reporting_period_from: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Period To</Label>
                      <Input 
                        type="date" 
                        value={formData.reporting_period_to}
                        onChange={e => setFormData(prev => ({ ...prev, reporting_period_to: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 2: Lab Domains */}
            <AccordionItem value="domains">
              <AccordionTrigger className="text-base font-semibold">
                2. Lab Domains Handled
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="grid grid-cols-3 gap-4">
                  {LAB_DOMAINS.map(domain => (
                    <div key={domain} className="flex items-center gap-2">
                      <Checkbox 
                        id={domain}
                        checked={formData.lab_domains.includes(domain)}
                        onCheckedChange={() => handleDomainToggle(domain)}
                      />
                      <Label htmlFor={domain}>{domain}</Label>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Total Projects Mentored</Label>
                    <Input 
                      type="number" 
                      value={formData.total_projects_mentored}
                      onChange={e => setFormData(prev => ({ ...prev, total_projects_mentored: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label>Total Instructional Hours</Label>
                    <Input 
                      type="number" 
                      value={formData.total_instructional_hours}
                      onChange={e => setFormData(prev => ({ ...prev, total_instructional_hours: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 3: Projects Summary */}
            <AccordionItem value="projects">
              <AccordionTrigger className="text-base font-semibold">
                3. Summary of Projects Mentored
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                {formData.projects_summary.map((project, index) => (
                  <Card key={project.id} className="p-4">
                    <div className="grid grid-cols-3 gap-3">
                      <Input 
                        placeholder="Project Title"
                        value={project.project_title}
                        onChange={e => updateProject(index, 'project_title', e.target.value)}
                      />
                      <Input 
                        placeholder="Grade/Level"
                        value={project.grade_level}
                        onChange={e => updateProject(index, 'grade_level', e.target.value)}
                      />
                      <Input 
                        placeholder="Domain"
                        value={project.domain}
                        onChange={e => updateProject(index, 'domain', e.target.value)}
                      />
                      <Input 
                        placeholder="Contest Name"
                        value={project.contest_name}
                        onChange={e => updateProject(index, 'contest_name', e.target.value)}
                      />
                      <Select 
                        value={project.level}
                        onValueChange={v => updateProject(index, 'level', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="school">School</SelectItem>
                          <SelectItem value="district">District</SelectItem>
                          <SelectItem value="state">State</SelectItem>
                          <SelectItem value="national">National</SelectItem>
                          <SelectItem value="international">International</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Result"
                          value={project.result}
                          onChange={e => updateProject(index, 'result', e.target.value)}
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeProject(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                <Button variant="outline" onClick={addProject}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </AccordionContent>
            </AccordionItem>

            {/* Section 4: Self-Reflection */}
            <AccordionItem value="reflection">
              <AccordionTrigger className="text-base font-semibold">
                4. Self-Reflection and Contribution
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div>
                  <Label>Key Contributions (Top 3)</Label>
                  {formData.key_contributions.map((contribution, index) => (
                    <Input 
                      key={index}
                      className="mt-2"
                      placeholder={`Contribution ${index + 1}`}
                      value={contribution}
                      onChange={e => {
                        const newContributions = [...formData.key_contributions];
                        newContributions[index] = e.target.value;
                        setFormData(prev => ({ ...prev, key_contributions: newContributions }));
                      }}
                    />
                  ))}
                </div>
                <div>
                  <Label>Innovations or Tools Introduced</Label>
                  {formData.innovations_introduced.map((innovation, index) => (
                    <Input 
                      key={index}
                      className="mt-2"
                      placeholder={`Innovation ${index + 1}`}
                      value={innovation}
                      onChange={e => {
                        const newInnovations = [...formData.innovations_introduced];
                        newInnovations[index] = e.target.value;
                        setFormData(prev => ({ ...prev, innovations_introduced: newInnovations }));
                      }}
                    />
                  ))}
                </div>
                <div>
                  <Label>Student Mentorship Experience</Label>
                  <Textarea 
                    className="mt-2"
                    placeholder="Describe achievements and challenges..."
                    value={formData.student_mentorship_experience}
                    onChange={e => setFormData(prev => ({ ...prev, student_mentorship_experience: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Collaboration & Coordination</Label>
                  <Textarea 
                    className="mt-2"
                    placeholder="How did you coordinate with peers, leadership, or external bodies?"
                    value={formData.collaboration_coordination}
                    onChange={e => setFormData(prev => ({ ...prev, collaboration_coordination: e.target.value }))}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 5: Feedback */}
            <AccordionItem value="feedback">
              <AccordionTrigger className="text-base font-semibold">
                5. Student Feedback Overview (HR Use)
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries({
                    concept_clarity: 'Concept Clarity',
                    responsiveness: 'Responsiveness & Availability',
                    mentorship_quality: 'Mentorship Quality',
                    contest_preparation: 'Contest Preparation Support',
                    overall_satisfaction: 'Overall Satisfaction'
                  }).map(([key, label]) => (
                    <div key={key}>
                      <Label>{label} (out of 5)</Label>
                      <Input 
                        type="number" 
                        min="0" 
                        max="5" 
                        step="0.1"
                        value={formData.student_feedback[key as keyof typeof formData.student_feedback]}
                        onChange={e => setFormData(prev => ({
                          ...prev,
                          student_feedback: {
                            ...prev.student_feedback,
                            [key]: parseFloat(e.target.value) || 0
                          }
                        }))}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <Label>Summary of Student Comments</Label>
                  <Textarea 
                    className="mt-2"
                    placeholder="Compiled by HR..."
                    value={formData.student_comments_summary}
                    onChange={e => setFormData(prev => ({ ...prev, student_comments_summary: e.target.value }))}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 6: Future Plan */}
            <AccordionItem value="future">
              <AccordionTrigger className="text-base font-semibold">
                6. Forward Plan
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div>
                  <Label>Goals for Upcoming Year</Label>
                  {formData.future_goals.map((goal, index) => (
                    <Input 
                      key={index}
                      className="mt-2"
                      placeholder={`Goal ${index + 1}`}
                      value={goal}
                      onChange={e => {
                        const newGoals = [...formData.future_goals];
                        newGoals[index] = e.target.value;
                        setFormData(prev => ({ ...prev, future_goals: newGoals }));
                      }}
                    />
                  ))}
                </div>
                <div>
                  <Label>Tools/Trainings Planned</Label>
                  {formData.planned_trainings.map((training, index) => (
                    <Input 
                      key={index}
                      className="mt-2"
                      placeholder={`Training ${index + 1}`}
                      value={training}
                      onChange={e => {
                        const newTrainings = [...formData.planned_trainings];
                        newTrainings[index] = e.target.value;
                        setFormData(prev => ({ ...prev, planned_trainings: newTrainings }));
                      }}
                    />
                  ))}
                </div>
                <div>
                  <Label>Support Needed from Management</Label>
                  <Textarea 
                    className="mt-2"
                    placeholder="Describe support needed..."
                    value={formData.support_needed}
                    onChange={e => setFormData(prev => ({ ...prev, support_needed: e.target.value }))}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ScrollArea>

        <div className="flex justify-between pt-4 border-t">
          <Select 
            value={formData.status} 
            onValueChange={(v: PerformanceAppraisal['status']) => setFormData(prev => ({ ...prev, status: v }))}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submit</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>
              {appraisal ? 'Update' : 'Create'} Appraisal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
