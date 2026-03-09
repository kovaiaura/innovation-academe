import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Award, Save, Shield, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { InstitutionHeader } from "@/components/management/InstitutionHeader";
import { useLocation } from "react-router-dom";
import { AccountSettingsSection } from "@/components/settings/AccountSettingsSection";
import { useInstitutionStats } from "@/hooks/useInstitutionStats";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface InstitutionProfileTabProps {
  institutionId: string | undefined;
  currentSettings: Record<string, any> | null;
  institutionName: string;
}

const InstitutionProfileTab = ({ institutionId, currentSettings, institutionName }: InstitutionProfileTabProps) => {
  const [academicYear, setAcademicYear] = useState(currentSettings?.academic_year || "2025-26");
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (currentSettings?.academic_year) {
      setAcademicYear(currentSettings.academic_year);
    }
  }, [currentSettings]);

  const handleSave = async () => {
    if (!institutionId) return;
    setSaving(true);
    try {
      const mergedSettings = { ...currentSettings, academic_year: academicYear };
      const { error } = await supabase
        .from('institutions')
        .update({ settings: mergedSettings as any })
        .eq('id', institutionId);
      
      if (error) throw error;
      
      // Invalidate all institution stats queries so headers refresh
      queryClient.invalidateQueries({ queryKey: ['institution-stats'] });
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Institution Information</CardTitle>
          <CardDescription>Manage your institution's basic details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="inst-name">Institution Name</Label>
              <Input id="inst-name" value={institutionName} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="academic-year">Academic Year</Label>
              <Input 
                id="academic-year" 
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="e.g. 2025-26"
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const BrandingTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Certificate Template</CardTitle>
          <CardDescription>Customize certificate formats and branding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cert-header">Certificate Header Text</Label>
            <Input id="cert-header" defaultValue="Meta-INNOVA Innovation Certificate" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cert-footer">Footer Text</Label>
            <Textarea 
              id="cert-footer" 
              defaultValue="This certifies that the above-named student has successfully completed the innovation program."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex gap-2">
                <Input id="primary-color" type="color" defaultValue="#0F766E" className="w-20 h-10" />
                <Input defaultValue="#0F766E" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accent-color">Accent Color</Label>
              <div className="flex gap-2">
                <Input id="accent-color" type="color" defaultValue="#FB923C" className="w-20 h-10" />
                <Input defaultValue="#FB923C" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signature-1">Principal Signature Name</Label>
            <Input id="signature-1" defaultValue="Dr. Suresh Reddy" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signature-2">Coordinator Signature Name</Label>
            <Input id="signature-2" defaultValue="Prof. Meena Iyer" />
          </div>

          <div className="pt-4 border-t">
            <Button>
              <Award className="h-4 w-4 mr-2" />
              Preview Certificate
            </Button>
            <Button variant="outline" className="ml-2">
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const IntegrationsTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Configure email settings for institution notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Student Enrollment Notifications</Label>
              <p className="text-sm text-muted-foreground">Send emails when new students are enrolled</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Attendance Alerts</Label>
              <p className="text-sm text-muted-foreground">Alert for low attendance rates</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Project Milestone Updates</Label>
              <p className="text-sm text-muted-foreground">Notify about project progress updates</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="pt-4 border-t space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input id="smtp-host" placeholder="smtp.gmail.com" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input id="smtp-port" placeholder="587" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-user">SMTP Username</Label>
                <Input id="smtp-user" placeholder="notifications@college.edu" />
              </div>
            </div>
          </div>

          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Email Settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SMS Notifications</CardTitle>
          <CardDescription>Configure SMS settings for urgent notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SMS Notifications Enabled</Label>
              <p className="text-sm text-muted-foreground">Enable SMS for critical alerts</p>
            </div>
            <Switch />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sms-provider">SMS Provider API Key</Label>
            <Input id="sms-provider" type="password" placeholder="Enter API key" />
          </div>

          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save SMS Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const Settings = () => {
  const location = useLocation();
  const institutionSlug = location.pathname.split('/')[2];
  const { institution, loading, assignedOfficers, stats } = useInstitutionStats(institutionSlug);

  return (
    <Layout>
      <div className="space-y-6">
        {institution && (
          <InstitutionHeader 
            institutionName={institution.name}
            establishedYear={institution.settings?.established_year}
            location={institution.address?.city || institution.address?.location}
            totalStudents={stats.totalStudents}
            academicYear={institution.settings?.academic_year || "2025-26"}
            userRole="Management Portal"
            assignedOfficers={assignedOfficers}
          />
        )}
        
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage institution profile, branding, and integrations</p>
        </div>

        <Tabs defaultValue="security" className="w-full">
          <TabsList className="grid w-full max-w-3xl grid-cols-4">
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Account Security</span>
              <span className="sm:hidden">Security</span>
            </TabsTrigger>
            <TabsTrigger value="profile">Institution Profile</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>
          <TabsContent value="security" className="mt-6">
            <AccountSettingsSection />
          </TabsContent>
          <TabsContent value="profile" className="mt-6">
            <InstitutionProfileTab 
              institutionId={institution?.id}
              currentSettings={institution?.settings || null}
              institutionName={institution?.name || ""}
            />
          </TabsContent>
          <TabsContent value="branding" className="mt-6">
            <BrandingTab />
          </TabsContent>
          <TabsContent value="integrations" className="mt-6">
            <IntegrationsTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
