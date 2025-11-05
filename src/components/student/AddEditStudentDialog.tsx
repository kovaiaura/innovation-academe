import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Student } from "@/types/student";
import { generateRollNumber, generateAdmissionNumber, generateStudentId, validatePhoneNumber } from "@/utils/studentHelpers";
import { getClassesByInstitution } from "@/data/mockClassData";
import { useState, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AddEditStudentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  student?: Student;
  onSave: (student: Student | Omit<Student, 'id' | 'created_at'>) => void;
  existingStudents: Student[];
  institutionId: string;
}

export function AddEditStudentDialog({
  isOpen,
  onOpenChange,
  mode,
  student,
  onSave,
  existingStudents,
  institutionId,
}: AddEditStudentDialogProps) {
  const [formData, setFormData] = useState({
    student_name: '',
    roll_number: '',
    admission_number: '',
    class: '',
    section: '',
    class_id: '',
    date_of_birth: '',
    gender: 'male' as 'male' | 'female' | 'other',
    blood_group: '',
    admission_date: '',
    previous_school: '',
    parent_name: '',
    parent_phone: '',
    parent_email: '',
    address: '',
    status: 'active' as 'active' | 'inactive' | 'transferred' | 'graduated',
  });

  const [dobDate, setDobDate] = useState<Date>();
  const [admissionDate, setAdmissionDate] = useState<Date>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && student) {
      setFormData({
        student_name: student.student_name,
        roll_number: student.roll_number,
        admission_number: student.admission_number,
        class: student.class,
        section: student.section,
        class_id: student.class_id,
        date_of_birth: student.date_of_birth,
        gender: student.gender,
        blood_group: student.blood_group || '',
        admission_date: student.admission_date,
        previous_school: student.previous_school || '',
        parent_name: student.parent_name,
        parent_phone: student.parent_phone,
        parent_email: student.parent_email,
        address: student.address,
        status: student.status,
      });
      setDobDate(new Date(student.date_of_birth));
      setAdmissionDate(new Date(student.admission_date));
    } else if (mode === 'add') {
      // Reset form for add mode
      setFormData({
        student_name: '',
        roll_number: '',
        admission_number: '',
        class: '',
        section: '',
        class_id: '',
        date_of_birth: '',
        gender: 'male',
        blood_group: '',
        admission_date: format(new Date(), 'yyyy-MM-dd'),
        previous_school: '',
        parent_name: '',
        parent_phone: '',
        parent_email: '',
        address: '',
        status: 'active',
      });
      setDobDate(undefined);
      setAdmissionDate(new Date());
    }
  }, [mode, student, isOpen]);

  // Auto-generate roll number when class and section are selected (add mode only)
  useEffect(() => {
    if (mode === 'add' && formData.class && formData.section) {
      const rollNum = generateRollNumber(formData.class, formData.section, existingStudents);
      setFormData(prev => ({ ...prev, roll_number: rollNum }));
    }
  }, [formData.class, formData.section, mode, existingStudents]);

  // Auto-generate admission number (add mode only)
  useEffect(() => {
    if (mode === 'add' && !formData.admission_number) {
      const admNum = generateAdmissionNumber(existingStudents, institutionId);
      setFormData(prev => ({ ...prev, admission_number: admNum }));
    }
  }, [mode, existingStudents, institutionId]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.student_name.trim()) newErrors.student_name = 'Name is required';
    if (!formData.roll_number.trim()) newErrors.roll_number = 'Roll number is required';
    if (!formData.admission_number.trim()) newErrors.admission_number = 'Admission number is required';
    if (!formData.class) newErrors.class = 'Class is required';
    if (!formData.section) newErrors.section = 'Section is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!formData.admission_date) newErrors.admission_date = 'Admission date is required';
    if (!formData.parent_name.trim()) newErrors.parent_name = 'Parent name is required';
    if (!formData.parent_phone.trim()) {
      newErrors.parent_phone = 'Parent phone is required';
    } else if (!validatePhoneNumber(formData.parent_phone)) {
      newErrors.parent_phone = 'Invalid phone number format';
    }
    if (formData.parent_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parent_email)) {
      newErrors.parent_email = 'Invalid email format';
    }

    // Age validation
    if (formData.date_of_birth) {
      const dob = new Date(formData.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 3 || age > 20) {
        newErrors.date_of_birth = 'Age must be between 3 and 20 years for school students';
      }
      if (dob >= today) {
        newErrors.date_of_birth = 'Date of birth must be in the past';
      }
    }

    // Admission date validation
    if (formData.admission_date && formData.date_of_birth) {
      const admDate = new Date(formData.admission_date);
      const dobDate = new Date(formData.date_of_birth);
      if (admDate <= dobDate) {
        newErrors.admission_date = 'Admission date must be after date of birth';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      toast.error('Please fix all validation errors');
      return;
    }

    if (mode === 'edit' && student) {
      const updatedStudent: Student = {
        ...student,
        ...formData,
        avatar: student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.student_name}`,
      };
      onSave(updatedStudent);
    } else {
      const newStudent = {
        ...formData,
        institution_id: institutionId,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.student_name}`,
      };
      onSave(newStudent);
    }
    onOpenChange(false);
  };

  const institutionClasses = getClassesByInstitution(institutionId);
  const sections = ['A', 'B', 'C', 'D', 'E'];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add New Student' : 'Edit Student'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="font-semibold mb-3">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="student_name">Full Name *</Label>
                <Input
                  id="student_name"
                  value={formData.student_name}
                  onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                  className={errors.student_name ? 'border-destructive' : ''}
                />
                {errors.student_name && <p className="text-xs text-destructive mt-1">{errors.student_name}</p>}
              </div>

              <div>
                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dobDate && "text-muted-foreground",
                        errors.date_of_birth && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dobDate ? format(dobDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dobDate}
                      onSelect={(date) => {
                        setDobDate(date);
                        setFormData({ ...formData, date_of_birth: date ? format(date, 'yyyy-MM-dd') : '' });
                      }}
                      disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {errors.date_of_birth && <p className="text-xs text-destructive mt-1">{errors.date_of_birth}</p>}
              </div>

              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value: any) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="blood_group">Blood Group</Label>
                <Select value={formData.blood_group} onValueChange={(value) => setFormData({ ...formData, blood_group: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map(bg => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div>
            <h3 className="font-semibold mb-3">Academic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="class">Class *</Label>
                <Select 
                  value={formData.class} 
                  onValueChange={(value) => {
                    const selectedClass = institutionClasses.find(cls => cls.class_name === value);
                    setFormData({ 
                      ...formData, 
                      class: value,
                      class_id: selectedClass?.id || ''
                    });
                  }}
                >
                  <SelectTrigger className={errors.class ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {institutionClasses.map(cls => (
                      <SelectItem key={cls.id} value={cls.class_name}>{cls.class_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.class && <p className="text-xs text-destructive mt-1">{errors.class}</p>}
              </div>

              <div>
                <Label htmlFor="section">Section *</Label>
                <Select value={formData.section} onValueChange={(value) => setFormData({ ...formData, section: value })}>
                  <SelectTrigger className={errors.section ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map(sec => (
                      <SelectItem key={sec} value={sec}>{sec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.section && <p className="text-xs text-destructive mt-1">{errors.section}</p>}
              </div>

              <div>
                <Label htmlFor="roll_number">Roll Number *</Label>
                <Input
                  id="roll_number"
                  value={formData.roll_number}
                  onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                  readOnly={mode === 'add'}
                  className={errors.roll_number ? 'border-destructive' : ''}
                />
                {errors.roll_number && <p className="text-xs text-destructive mt-1">{errors.roll_number}</p>}
              </div>

              <div>
                <Label htmlFor="admission_number">Admission Number *</Label>
                <Input
                  id="admission_number"
                  value={formData.admission_number}
                  onChange={(e) => setFormData({ ...formData, admission_number: e.target.value })}
                  readOnly={mode === 'add'}
                  className={errors.admission_number ? 'border-destructive' : ''}
                />
                {errors.admission_number && <p className="text-xs text-destructive mt-1">{errors.admission_number}</p>}
              </div>

              <div>
                <Label htmlFor="admission_date">Admission Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !admissionDate && "text-muted-foreground",
                        errors.admission_date && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {admissionDate ? format(admissionDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={admissionDate}
                      onSelect={(date) => {
                        setAdmissionDate(date);
                        setFormData({ ...formData, admission_date: date ? format(date, 'yyyy-MM-dd') : '' });
                      }}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {errors.admission_date && <p className="text-xs text-destructive mt-1">{errors.admission_date}</p>}
              </div>

              <div>
                <Label htmlFor="previous_school">Previous School</Label>
                <Input
                  id="previous_school"
                  value={formData.previous_school}
                  onChange={(e) => setFormData({ ...formData, previous_school: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Parent/Guardian Information */}
          <div>
            <h3 className="font-semibold mb-3">Parent/Guardian Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="parent_name">Parent Name *</Label>
                <Input
                  id="parent_name"
                  value={formData.parent_name}
                  onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                  className={errors.parent_name ? 'border-destructive' : ''}
                />
                {errors.parent_name && <p className="text-xs text-destructive mt-1">{errors.parent_name}</p>}
              </div>

              <div>
                <Label htmlFor="parent_phone">Phone *</Label>
                <Input
                  id="parent_phone"
                  value={formData.parent_phone}
                  onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                  placeholder="+91-9876543210"
                  className={errors.parent_phone ? 'border-destructive' : ''}
                />
                {errors.parent_phone && <p className="text-xs text-destructive mt-1">{errors.parent_phone}</p>}
              </div>

              <div>
                <Label htmlFor="parent_email">Email</Label>
                <Input
                  id="parent_email"
                  type="email"
                  value={formData.parent_email}
                  onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                  className={errors.parent_email ? 'border-destructive' : ''}
                />
                {errors.parent_email && <p className="text-xs text-destructive mt-1">{errors.parent_email}</p>}
              </div>

              <div className="col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="font-semibold mb-3">Status</h3>
            <div>
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              {mode === 'add' ? 'Add Student' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
