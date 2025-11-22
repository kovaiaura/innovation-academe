import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Trophy, 
  Award, 
  Gift, 
  TrendingUp, 
  Plus, 
  Pencil, 
  Trash2,
  BarChart3,
  FileText
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { GamificationStatsCards } from "@/components/gamification/GamificationStatsCards";
import { ActivityFeed } from "@/components/gamification/ActivityFeed";
import { BadgeConfigDialog } from "@/components/gamification/BadgeConfigDialog";
import { XPRuleEditor } from "@/components/gamification/XPRuleEditor";
import { RewardConfigDialog } from "@/components/gamification/RewardConfigDialog";
import { StudentPerformanceTable } from "@/components/gamification/StudentPerformanceTable";
import { StudentPerformanceModal } from "@/components/gamification/StudentPerformanceModal";
import { LeaderboardConfigCard } from "@/components/gamification/LeaderboardConfigCard";
import { CertificateTemplateManager } from "@/components/gamification/CertificateTemplateManager";
import {
  mockGamificationStats,
  mockActivityLogs,
  mockBadgeConfigs,
  mockXPRules,
  mockRewardConfigs,
  mockStudentPerformances,
  mockLeaderboardConfigs
} from "@/data/mockGamificationData";
import { BadgeConfig, XPRule, RewardConfig, StudentPerformance, LeaderboardConfig } from "@/types/gamification";
import { toast } from "sonner";

