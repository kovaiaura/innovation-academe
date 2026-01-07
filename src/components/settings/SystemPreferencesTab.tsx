import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2 } from 'lucide-react';
import { usePlatformSettings } from '@/contexts/PlatformSettingsContext';
import { toast } from 'sonner';

export function SystemPreferencesTab() {
  const { settings, isLoading, updateSettings } = usePlatformSettings();
  const [localSettings, setLocalSettings] = useState({
    maintenanceMode: false,
    maintenanceMessage: '',
    sessionTimeoutEnabled: true,
    sessionTimeoutMinutes: 30,
    selfRegistration: false,
    twoFactorAuth: false,
    emailNotifications: true,
    smsNotifications: false,
    browserNotifications: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setLocalSettings((prev) => ({
        ...prev,
        maintenanceMode: settings.maintenanceMode,
        maintenanceMessage: settings.maintenanceMessage,
        sessionTimeoutEnabled: settings.sessionTimeoutEnabled,
        sessionTimeoutMinutes: settings.sessionTimeoutMinutes,
      }));
    }
  }, [settings, isLoading]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        maintenanceMode: localSettings.maintenanceMode,
        maintenanceMessage: localSettings.maintenanceMessage,
        sessionTimeoutEnabled: localSettings.sessionTimeoutEnabled,
        sessionTimeoutMinutes: localSettings.sessionTimeoutMinutes,
      });
      toast.success('Platform settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
          <CardDescription>General platform configuration options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Temporarily disable access for non-admins
              </p>
            </div>
            <Switch 
              checked={localSettings.maintenanceMode}
              onCheckedChange={(checked) => 
                setLocalSettings((prev) => ({ ...prev, maintenanceMode: checked }))
              }
            />
          </div>

          {localSettings.maintenanceMode && (
            <div className="space-y-2 pl-4 border-l-2 border-amber-500">
              <Label htmlFor="maintenance-message">Maintenance Message</Label>
              <Input
                id="maintenance-message"
                value={localSettings.maintenanceMessage}
                onChange={(e) =>
                  setLocalSettings((prev) => ({ ...prev, maintenanceMessage: e.target.value }))
                }
                placeholder="System is under maintenance..."
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Self-Registration</Label>
              <p className="text-sm text-muted-foreground">Allow users to create accounts</p>
            </div>
            <Switch 
              checked={localSettings.selfRegistration}
              onCheckedChange={(checked) => 
                setLocalSettings((prev) => ({ ...prev, selfRegistration: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Require 2FA for all admin users</p>
            </div>
            <Switch 
              checked={localSettings.twoFactorAuth}
              onCheckedChange={(checked) => 
                setLocalSettings((prev) => ({ ...prev, twoFactorAuth: checked }))
              }
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Session Timeout</Label>
                <p className="text-sm text-muted-foreground">Auto logout after inactivity</p>
              </div>
              <Switch 
                checked={localSettings.sessionTimeoutEnabled}
                onCheckedChange={(checked) => 
                  setLocalSettings((prev) => ({ ...prev, sessionTimeoutEnabled: checked }))
                }
              />
            </div>
            
            {localSettings.sessionTimeoutEnabled && (
              <div className="flex items-center gap-4 pl-4 border-l-2 border-primary">
                <Label htmlFor="timeout-minutes" className="whitespace-nowrap">
                  Timeout Duration
                </Label>
                <Input
                  id="timeout-minutes"
                  type="number"
                  min={5}
                  max={480}
                  value={localSettings.sessionTimeoutMinutes}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      sessionTimeoutMinutes: Math.max(5, Math.min(480, parseInt(e.target.value) || 30)),
                    }))
                  }
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">minutes</span>
              </div>
            )}
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
            <Switch 
              checked={localSettings.emailNotifications}
              onCheckedChange={(checked) => 
                setLocalSettings((prev) => ({ ...prev, emailNotifications: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">Send SMS for critical alerts</p>
            </div>
            <Switch 
              checked={localSettings.smsNotifications}
              onCheckedChange={(checked) => 
                setLocalSettings((prev) => ({ ...prev, smsNotifications: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Browser Notifications</Label>
              <p className="text-sm text-muted-foreground">Show desktop notifications</p>
            </div>
            <Switch 
              checked={localSettings.browserNotifications}
              onCheckedChange={(checked) => 
                setLocalSettings((prev) => ({ ...prev, browserNotifications: checked }))
              }
            />
          </div>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
