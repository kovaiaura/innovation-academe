import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Upload, FileText, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const AVAILABLE_ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'officer', label: 'Innovation Officer' },
  { value: 'management', label: 'Management' },
  { value: 'system_admin', label: 'System Admin' },
  { value: 'super_admin', label: 'Super Admin' },
];

export function AboutIMSSettings() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [visibleRoles, setVisibleRoles] = useState<string[]>(['student', 'officer', 'management', 'system_admin', 'super_admin']);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('system_configurations')
      .select('key, value')
      .in('key', ['about_ims_pdf_url', 'about_ims_visible_roles']);

    if (data) {
      data.forEach((config) => {
        if (config.key === 'about_ims_pdf_url' && config.value) {
          setPdfUrl(typeof config.value === 'string' ? config.value : (config.value as any)?.url || null);
        }
        if (config.key === 'about_ims_visible_roles' && config.value) {
          const roles = Array.isArray(config.value) ? config.value : (config.value as any)?.roles;
          if (Array.isArray(roles)) setVisibleRoles(roles);
        }
      });
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      const fileName = `about-ims-${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('site-assets')
        .getPublicUrl(fileName);

      const url = urlData.publicUrl;
      setPdfUrl(url);

      await supabase
        .from('system_configurations')
        .upsert({
          key: 'about_ims_pdf_url',
          value: { url } as any,
          category: 'about_ims',
          description: 'About IMS PDF document URL',
        }, { onConflict: 'key' });

      toast.success('PDF uploaded successfully');
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePdf = async () => {
    setPdfUrl(null);
    await supabase
      .from('system_configurations')
      .upsert({
        key: 'about_ims_pdf_url',
        value: { url: null } as any,
        category: 'about_ims',
        description: 'About IMS PDF document URL',
      }, { onConflict: 'key' });
    toast.success('PDF removed');
  };

  const handleRoleToggle = (role: string) => {
    setVisibleRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSaveRoles = async () => {
    setSaving(true);
    try {
      await supabase
        .from('system_configurations')
        .upsert({
          key: 'about_ims_visible_roles',
          value: { roles: visibleRoles } as any,
          category: 'about_ims',
          description: 'Roles that can see the About IMS page',
        }, { onConflict: 'key' });
      toast.success('Role visibility saved');
    } catch (err: any) {
      toast.error('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* PDF Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            About IMS Document
          </CardTitle>
          <CardDescription>Upload a PDF document to display on the About IMS page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pdfUrl ? (
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <FileText className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Document uploaded</p>
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                  View PDF
                </a>
              </div>
              <Button variant="destructive" size="sm" onClick={handleRemovePdf}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No document uploaded yet.</p>
          )}
          <div>
            <Label htmlFor="pdf-upload" className="cursor-pointer">
              <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 hover:bg-muted/50 transition-colors">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {uploading ? 'Uploading...' : 'Click to upload PDF (max 10MB)'}
                </span>
              </div>
            </Label>
            <input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Role Visibility */}
      <Card>
        <CardHeader>
          <CardTitle>Page Visibility</CardTitle>
          <CardDescription>Select which roles can see the About IMS page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {AVAILABLE_ROLES.map((role) => (
            <div key={role.value} className="flex items-center gap-3">
              <Checkbox
                id={`role-${role.value}`}
                checked={visibleRoles.includes(role.value)}
                onCheckedChange={() => handleRoleToggle(role.value)}
              />
              <Label htmlFor={`role-${role.value}`} className="cursor-pointer">
                {role.label}
              </Label>
            </div>
          ))}
          <Separator />
          <Button onClick={handleSaveRoles} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Visibility Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
