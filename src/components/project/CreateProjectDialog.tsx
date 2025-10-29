import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Project } from "@/data/mockProjectData";

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
  const [studentClass, setStudentClass] = useState("");
  const [fundingRequired, setFundingRequired] = useState("");
  const [selectedSdgs, setSelectedSdgs] = useState<number[]>([]);
  const [teamLeader, setTeamLeader] = useState("");
  const [teamMembers, setTeamMembers] = useState("");

  const handleSubmit = () => {
    if (!title || !description || !category || !studentClass || !teamLeader) {
      toast.error("Please fill in all required fields");
      return;
    }

    const members = teamMembers
      .split(',')
      .map(name => name.trim())
      .filter(name => name)
      .map((name, index) => ({
        id: `s${Date.now()}-${index}`,
        name,
        role: 'member' as const
      }));

    const newProject: Omit<Project, 'id'> = {
      title,
      description,
      category,
      team_members: [
        { id: `s${Date.now()}-leader`, name: teamLeader, role: 'leader' },
        ...members
      ],
      created_by_officer_id: officerId,
      created_by_officer_name: officerName,
      institution_id: institutionId,
      class: studentClass,
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
    setStudentClass("");
    setFundingRequired("");
    setSelectedSdgs([]);
    setTeamLeader("");
    setTeamMembers("");
    
    toast.success("Project created successfully");
    onOpenChange(false);
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

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="class">Class/Section *</Label>
              <Input
                id="class"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                placeholder="e.g., 3rd Year CSE - Section A"
              />
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
            <Label htmlFor="teamLeader">Team Leader Name *</Label>
            <Input
              id="teamLeader"
              value={teamLeader}
              onChange={(e) => setTeamLeader(e.target.value)}
              placeholder="e.g., Rahul Sharma"
            />
          </div>

          <div>
            <Label htmlFor="teamMembers">Team Members (comma-separated)</Label>
            <Input
              id="teamMembers"
              value={teamMembers}
              onChange={(e) => setTeamMembers(e.target.value)}
              placeholder="e.g., Priya Patel, Amit Kumar"
            />
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
