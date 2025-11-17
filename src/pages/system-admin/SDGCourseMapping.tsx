import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { mockCourses } from "@/data/mockCourseData";
import { sdgGoals, mockCourseSDGMappings } from "@/data/mockSDGData";
import { Edit, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function SDGCourseMapping() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSDGs, setSelectedSDGs] = useState<string[]>([]);

  const handleEditSDGs = (courseId: string) => {
    setSelectedCourse(courseId);
    const mapping = mockCourseSDGMappings.find(m => m.entity_id === courseId);
    setSelectedSDGs(mapping?.sdg_goals || []);
    setDialogOpen(true);
  };

  const handleSaveSDGs = () => {
    toast.success(`SDGs updated for ${mockCourses.find(c => c.id === selectedCourse)?.title}`);
    setDialogOpen(false);
    setSelectedCourse(null);
    setSelectedSDGs([]);
  };

  const toggleSDG = (sdgId: string) => {
    setSelectedSDGs(prev => 
      prev.includes(sdgId) 
        ? prev.filter(id => id !== sdgId)
        : [...prev, sdgId]
    );
  };

  const getCourseSDGs = (courseId: string) => {
    const mapping = mockCourseSDGMappings.find(m => m.entity_id === courseId);
    return mapping?.sdg_goals || [];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Course SDG Mapping</CardTitle>
          <p className="text-sm text-muted-foreground">
            Assign UN Sustainable Development Goals to courses
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockCourses.map((course) => {
              const courseSDGs = getCourseSDGs(course.id);
              return (
                <div key={course.id} className="flex items-start justify-between border rounded-lg p-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-foreground">{course.title}</h3>
                      <Badge variant="outline" className="text-xs">{course.course_code}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{course.description}</p>
                    
                    {/* SDG Badges */}
                    <div className="flex flex-wrap gap-1">
                      {courseSDGs.length > 0 ? (
                        courseSDGs.map(sdgId => {
                          const sdgInfo = sdgGoals.find(s => s.id === sdgId);
                          return sdgInfo ? (
                            <Badge 
                              key={sdgId}
                              style={{ 
                                backgroundColor: sdgInfo.color,
                                color: '#ffffff',
                                borderColor: sdgInfo.color
                              }}
                              className="text-xs font-semibold"
                            >
                              SDG {sdgInfo.number}
                            </Badge>
                          ) : null;
                        })
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No SDGs assigned</span>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditSDGs(course.id)}
                    className="ml-4"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit SDGs
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edit SDGs Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit SDG Goals</DialogTitle>
            <DialogDescription>
              Select the UN Sustainable Development Goals that apply to{" "}
              <span className="font-semibold">
                {mockCourses.find(c => c.id === selectedCourse)?.title}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {sdgGoals.map((sdg) => (
              <div 
                key={sdg.id} 
                className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => toggleSDG(sdg.id)}
              >
                <Checkbox
                  id={sdg.id}
                  checked={selectedSDGs.includes(sdg.id)}
                  onCheckedChange={() => toggleSDG(sdg.id)}
                />
                <div className="flex-1 space-y-1">
                  <Label 
                    htmlFor={sdg.id}
                    className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
                  >
                    <div 
                      className="h-2 w-2 rounded-full" 
                      style={{ backgroundColor: sdg.color }}
                    />
                    {sdg.number}. {sdg.title}
                  </Label>
                  <p className="text-xs text-muted-foreground">{sdg.description}</p>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSDGs}>
              Save SDG Mappings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
