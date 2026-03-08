import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, Award, TrendingUp, BarChart3, Loader2, Users, RefreshCw, Sparkles, FileText, Building2, CheckCircle
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { StudentPerformanceTable } from "@/components/gamification/StudentPerformanceTable";
import { CertificateTemplateManager } from "@/components/gamification/CertificateTemplateManager";
import { StudentPerformanceModal } from "@/components/gamification/StudentPerformanceModal";
import { gamificationDbService } from "@/services/gamification-db.service";
import { StudentPerformance, GamificationStats } from "@/types/gamification";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";

const XP_COLORS: Record<string, string> = {
  'Projects': '#3B82F6',
  'Achievements': '#22C55E', 
  'Assessments': '#F97316',
  'Assignments': '#A855F7',
  'Daily Login': '#14B8A6',
  'Other': '#6B7280',
};

const BADGE_DEFINITIONS = [
  { name: '1 Project', category: 'project', icon: '🎯', threshold: 1, description: 'Joined your first project' },
  { name: '5 Projects', category: 'project', icon: '🎯', threshold: 5, description: 'Joined 5 projects' },
  { name: '10 Projects', category: 'project', icon: '🎯', threshold: 10, description: 'Joined 10 projects' },
  { name: '15 Projects', category: 'project', icon: '🎯', threshold: 15, description: 'Joined 15 projects' },
  { name: '20 Projects', category: 'project', icon: '🎯', threshold: 20, description: 'Joined 20 projects' },
  { name: '1 Achievement', category: 'achievement', icon: '🏆', threshold: 1, description: 'First project award' },
  { name: '5 Achievements', category: 'achievement', icon: '🏆', threshold: 5, description: '5 project awards' },
  { name: '10 Achievements', category: 'achievement', icon: '🏆', threshold: 10, description: '10 project awards' },
  { name: '20 Achievements', category: 'achievement', icon: '🏆', threshold: 20, description: '20 project awards' },
  { name: '5 Assessments', category: 'assessment', icon: '📝', threshold: 5, description: 'Completed 5 assessments' },
  { name: '10 Assessments', category: 'assessment', icon: '📝', threshold: 10, description: 'Completed 10 assessments' },
  { name: '15 Assessments', category: 'assessment', icon: '📝', threshold: 15, description: 'Completed 15 assessments' },
  { name: '20 Assessments', category: 'assessment', icon: '📝', threshold: 20, description: 'Completed 20 assessments' },
  { name: '5 Assignments', category: 'assignment', icon: '📄', threshold: 5, description: 'Completed 5 assignments' },
  { name: '10 Assignments', category: 'assignment', icon: '📄', threshold: 10, description: 'Completed 10 assignments' },
  { name: '15 Assignments', category: 'assignment', icon: '📄', threshold: 15, description: 'Completed 15 assignments' },
  { name: '20 Assignments', category: 'assignment', icon: '📄', threshold: 20, description: 'Completed 20 assignments' },
];

