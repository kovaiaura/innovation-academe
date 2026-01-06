import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Users, BookOpen, GraduationCap, TrendingUp, AlertCircle, Award, 
  CheckCircle, Target, Briefcase, MapPin, Clock, Trophy, 
  Shield, BarChart, Star, Zap, Rocket, FolderKanban, UserCog,
  ClipboardCheck, ShoppingCart, CalendarCheck, Sparkles, Medal
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth.service";
import { InstitutionHeader } from "@/components/management/InstitutionHeader";
import { CriticalActionsCard } from "@/components/management/CriticalActionsCard";
import { LeaderboardSection } from "@/components/management/LeaderboardSection";
import { useInstitutionStats } from "@/hooks/useInstitutionStats";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { user } = useAuth();
  const tenant = authService.getTenant();
  
  // Extract institution from URL
  const location = useLocation();
  const institutionSlug = location.pathname.split('/')[2];
  
  // Fetch real data
  const { loading, institution, stats, criticalActions, assignedOfficers } = useInstitutionStats(institutionSlug);

  // Core metrics from real data
  const coreMetrics = [
    { 
      title: "Total Students", 
      value: stats.totalStudents.toLocaleString(), 
      icon: Users,
      description: "Enrolled students",
      color: "text-blue-500", 
      bgColor: "bg-blue-500/10" 
    },
    { 
      title: "Total Classes", 
      value: stats.totalClasses.toString(), 
      icon: GraduationCap,
      description: "Active classes",
      color: "text-purple-500", 
      bgColor: "bg-purple-500/10" 
    },
    { 
      title: "Courses Assigned", 
      value: stats.totalCourses.toString(), 
      icon: BookOpen,
      description: "Available courses",
      color: "text-green-500", 
      bgColor: "bg-green-500/10" 
    },
    { 
      title: "Active Projects", 
      value: `${stats.activeProjects} / ${stats.totalProjects}`, 
      icon: FolderKanban,
      description: "Student projects",
      color: "text-orange-500", 
      bgColor: "bg-orange-500/10" 
    },
    {
      title: "Assigned Officers",
      value: stats.totalOfficers.toString(),
      icon: UserCog,
      description: "Teaching staff",
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10"
    },
    {
      title: "Assessment Attempts",
      value: stats.assessmentAttempts.toString(),
      icon: ClipboardCheck,
      description: `Avg: ${stats.avgAssessmentScore}%`,
      color: "text-teal-500",
      bgColor: "bg-teal-500/10"
    }
  ];

  // Gamification metrics
  const gamificationMetrics = [
    { 
      title: "Total XP Earned", 
      value: stats.totalXP.toLocaleString(), 
      icon: Sparkles,
      description: "Across all students",
      color: "text-yellow-500", 
      bgColor: "bg-yellow-500/10" 
    },
    { 
      title: "Badges Awarded", 
      value: stats.totalBadges.toString(), 
      icon: Medal,
      description: "Student achievements",
      color: "text-pink-500", 
      bgColor: "bg-pink-500/10" 
    },
    { 
      title: "Assignment Submissions", 
      value: stats.assignmentSubmissions.toString(), 
      icon: CheckCircle,
      description: `Avg: ${stats.avgAssignmentMarks}%`,
      color: "text-emerald-500", 
      bgColor: "bg-emerald-500/10" 
    },
  ];

  // Operations metrics
  const operationsMetrics = [
    { 
      title: "Pending Purchases", 
      value: stats.pendingPurchases.toString(), 
      amount: stats.pendingPurchaseAmount,
      icon: ShoppingCart,
      description: stats.pendingPurchaseAmount > 0 ? `₹${stats.pendingPurchaseAmount.toLocaleString()}` : "No pending",
      color: stats.pendingPurchases > 0 ? "text-red-500" : "text-green-500", 
      bgColor: stats.pendingPurchases > 0 ? "bg-red-500/10" : "bg-green-500/10" 
    },
    { 
      title: "Pending Leaves", 
      value: stats.pendingLeaves.toString(), 
      icon: CalendarCheck,
      description: stats.pendingLeaves > 0 ? "Awaiting approval" : "All clear",
      color: stats.pendingLeaves > 0 ? "text-amber-500" : "text-green-500", 
      bgColor: stats.pendingLeaves > 0 ? "bg-amber-500/10" : "bg-green-500/10" 
    },
  ];

  // ROI Highlights - Platform marketing content (static)
  const roiHighlights = [
    {
      title: "Time Saved on Administration",
      value: "40 hours/week",
      description: "Automated attendance, grading, and reporting reduce manual workload",
      icon: Clock,
      benefit: "Cost Savings",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    },
    {
      title: "Improved Student Outcomes",
      value: "+23% Performance",
      description: "Gamification and personalized learning paths increase engagement",
      icon: TrendingUp,
      benefit: "Academic Excellence",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Parent Satisfaction",
      value: "4.8/5 Rating",
      description: "Real-time progress tracking increases parent trust",
      icon: Users,
      benefit: "Reputation",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Accreditation Ready",
      value: "100% Compliant",
      description: "Comprehensive audit logs and SDG alignment support requirements",
      icon: Shield,
      benefit: "Compliance",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    }
  ];

  // Platform Features (static)
  const platformFeatures = [
    {
      category: "Learning Management",
      features: [
        "STEM Courses with modular content",
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

  // Competitive Advantages (static)
  const competitiveAdvantages = [
    {
      advantage: "All-in-One Platform",
      description: "LMS + ERP + Project Management in one unified system",
      badge: "No Integration Hassles",
      icon: Zap
    },
    {
      advantage: "STEM-Focused Curriculum",
      description: "Industry-relevant courses from Electronics to AI to Entrepreneurship",
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

  // Map critical actions to the expected format for CriticalActionsCard
  const mappedCriticalActions = criticalActions.map(action => ({
    id: action.id,
    type: action.type,
    title: action.title,
    description: action.description,
    count: action.count,
    urgency: action.urgency,
    deadline: action.deadline,
    amount: action.amount,
    link: action.link,
    icon: action.type === 'purchase' ? ShoppingCart : 
          action.type === 'approval' ? CalendarCheck :
          action.type === 'deadline' ? ClipboardCheck : AlertCircle
  }));

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid gap-4 md:grid-cols-3">
            {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {institution && (
          <InstitutionHeader 
            institutionName={institution.name}
            establishedYear={institution.settings?.established_year}
            location={institution.address?.city || institution.address?.location}
            totalStudents={stats.totalStudents}
            academicYear={institution.settings?.academic_year || "2024-25"}
            userRole="Management Portal"
            assignedOfficers={assignedOfficers}
          />
        )}
        
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-lg p-6 border">
          <h1 className="text-3xl font-bold mb-2">Institution Dashboard</h1>
          <p className="text-muted-foreground text-lg">Welcome back, {user?.name}! Here's your institution's real-time performance</p>
        </div>

        {/* Core Metrics - Real Data */}
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Core Metrics</h2>
            <p className="text-sm text-muted-foreground">Real-time institution statistics</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {coreMetrics.map((metric) => {
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
                    <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Gamification & Academic Performance */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Gamification */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold">Gamification</h2>
              <p className="text-sm text-muted-foreground">Student engagement metrics</p>
            </div>
            <div className="grid gap-4">
              {gamificationMetrics.map((metric) => {
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
                      <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Operations */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold">Operations Status</h2>
              <p className="text-sm text-muted-foreground">Pending actions overview</p>
            </div>
            <div className="grid gap-4">
              {operationsMetrics.map((metric) => {
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
                      <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Critical Actions Section - Real Data */}
        {mappedCriticalActions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">Critical Actions</h2>
                <p className="text-sm text-muted-foreground">Items requiring immediate attention</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {mappedCriticalActions.map((action) => (
                <CriticalActionsCard key={action.id} action={action} />
              ))}
            </div>
          </div>
        )}

        {/* Student Leaderboards - Already uses real data */}
        {institution && (
          <LeaderboardSection institutionId={institution.id} />
        )}

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

        {/* Platform Features */}
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
