import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { InstitutionHeader } from "@/components/management/InstitutionHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Eye, FileDown, Award, Lock } from "lucide-react";
import { getProjectsByInstitution, getShowcaseProjects, Project } from "@/data/mockProjectData";
import { ProjectDetailsDialog } from "@/components/project/ProjectDetailsDialog";
import { getInstitutionBySlug } from "@/data/mockInstitutionData";
import { useLocation } from "react-router-dom";

interface ProjectRegistryTabProps {
  institutionId: string;
}

const ProjectRegistryTab = ({ institutionId }: ProjectRegistryTabProps) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const projects = getProjectsByInstitution(institutionId);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      'proposal': 'outline',
      'approved': 'default',
      'in_progress': 'default',
      'completed': 'secondary',
      'rejected': 'destructive',
    };
    return variants[status] || 'outline';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Project Registry</h2>
        <p className="text-muted-foreground">All innovation projects at this institution</p>
      </div>

      <div className="grid gap-4">
        {projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No projects found for this institution</p>
            </CardContent>
          </Card>
        ) : (
          projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <Badge variant={getStatusBadge(project.status)}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                      {project.is_showcase && (
                        <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                          ⭐ Showcase
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedProject(project);
                      setIsDetailsDialogOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                {project.status !== 'proposal' && project.status !== 'rejected' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} />
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Team Members</p>
                    <p className="text-sm font-medium">{project.team_members.length} students</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Category</p>
                    <p className="text-sm font-medium">{project.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Officer</p>
                    <p className="text-sm font-medium">{project.created_by_officer_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                    <p className="text-sm font-medium">
                      {new Date(project.start_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* SDG Goals */}
                {project.sdg_goals && project.sdg_goals.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">UN SDG Goals</p>
                    <div className="flex flex-wrap gap-2">
                      {project.sdg_goals.map((goal) => (
                        <Badge key={goal} variant="outline" className="text-xs">
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Project Details Dialog */}
      <ProjectDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        project={selectedProject}
      />
    </div>
  );
};

interface ProjectGalleryTabProps {
  institutionId: string;
}

function ProjectGalleryTab({ institutionId }: ProjectGalleryTabProps) {
  const showcaseProjects = getShowcaseProjects(institutionId);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Project Gallery</CardTitle>
              <Badge variant="outline" className="text-xs">
                <Lock className="h-3 w-3 mr-1" />
                Read Only
              </Badge>
            </div>
            <Button variant="outline" size="sm">
              <FileDown className="h-4 w-4 mr-2" />
              Export Showcase
            </Button>
          </div>
          <CardDescription>
            Award-winning and showcase projects (Managed by innovation officers)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showcaseProjects.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No showcase projects available for this institution</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {showcaseProjects.map((project) => (
                <Card key={project.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    <img 
                      src={project.showcase_image || '/placeholder.svg'} 
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-4 right-4 bg-yellow-500 text-white">
                      <Award className="h-3 w-3 mr-1" />
                      Showcase
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{project.title}</h3>
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Category</p>
                          <p className="font-medium">{project.category}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Team Size</p>
                          <p className="font-medium">{project.team_members.length} members</p>
                        </div>
                      </div>

                      {project.achievements && project.achievements.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Achievements</p>
                          <ul className="text-sm space-y-1">
                            {project.achievements.map((achievement, index) => (
                              <li key={index} className="text-muted-foreground flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                <span>{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {project.awards && project.awards.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Awards</p>
                          <div className="flex flex-wrap gap-2">
                            {project.awards.map((award, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                <Award className="h-3 w-3 mr-1" />
                                {award}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          setSelectedProject(project);
                          setIsDetailsDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ProjectDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        project={selectedProject}
      />
    </>
  );
}

export default function ProjectsAndCertificates() {
  // Extract institution from URL
  const location = useLocation();
  const institutionSlug = location.pathname.split('/')[2];
  const institution = getInstitutionBySlug(institutionSlug);

  if (!institution) {
    return (
      <Layout>
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Institution not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <InstitutionHeader 
          institutionName={institution.name}
          establishedYear={institution.established_year}
          location={institution.location}
          totalStudents={institution.total_students}
          academicYear={institution.academic_year}
          userRole="Management Portal"
          assignedOfficers={institution.assigned_officers.map(o => o.officer_name)}
        />
        <div>
          <h1 className="text-3xl font-bold">Projects & Certificates</h1>
          <p className="text-muted-foreground">View innovation projects and certificates managed by officers</p>
        </div>

        <Tabs defaultValue="registry" className="space-y-6">
          <TabsList>
            <TabsTrigger value="registry">Project Registry</TabsTrigger>
            <TabsTrigger value="gallery">Project Gallery</TabsTrigger>
          </TabsList>

          <TabsContent value="registry">
            <ProjectRegistryTab institutionId={institution.id} />
          </TabsContent>

          <TabsContent value="gallery">
            <ProjectGalleryTab institutionId={institution.id} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