export default function GamificationManagement() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentPerformance[]>([]);
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentPerformance | null>(null);
  const [performanceModalOpen, setPerformanceModalOpen] = useState(false);
  const [institutionFilter, setInstitutionFilter] = useState<string>("all");
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalculateStatus, setRecalculateStatus] = useState('');
  const [recalcProgressDialogOpen, setRecalcProgressDialogOpen] = useState(false);
  const [recalcProgress, setRecalcProgress] = useState<{ step: string; current: number; total: number; message: string } | null>(null);
  const [recalcResult, setRecalcResult] = useState<{ studentsProcessed: number; totalXP: number; badgesAwarded: number } | null>(null);
  const [badgeEarnedCounts, setBadgeEarnedCounts] = useState<Record<string, number>>({});
  const [xpBreakdown, setXpBreakdown] = useState<{ name: string; value: number }[]>([]);
  const [totalBadgesEarned, setTotalBadgesEarned] = useState(0);
  const [allInstitutions, setAllInstitutions] = useState<{ id: string; name: string }[]>([]);
  const [recalcInstitution, setRecalcInstitution] = useState<string>("all");

  useEffect(() => {
    loadData();
    loadInstitutions();
  }, []);

  const loadInstitutions = async () => {
    const { data } = await supabase
      .from('institutions')
      .select('id, name')
      .order('name');
    setAllInstitutions(data || []);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, studentsData] = await Promise.all([
        gamificationDbService.getGamificationStats(),
        gamificationDbService.getLeaderboard(undefined, 50)
      ]);

      setStats(statsData);
      setStudents(studentsData);

      // Fetch XP breakdown by category
      const { data: xpData } = await supabase
        .from('student_xp_transactions')
        .select('activity_type, points_earned');

      if (xpData) {
        const categoryMap: Record<string, number> = {};
        xpData.forEach(t => {
          let cat = t.activity_type;
          if (cat === 'project_membership' || cat === 'project_completion') cat = 'Projects';
          else if (cat === 'project_award') cat = 'Achievements';
          else if (cat === 'assessment_completion' || cat === 'assessment_perfect_score') cat = 'Assessments';
          else if (cat === 'assignment_submission' || cat === 'assignment_perfect_score' || cat === 'assignment_pass') cat = 'Assignments';
          else if (cat === 'daily_streak') cat = 'Daily Login';
          else cat = 'Other';
          categoryMap[cat] = (categoryMap[cat] || 0) + t.points_earned;
        });
        setXpBreakdown(Object.entries(categoryMap).map(([name, value]) => ({ name, value })));
      }

      // Fetch badge earned counts
      const { data: badgeData } = await supabase
        .from('student_badges')
        .select('badge_id, gamification_badges(name)');

      const counts: Record<string, number> = {};
      let total = 0;
      badgeData?.forEach(b => {
        const name = (b.gamification_badges as any)?.name;
        if (name) {
          counts[name] = (counts[name] || 0) + 1;
          total++;
        }
      });
      setBadgeEarnedCounts(counts);
      setTotalBadgesEarned(total);
    } catch (error) {
      console.error('Error loading gamification data:', error);
      toast.error('Failed to load gamification data');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    const isInstitution = recalcInstitution !== 'all';
    const instName = isInstitution ? allInstitutions.find(i => i.id === recalcInstitution)?.name : 'ALL';
    
    if (!confirm(`This will reset ${isInstitution ? `"${instName}"` : 'ALL'} student XP, badges, and streaks, then recalculate from scratch. Continue?`)) return;
    
    setIsRecalculating(true);
    setRecalculateStatus('Starting...');
    setRecalcProgressDialogOpen(true);
    setRecalcProgress(null);
    setRecalcResult(null);
    
    const progressCallback = (msg: string | { step: string; current: number; total: number; message: string }) => {
      if (typeof msg === 'string') {
        setRecalculateStatus(msg);
      } else {
        setRecalcProgress(msg);
        setRecalculateStatus(msg.message);
      }
    };
    
    try {
      const result = isInstitution
        ? await gamificationDbService.recalculateForInstitution(recalcInstitution, progressCallback)
        : await gamificationDbService.recalculateAllXPAndBadges(progressCallback);
      
      setRecalcResult(result);
      toast.success(`Done! ${result.studentsProcessed} students, ${result.totalXP} XP, ${result.badgesAwarded} badges`);
      await loadData();
    } catch (error) {
      console.error('Recalculate error:', error);
      toast.error('Recalculation failed');
      setRecalcProgressDialogOpen(false);
    } finally {
      setIsRecalculating(false);
      setRecalculateStatus('');
    }
  };

  const handleViewStudentDetails = (student: StudentPerformance) => {
    setSelectedStudent(student);
    setPerformanceModalOpen(true);
  };

  const filteredStudents = students.filter(s => {
    if (institutionFilter !== "all" && s.institution_id !== institutionFilter) return false;
    return true;
  });

  const institutions = Array.from(new Map(students.map(s => [s.institution_id, { id: s.institution_id, name: s.institution_name }])).values());

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trophy className="h-8 w-8 text-primary" />
              Gamification Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor and manage student XP & badges across all institutions
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="performance">
              <TrendingUp className="h-4 w-4 mr-2" />
              Student Performance
            </TabsTrigger>
            <TabsTrigger value="badges">
              <Award className="h-4 w-4 mr-2" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="certificates">
              <FileText className="h-4 w-4 mr-2" />
              Certificates
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Overview */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(stats?.total_students || 0).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Across all institutions</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">XP Distributed</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(stats?.total_points_distributed || 0).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total XP earned</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalBadgesEarned}</div>
                  <p className="text-xs text-muted-foreground">By students</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Badge Types</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{BADGE_DEFINITIONS.length}</div>
                  <p className="text-xs text-muted-foreground">Available to earn</p>
                </CardContent>
              </Card>
            </div>

            {/* Recalculate */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Recalculate XP & Badges
                </CardTitle>
                <CardDescription>
                  Reset student XP, badges, and streaks, then recalculate from existing records. You can recalculate all or by institution.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={recalcInstitution} onValueChange={setRecalcInstitution}>
                    <SelectTrigger className="w-[300px]">
                      <Building2 className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Select scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Institutions</SelectItem>
                      {allInstitutions.map(inst => (
                        <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="destructive"
                    disabled={isRecalculating}
                    onClick={handleRecalculate}
                  >
                    {isRecalculating ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Recalculating...</>
                    ) : (
                      <><RefreshCw className="mr-2 h-4 w-4" /> Recalculate {recalcInstitution === 'all' ? 'All' : 'Institution'}</>
                    )}
                  </Button>
                </div>
                {recalculateStatus && (
                  <p className="text-sm text-muted-foreground">{recalculateStatus}</p>
                )}
              </CardContent>
            </Card>

            {/* XP Distribution & Top Students */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>XP Distribution</CardTitle>
                  <CardDescription>Points breakdown by category</CardDescription>
                </CardHeader>
                <CardContent>
                  {xpBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={xpBreakdown} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 11 }} />
                        <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                          formatter={(value: number) => [`${value.toLocaleString()} XP`, '']}
                        />
                        <Legend />
                        <Bar dataKey="value" name="XP Points" radius={[4, 4, 0, 0]}>
                          {xpBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={XP_COLORS[entry.name] || '#6B7280'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                      No XP data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Top 5 Students
                  </CardTitle>
                  <CardDescription>By total XP earned</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {students.slice(0, 5).map((student, idx) => (
                      <div key={student.student_id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm w-6">#{idx + 1}</span>
                          <div>
                            <p className="font-medium text-sm">{student.student_name}</p>
                            <p className="text-xs text-muted-foreground">{student.institution_name}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{student.total_points} XP</Badge>
                      </div>
                    ))}
                    {students.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No student data yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 2: Student Performance */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Student Performance</CardTitle>
                    <CardDescription>View and manage student points and rankings</CardDescription>
                  </div>
                  <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="Filter by institution" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Institutions</SelectItem>
                      {institutions.map(inst => (
                        <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <StudentPerformanceTable 
                  performances={filteredStudents}
                  onViewDetails={handleViewStudentDetails}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Badges (Read-only) */}
          <TabsContent value="badges" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Badge Definitions</CardTitle>
                <CardDescription>
                  Fixed set of {BADGE_DEFINITIONS.length} badges awarded based on activity count thresholds. No XP is granted for earning badges.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Icon</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Criteria</TableHead>
                        <TableHead>Threshold</TableHead>
                        <TableHead className="text-right">Students Earned</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {BADGE_DEFINITIONS.map((badge) => (
                        <TableRow key={badge.name}>
                          <TableCell className="text-2xl">{badge.icon}</TableCell>
                          <TableCell className="font-medium">{badge.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{badge.category}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {badge.description}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{badge.threshold}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {badgeEarnedCounts[badge.name] || 0}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Certificates */}
          <TabsContent value="certificates" className="space-y-6">
            <CertificateTemplateManager />
          </TabsContent>
        </Tabs>

        <StudentPerformanceModal
          student={selectedStudent}
          open={performanceModalOpen}
          onOpenChange={setPerformanceModalOpen}
        />

        {/* Recalculation Progress Dialog */}
        <Dialog open={recalcProgressDialogOpen} onOpenChange={(open) => !isRecalculating && setRecalcProgressDialogOpen(open)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {recalcResult ? (
                  <><CheckCircle className="h-5 w-5 text-green-500" /> Recalculation Complete</>
                ) : (
                  <><Loader2 className="h-5 w-5 animate-spin text-primary" /> Recalculating...</>
                )}
              </DialogTitle>
              <DialogDescription>
                {recalcResult 
                  ? 'XP and badges have been recalculated from source records.'
                  : 'Please wait while we process all students.'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Progress bar */}
              {recalcProgress && !recalcResult && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{recalcProgress.step === 'processing' ? 'Processing students...' : recalcProgress.step}</span>
                    <span className="font-medium">{recalcProgress.current} / {recalcProgress.total}</span>
                  </div>
                  <Progress value={recalcProgress.total > 0 ? (recalcProgress.current / recalcProgress.total) * 100 : 0} className="h-2" />
                </div>
              )}
              
              {/* Status text */}
              {recalculateStatus && !recalcResult && (
                <p className="text-sm text-muted-foreground">{recalculateStatus}</p>
              )}
              
              {/* Result summary */}
              {recalcResult && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-primary">{recalcResult.studentsProcessed.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Students</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-primary">{recalcResult.totalXP.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Total XP</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-primary">{recalcResult.badgesAwarded.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Badges</p>
                  </div>
                </div>
              )}
            </div>
            
            {recalcResult && (
              <DialogFooter>
                <Button onClick={() => setRecalcProgressDialogOpen(false)}>Close</Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
