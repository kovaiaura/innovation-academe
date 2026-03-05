import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, RotateCcw, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AttendanceReminderTemplate {
  subject: string;
  body: string;
}

const defaultTemplate: AttendanceReminderTemplate = {
  subject: 'Reminder: {type} at {time}',
  body: `Dear {name},

This is a friendly reminder that your {type} time is at {time} today ({date}).

Please make sure to {type_action} on time.

Best regards,
HR Department`,
};

export function AttendanceReminderTemplateCard() {
  const [template, setTemplate] = useState<AttendanceReminderTemplate>(defaultTemplate);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    try {
      const { data, error } = await supabase
        .from('system_configurations')
        .select('value')
        .eq('key', 'attendance_reminder_template')
        .single();

      if (!error && data?.value) {
        const value = data.value as unknown as AttendanceReminderTemplate;
        setTemplate({ ...defaultTemplate, ...value });
      }
    } catch (error) {
      console.error('Error fetching reminder template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Upsert — try update first, then insert if not found
      const { data: existing } = await supabase
        .from('system_configurations')
        .select('id')
        .eq('key', 'attendance_reminder_template')
        .single();

      if (existing) {
        const { error } = await supabase
          .from('system_configurations')
          .update({
            value: JSON.parse(JSON.stringify(template)),
            updated_at: new Date().toISOString(),
          })
          .eq('key', 'attendance_reminder_template');
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('system_configurations')
          .insert({
            key: 'attendance_reminder_template',
            value: JSON.parse(JSON.stringify(template)),
          });
        if (error) throw error;
      }
      toast.success('Reminder email template saved successfully');
    } catch (error) {
      console.error('Error saving reminder template:', error);
      toast.error('Failed to save reminder template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setTemplate(defaultTemplate);
    toast.info('Template reset to defaults (not saved yet)');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Attendance Reminder Email Template
        </CardTitle>
        <CardDescription>
          Customize the reminder email sent before check-in/check-out times
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge variant="outline">{'{name}'} — Employee name</Badge>
          <Badge variant="outline">{'{type}'} — Check-in / Check-out</Badge>
          <Badge variant="outline">{'{time}'} — Scheduled time</Badge>
          <Badge variant="outline">{'{date}'} — Today's date</Badge>
          <Badge variant="outline">{'{type_action}'} — check in / check out</Badge>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reminder-subject">Subject</Label>
          <Input
            id="reminder-subject"
            value={template.subject}
            onChange={(e) => setTemplate(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Reminder: {type} at {time}"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reminder-body">Body</Label>
          <Textarea
            id="reminder-body"
            value={template.body}
            onChange={(e) => setTemplate(prev => ({ ...prev, body: e.target.value }))}
            rows={8}
            className="font-mono text-sm"
          />
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Template'}
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
