import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Target, Users, TrendingUp, Award, FileDown, Eye, 
  Search, Calendar, Clock 
} from 'lucide-react';
import { getAllProjects, Project } from '@/data/mockProjectData';
import { ProjectDetailsDialog } from '@/components/project/ProjectDetailsDialog';

type ProjectWithInstitution = Project & { institutionId: string };

export default function ProjectManagement() {
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Get all projects from all institutions
  const allProjects = useMemo(() => getAllProjects(), []);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = allProjects.length;
    const byStatus = {
      proposal: allProjects.filter(p => p.status === 'proposal').length,
      in_progress: allProjects.filter(p => p.status === 'in_progress').length,
      completed: allProjects.filter(p => p.status === 'completed').length,
      approved: allProjects.filter(p => p.status === 'approved').length,
      rejected: allProjects.filter(p => p.status === 'rejected').length,
    };
    const totalStudents = allProjects.reduce((sum, p) => sum + p.team_members.length, 0);
    const uniqueOfficers = new Set(allProjects.map(p => p.created_by_officer_id)).size;
    const showcaseCount = allProjects.filter(p => p.is_showcase).length;
    const avgProgress = total > 0 ? Math.round(
      allProjects.reduce((sum, p) => sum + p.progress, 0) / total
    ) : 0;

    return {
      total,
      byStatus,
      totalStudents,
      uniqueOfficers,
      showcaseCount,
      avgProgress
    };
  }, [allProjects]);

  // Get unique institutions
  const institutions = useMemo(() => {
    const institutionSet = new Set(allProjects.map(p => p.institutionId));
    return Array.from(institutionSet);
  }, [allProjects]);

  // Get unique categories
  const categories = useMemo(() => {
    const categorySet = new Set(allProjects.map(p => p.category));
    return Array.from(categorySet);
  }, [allProjects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return allProjects.filter(project => {
      const matchesInstitution = selectedInstitution === 'all' || project.institutionId === selectedInstitution;
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter;
      const matchesSearch = searchQuery === '' || 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.created_by_officer_name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesInstitution && matchesStatus && matchesCategory && matchesSearch;
    });
  }, [allProjects, selectedInstitution, statusFilter, categoryFilter, searchQuery]);

  // Get status badge variant
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      proposal: "outline",
      approved: "default",
      in_progress: "default",
      completed: "secondary",
      rejected: "destructive"
    };
    return variants[status] || "outline";
  };

  // Get institution name from ID
  const getInstitutionName = (institutionId: string) => {
    const institutionNames: Record<string, string> = {
      springfield: "Springfield Institute of Innovation",
    };
    return institutionNames[institutionId] || institutionId;
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Institution', 'Title', 'Category', 'Status', 'Progress', 'Class', 'Students', 'Officer', 'Start Date', 'Last Updated'];
    const rows = filteredProjects.map(p => [
      getInstitutionName(p.institutionId),
      p.title,
      p.category,
      p.status,
      p.progress,
      p.class,
      p.team_members.length,
      p.created_by_officer_name,
      p.start_date,
      p.last_updated
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projects-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Project Management Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive oversight of all innovation projects across institutions
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Projects */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Across all institutions
              </p>
            </CardContent>
          </Card>

          {/* In Progress */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byStatus.in_progress}</div>
              <p className="text-xs text-muted-foreground">
                Active projects
              </p>
            </CardContent>
          </Card>

          {/* Completed */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Award className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byStatus.completed}</div>
              <p className="text-xs text-muted-foreground">
                {stats.showcaseCount} showcase projects
              </p>
            </CardContent>
          </Card>

          {/* Students Involved */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students Involved</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                {stats.uniqueOfficers} innovation officers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <Card>
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              {/* Search Bar */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects or officers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Institution Filter */}
              <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                <SelectTrigger>
                  <SelectValue placeholder="All Institutions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Institutions</SelectItem>
                  {institutions.map(inst => (
                    <SelectItem key={inst} value={inst}>
                      {getInstitutionName(inst)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <FileDown className="h-4 w-4 mr-2" />
                Export All
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setStatusFilter('completed');
                  setSearchQuery('');
                }}
              >
                <Award className="h-4 w-4 mr-2" />
                Showcase Only ({stats.showcaseCount})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Project List */}
        <Card>
          <CardHeader>
            <CardTitle>Projects ({filteredProjects.length})</CardTitle>
            <CardDescription>
              Comprehensive view of all innovation projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="hover:border-primary transition-colors">
                  <CardContent className="p-6">
                    <div className="grid gap-4 md:grid-cols-12">
                      {/* Left Section: Project Info */}
                      <div className="md:col-span-5 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-lg">{project.title}</h3>
                              <Badge variant={getStatusVariant(project.status)}>
                                {project.status.replace('_', ' ')}
                              </Badge>
                              {project.is_showcase && (
                                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
                                  <Award className="h-3 w-3 mr-1" />
                                  Showcase
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {project.category} • {project.class}
                            </p>
                          </div>
                        </div>

                        {/* Institution Badge */}
                        <Badge variant="outline" className="text-xs">
                          {getInstitutionName(project.institutionId)}
                        </Badge>

                        {/* Team Members */}
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span className="text-muted-foreground">
                            {project.team_members.length} students
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({project.team_members.map(m => m.name).join(', ')})
                          </span>
                        </div>
                      </div>

                      {/* Middle Section: Progress & Officer */}
                      <div className="md:col-span-4 space-y-3">
                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>

                        {/* Innovation Officer */}
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Innovation Officer</p>
                          <p className="text-sm font-medium">{project.created_by_officer_name}</p>
                        </div>

                        {/* Dates */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Started: {new Date(project.start_date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Updated: {new Date(project.last_updated).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Right Section: SDGs & Actions */}
                      <div className="md:col-span-3 space-y-3">
                        {/* SDG Goals */}
                        {project.sdg_goals.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">SDG Goals</p>
                            <div className="flex flex-wrap gap-1">
                              {project.sdg_goals.slice(0, 3).map((goal) => (
                                <Badge key={goal} variant="secondary" className="text-xs">
                                  SDG {goal}
                                </Badge>
                              ))}
                              {project.sdg_goals.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{project.sdg_goals.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            setSelectedProject(project);
                            setIsDetailsOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredProjects.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No projects found matching your filters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Project Details Dialog */}
        <ProjectDetailsDialog
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          project={selectedProject}
        />
      </div>
    </Layout>
  );
}
