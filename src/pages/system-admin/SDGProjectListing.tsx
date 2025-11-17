import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockProjects } from "@/data/mockProjectData";
import { sdgGoals } from "@/data/mockSDGData";
import { Search, Target, Users, Building2, Calendar, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

export default function SDGProjectListing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSDG, setFilterSDG] = useState<string>("all");
  const [filterInstitution, setFilterInstitution] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Flatten projects from all institutions
  const allProjects = Object.values(mockProjects).flat();

  // Filter projects
  const filteredProjects = allProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSDG = filterSDG === "all" || project.sdg_goals.includes(filterSDG);
    const matchesInstitution = filterInstitution === "all" || project.institution_id === filterInstitution;
    
    return matchesSearch && matchesSDG && matchesInstitution;
  });

  const handleViewDetails = (project: any) => {
    setSelectedProject(project);
    setDetailsOpen(true);
  };

  const getSDGInfo = (sdgId: string) => {
    return sdgGoals.find(s => s.id === sdgId);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      proposal: 'bg-yellow-500',
      approved: 'bg-blue-500',
      in_progress: 'bg-purple-500',
      completed: 'bg-green-500',
      rejected: 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getInstitutionName = (instId: string) => {
    const names: Record<string, string> = {
      'inst-msd-001': 'Modern School Vasant Vihar',
      'inst-kga-001': 'Kikani Global Academy'
    };
    return names[instId] || instId;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Project Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterSDG} onValueChange={setFilterSDG}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by SDG" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All SDGs</SelectItem>
                {sdgGoals.map(sdg => (
                  <SelectItem key={sdg.id} value={sdg.id}>
                    SDG {sdg.number}: {sdg.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterInstitution} onValueChange={setFilterInstitution}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Institution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Institutions</SelectItem>
                <SelectItem value="inst-msd-001">Modern School Vasant Vihar</SelectItem>
                <SelectItem value="inst-kga-001">Kikani Global Academy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Project Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    {getInstitutionName(project.institution_id)}
                  </div>
                </div>
                <Badge className={getStatusColor(project.status)}>
                  {project.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>

              {/* SDG Badges */}
              <div className="flex flex-wrap gap-1">
                {project.sdg_goals.map(sdgId => {
                  const sdgInfo = getSDGInfo(sdgId);
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
                })}
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              {/* Team Info */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{project.team_members.length} team members</span>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleViewDetails(project)}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No projects found matching your filters</p>
          </CardContent>
        </Card>
      )}

      {/* Project Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProject?.title}</DialogTitle>
            <DialogDescription>
              Project details and SDG impact tracking
            </DialogDescription>
          </DialogHeader>

          {selectedProject && (
            <div className="space-y-6 py-4">
              {/* SDG Goals */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">SDG Goals</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.sdg_goals.map((sdgId: string) => {
                    const sdgInfo = getSDGInfo(sdgId);
                    return sdgInfo ? (
                      <div 
                        key={sdgId}
                        className="flex items-center gap-2 p-2 border rounded-lg"
                      >
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: sdgInfo.color }}
                        />
                        <div>
                          <p className="text-sm font-semibold">
                            {sdgInfo.number}. {sdgInfo.title}
                          </p>
                          <p className="text-xs text-muted-foreground">{sdgInfo.description}</p>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Project Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Institution</p>
                  <p className="font-medium">{getInstitutionName(selectedProject.institution_id)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{selectedProject.category}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedProject.status)}>
                    {selectedProject.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="font-medium">{selectedProject.progress}%</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
              </div>

              {/* Team Members */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Team Members</h4>
                <div className="space-y-2">
                  {selectedProject.team_members.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{member.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={member.role === 'leader' ? 'default' : 'secondary'}>
                          {member.role}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {member.class} {member.section}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Updates */}
              {selectedProject.progress_updates && selectedProject.progress_updates.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Latest Update</h4>
                  <div className="p-3 border rounded-lg bg-accent/50">
                    <p className="text-sm">{selectedProject.progress_updates[0].notes}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {selectedProject.progress_updates[0].date}
                      <span>•</span>
                      {selectedProject.progress_updates[0].updated_by}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
