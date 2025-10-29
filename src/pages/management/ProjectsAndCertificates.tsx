import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Award, Users, Calendar, TrendingUp } from "lucide-react";
import { InstitutionHeader } from "@/components/management/InstitutionHeader";

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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Project Registry</h2>
        <Button>
          <Target className="h-4 w-4 mr-2" />
          Add New Project
        </Button>
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

const ProjectGalleryTab = () => {
  const showcaseProjects = [
    {
      id: "1",
      title: "Smart Agriculture System",
      description: "IoT-based automated irrigation and crop monitoring",
      students: "Team AgriTech",
      achievements: ["Best Innovation Award 2024", "State Level Winner"],
      image: "🌾",
      completedDate: "2024-01-30",
    },
    {
      id: "2",
      title: "Healthcare Chatbot",
      description: "AI-powered symptom checker and health advisor",
      students: "Team HealthAI",
      achievements: ["National Hackathon Finalist"],
      image: "🏥",
      completedDate: "2024-01-25",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Project Gallery</h2>
        <Button variant="outline">
          <Award className="h-4 w-4 mr-2" />
          Export Showcase
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {showcaseProjects.map((project) => (
          <Card key={project.id} className="overflow-hidden">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-12 text-center">
              <span className="text-6xl">{project.image}</span>
            </div>
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Team</p>
                <p className="font-medium">{project.students}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <p className="text-sm font-medium">Achievements</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.achievements.map((achievement, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {achievement}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Completed: {project.completedDate}
                </p>
                <Button variant="outline" size="sm">
                  View Full Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const ProjectsAndCertificates = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <InstitutionHeader />
        
        <div>
          <h1 className="text-3xl font-bold">Projects & Certificates</h1>
          <p className="text-muted-foreground">Manage student projects and showcase achievements</p>
        </div>

        <Tabs defaultValue="registry" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="registry">Project Registry</TabsTrigger>
            <TabsTrigger value="gallery">Project Gallery</TabsTrigger>
          </TabsList>
          <TabsContent value="registry" className="mt-6">
            <ProjectRegistryTab />
          </TabsContent>
          <TabsContent value="gallery" className="mt-6">
            <ProjectGalleryTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProjectsAndCertificates;
