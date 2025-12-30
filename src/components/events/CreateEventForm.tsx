import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Upload, X, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActivityEventType, EVENT_TYPE_LABELS } from '@/types/events';
import { useCreateEvent, useUploadBrochure, useUploadAttachment } from '@/hooks/useEvents';
import { toast } from 'sonner';

interface CreateEventFormProps {
  onSuccess?: () => void;
}

export function CreateEventForm({ onSuccess }: CreateEventFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<ActivityEventType>('competition');
  const [venue, setVenue] = useState('');
  const [registrationStart, setRegistrationStart] = useState<Date>();
  const [registrationEnd, setRegistrationEnd] = useState<Date>();
  const [eventStart, setEventStart] = useState<Date>();
  const [eventEnd, setEventEnd] = useState<Date>();
  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [brochureUrl, setBrochureUrl] = useState<string>('');
  const [attachments, setAttachments] = useState<{ name: string; url: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const createEvent = useCreateEvent();
  const uploadBrochure = useUploadBrochure();
  const uploadAttachment = useUploadAttachment();

  const handleBrochureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBrochureFile(file);
    setIsUploading(true);

    try {
      const url = await uploadBrochure.mutateAsync(file);
      setBrochureUrl(url);
      toast.success('Brochure uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload brochure');
      setBrochureFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAttachmentAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const attachment = await uploadAttachment.mutateAsync(file);
      setAttachments([...attachments, attachment]);
      toast.success('Attachment uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload attachment');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title || !description || !eventType || !eventStart) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createEvent.mutateAsync({
        title,
        description,
        event_type: eventType,
        venue: venue || undefined,
        registration_start: registrationStart?.toISOString(),
        registration_end: registrationEnd?.toISOString(),
        event_start: eventStart.toISOString(),
        event_end: eventEnd?.toISOString(),
        brochure_url: brochureUrl || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setEventType('competition');
      setVenue('');
      setRegistrationStart(undefined);
      setRegistrationEnd(undefined);
      setEventStart(undefined);
      setEventEnd(undefined);
      setBrochureFile(null);
      setBrochureUrl('');
      setAttachments([]);

      onSuccess?.();
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Event</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                placeholder="e.g., National Innovation Hackathon 2025"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the event, its objectives, and what participants can expect..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type *</Label>
                <Select value={eventType} onValueChange={(value) => setEventType(value as ActivityEventType)}>
                  <SelectTrigger id="eventType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue">Venue (Optional)</Label>
                <Input
                  id="venue"
                  placeholder="e.g., Innovation Center, Tech Park"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Important Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Important Dates</h3>
            
            {/* Registration Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Registration Start (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !registrationStart && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {registrationStart ? format(registrationStart, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={registrationStart}
                      onSelect={setRegistrationStart}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Registration End (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !registrationEnd && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {registrationEnd ? format(registrationEnd, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={registrationEnd}
                      onSelect={setRegistrationEnd}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Event Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Event Start *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !eventStart && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {eventStart ? format(eventStart, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={eventStart}
                      onSelect={setEventStart}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Event End (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !eventEnd && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {eventEnd ? format(eventEnd, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={eventEnd}
                      onSelect={setEventEnd}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Brochure/Document Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Brochure / Document</h3>
            
            <div className="space-y-2">
              <Label>Upload Brochure (PDF, DOC, etc.)</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  onChange={handleBrochureChange}
                  disabled={isUploading}
                  className="max-w-xs"
                />
                {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              {brochureFile && brochureUrl && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{brochureFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      setBrochureFile(null);
                      setBrochureUrl('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Additional Attachments</Label>
              <Input
                type="file"
                onChange={handleAttachmentAdd}
                disabled={isUploading}
                className="max-w-xs"
              />
              {attachments.length > 0 && (
                <div className="space-y-2 mt-2">
                  {attachments.map((att, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm flex-1">{att.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={createEvent.isPending || isUploading}
            >
              {createEvent.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Event'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
