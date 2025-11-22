import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CertificateTemplate } from '@/types/gamification';
import { Upload, X, FileImage } from 'lucide-react';
import { toast } from 'sonner';

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
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PNG or JPG images only.');
      return false;
    }

    if (file.size > maxSize) {
      toast.error('File size exceeds 5MB. Please upload a smaller image.');
      return false;
    }

    return true;
  };

  const handleFileUpload = (file: File) => {
    if (!validateFile(file)) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageUrl(result);
      setFileName(file.name);
      toast.success('Template image uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
            <Label>Template Image *</Label>
            {!imageUrl ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragging 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50 hover:bg-accent'
                }`}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">
                  {isDragging ? 'Drop image here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG or JPG (max 5MB) • 1200x900px recommended
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative border rounded-lg p-4 bg-accent/50">
                <div className="flex items-center gap-3">
                  <FileImage className="w-10 h-10 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{fileName || 'Template Image'}</p>
                    <p className="text-xs text-muted-foreground">Image uploaded successfully</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveImage}
                    className="shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
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