export default function GamificationManagement() {
  const [badges, setBadges] = useState<BadgeConfig[]>(mockBadgeConfigs);
  const [xpRules, setXpRules] = useState<XPRule[]>(mockXPRules);
  const [rewards, setRewards] = useState<RewardConfig[]>(mockRewardConfigs);
  const [students, setStudents] = useState<StudentPerformance[]>(mockStudentPerformances);
  const [leaderboards, setLeaderboards] = useState<LeaderboardConfig[]>(mockLeaderboardConfigs);

  const [badgeDialogOpen, setBadgeDialogOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<BadgeConfig | undefined>();
  
  const [rewardDialogOpen, setRewardDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<RewardConfig | undefined>();

  const [selectedStudent, setSelectedStudent] = useState<StudentPerformance | null>(null);
  const [performanceModalOpen, setPerformanceModalOpen] = useState(false);

  const [institutionFilter, setInstitutionFilter] = useState<string>("all");
  const [timePeriodFilter, setTimePeriodFilter] = useState<string>("all_time");

  // Badge Management
  const handleSaveBadge = (badge: Partial<BadgeConfig>) => {
    if (editingBadge) {
      setBadges(badges.map(b => b.id === editingBadge.id ? { ...editingBadge, ...badge } : b));
    } else {
      setBadges([...badges, { ...badge, id: `badge-${Date.now()}` } as BadgeConfig]);
    }
    setEditingBadge(undefined);
  };

  const handleDeleteBadge = (id: string) => {
    setBadges(badges.filter(b => b.id !== id));
    toast.success("Badge deleted successfully");
  };

  // XP Rule Management
  const handleUpdateXPRule = (rule: XPRule) => {
    setXpRules(xpRules.map(r => r.id === rule.id ? rule : r));
  };

  // Reward Management
  const handleSaveReward = (reward: Partial<RewardConfig>) => {
    if (editingReward) {
      setRewards(rewards.map(r => r.id === editingReward.id ? { ...editingReward, ...reward } : r));
    } else {
      setRewards([...rewards, { ...reward, id: `reward-${Date.now()}` } as RewardConfig]);
    }
    setEditingReward(undefined);
  };

  const handleDeleteReward = (id: string) => {
    setRewards(rewards.filter(r => r.id !== id));
    toast.success("Reward deleted successfully");
  };

  // Student Performance
  const handleViewStudentDetails = (student: StudentPerformance) => {
    setSelectedStudent(student);
    setPerformanceModalOpen(true);
  };

  const handleAdjustPoints = (studentId: string, points: number, reason: string) => {
    setStudents(students.map(s => 
      s.student_id === studentId 
        ? { ...s, total_points: s.total_points + points }
        : s
    ));
  };

  // Leaderboard Management
  const handleSaveLeaderboard = (config: LeaderboardConfig) => {
    setLeaderboards(leaderboards.map(l => 
      l.institution_id === config.institution_id ? config : l
    ));
  };

  const filteredStudents = students.filter(s => {
    if (institutionFilter !== "all" && s.institution_id !== institutionFilter) return false;
    return true;
  });

  const institutions = Array.from(new Set(students.map(s => ({
    id: s.institution_id,
    name: s.institution_name
  }))));

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
            Configure and monitor gamification across all institutions
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="badges">
            <Award className="h-4 w-4 mr-2" />
            Badges & XP
          </TabsTrigger>
          <TabsTrigger value="rewards">
            <Gift className="h-4 w-4 mr-2" />
            Rewards
          </TabsTrigger>
          <TabsTrigger value="certificates">
            <FileText className="h-4 w-4 mr-2" />
            Certificates
          </TabsTrigger>
          <TabsTrigger value="performance">
            <TrendingUp className="h-4 w-4 mr-2" />
            Student Performance
          </TabsTrigger>
          <TabsTrigger value="leaderboards">
            <Trophy className="h-4 w-4 mr-2" />
            Leaderboards
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview Dashboard */}
        <TabsContent value="overview" className="space-y-6">
          <GamificationStatsCards stats={mockGamificationStats} />

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Institutions</CardTitle>
                <CardDescription>By average student points</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockGamificationStats.top_institutions.map((inst, index) => (
                    <div key={inst.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          <span className="text-sm font-bold">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{inst.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {inst.total_students} students
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {inst.avg_points} XP avg
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <ActivityFeed activities={mockActivityLogs} />
          </div>
        </TabsContent>

        {/* Tab 2: Badges & XP Configuration */}
        <TabsContent value="badges" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Badge Management</CardTitle>
                  <CardDescription>Create and configure badges for students to earn</CardDescription>
                </div>
                <Button onClick={() => {
                  setEditingBadge(undefined);
                  setBadgeDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Badge
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Icon</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Criteria</TableHead>
                      <TableHead>XP Reward</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {badges.map((badge) => (
                      <TableRow key={badge.id}>
                        <TableCell className="text-2xl">{badge.icon}</TableCell>
                        <TableCell className="font-medium">{badge.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{badge.category}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {badge.unlock_criteria.description}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">+{badge.xp_reward} XP</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={badge.is_active ? "default" : "secondary"}>
                            {badge.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingBadge(badge);
                                setBadgeDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteBadge(badge.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>XP Rules Configuration</CardTitle>
              <CardDescription>Configure points awarded for different activities</CardDescription>
            </CardHeader>
            <CardContent>
              <XPRuleEditor rules={xpRules} onUpdate={handleUpdateXPRule} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Rewards Setup */}
        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Reward Management</CardTitle>
                  <CardDescription>Manage rewards students can redeem with their points</CardDescription>
                </div>
                <Button onClick={() => {
                  setEditingReward(undefined);
                  setRewardDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Reward
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Points Required</TableHead>
                      <TableHead>Claimed</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rewards.map((reward) => (
                      <TableRow key={reward.id}>
                        <TableCell className="font-medium">{reward.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{reward.type.replace('_', ' ')}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{reward.points_required} XP</Badge>
                        </TableCell>
                        <TableCell>{reward.quantity_claimed}</TableCell>
                        <TableCell>
                          {reward.quantity_available ? reward.quantity_available - reward.quantity_claimed : '∞'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={reward.is_active ? "default" : "secondary"}>
                            {reward.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingReward(reward);
                                setRewardDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteReward(reward.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Certificate Templates */}
        <TabsContent value="certificates" className="space-y-6">
          <CertificateTemplateManager />
        </TabsContent>

        {/* Tab 5: Student Performance Monitoring */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Performance Monitoring</CardTitle>
              <CardDescription>View and manage student gamification data across institutions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Filter by Institution" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Institutions</SelectItem>
                    {institutions.map(inst => (
                      <SelectItem key={inst.id} value={inst.id}>
                        {inst.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={timePeriodFilter} onValueChange={setTimePeriodFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Time Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_time">All Time</SelectItem>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="this_week">This Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <StudentPerformanceTable
                performances={filteredStudents}
                onViewDetails={handleViewStudentDetails}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Leaderboards Management */}
        <TabsContent value="leaderboards" className="space-y-6">
          <div className="space-y-6">
            {leaderboards.map((leaderboard) => (
              <LeaderboardConfigCard
                key={leaderboard.id}
                config={leaderboard}
                students={students}
                onSave={handleSaveLeaderboard}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <BadgeConfigDialog
        open={badgeDialogOpen}
        onOpenChange={setBadgeDialogOpen}
        badge={editingBadge}
        onSave={handleSaveBadge}
      />

      <RewardConfigDialog
        open={rewardDialogOpen}
        onOpenChange={setRewardDialogOpen}
        reward={editingReward}
        onSave={handleSaveReward}
      />

      <StudentPerformanceModal
        open={performanceModalOpen}
        onOpenChange={setPerformanceModalOpen}
        student={selectedStudent}
        onAdjustPoints={handleAdjustPoints}
      />
      </div>
    </Layout>
  );
}
