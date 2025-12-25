import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Users, BookOpen, GraduationCap, TrendingUp, AlertCircle, Award, 
  CheckCircle, Target, Briefcase, MapPin, Clock, Trophy, 
  Shield, BarChart, Star, Zap, Rocket
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth.service";
import { InstitutionHeader } from "@/components/management/InstitutionHeader";
import { CriticalActionsCard } from "@/components/management/CriticalActionsCard";
import { mockCriticalActions } from "@/data/mockManagementData";
import { getInstitutionBySlug } from "@/data/mockInstitutionData";
import { useLocation } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const tenant = authService.getTenant();
  
  // Extract institution from URL
  const location = useLocation();
  const institutionSlug = location.pathname.split('/')[2];
  const institution = getInstitutionBySlug(institutionSlug);

  // Platform Value Metrics - What makes this LMS attractive
  const platformValueMetrics = [
    { 
      title: "Student Engagement Rate", 
      value: "94%", 
      change: "+12%", 
      icon: TrendingUp,
      description: "Students actively using the platform daily",
      color: "text-green-500", 
      bgColor: "bg-green-500/10" 
    },
    { 
      title: "Course Completion Rate", 
      value: "87%", 
      change: "+18%", 
      icon: CheckCircle,
      description: "Students completing assigned courses on time",
      color: "text-blue-500", 
      bgColor: "bg-blue-500/10" 
    },
    { 
      title: "Project-Based Learning", 
      value: "45", 
      change: "+23", 
      icon: Target,
      description: "Active innovation projects this term",
      color: "text-purple-500", 
      bgColor: "bg-purple-500/10" 
    },
    { 
      title: "Industry Connections", 
      value: "12", 
      change: "+4", 
      icon: Briefcase,
      description: "Partner companies for events & mentorship",
      color: "text-orange-500", 
      bgColor: "bg-orange-500/10" 
    },
    {
      title: "Certification Rate",
      value: "78%",
      change: "+15%",
      icon: Award,
      description: "Students earning course certificates",
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10"
    },
    {
      title: "Attendance Tracking",
      value: "Real-time",
      change: "GPS Verified",
      icon: MapPin,
      description: "Automated attendance with GPS validation",
      color: "text-teal-500",
      bgColor: "bg-teal-500/10"
    }
  ];

  // ROI Highlights - Why this platform saves money and improves outcomes
  const roiHighlights = [
    {
      title: "Time Saved on Administration",
      value: "40 hours/week",
      description: "Automated attendance, grading, and reporting reduce manual administrative workload",
      icon: Clock,
      benefit: "Cost Savings",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    },
    {
      title: "Improved Student Outcomes",
      value: "+23% Performance",
      description: "Gamification and personalized learning paths increase student engagement and grades",
      icon: TrendingUp,
      benefit: "Academic Excellence",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Parent Satisfaction",
      value: "4.8/5 Rating",
      description: "Real-time progress tracking and transparent communication increase parent trust",
      icon: Users,
      benefit: "Reputation",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Accreditation Ready",
      value: "100% Compliant",
      description: "Comprehensive audit logs and SDG alignment support accreditation requirements",
      icon: Shield,
      benefit: "Compliance",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    }
  ];

  // Platform Features Showcase
  const platformFeatures = [
    {
      category: "Learning Management",
      features: [
        "23 STEM Courses with modular content",
        "Assignment & Assessment management",
        "Real-time progress tracking",
        "Certificate generation"
      ],
      icon: BookOpen,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      category: "Student Engagement",
      features: [
        "Gamification with XP & badges",
        "Project-based learning",
        "Event participation tracking",
        "Portfolio & resume builder"
      ],
      icon: Trophy,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      category: "Operations Management",
      features: [
        "GPS-based attendance & payroll",
        "Inventory & purchase management",
        "Leave & schedule management",
        "Automated invoicing"
      ],
      icon: Briefcase,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      category: "Analytics & Reporting",
      features: [
        "Real-time dashboards",
        "SDG impact tracking",
        "Performance analytics",
        "Compliance reports"
      ],
      icon: BarChart,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    }
  ];

  // Impact Metrics - Success stories
  const impactMetrics = [
    {
      metric: "Student Projects Completed",
      value: "124",
      period: "This Academic Year",
      trend: "+45% vs last year",
      icon: Target,
      color: "text-purple-500"
    },
    {
      metric: "Innovation Events Participated",
      value: "8",
      period: "This Term",
      trend: "3 National-level competitions",
      icon: Trophy,
      color: "text-yellow-500"
    },
    {
      metric: "SDG Goals Addressed",
      value: "12/17",
      period: "Through Curriculum",
      trend: "Highest in region",
      icon: Target,
      color: "text-green-500"
    },
    {
      metric: "Student Employability Score",
      value: "8.2/10",
      period: "Based on Skills Tracking",
      trend: "+1.8 points improvement",
      icon: TrendingUp,
      color: "text-blue-500"
    }
  ];

  // Competitive Advantages
  const competitiveAdvantages = [
    {
      advantage: "All-in-One Platform",
      description: "LMS + ERP + Project Management in one unified system",
      badge: "No Integration Hassles",
      icon: Zap
    },
    {
      advantage: "STEM-Focused Curriculum",
      description: "23 industry-relevant courses from Electronics to AI to Entrepreneurship",
      badge: "Future-Ready Skills",
      icon: Rocket
    },
    {
      advantage: "Automated Operations",
      description: "GPS attendance, auto-grading, invoice generation reduce overhead",
      badge: "40% Cost Reduction",
      icon: Clock
    },
    {
      advantage: "Accreditation Support",
      description: "SDG alignment, audit logs, and compliance reporting built-in",
      badge: "Inspection Ready",
      icon: Shield
    },
    {
      advantage: "Student Portfolio Builder",
      description: "Automatic resume generation with projects, certificates, and skills",
      badge: "Career Advantage",
      icon: Star
    }
  ];

  const departmentPerformance = [
    { name: "Computer Science", teachers: 28, students: 520, performance: 88, trend: "up" },
    { name: "Electronics", teachers: 24, students: 450, performance: 85, trend: "up" },
    { name: "Mechanical", teachers: 26, students: 480, performance: 82, trend: "stable" },
    { name: "Civil", teachers: 22, students: 390, performance: 84, trend: "up" },
    { name: "Electrical", teachers: 23, students: 425, performance: 86, trend: "up" },
  ];

  const alerts = [
    { type: "warning", message: "3 faculty members pending performance review", icon: AlertCircle },
    { type: "info", message: "Semester exam schedule due in 7 days", icon: Award },
    { type: "success", message: "All departments meeting attendance targets", icon: TrendingUp },
  ];

  const recentActivities = [
    { id: '1', title: 'New batch enrollment completed', time: '2 hours ago', type: 'enrollment' },
    { id: '2', title: 'Semester exam schedule published', time: '5 hours ago', type: 'academic' },
    { id: '3', title: 'Faculty development workshop scheduled', time: '1 day ago', type: 'event' },
    { id: '4', title: 'Student placement drive initiated', time: '2 days ago', type: 'placement' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {institution && (
          <InstitutionHeader 
            institutionName={institution.name}
            establishedYear={institution.established_year}
            location={institution.location}
            totalStudents={institution.total_students}
            academicYear={institution.academic_year}
            userRole="Management Portal"
            assignedOfficers={institution.assigned_officers.map(o => o.officer_name)}
          />
        )}
        
        {/* Welcome Section with Value Proposition */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-lg p-6 border">
          <h1 className="text-3xl font-bold mb-2">Your Innovation Platform Dashboard</h1>
          <p className="text-muted-foreground text-lg">Welcome back, {user?.name}! See how Meta-Innova transforms education management</p>
        </div>

        {/* Platform Value Metrics */}
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Platform Performance</h2>
            <p className="text-sm text-muted-foreground">Real-time metrics showing platform impact and engagement</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {platformValueMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <Card key={metric.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                    <div className={`${metric.bgColor} p-2 rounded-lg`}>
                      <Icon className={`h-4 w-4 ${metric.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{metric.change}</Badge>
                      <p className="text-xs text-muted-foreground">{metric.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* ROI Highlights */}
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Return on Investment</h2>
            <p className="text-sm text-muted-foreground">How Meta-Innova delivers measurable value</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {roiHighlights.map((roi) => {
              const Icon = roi.icon;
              return (
                <Card key={roi.title} className="hover:shadow-lg transition-shadow border-2">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`${roi.bgColor} p-3 rounded-lg`}>
                        <Icon className={`h-5 w-5 ${roi.color}`} />
                      </div>
                      <Badge variant="outline" className="text-xs">{roi.benefit}</Badge>
                    </div>
                    <CardTitle className="text-lg mt-3">{roi.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      {roi.value}
                    </div>
                    <p className="text-xs text-muted-foreground">{roi.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Critical Actions Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Critical Actions</h2>
              <p className="text-sm text-muted-foreground">Items requiring immediate attention</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {mockCriticalActions.map((action) => (
              <CriticalActionsCard key={action.id} action={action} />
            ))}
          </div>
        </div>

        {/* Platform Features Showcase */}
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Platform Capabilities</h2>
            <p className="text-sm text-muted-foreground">Complete suite of features for modern education</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {platformFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.category} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className={`${feature.bgColor} p-3 rounded-lg w-fit`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-lg mt-3">{feature.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.features.map((item, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Impact Metrics */}
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Impact & Success Stories</h2>
            <p className="text-sm text-muted-foreground">Real results from your institution</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {impactMetrics.map((impact) => {
              const Icon = impact.icon;
              return (
                <Card key={impact.metric} className="hover:shadow-lg transition-shadow bg-gradient-to-br from-background to-muted/20">
                  <CardHeader>
                    <Icon className={`h-8 w-8 ${impact.color} mb-2`} />
                    <CardTitle className="text-sm font-medium">{impact.metric}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-1">{impact.value}</div>
                    <p className="text-xs text-muted-foreground mb-2">{impact.period}</p>
                    <Badge variant="secondary" className="text-xs">{impact.trend}</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Competitive Advantages */}
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Why Choose Meta-Innova</h2>
            <p className="text-sm text-muted-foreground">Competitive advantages that set us apart</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {competitiveAdvantages.map((adv) => {
              const Icon = adv.icon;
              return (
                <Card key={adv.advantage} className="hover:shadow-lg transition-shadow border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Icon className="h-6 w-6 text-primary" />
                      <Badge className="text-xs bg-primary/10 text-primary hover:bg-primary/20">{adv.badge}</Badge>
                    </div>
                    <CardTitle className="text-lg mt-3">{adv.advantage}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{adv.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
            <CardDescription>Overview of all academic departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentPerformance.map((dept) => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{dept.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {dept.teachers} Teachers • {dept.students} Students
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{dept.performance}%</span>
                      <TrendingUp className={`h-4 w-4 ${dept.trend === 'up' ? 'text-green-500' : 'text-muted-foreground'}`} />
                    </div>
                  </div>
                  <Progress value={dept.performance} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities and Alerts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest updates and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <GraduationCap className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Important notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert, index) => {
                  const Icon = alert.icon;
                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-3 rounded-lg ${
                        alert.type === 'warning' ? 'bg-yellow-500/10' :
                        alert.type === 'success' ? 'bg-green-500/10' :
                        'bg-blue-500/10'
                      }`}
                    >
                      <Icon className={`h-4 w-4 mt-0.5 ${
                        alert.type === 'warning' ? 'text-yellow-500' :
                        alert.type === 'success' ? 'text-green-500' :
                        'text-blue-500'
                      }`} />
                      <p className="text-sm">{alert.message}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" asChild className="h-auto flex-col gap-2 py-4">
                <Link to={tenant?.slug ? `/tenant/${tenant.slug}/management/students` : '/management/students'}>
                  <Users className="h-5 w-5" />
                  <span className="text-sm">Manage People</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-auto flex-col gap-2 py-4">
                <Link to={tenant?.slug ? `/tenant/${tenant.slug}/management/courses` : '/management/courses'}>
                  <BookOpen className="h-5 w-5" />
                  <span className="text-sm">Manage Courses</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-auto flex-col gap-2 py-4">
                <Link to={tenant?.slug ? `/tenant/${tenant.slug}/management/inventory` : '/management/inventory'}>
                  <Briefcase className="h-5 w-5" />
                  <span className="text-sm">Inventory</span>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-auto flex-col gap-2 py-4">
                <Link to={tenant?.slug ? `/tenant/${tenant.slug}/management/reports` : '/management/reports'}>
                  <BarChart className="h-5 w-5" />
                  <span className="text-sm">Reports</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
