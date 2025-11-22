import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CertificateTemplateDialog } from './CertificateTemplateDialog';
import { mockCertificateTemplates } from '@/data/mockCertificateTemplates';
import { CertificateTemplate } from '@/types/gamification';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

export function CertificateTemplateManager() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>(mockCertificateTemplates);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CertificateTemplate | undefined>();

  const handleSaveTemplate = (template: Partial<CertificateTemplate>) => {
    if (editingTemplate) {
      setTemplates(templates.map(t => 
        t.id === editingTemplate.id ? { ...editingTemplate, ...template } : t
      ));
      toast.success('Certificate template updated');
    } else {
      const newTemplate: CertificateTemplate = {
        ...template,
        id: `cert-temp-${Date.now()}`,
        created_by: 'sysadmin-001',
        created_at: new Date().toISOString(),
      } as CertificateTemplate;
      setTemplates([...templates, newTemplate]);
      toast.success('Certificate template created');
    }
    setEditingTemplate(undefined);
    setDialogOpen(false);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    toast.success('Certificate template deleted');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'course': return 'bg-blue-100 text-blue-800';
      case 'assignment': return 'bg-green-100 text-green-800';
      case 'assessment': return 'bg-purple-100 text-purple-800';
      case 'event': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Certificate Templates</CardTitle>
              <CardDescription>
                Upload and manage certificate templates for courses, assignments, assessments, and events
              </CardDescription>
            </div>
            <Button onClick={() => { setEditingTemplate(undefined); setDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Preview</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <img 
                        src={template.template_image_url} 
                        alt={template.name}
                        className="w-16 h-12 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(template.category)} variant="secondary">
                        {template.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{template.description}</TableCell>
                    <TableCell>
                      <Badge variant={template.is_active ? "default" : "secondary"}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(template.template_image_url, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setEditingTemplate(template); setDialogOpen(true); }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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

      <CertificateTemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={editingTemplate}
        onSave={handleSaveTemplate}
      />
    </div>
  );
}
