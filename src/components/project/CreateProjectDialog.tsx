import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Project } from "@/data/mockProjectData";
import { getStudentsByInstitution, getStudentsByClassAndSection } from "@/data/mockStudentData";
import { Student } from "@/types/student";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (project: Omit<Project, 'id'>) => void;
  officerId: string;
  officerName: string;
  institutionId: string;
}

const categories = [
  'IoT',
  'AI/ML',
  'Blockchain',
  'Renewable Energy',
  'Healthcare',
  'Education Technology',
  'Robotics',
  'Web Development',
  'Mobile Apps',
  'Other'
];

const sdgGoals = [
  { value: 1, label: '1. No Poverty' },
  { value: 2, label: '2. Zero Hunger' },
  { value: 3, label: '3. Good Health' },
  { value: 4, label: '4. Quality Education' },
  { value: 6, label: '6. Clean Water' },
  { value: 7, label: '7. Affordable Energy' },
  { value: 8, label: '8. Economic Growth' },
  { value: 9, label: '9. Industry Innovation' },
  { value: 11, label: '11. Sustainable Cities' },
  { value: 12, label: '12. Responsible Consumption' },
  { value: 13, label: '13. Climate Action' },
];

export function CreateProjectDialog({
  open,
  onOpenChange,
  onCreateProject,
  officerId,
  officerName,
  institutionId
}: CreateProjectDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [fundingRequired, setFundingRequired] = useState("");
  const [selectedSdgs, setSelectedSdgs] = useState<number[]>([]);
  const [teamLeader, setTeamLeader] = useState<Student | null>(null);
  const [teamMembers, setTeamMembers] = useState<Student[]>([]);

  // Get all students for this institution
  const allStudents = useMemo(() => 
    getStudentsByInstitution(institutionId).filter(s => s.status === 'active'),
    [institutionId]
  );

  // Get unique classes
  const uniqueClasses = useMemo(() => {
    const classes = new Set<string>();
    allStudents.forEach(student => {
      const classNum = student.class.replace('Class ', '');
      classes.add(classNum);
    });
    return Array.from(classes).sort((a, b) => parseInt(a) - parseInt(b));
  }, [allStudents]);

  // Get sections for selected class
  const availableSections = useMemo(() => {
    if (!selectedClass) return [];
    const sections = new Set<string>();
    allStudents.forEach(student => {
      const classNum = student.class.replace('Class ', '');
      if (classNum === selectedClass) {
        sections.add(student.section);
      }
    });
    return Array.from(sections).sort();
  }, [allStudents, selectedClass]);

  // Get students for selected class and section
  const availableStudents = useMemo(() => {
    if (!selectedClass || !selectedSection) return [];
    return getStudentsByClassAndSection(
      institutionId, 
      `Class ${selectedClass}`, 
      selectedSection
    ).filter(s => s.status === 'active');
  }, [institutionId, selectedClass, selectedSection]);


  const handleSubmit = () => {
    if (!title || !description || !category || !selectedClass || !selectedSection || !teamLeader) {
      toast.error("Please fill in all required fields");
      return;
    }

    const members = teamMembers.map(student => ({
      id: student.id,
      name: student.student_name,
      role: 'member' as const
    }));

    const newProject: Omit<Project, 'id'> = {
      title,
      description,
      category,
      team_members: [
        { id: teamLeader.id, name: teamLeader.student_name, role: 'leader' },
        ...members
      ],
      created_by_officer_id: officerId,
      created_by_officer_name: officerName,
      institution_id: institutionId,
      class: `Class ${selectedClass} - Section ${selectedSection}`,
      status: 'approved',
      progress: 0,
      start_date: new Date().toISOString().split('T')[0],
      funding_required: fundingRequired ? parseFloat(fundingRequired) : undefined,
      sdg_goals: selectedSdgs,
      last_updated: new Date().toISOString().split('T')[0],
      progress_updates: [],
      is_showcase: false
    };

    onCreateProject(newProject);
    
    // Reset form
    setTitle("");
    setDescription("");
    setCategory("");
    setSelectedClass("");
    setSelectedSection("");
    setFundingRequired("");
    setSelectedSdgs([]);
    setTeamLeader(null);
    setTeamMembers([]);
    
    toast.success("Project created successfully");
    onOpenChange(false);
  };

  const addTeamMember = (student: Student) => {
    if (teamLeader?.id === student.id) {
      toast.error("Team leader is already selected");
      return;
    }
    if (teamMembers.some(m => m.id === student.id)) {
      toast.error("Student already added to team");
      return;
    }
    setTeamMembers([...teamMembers, student]);
  };

  const removeTeamMember = (studentId: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== studentId));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Innovation Project</DialogTitle>
          <DialogDescription>
            Add a new project and assign it to student teams
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., IoT-Based Smart Home Automation"
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the project objectives and scope"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="class">Class *</Label>
              <Select value={selectedClass} onValueChange={(val) => {
                setSelectedClass(val);
                setSelectedSection("");
                setTeamLeader(null);
                setTeamMembers([]);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueClasses.map(cls => (
                    <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="section">Section *</Label>
              <Select 
                value={selectedSection} 
                onValueChange={(val) => {
                  setSelectedSection(val);
                  setTeamLeader(null);
                  setTeamMembers([]);
                }}
                disabled={!selectedClass}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {availableSections.map(sec => (
                    <SelectItem key={sec} value={sec}>Section {sec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="funding">Funding Required (₹)</Label>
            <Input
              id="funding"
              type="number"
              value={fundingRequired}
              onChange={(e) => setFundingRequired(e.target.value)}
              placeholder="e.g., 15000"
            />
          </div>

          <div>
            <Label>SDG Goals (Select applicable goals)</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {sdgGoals.map(sdg => (
                <div key={sdg.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`sdg-${sdg.value}`}
                    checked={selectedSdgs.includes(sdg.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSdgs([...selectedSdgs, sdg.value]);
                      } else {
                        setSelectedSdgs(selectedSdgs.filter(s => s !== sdg.value));
                      }
                    }}
                    className="rounded border-input"
                  />
                  <label htmlFor={`sdg-${sdg.value}`} className="text-sm">
                    {sdg.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="teamLeader">Team Leader *</Label>
            {teamLeader ? (
              <div className="flex items-center justify-between p-3 border rounded-md bg-muted">
                <div>
                  <div className="font-medium">{teamLeader.student_name}</div>
                  <div className="text-sm text-muted-foreground">
                    Roll: {teamLeader.roll_number}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setTeamLeader(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Select 
                disabled={!selectedClass || !selectedSection}
                onValueChange={(val) => {
                  const student = availableStudents.find(s => s.id === val);
                  if (student) {
                    setTeamLeader(student);
                    setTeamMembers(teamMembers.filter(m => m.id !== student.id));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedClass || !selectedSection 
                      ? "Select class and section first" 
                      : "Select team leader"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {availableStudents.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.student_name} - {student.roll_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <Label htmlFor="teamMembers">Team Members</Label>
            <div className="space-y-2">
              {teamMembers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {teamMembers.map(member => (
                    <Badge key={member.id} variant="secondary" className="gap-2">
                      {member.student_name}
                      <button
                        type="button"
                        onClick={() => removeTeamMember(member.id)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <Select
                value=""
                onValueChange={(val) => {
                  const student = availableStudents.find(s => s.id === val);
                  if (student) addTeamMember(student);
                }}
                disabled={!selectedClass || !selectedSection}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedClass || !selectedSection 
                      ? "Select class and section first" 
                      : "Add team member"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {availableStudents
                    .filter(s => s.id !== teamLeader?.id && !teamMembers.some(m => m.id === s.id))
                    .map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.student_name} - {student.roll_number}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
