import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { InstitutionClass } from '@/types/institution';
import { Course, CourseModule } from '@/types/course';
import { courseService } from '@/services/course.service';
import { BookOpen, CalendarIcon, Check, ChevronRight, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type UnlockMode = 'immediate' | 'sequential' | 'date_based' | 'manual';

interface ModuleConfig {
  module_id: string;
  unlock_mode: UnlockMode;
  unlock_date?: string;
  require_all_content: boolean;
  require_all_assignments: boolean;
  require_all_quizzes: boolean;
  minimum_score_percent?: number;
}

interface AssignCourseToClassDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  classData: InstitutionClass;
  onAssignCourse: (assignment: any) => Promise<void>;
}

export function AssignCourseToClassDialog({
  isOpen,
  onOpenChange,
  classData,
  onAssignCourse
}: AssignCourseToClassDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
  const [moduleConfigs, setModuleConfigs] = useState<Map<string, ModuleConfig>>(new Map());
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [assignedOfficerIds, setAssignedOfficerIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    if (isOpen) {
      loadCourses();
    }
  }, [isOpen]);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      // Mock data for now - replace with actual API call
      const mockCourses: Course[] = [
        {
          id: 'course-1',
          course_code: 'WEB-101',
          title: 'Full Stack Web Development',
          description: 'Learn to build modern web applications from scratch',
          category: 'web_dev',
          difficulty: 'beginner',
          duration_weeks: 12,
          learning_outcomes: ['HTML/CSS', 'JavaScript', 'React', 'Node.js'],
          status: 'active',
          created_by: 'admin',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: 'course-2',
          course_code: 'AI-201',
          title: 'Introduction to AI & Machine Learning',
          description: 'Master the fundamentals of artificial intelligence',
          category: 'ai_ml',
          difficulty: 'intermediate',
          duration_weeks: 16,
          learning_outcomes: ['Python', 'ML Algorithms', 'Neural Networks'],
          status: 'active',
          created_by: 'admin',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: 'course-3',
          course_code: 'CYB-101',
          title: 'Cybersecurity Fundamentals',
          description: 'Learn essential cybersecurity concepts',
          category: 'other',
          difficulty: 'beginner',
          duration_weeks: 8,
          learning_outcomes: ['Network Security', 'Ethical Hacking'],
          status: 'active',
          created_by: 'admin',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ];
      setCourses(mockCourses);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  const loadModules = async (courseId: string) => {
    try {
      setIsLoading(true);
      // Mock modules
      const mockModules: CourseModule[] = [
        { id: `${courseId}-mod-1`, course_id: courseId, title: 'Introduction & Setup', description: 'Getting started', order: 1, created_at: '2024-01-01' },
        { id: `${courseId}-mod-2`, course_id: courseId, title: 'Core Concepts', description: 'Learn the basics', order: 2, created_at: '2024-01-01' },
        { id: `${courseId}-mod-3`, course_id: courseId, title: 'Advanced Topics', description: 'Deep dive', order: 3, created_at: '2024-01-01' },
        { id: `${courseId}-mod-4`, course_id: courseId, title: 'Final Project', description: 'Capstone project', order: 4, created_at: '2024-01-01' },
      ];
      setModules(mockModules);
      
      // Initialize configs for all modules with immediate unlock
      const configs = new Map<string, ModuleConfig>();
      mockModules.forEach(module => {
        configs.set(module.id, {
          module_id: module.id,
          unlock_mode: 'immediate',
          require_all_content: true,
          require_all_assignments: true,
          require_all_quizzes: true,
          minimum_score_percent: 70
        });
      });
      setModuleConfigs(configs);
    } catch (error) {
      toast.error('Failed to load modules');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    loadModules(course.id);
    setCurrentStep(2);
  };

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModuleIds(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleNext = () => {
    if (currentStep === 2 && selectedModuleIds.length === 0) {
      toast.error('Please select at least one module');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const updateModuleConfig = (moduleId: string, updates: Partial<ModuleConfig>) => {
    const newConfigs = new Map(moduleConfigs);
    const current = newConfigs.get(moduleId)!;
    newConfigs.set(moduleId, { ...current, ...updates });
    setModuleConfigs(newConfigs);
  };

  const handleAssign = async () => {
    if (!selectedCourse) return;

    try {
      setIsLoading(true);
      
      const assignment = {
        course_id: selectedCourse.id,
        course_title: selectedCourse.title,
        course_category: selectedCourse.category,
        class_id: classData.id,
        assigned_modules: selectedModuleIds.map((modId, index) => {
          const module = modules.find(m => m.id === modId)!;
          const config = moduleConfigs.get(modId)!;
          return {
            module_id: modId,
            module_title: module.title,
            module_order: index + 1,
            unlock_mode: config.unlock_mode,
            unlock_date: config.unlock_date,
            is_unlocked: config.unlock_mode === 'immediate',
            completion_requirement: {
              require_all_content: config.require_all_content,
              require_all_assignments: config.require_all_assignments,
              require_all_quizzes: config.require_all_quizzes,
              minimum_score_percent: config.minimum_score_percent
            },
            students_completed: 0
          };
        }),
        assigned_officers: assignedOfficerIds,
        start_date: format(startDate, 'yyyy-MM-dd'),
        expected_end_date: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
        status: 'active'
      };

      await onAssignCourse(assignment);
      handleReset();
    } catch (error) {
      toast.error('Failed to assign course');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedCourse(null);
    setModules([]);
    setSelectedModuleIds([]);
    setModuleConfigs(new Map());
    setStartDate(new Date());
    setEndDate(undefined);
    setAssignedOfficerIds([]);
    setSearchQuery('');
    setCategoryFilter('all');
    onOpenChange(false);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const selectedModules = modules.filter(m => selectedModuleIds.includes(m.id));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Course to {classData.class_name} - Step {currentStep} of 5</DialogTitle>
          <DialogDescription>
            {currentStep === 1 && 'Select a course to assign'}
            {currentStep === 2 && 'Choose which modules to include'}
            {currentStep === 3 && 'Configure module unlock settings'}
            {currentStep === 4 && 'Set dates and assign officers'}
            {currentStep === 5 && 'Review and confirm'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map(step => (
            <div 
              key={step} 
              className={`h-1 flex-1 rounded ${step <= currentStep ? 'bg-primary' : 'bg-muted'}`} 
            />
          ))}
        </div>

        {/* Step 1: Select Course */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <Input 
                placeholder="Search courses..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="web_dev">Web Dev</SelectItem>
                  <SelectItem value="ai_ml">AI & ML</SelectItem>
                  <SelectItem value="iot">IoT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="grid gap-3">
                {filteredCourses.map(course => (
                  <Card 
                    key={course.id} 
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleCourseSelect(course)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{course.title}</CardTitle>
                            <CardDescription className="mt-1">{course.description}</CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex gap-2">
                        <Badge variant="outline">{course.course_code}</Badge>
                        <Badge variant="outline" className="capitalize">{course.difficulty}</Badge>
                        <Badge variant="outline">{course.duration_weeks} weeks</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Step 2: Select Modules */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{selectedModuleIds.length} of {modules.length} modules selected</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedModuleIds(modules.map(m => m.id))}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedModuleIds([])}>
                  Deselect All
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {modules.map(module => (
                  <Card 
                    key={module.id}
                    className={cn(
                      "cursor-pointer transition-colors",
                      selectedModuleIds.includes(module.id) && "border-primary bg-primary/5"
                    )}
                    onClick={() => handleModuleToggle(module.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Checkbox checked={selectedModuleIds.includes(module.id)} />
                        <div className="flex-1">
                          <p className="font-medium">Module {module.order}: {module.title}</p>
                          <p className="text-sm text-muted-foreground">{module.description}</p>
                        </div>
                        {selectedModuleIds.includes(module.id) && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Step 3: Configure Unlock Settings */}
        {currentStep === 3 && (
          <ScrollArea className="h-[500px]">
            <div className="space-y-4 pr-4">
              {selectedModules.map((module, index) => {
                const config = moduleConfigs.get(module.id)!;
                return (
                  <Card key={module.id}>
                    <CardHeader>
                      <CardTitle className="text-base">Module {index + 1}: {module.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Unlock Mode</Label>
                        <Select 
                          value={config.unlock_mode} 
                          onValueChange={(value: UnlockMode) => updateModuleConfig(module.id, { unlock_mode: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Immediate - Unlocked right away</SelectItem>
                            <SelectItem value="sequential">Sequential - After previous module</SelectItem>
                            <SelectItem value="date_based">Date Based - Unlock on specific date</SelectItem>
                            <SelectItem value="manual">Manual - Admin unlocks manually</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {config.unlock_mode === 'date_based' && (
                        <div>
                          <Label>Unlock Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {config.unlock_date ? format(new Date(config.unlock_date), 'PPP') : 'Pick a date'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={config.unlock_date ? new Date(config.unlock_date) : undefined}
                                onSelect={(date) => updateModuleConfig(module.id, { unlock_date: date ? format(date, 'yyyy-MM-dd') : undefined })}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}

                      <div>
                        <Label className="mb-2 block">Completion Requirements</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              checked={config.require_all_content}
                              onCheckedChange={(checked) => updateModuleConfig(module.id, { require_all_content: !!checked })}
                            />
                            <Label className="font-normal">Require all content viewed</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              checked={config.require_all_assignments}
                              onCheckedChange={(checked) => updateModuleConfig(module.id, { require_all_assignments: !!checked })}
                            />
                            <Label className="font-normal">Require all assignments completed</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              checked={config.require_all_quizzes}
                              onCheckedChange={(checked) => updateModuleConfig(module.id, { require_all_quizzes: !!checked })}
                            />
                            <Label className="font-normal">Require all quizzes completed</Label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Minimum Score (%)</Label>
                        <Input 
                          type="number" 
                          min="0" 
                          max="100" 
                          value={config.minimum_score_percent || 70}
                          onChange={(e) => updateModuleConfig(module.id, { minimum_score_percent: parseInt(e.target.value) })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Step 4: Dates & Officers */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Date Range</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(startDate, 'PPP')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => date && setStartDate(date)}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, 'PPP') : 'Optional'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          disabled={(date) => date < startDate}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assign Officers (Optional)</CardTitle>
                <CardDescription>Select officers who will manage this course</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Officer assignment will be available after integration with officer management</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && selectedCourse && (
          <ScrollArea className="h-[500px]">
            <div className="space-y-4 pr-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Course Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Course:</span>
                    <span className="font-medium">{selectedCourse.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Class:</span>
                    <span className="font-medium">{classData.class_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Start Date:</span>
                    <span className="font-medium">{format(startDate, 'PPP')}</span>
                  </div>
                  {endDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">End Date:</span>
                      <span className="font-medium">{format(endDate, 'PPP')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Modules ({selectedModuleIds.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedModules.map((module, index) => {
                      const config = moduleConfigs.get(module.id)!;
                      return (
                        <div key={module.id} className="flex items-start gap-3 p-3 border rounded">
                          <div className="flex-1">
                            <p className="font-medium text-sm">Module {index + 1}: {module.title}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="capitalize">{config.unlock_mode}</Badge>
                              {config.unlock_date && (
                                <Badge variant="outline">{format(new Date(config.unlock_date), 'MMM d, yyyy')}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        )}

        <div className="flex justify-between pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => currentStep === 1 ? handleReset() : setCurrentStep(currentStep - 1)}
            disabled={isLoading}
          >
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button 
            onClick={currentStep === 5 ? handleAssign : handleNext}
            disabled={isLoading || (currentStep === 2 && selectedModuleIds.length === 0)}
          >
            {isLoading ? 'Processing...' : currentStep === 5 ? 'Assign Course' : 'Next'}
            {currentStep < 5 && <ChevronRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
