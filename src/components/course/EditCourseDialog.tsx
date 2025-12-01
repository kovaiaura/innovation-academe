import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, Save, X, Layers, PlayCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Course, CourseModule, CourseSession, CourseContent, CourseCategory, CourseDifficulty, CourseStatus } from '@/types/course';
import { 
  getCourseById, 
  updateCourse, 
  getLevelsByCourse, 
  saveLevels,
  getSessionsByLevel,
  saveSessions,
  getContentBySession,
  saveContent,
  loadLevels,
  loadSessions,
  loadContent
} from '@/utils/courseDataHelpers';

interface EditCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string | null;
  onSave?: () => void;
}

const categoryOptions: { value: CourseCategory; label: string }[] = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'iot', label: 'IoT' },
  { value: 'robotics', label: 'Robotics' },
  { value: 'ai_ml', label: 'AI/ML' },
  { value: 'data_science', label: 'Data Science' },
  { value: 'ar_vr', label: 'AR/VR/XR' },
  { value: 'blockchain', label: 'Blockchain' },
  { value: 'drones', label: 'Drones' },
  { value: 'cybersecurity', label: 'Cybersecurity' },
  { value: 'design_thinking', label: 'Design Thinking' },
  { value: 'product_design', label: 'Product Design' },
  { value: 'prototyping', label: 'Prototyping' },
  { value: 'environmental_tech', label: 'Environmental Tech' },
  { value: 'sdg', label: 'SDG' },
  { value: 'ethics', label: 'Ethics' },
  { value: 'etiquettes', label: 'Etiquettes' },
  { value: 'human_values', label: 'Human Values' },
  { value: 'digital_media', label: 'Digital Media' },
  { value: 'communication', label: 'Communication' },
  { value: 'prompt_engineering', label: 'Prompt Engineering' },
  { value: 'entrepreneurship', label: 'Entrepreneurship' },
  { value: 'financial_literacy', label: 'Financial Literacy' },
  { value: 'career_prep', label: 'Career Preparation' },
];

