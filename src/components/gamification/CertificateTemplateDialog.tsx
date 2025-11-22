import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CertificateTemplate } from '@/types/gamification';
import { Upload } from 'lucide-react';

interface CertificateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: CertificateTemplate;
  onSave: (template: Partial<CertificateTemplate>) => void;
}

export function CertificateTemplateDialog({
  open,
  onOpenChange,
  template,
  onSave
}: CertificateTemplateDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'course' | 'assignment' | 'assessment' | 'event'>('course');
  const [imageUrl, setImageUrl] = useState('');
  const [nameX, setNameX] = useState(600);
  const [nameY, setNameY] = useState(450);
  const [fontSize, setFontSize] = useState(48);
  const [fontColor, setFontColor] = useState('#1e3a8a');
  const [fontFamily, setFontFamily] = useState('serif');
  const [isActive, setIsActive] = useState(true);
  const [sampleName, setSampleName] = useState('Student Name');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description);
      setCategory(template.category);
      setImageUrl(template.template_image_url);
      setNameX(template.name_position.x);
      setNameY(template.name_position.y);
      setFontSize(template.name_position.fontSize);
      setFontColor(template.name_position.color);
      setFontFamily(template.name_position.fontFamily);
      setIsActive(template.is_active);
    }
  }, [template]);

  useEffect(() => {
    if (imageUrl && canvasRef.current) {
      drawPreview();
    }
  }, [imageUrl, nameX, nameY, fontSize, fontColor, fontFamily, sampleName]);

  const drawPreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = 800;
      canvas.height = 600;
      ctx.drawImage(img, 0, 0, 800, 600);
      
      ctx.font = `${(fontSize * 800) / 1200}px ${fontFamily}`;
      ctx.fillStyle = fontColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sampleName, (nameX * 800) / 1200, (nameY * 600) / 900);
    };
    img.src = imageUrl;
  };

  const handleSave = () => {
    onSave({
      name,
      description,
      category,
      template_image_url: imageUrl,
      name_position: {
        x: nameX,
        y: nameY,
        fontSize,
        color: fontColor,
        fontFamily
      },
      is_active: isActive
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * 1200) / 800;
    const y = ((e.clientY - rect.top) * 900) / 600;
    setNameX(Math.round(x));
    setNameY(Math.round(y));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit' : 'Create'} Certificate Template</DialogTitle>
          <DialogDescription>
            Upload a certificate template and configure the student name position
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Template Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Template Image URL *</Label>
            <Input 
              value={imageUrl} 
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/certificate-template.jpg"
            />
            <p className="text-xs text-muted-foreground">Enter the URL of your certificate background image (1200x900px recommended)</p>
          </div>

          {imageUrl && (
            <>
              <div className="space-y-2">
                <Label>Preview & Position Name (Click to reposition)</Label>
                <canvas 
                  ref={canvasRef} 
                  onClick={handleCanvasClick}
                  className="border rounded cursor-crosshair w-full"
                />
                <p className="text-xs text-muted-foreground">Click on the preview to set the student name position</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sample Name</Label>
                  <Input value={sampleName} onChange={(e) => setSampleName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Input type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Font Color</Label>
                  <Input type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serif">Serif</SelectItem>
                      <SelectItem value="sans-serif">Sans Serif</SelectItem>
                      <SelectItem value="monospace">Monospace</SelectItem>
                      <SelectItem value="cursive">Cursive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>Position: X={nameX}, Y={nameY}</p>
              </div>
            </>
          )}

          <div className="flex items-center justify-between">
            <Label>Active Template</Label>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Template</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
