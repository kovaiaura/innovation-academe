import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Project } from "@/data/mockProjectData";
import { getStudentsByInstitution } from "@/data/mockStudentData";
import { Student } from "@/types/student";
import { Badge } from "@/components/ui/badge";
import { X, UserPlus } from "lucide-react";

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
  { value: 'SDG1', label: '1. No Poverty' },
  { value: 'SDG2', label: '2. Zero Hunger' },
  { value: 'SDG3', label: '3. Good Health' },
  { value: 'SDG4', label: '4. Quality Education' },
  { value: 'SDG6', label: '6. Clean Water' },
  { value: 'SDG7', label: '7. Affordable Energy' },
  { value: 'SDG8', label: '8. Economic Growth' },
  { value: 'SDG9', label: '9. Industry Innovation' },
  { value: 'SDG11', label: '11. Sustainable Cities' },
  { value: 'SDG12', label: '12. Responsible Consumption' },
  { value: 'SDG13', label: '13. Climate Action' },
];

interface TeamMember {
  id: string;
  name: string;
  class: string;
  section: string;
}

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
  const [selectedSdgs, setSelectedSdgs] = useState<string[]>([]);
  
  // Team Leader State
  const [leaderData, setLeaderData] = useState({
    student: null as Student | null,
    class: '',
    section: ''
  });

  // Team Members State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [memberInput, setMemberInput] = useState({
    class: '',
    section: '',
    student: null as Student | null
  });

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

  // Get sections for a specific class
  const getSectionsForClass = (classNum: string) => {
    if (!classNum) return [];
    const sections = new Set<string>();
    allStudents.forEach(student => {
      const cls = student.class.replace('Class ', '');
      if (cls === classNum) {
        sections.add(student.section);
      }
    });
    return Array.from(sections).sort();
  };

  // Get students for a specific class and section
  const getStudentsForClassSection = (classNum: string, section: string) => {
    if (!classNum || !section) return [];
    return allStudents.filter(s => 
      s.class === `Class ${classNum}` && 
      s.section === section &&
      s.status === 'active'
    );
  };

  // Add team member with class/section info
  const handleAddMember = () => {
    if (!memberInput.student) {
      toast.error("Please select a student");
      return;
    }
    
    // Check if already added
    if (teamMembers.some(m => m.id === memberInput.student!.id)) {
      toast.error("This student is already added");
      return;
    }
    
    // Check if same as leader
    if (memberInput.student.id === leaderData.student?.id) {
      toast.error("Team leader cannot be added as a member");
      return;
    }
    
    setTeamMembers([...teamMembers, {
      id: memberInput.student.id,
      name: memberInput.student.student_name,
      class: `Class ${memberInput.class}`,
      section: memberInput.section
    }]);
    
    // Reset input
    setMemberInput({ class: '', section: '', student: null });
    toast.success("Team member added");
  };

  // Remove team member
  const handleRemoveMember = (memberId: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== memberId));
  };

  const handleSubmit = () => {
    if (!title || !description || !category || !leaderData.student) {
      toast.error("Please fill in all required fields and select a team leader");
      return;
    }

    const members = [
      {
        id: leaderData.student.id,
        name: leaderData.student.student_name,
        role: 'leader' as const,
        class: `Class ${leaderData.class}`,
        section: leaderData.section
      },
      ...teamMembers.map(member => ({
        id: member.id,
        name: member.name,
        role: 'member' as const,
        class: member.class,
        section: member.section
      }))
    ];

    const newProject: Omit<Project, 'id'> = {
      title,
      description,
      category,
      team_members: members,
      created_by_officer_id: officerId,
      created_by_officer_name: officerName,
      institution_id: institutionId,
      class: `Multi-Class Team`, // Generic label since team is multi-class
      status: 'approved',
      progress: 0,
      start_date: new Date().toISOString().split('T')[0],
      sdg_goals: selectedSdgs,
      last_updated: new Date().toISOString().split('T')[0],
      progress_updates: [],
      is_showcase: false
    };

    onCreateProject(newProject);
    handleClose();
    toast.success("Project created successfully");
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setSelectedSdgs([]);
    setLeaderData({ student: null, class: '', section: '' });
    setTeamMembers([]);
    setMemberInput({ class: '', section: '', student: null });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Innovation Project</DialogTitle>
          <DialogDescription>
            Add a new project and assign it to student teams from any class
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
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

          {/* Team Leader Selection */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <Label className="text-base font-semibold">Team Leader *</Label>
            
            {leaderData.student ? (
              <div className="flex items-center justify-between p-3 border rounded-md bg-background">
                <div>
                  <div className="font-medium">{leaderData.student.student_name}</div>
                  <div className="text-sm text-muted-foreground">
                    Class {leaderData.class} - Section {leaderData.section}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setLeaderData({ student: null, class: '', section: '' })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {/* Select Class */}
                <div>
                  <Label>Class</Label>
                  <Select 
                    value={leaderData.class} 
                    onValueChange={(val) => setLeaderData({...leaderData, class: val, section: '', student: null})}
                  >
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

                {/* Select Section */}
                <div>
                  <Label>Section</Label>
                  <Select 
                    value={leaderData.section} 
                    onValueChange={(val) => setLeaderData({...leaderData, section: val, student: null})}
                    disabled={!leaderData.class}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSectionsForClass(leaderData.class).map(sec => (
                        <SelectItem key={sec} value={sec}>Section {sec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Select Student */}
                <div>
                  <Label>Student</Label>
                  <Select 
                    value={leaderData.student?.id || ''} 
                    onValueChange={(val) => {
                      const student = getStudentsForClassSection(leaderData.class, leaderData.section).find(s => s.id === val);
                      if (student) {
                        setLeaderData({...leaderData, student});
                      }
                    }}
                    disabled={!leaderData.class || !leaderData.section}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {getStudentsForClassSection(leaderData.class, leaderData.section).map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.student_name} - {student.roll_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Team Members Selection */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              <Label className="text-base font-semibold">Team Members (Optional)</Label>
            </div>
            
            {/* Add Member Form */}
            <div className="grid grid-cols-4 gap-4 items-end">
              {/* Select Class */}
              <div>
                <Label>Class</Label>
                <Select 
                  value={memberInput.class} 
                  onValueChange={(val) => setMemberInput({...memberInput, class: val, section: '', student: null})}
                >
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

              {/* Select Section */}
              <div>
                <Label>Section</Label>
                <Select 
                  value={memberInput.section} 
                  onValueChange={(val) => setMemberInput({...memberInput, section: val, student: null})}
                  disabled={!memberInput.class}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSectionsForClass(memberInput.class).map(sec => (
                      <SelectItem key={sec} value={sec}>Section {sec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Select Student */}
              <div>
                <Label>Student</Label>
                <Select 
                  value={memberInput.student?.id || ''} 
                  onValueChange={(val) => {
                    const student = getStudentsForClassSection(memberInput.class, memberInput.section).find(s => s.id === val);
                    if (student) {
                      setMemberInput({...memberInput, student});
                    }
                  }}
                  disabled={!memberInput.class || !memberInput.section}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {getStudentsForClassSection(memberInput.class, memberInput.section)
                      .filter(s => s.id !== leaderData.student?.id && !teamMembers.some(m => m.id === s.id))
                      .map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.student_name} - {student.roll_number}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Add Button */}
              <Button 
                type="button" 
                onClick={handleAddMember}
                disabled={!memberInput.student}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            {/* Display Added Members */}
            {teamMembers.length > 0 && (
              <div className="space-y-2 mt-4">
                <Label className="text-sm text-muted-foreground">Added Members ({teamMembers.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {teamMembers.map((member) => (
                    <Badge key={member.id} variant="secondary" className="gap-2 py-2 px-3">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{member.name}</span>
                        <span className="text-xs text-muted-foreground">{member.class} - Section {member.section}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="hover:text-destructive ml-2"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
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