export function EditCourseDialog({ open, onOpenChange, courseId, onSave }: EditCourseDialogProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [course, setCourse] = useState<Course | null>(null);
  const [levels, setLevels] = useState<CourseModule[]>([]);
  const [sessions, setSessions] = useState<CourseSession[]>([]);
  const [content, setContent] = useState<CourseContent[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (open && courseId) {
      const courseData = getCourseById(courseId);
      if (courseData) {
        setCourse(courseData);
        const courseLevels = getLevelsByCourse(courseId);
        setLevels(courseLevels);
        
        // Load all sessions for this course
        const allSessions = loadSessions().filter(s => s.course_id === courseId);
        setSessions(allSessions);
        
        // Load all content for this course
        const allContent = loadContent().filter(c => c.course_id === courseId);
        setContent(allContent);
        
        if (courseLevels.length > 0) {
          setSelectedLevelId(courseLevels[0].id);
        }
      }
    }
  }, [open, courseId]);

  const handleSave = () => {
    if (!course) return;

    // Save course
    updateCourse(course.id, course);
    
    // Save levels - update global list
    const allLevels = loadLevels();
    const otherLevels = allLevels.filter(l => l.course_id !== course.id);
    saveLevels([...otherLevels, ...levels]);
    
    // Save sessions
    const allSessions = loadSessions();
    const otherSessions = allSessions.filter(s => s.course_id !== course.id);
    saveSessions([...otherSessions, ...sessions]);
    
    // Save content
    const allContent = loadContent();
    const otherContent = allContent.filter(c => c.course_id !== course.id);
    saveContent([...otherContent, ...content]);

    toast.success('Course updated successfully!');
    onSave?.();
    onOpenChange(false);
  };

  const updateCourseField = (field: keyof Course, value: any) => {
    if (!course) return;
    setCourse({ ...course, [field]: value });
  };

  const addLearningOutcome = () => {
    if (!course) return;
    setCourse({ ...course, learning_outcomes: [...course.learning_outcomes, ''] });
  };

  const updateLearningOutcome = (index: number, value: string) => {
    if (!course) return;
    const outcomes = [...course.learning_outcomes];
    outcomes[index] = value;
    setCourse({ ...course, learning_outcomes: outcomes });
  };

  const removeLearningOutcome = (index: number) => {
    if (!course) return;
    setCourse({ 
      ...course, 
      learning_outcomes: course.learning_outcomes.filter((_, i) => i !== index) 
    });
  };

  // Level management
  const addLevel = () => {
    if (!course) return;
    const newLevel: CourseModule = {
      id: `level-${Date.now()}`,
      course_id: course.id,
      title: '',
      description: '',
      order: levels.length + 1,
      created_at: new Date().toISOString(),
    };
    setLevels([...levels, newLevel]);
    setSelectedLevelId(newLevel.id);
  };

  const updateLevel = (levelId: string, field: keyof CourseModule, value: any) => {
    setLevels(levels.map(l => l.id === levelId ? { ...l, [field]: value } : l));
  };

  const deleteLevel = (levelId: string) => {
    setLevels(levels.filter(l => l.id !== levelId));
    setSessions(sessions.filter(s => s.module_id !== levelId));
    setContent(content.filter(c => c.module_id !== levelId));
    if (selectedLevelId === levelId) {
      setSelectedLevelId(levels[0]?.id || null);
    }
  };

  // Session management
  const addSession = () => {
    if (!course || !selectedLevelId) return;
    const levelSessions = sessions.filter(s => s.module_id === selectedLevelId);
    const newSession: CourseSession = {
      id: `session-${Date.now()}`,
      course_id: course.id,
      module_id: selectedLevelId,
      title: '',
      description: '',
      order: levelSessions.length + 1,
      duration_minutes: 45,
      learning_objectives: [],
      created_at: new Date().toISOString(),
    };
    setSessions([...sessions, newSession]);
    setSelectedSessionId(newSession.id);
  };

  const updateSession = (sessionId: string, field: keyof CourseSession, value: any) => {
    setSessions(sessions.map(s => s.id === sessionId ? { ...s, [field]: value } : s));
  };

  const deleteSession = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
    setContent(content.filter(c => c.session_id !== sessionId));
    if (selectedSessionId === sessionId) {
      setSelectedSessionId(null);
    }
  };

  // Content management
  const addContentItem = () => {
    if (!course || !selectedLevelId || !selectedSessionId) return;
    const sessionContent = content.filter(c => c.session_id === selectedSessionId);
    const newContent: CourseContent = {
      id: `content-${Date.now()}`,
      course_id: course.id,
      module_id: selectedLevelId,
      session_id: selectedSessionId,
      title: '',
      type: 'pdf',
      order: sessionContent.length + 1,
      views_count: 0,
      created_at: new Date().toISOString(),
    };
    setContent([...content, newContent]);
  };

  const updateContentItem = (contentId: string, field: keyof CourseContent, value: any) => {
    setContent(content.map(c => c.id === contentId ? { ...c, [field]: value } : c));
  };

  const deleteContentItem = (contentId: string) => {
    setContent(content.filter(c => c.id !== contentId));
  };

  const selectedLevel = levels.find(l => l.id === selectedLevelId);
  const levelSessions = sessions.filter(s => s.module_id === selectedLevelId).sort((a, b) => a.order - b.order);
  const sessionContent = content.filter(c => c.session_id === selectedSessionId).sort((a, b) => a.order - b.order);

  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>Edit Course: {course.title}</DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                {course.status}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-4 grid grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="levels">Levels ({levels.length})</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            {/* Basic Info Tab */}
            <TabsContent value="basic" className="p-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Course Code</Label>
                  <Input
                    value={course.course_code}
                    onChange={(e) => updateCourseField('course_code', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Course Title</Label>
                  <Input
                    value={course.title}
                    onChange={(e) => updateCourseField('title', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={course.description}
                  onChange={(e) => updateCourseField('description', e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={course.category}
                    onValueChange={(value) => updateCourseField('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select
                    value={course.difficulty}
                    onValueChange={(value) => updateCourseField('difficulty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Duration (weeks)</Label>
                  <Input
                    type="number"
                    value={course.duration_weeks}
                    onChange={(e) => updateCourseField('duration_weeks', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Prerequisites</Label>
                  <Input
                    value={course.prerequisites || ''}
                    onChange={(e) => updateCourseField('prerequisites', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={course.status}
                    onValueChange={(value) => updateCourseField('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Learning Outcomes</Label>
                  <Button variant="outline" size="sm" onClick={addLearningOutcome}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                {course.learning_outcomes.map((outcome, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={outcome}
                      onChange={(e) => updateLearningOutcome(index, e.target.value)}
                      placeholder={`Outcome ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLearningOutcome(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Levels Tab */}
            <TabsContent value="levels" className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Course Levels</h3>
                <Button onClick={addLevel}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Level
                </Button>
              </div>

              <div className="space-y-3">
                {levels.map((level, index) => (
                  <Card key={level.id} className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-primary" />
                        <span className="font-medium">Level {index + 1}</span>
                      </div>
                      <div className="flex-1 grid gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Title</Label>
                          <Input
                            value={level.title}
                            onChange={(e) => updateLevel(level.id, 'title', e.target.value)}
                            placeholder="Level title"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Description</Label>
                          <Input
                            value={level.description}
                            onChange={(e) => updateLevel(level.id, 'description', e.target.value)}
                            placeholder="Brief description"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteLevel(level.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Sessions Tab */}
            <TabsContent value="sessions" className="p-4">
              <div className="grid grid-cols-3 gap-4 h-[500px]">
                {/* Level Selection */}
                <div className="border rounded-lg p-3 space-y-2">
                  <h4 className="font-medium text-sm">Select Level</h4>
                  {levels.map((level, index) => (
                    <Button
                      key={level.id}
                      variant={selectedLevelId === level.id ? 'default' : 'ghost'}
                      className="w-full justify-start text-left"
                      onClick={() => {
                        setSelectedLevelId(level.id);
                        setSelectedSessionId(null);
                      }}
                    >
                      <Layers className="h-4 w-4 mr-2" />
                      Level {index + 1}: {level.title || 'Untitled'}
                    </Button>
                  ))}
                </div>

                {/* Sessions List */}
                <div className="border rounded-lg p-3 space-y-2 col-span-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">
                      Sessions {selectedLevel ? `for Level: ${selectedLevel.title || 'Untitled'}` : ''}
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addSession}
                      disabled={!selectedLevelId}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Session
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {levelSessions.map((session, index) => (
                      <Card key={session.id} className="p-3">
                        <div className="flex items-start gap-3">
                          <PlayCircle className="h-4 w-4 text-blue-500 mt-1" />
                          <div className="flex-1 grid gap-2 md:grid-cols-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Title</Label>
                              <Input
                                value={session.title}
                                onChange={(e) => updateSession(session.id, 'title', e.target.value)}
                                placeholder="Session title"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Duration (min)</Label>
                              <Input
                                type="number"
                                value={session.duration_minutes || ''}
                                onChange={(e) => updateSession(session.id, 'duration_minutes', parseInt(e.target.value) || 0)}
                              />
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSessionId(session.id)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSession(session.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="p-4">
              <div className="grid grid-cols-4 gap-4 h-[500px]">
                {/* Level Selection */}
                <div className="border rounded-lg p-3 space-y-2 overflow-auto">
                  <h4 className="font-medium text-sm">Levels</h4>
                  {levels.map((level, index) => (
                    <Button
                      key={level.id}
                      variant={selectedLevelId === level.id ? 'default' : 'ghost'}
                      className="w-full justify-start text-left text-xs"
                      size="sm"
                      onClick={() => {
                        setSelectedLevelId(level.id);
                        setSelectedSessionId(null);
                      }}
                    >
                      L{index + 1}: {level.title || 'Untitled'}
                    </Button>
                  ))}
                </div>

                {/* Session Selection */}
                <div className="border rounded-lg p-3 space-y-2 overflow-auto">
                  <h4 className="font-medium text-sm">Sessions</h4>
                  {levelSessions.map((session, index) => (
                    <Button
                      key={session.id}
                      variant={selectedSessionId === session.id ? 'default' : 'ghost'}
                      className="w-full justify-start text-left text-xs"
                      size="sm"
                      onClick={() => setSelectedSessionId(session.id)}
                    >
                      S{index + 1}: {session.title || 'Untitled'}
                    </Button>
                  ))}
                </div>

                {/* Content List */}
                <div className="border rounded-lg p-3 space-y-2 col-span-2 overflow-auto">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Content Items</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addContentItem}
                      disabled={!selectedSessionId}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Content
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {sessionContent.map((item) => (
                      <Card key={item.id} className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{item.type}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteContentItem(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="grid gap-2 md:grid-cols-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Title</Label>
                              <Input
                                value={item.title}
                                onChange={(e) => updateContentItem(item.id, 'title', e.target.value)}
                                placeholder="Content title"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Type</Label>
                              <Select
                                value={item.type}
                                onValueChange={(value) => updateContentItem(item.id, 'type', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="ppt">PowerPoint</SelectItem>
                                  <SelectItem value="video">Video</SelectItem>
                                  <SelectItem value="youtube">YouTube</SelectItem>
                                  <SelectItem value="link">Link</SelectItem>
                                  <SelectItem value="simulation">Simulation</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          {['youtube', 'link', 'simulation'].includes(item.type) && (
                            <div className="space-y-1">
                              <Label className="text-xs">URL</Label>
                              <Input
                                value={item.youtube_url || item.external_url || ''}
                                onChange={(e) => {
                                  if (item.type === 'youtube') {
                                    updateContentItem(item.id, 'youtube_url', e.target.value);
                                  } else {
                                    updateContentItem(item.id, 'external_url', e.target.value);
                                  }
                                }}
                                placeholder="https://..."
                              />
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Footer */}
        <div className="p-4 border-t flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
