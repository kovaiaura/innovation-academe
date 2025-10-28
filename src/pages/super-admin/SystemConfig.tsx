import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Settings, Plug, Database, Shield } from 'lucide-react';

export default function SystemConfig() {
  const [config, setConfig] = useState({
    // API Integrations
    emailService: {
      smtp_host: 'smtp.gmail.com',
      smtp_port: '587',
      smtp_user: 'noreply@metainnova.com',
      smtp_password: '••••••••'
    },
    smsGateway: {
      provider: 'twilio',
      api_key: '••••••••',
      enabled: true
    },
    // Feature Toggles
    features: {
      ai_enabled: false,
      proctoring_enabled: true,
      gamification_enabled: true
    },
    // Database
    database: {
      backup_enabled: true,
      backup_frequency: 'daily'
    }
  });

  const handleSave = () => {
    toast.success('Configuration saved successfully');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">System Configuration</h1>
          <p className="text-muted-foreground">Manage platform-wide settings and integrations</p>
        </div>

        <Tabs defaultValue="integrations" className="space-y-6">
          <TabsList>
            <TabsTrigger value="integrations">
              <Plug className="mr-2 h-4 w-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="features">
              <Settings className="mr-2 h-4 w-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="database">
              <Database className="mr-2 h-4 w-4" />
              Database
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Service (SMTP)</CardTitle>
                <CardDescription>Configure email delivery settings for notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp_host">SMTP Host</Label>
                    <Input
                      id="smtp_host"
                      value={config.emailService.smtp_host}
                      onChange={(e) => setConfig({
                        ...config,
                        emailService: { ...config.emailService, smtp_host: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp_port">SMTP Port</Label>
                    <Input
                      id="smtp_port"
                      value={config.emailService.smtp_port}
                      onChange={(e) => setConfig({
                        ...config,
                        emailService: { ...config.emailService, smtp_port: e.target.value }
                      })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_user">SMTP Username</Label>
                  <Input
                    id="smtp_user"
                    value={config.emailService.smtp_user}
                    onChange={(e) => setConfig({
                      ...config,
                      emailService: { ...config.emailService, smtp_user: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_password">SMTP Password</Label>
                  <Input
                    id="smtp_password"
                    type="password"
                    value={config.emailService.smtp_password}
                    onChange={(e) => setConfig({
                      ...config,
                      emailService: { ...config.emailService, smtp_password: e.target.value }
                    })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SMS Gateway</CardTitle>
                <CardDescription>Configure SMS service for alerts and OTP</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable SMS Service</Label>
                    <p className="text-sm text-muted-foreground">Send SMS notifications to users</p>
                  </div>
                  <Switch
                    checked={config.smsGateway.enabled}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      smsGateway: { ...config.smsGateway, enabled: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="sms_provider">Provider</Label>
                  <Input
                    id="sms_provider"
                    value={config.smsGateway.provider}
                    onChange={(e) => setConfig({
                      ...config,
                      smsGateway: { ...config.smsGateway, provider: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sms_api_key">API Key</Label>
                  <Input
                    id="sms_api_key"
                    type="password"
                    value={config.smsGateway.api_key}
                    onChange={(e) => setConfig({
                      ...config,
                      smsGateway: { ...config.smsGateway, api_key: e.target.value }
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Feature Toggles</CardTitle>
                <CardDescription>Enable or disable platform features globally</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>AI Features</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable AI-powered content generation and analysis
                    </p>
                  </div>
                  <Switch
                    checked={config.features.ai_enabled}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      features: { ...config.features, ai_enabled: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Exam Proctoring</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable video proctoring for online assessments
                    </p>
                  </div>
                  <Switch
                    checked={config.features.proctoring_enabled}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      features: { ...config.features, proctoring_enabled: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Gamification</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable points, badges, and leaderboards
                    </p>
                  </div>
                  <Switch
                    checked={config.features.gamification_enabled}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      features: { ...config.features, gamification_enabled: checked }
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Database Management</CardTitle>
                <CardDescription>Configure database backups and maintenance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Automated Backups</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable automatic database backups
                    </p>
                  </div>
                  <Switch
                    checked={config.database.backup_enabled}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      database: { ...config.database, backup_enabled: checked }
                    })}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Backup Frequency</Label>
                  <Input
                    value={config.database.backup_frequency}
                    onChange={(e) => setConfig({
                      ...config,
                      database: { ...config.database, backup_frequency: e.target.value }
                    })}
                  />
                  <p className="text-sm text-muted-foreground">Options: hourly, daily, weekly</p>
                </div>
                <Separator />
                <div className="flex gap-3">
                  <Button variant="outline">Run Backup Now</Button>
                  <Button variant="outline">View Backup History</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure platform security policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">
                    Security settings are managed through environment variables and require server restart.
                    Contact the development team for changes.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>JWT Token Expiry</Label>
                  <Input value="24 hours" disabled />
                </div>
                <div className="space-y-2">
                  <Label>Password Policy</Label>
                  <Input value="Minimum 8 characters, 1 uppercase, 1 number" disabled />
                </div>
                <div className="space-y-2">
                  <Label>Session Timeout</Label>
                  <Input value="30 minutes of inactivity" disabled />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-meta-dark hover:bg-meta-dark-lighter">
            Save Configuration
          </Button>
        </div>
      </div>
    </Layout>
  );
}
