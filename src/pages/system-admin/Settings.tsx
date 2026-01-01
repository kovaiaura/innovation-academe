import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Shield, Mail, Settings as SettingsIcon, Save, FileText } from 'lucide-react';
import { AccountSettingsSection } from '@/components/settings/AccountSettingsSection';
import { InvoiceSettingsTab } from '@/components/settings/InvoiceSettingsTab';

const EmailConfigurationTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SMTP Configuration</CardTitle>
          <CardDescription>Configure email server settings for notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input id="smtp-host" placeholder="smtp.gmail.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input id="smtp-port" placeholder="587" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="smtp-user">SMTP Username</Label>
              <Input id="smtp-user" placeholder="notifications@metainnova.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-password">SMTP Password</Label>
              <Input id="smtp-password" type="password" placeholder="••••••••" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Use TLS</Label>
              <p className="text-sm text-muted-foreground">Enable TLS encryption for email</p>
            </div>
            <Switch defaultChecked />
          </div>

          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save SMTP Settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>Configure email notification templates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="from-name">From Name</Label>
            <Input id="from-name" defaultValue="Meta-INNOVA Platform" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="from-email">From Email</Label>
            <Input id="from-email" defaultValue="noreply@metainnova.com" />
          </div>
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Test Email Configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const SystemPreferencesTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
          <CardDescription>General platform configuration options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">Temporarily disable access for non-admins</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Self-Registration</Label>
              <p className="text-sm text-muted-foreground">Allow users to create accounts</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Require 2FA for all admin users</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Session Timeout</Label>
              <p className="text-sm text-muted-foreground">Auto logout after inactivity</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Configure system-wide notification settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Send email for important events</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">Send SMS for critical alerts</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Browser Notifications</Label>
              <p className="text-sm text-muted-foreground">Show desktop notifications</p>
            </div>
            <Switch defaultChecked />
          </div>

          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default function SystemAdminSettings() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account security and system preferences</p>
        </div>

        <Tabs defaultValue="security" className="w-full">
          <TabsList className="grid w-full max-w-xl grid-cols-4">
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Prefs</span>
            </TabsTrigger>
            <TabsTrigger value="invoice" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Invoice</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="security" className="mt-6">
            <AccountSettingsSection />
          </TabsContent>

          <TabsContent value="email" className="mt-6">
            <EmailConfigurationTab />
          </TabsContent>

          <TabsContent value="preferences" className="mt-6">
            <SystemPreferencesTab />
          </TabsContent>

          <TabsContent value="invoice" className="mt-6">
            <InvoiceSettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
