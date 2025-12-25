import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { InstitutionHeader } from "@/components/management/InstitutionHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Eye, FileDown, Award, Lock, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useInstitutionProjects, useDeleteProject, ProjectWithRelations } from "@/hooks/useProjects";
import { ProjectDetailsDialog } from "@/components/project/ProjectDetailsDialog";
import { SDGGoalBadges } from "@/components/project/SDGGoalSelector";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const STATUS_CONFIG = {
  yet_to_start: { label: 'Yet to Start', variant: 'secondary' as const },
  ongoing: { label: 'Ongoing', variant: 'default' as const },
  completed: { label: 'Completed', variant: 'outline' as const },
};

interface ProjectRegistryTabProps {
  projects: ProjectWithRelations[];
  isLoading: boolean;
  isCeo: boolean;
  onDelete: (projectId: string) => void;
}

const ProjectRegistryTab = ({ projects, isLoading, isCeo, onDelete }: ProjectRegistryTabProps) => {
  const [selectedProject, setSelectedProject] = useState<ProjectWithRelations | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

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
          projects.map((project) => {
            const statusInfo = STATUS_CONFIG[project.status] || STATUS_CONFIG.yet_to_start;
            
            return (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>
                        {project.is_showcase && (
                          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                            ⭐ Showcase
                          </Badge>
                        )}
                        {project.is_published && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                            Published
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
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
                      {isCeo && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
                              onDelete(project.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} />
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Team Members</p>
                      <p className="text-sm font-medium">{project.project_members?.length || 0} students</p>
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
                        {project.start_date 
                          ? format(new Date(project.start_date), 'MMM dd, yyyy')
                          : 'Not set'}
                      </p>
                    </div>
                  </div>

                  {/* SDG Goals */}
                  {project.sdg_goals && (project.sdg_goals as number[]).length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">UN SDG Goals</p>
                      <SDGGoalBadges goals={project.sdg_goals as number[]} maxDisplay={6} />
                    </div>
                  )}

                  {/* Achievements */}
                  {project.project_achievements && project.project_achievements.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Achievements</p>
                      <div className="flex flex-wrap gap-2">
                        {project.project_achievements.map((achievement) => (
                          <Badge key={achievement.id} variant="outline" className="text-xs">
                            <Award className="h-3 w-3 mr-1" />
                            {achievement.title}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
      
      <ProjectDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        project={selectedProject}
        canDelete={isCeo}
        onDelete={onDelete}
      />
    </div>
  );
};

interface ProjectGalleryTabProps {
  projects: ProjectWithRelations[];
  isLoading: boolean;
}

function ProjectGalleryTab({ projects, isLoading }: ProjectGalleryTabProps) {
  const showcaseProjects = projects.filter(p => p.is_showcase);
  const [selectedProject, setSelectedProject] = useState<ProjectWithRelations | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

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
            <Button variant="outline" size="sm" disabled={showcaseProjects.length === 0}>
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
                      src={project.showcase_image_url || '/placeholder.svg'} 
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
                        <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Category</p>
                          <p className="font-medium">{project.category}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Team Size</p>
                          <p className="font-medium">{project.project_members?.length || 0} members</p>
                        </div>
                      </div>

                      {project.project_achievements && project.project_achievements.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Achievements</p>
                          <div className="flex flex-wrap gap-2">
                            {project.project_achievements.slice(0, 3).map((achievement) => (
                              <Badge key={achievement.id} variant="outline" className="text-xs">
                                <Award className="h-3 w-3 mr-1" />
                                {achievement.title}
                              </Badge>
                            ))}
                            {project.project_achievements.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{project.project_achievements.length - 3} more
                              </Badge>
                            )}
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
  const { user } = useAuth();
  const institutionId = user?.institution_id || null;
  // Check is_ceo from user object if available
  const isCeo = (user as any)?.is_ceo === true;

  const { data: projects = [], isLoading } = useInstitutionProjects(institutionId);
  const deleteProject = useDeleteProject();

  const handleDeleteProject = async (projectId: string) => {
    await deleteProject.mutateAsync(projectId);
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Projects & Certificates</h1>
          <p className="text-muted-foreground">View innovation projects and certificates managed by officers</p>
          {isCeo && (
            <Badge variant="outline" className="mt-2 bg-purple-50 text-purple-700">
              CEO Access - You can delete projects
            </Badge>
          )}
        </div>

        <Tabs defaultValue="registry" className="space-y-6">
          <TabsList>
            <TabsTrigger value="registry">Project Registry</TabsTrigger>
            <TabsTrigger value="gallery">Project Gallery</TabsTrigger>
          </TabsList>

          <TabsContent value="registry">
            <ProjectRegistryTab 
              projects={projects} 
              isLoading={isLoading} 
              isCeo={isCeo}
              onDelete={handleDeleteProject}
            />
          </TabsContent>

          <TabsContent value="gallery">
            <ProjectGalleryTab projects={projects} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
