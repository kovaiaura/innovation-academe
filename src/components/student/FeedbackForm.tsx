import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Star, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Feedback } from "@/data/mockFeedbackData";

interface FeedbackFormProps {
  onSubmit: (feedback: Omit<Feedback, 'id' | 'submitted_at' | 'status'>) => void;
}

export function FeedbackForm({ onSubmit }: FeedbackFormProps) {
  const [category, setCategory] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [relatedCourse, setRelatedCourse] = useState('');
  const [relatedOfficer, setRelatedOfficer] = useState('');
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!category || !subject || !feedbackText) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (feedbackText.length < 50) {
      toast.error("Feedback must be at least 50 characters");
      return;
    }

    const feedback: Omit<Feedback, 'id' | 'submitted_at' | 'status'> = {
      student_id: 'student-1',
      category: category as Feedback['category'],
      subject,
      feedback_text: feedbackText,
      is_anonymous: isAnonymous,
      rating: rating > 0 ? rating : undefined,
      related_course_id: category === 'course' && relatedCourse ? relatedCourse : undefined,
      related_officer_id: category === 'officer' && relatedOfficer ? relatedOfficer : undefined
    };

    onSubmit(feedback);
    
    // Reset form
    setCategory('');
    setSubject('');
    setRelatedCourse('');
    setRelatedOfficer('');
    setRating(0);
    setFeedbackText('');
    setIsAnonymous(false);
    
    toast.success("Feedback submitted successfully!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Feedback</CardTitle>
        <CardDescription>
          Share your thoughts and help us improve your learning experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="course">Course Feedback</SelectItem>
                <SelectItem value="officer">Innovation Officer Feedback</SelectItem>
                <SelectItem value="facility">Facility & Infrastructure</SelectItem>
                <SelectItem value="general">General Feedback</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {category === 'course' && (
            <div className="space-y-2">
              <Label htmlFor="course">Select Course</Label>
              <Select value={relatedCourse} onValueChange={setRelatedCourse}>
                <SelectTrigger id="course">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="course-1">Data Science Fundamentals</SelectItem>
                  <SelectItem value="course-2">Web Development</SelectItem>
                  <SelectItem value="course-3">AI & Machine Learning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {category === 'officer' && (
            <div className="space-y-2">
              <Label htmlFor="officer">Select Officer</Label>
              <Select value={relatedOfficer} onValueChange={setRelatedOfficer}>
                <SelectTrigger id="officer">
                  <SelectValue placeholder="Select officer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="officer-1">Priya Mehta</SelectItem>
                  <SelectItem value="officer-2">Raj Kumar</SelectItem>
                  <SelectItem value="officer-3">Anita Singh</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="subject">
              Subject <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief subject of your feedback"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Rating (Optional)</Label>
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setRating(index + 1)}
                  onMouseEnter={() => setHoverRating(index + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      (hoverRating || rating) > index
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground self-center">
                  {rating} / 5
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">
              Detailed Feedback <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="feedback"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Share your detailed feedback (minimum 50 characters)..."
              className="min-h-[150px]"
              required
            />
            <p className="text-xs text-muted-foreground">
              {feedbackText.length} / 50 characters minimum
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachment">Attachment (Optional)</Label>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload File
              </Button>
              <span className="text-xs text-muted-foreground">
                Max 5MB (PDF, PNG, JPG)
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
            <Label htmlFor="anonymous" className="cursor-pointer">
              Submit anonymously
            </Label>
          </div>

          <Button type="submit" className="w-full">
            Submit Feedback
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
