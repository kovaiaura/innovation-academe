import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { InstitutionHeader } from "@/components/management/InstitutionHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Eye, FileDown, Award, Lock, Target, Users, Calendar, TrendingUp } from "lucide-react";
import { getProjectsByInstitution, getShowcaseProjects, Project } from "@/data/mockProjectData";
import { ProjectDetailsDialog } from "@/components/project/ProjectDetailsDialog";

const sdgNames: Record<number, string> = {
  1: 'No Poverty',
  2: 'Zero Hunger',
  3: 'Good Health',
  4: 'Quality Education',
  6: 'Clean Water',
  7: 'Affordable Energy',
  8: 'Economic Growth',
  9: 'Industry Innovation',
  11: 'Sustainable Cities',
  12: 'Responsible Consumption',
  13: 'Climate Action',
};

const ProjectRegistryTab = () => {
  const projects = [
    {
      id: "1",
      title: "IoT-Based Smart Home Automation",
      students: ["Rahul Sharma", "Priya Patel", "Amit Kumar"],
      class: "3rd Year CSE - Section A",
      officer: "Dr. Rajesh Kumar",
      status: "in_progress" as const,
      progress: 65,
      startDate: "2024-01-15",
      sdgs: ["SDG 7: Affordable & Clean Energy", "SDG 11: Sustainable Cities"],
    },
    {
      id: "2",
      title: "AI-Powered Crop Disease Detection",
      students: ["Sneha Reddy", "Karthik Iyer"],
      class: "3rd Year CSE - Section B",
      officer: "Ms. Priya Sharma",
      status: "in_progress" as const,
      progress: 45,
      startDate: "2024-01-20",
      sdgs: ["SDG 2: Zero Hunger", "SDG 9: Industry Innovation"],
    },
    {
      id: "3",
      title: "Blockchain for Supply Chain",
      students: ["Arun Nair", "Meera Singh", "Vikram Patel"],
      class: "4th Year CSE",
      officer: "Mr. Amit Patel",
      status: "completed" as const,
      progress: 100,
      startDate: "2023-11-01",
      sdgs: ["SDG 9: Industry Innovation", "SDG 12: Responsible Consumption"],
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      in_progress: "default",
      completed: "secondary",
      pending: "outline",
    } as const;
    return variants[status as keyof typeof variants] || "secondary";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Project Registry</h2>
      </div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <Badge variant={getStatusBadge(project.status)}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{project.class}</p>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-muted-foreground">Team:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.students.map((student, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {student}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Innovation Officer</p>
                  <p className="font-medium">{project.officer}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground">Started: {project.startDate}</span>
                  </div>
                </div>
              </div>

              {project.status === "in_progress" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">UN SDGs Addressed:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.sdgs.map((sdg, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {sdg}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

function ProjectGalleryTab() {
  const institutionId = 'springfield';
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
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Achievements */}
                  {project.achievements && project.achievements.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Achievements:</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {project.achievements.map((achievement, index) => (
                          <li key={index}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Awards */}
                  {project.awards && project.awards.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Awards:</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {project.awards.map((award, index) => (
                          <li key={index}>{award}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="pt-4 border-t space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Officer:</span>
                      <span className="font-medium">{project.created_by_officer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completed:</span>
                      <span className="font-medium">
                        {project.completion_date ? new Date(project.completion_date).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* SDG Goals */}
                  {project.sdg_goals.length > 0 && (
                    <div>
                      <span className="text-sm font-semibold mb-2 block">SDG Goals:</span>
                      <div className="flex flex-wrap gap-2">
                        {project.sdg_goals.map((goal) => (
                          <Badge key={goal} variant="outline" className="text-xs">
                            SDG {goal}
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
                </CardContent>
              </Card>
            ))}

            {showcaseProjects.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <p className="text-muted-foreground">No showcase projects available yet</p>
              </div>
            )}
          </div>
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
  return (
    <Layout>
      <div className="space-y-8">
        <InstitutionHeader />
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
            <ProjectRegistryTab />
          </TabsContent>

          <TabsContent value="gallery">
            <ProjectGalleryTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
