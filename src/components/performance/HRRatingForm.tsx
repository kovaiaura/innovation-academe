import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, Printer, Star } from 'lucide-react';
import { HRRating, HRRatingProject, addHRRating, updateHRRating, calculateCumulativeStars } from '@/data/mockPerformanceData';
import { loadOfficers } from '@/data/mockOfficerData';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rating: HRRating | null;
  onSuccess: () => void;
}

const PERIODS = ['Q1', 'Q2', 'Q3', 'Q4'] as const;
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

export function HRRatingForm({ open, onOpenChange, rating, onSuccess }: Props) {
  const { user } = useAuth();
  const officers = loadOfficers();
  
  const [formData, setFormData] = useState({
    trainer_id: '',
    trainer_name: '',
    employee_id: '',
    period: 'Q1' as typeof PERIODS[number],
    year: CURRENT_YEAR,
    project_ratings: [] as HRRatingProject[]
  });

  useEffect(() => {
    if (rating) {
      setFormData({
        trainer_id: rating.trainer_id,
        trainer_name: rating.trainer_name,
        employee_id: rating.employee_id,
        period: rating.period,
        year: rating.year,
        project_ratings: rating.project_ratings
      });
    } else {
      setFormData({
        trainer_id: '',
        trainer_name: '',
        employee_id: '',
        period: 'Q1',
        year: CURRENT_YEAR,
        project_ratings: []
      });
    }
  }, [rating, open]);

  const handleOfficerChange = (officerId: string) => {
    const officer = officers.find(o => o.id === officerId);
    if (officer) {
      setFormData(prev => ({
        ...prev,
        trainer_id: officer.id,
        trainer_name: officer.name,
        employee_id: officer.employee_id || `EMP-${officer.id}`
      }));
    }
  };

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      project_ratings: [...prev.project_ratings, {
        id: `pr-${Date.now()}`,
        project_title: '',
        competition_level: '',
        result: '',
        stars_earned: 0,
        verified_by_hr: false
      }]
    }));
  };

  const updateProject = (index: number, field: keyof HRRatingProject, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      project_ratings: prev.project_ratings.map((p, i) => 
        i === index ? { ...p, [field]: value } : p
      )
    }));
  };

  const removeProject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      project_ratings: prev.project_ratings.filter((_, i) => i !== index)
    }));
  };

  const totalStarsQuarter = formData.project_ratings.reduce((sum, p) => sum + p.stars_earned, 0);
  const cumulativeStarsYear = rating 
    ? calculateCumulativeStars(formData.trainer_id, formData.year) - (rating.total_stars_quarter || 0) + totalStarsQuarter
    : calculateCumulativeStars(formData.trainer_id, formData.year) + totalStarsQuarter;

  const handleSubmit = () => {
    if (!formData.trainer_id) {
      toast({ title: 'Please select a trainer', variant: 'destructive' });
      return;
    }

    const data = {
      ...formData,
      total_stars_quarter: totalStarsQuarter,
      cumulative_stars_year: cumulativeStarsYear,
      created_by: user?.id || 'hr-admin'
    };

    if (rating) {
      updateHRRating(rating.id, data);
      toast({ title: 'HR Rating updated successfully' });
    } else {
      addHRRating(data);
      toast({ title: 'HR Rating created successfully' });
    }

    onSuccess();
    onOpenChange(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {rating ? 'Edit HR Rating' : 'Create HR Rating'}
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Select Trainer</Label>
                <Select value={formData.trainer_id} onValueChange={handleOfficerChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trainer" />
                  </SelectTrigger>
                  <SelectContent>
                    {officers.map(officer => (
                      <SelectItem key={officer.id} value={officer.id}>
                        {officer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Employee ID</Label>
                <Input value={formData.employee_id} disabled />
              </div>
              <div>
                <Label>Period</Label>
                <Select 
                  value={formData.period} 
                  onValueChange={(v: typeof PERIODS[number]) => setFormData(prev => ({ ...prev, period: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIODS.map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Year</Label>
                <Select 
                  value={String(formData.year)} 
                  onValueChange={v => setFormData(prev => ({ ...prev, year: parseInt(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map(y => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Project Ratings Table */}
            <div>
              <Label className="text-base font-semibold">Project Ratings</Label>
              <div className="mt-4 space-y-3">
                {formData.project_ratings.map((project, index) => (
                  <Card key={project.id} className="p-4">
                    <div className="grid grid-cols-6 gap-3 items-center">
                      <Input 
                        placeholder="Project Title"
                        className="col-span-2"
                        value={project.project_title}
                        onChange={e => updateProject(index, 'project_title', e.target.value)}
                      />
                      <Input 
                        placeholder="Competition Level"
                        value={project.competition_level}
                        onChange={e => updateProject(index, 'competition_level', e.target.value)}
                      />
                      <Input 
                        placeholder="Result"
                        value={project.result}
                        onChange={e => updateProject(index, 'result', e.target.value)}
                      />
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <Input 
                          type="number"
                          min="0"
                          max="5"
                          placeholder="Stars"
                          value={project.stars_earned}
                          onChange={e => updateProject(index, 'stars_earned', parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id={`verified-${index}`}
                          checked={project.verified_by_hr}
                          onCheckedChange={v => updateProject(index, 'verified_by_hr', !!v)}
                        />
                        <Label htmlFor={`verified-${index}`} className="text-xs">Verified</Label>
                        <Button variant="ghost" size="icon" onClick={() => removeProject(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                <Button variant="outline" onClick={addProject}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </div>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Label className="font-semibold">Total Stars This Quarter:</Label>
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-xl font-bold">{totalStarsQuarter}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label className="font-semibold">Cumulative Stars This Year:</Label>
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-xl font-bold">{cumulativeStarsYear}</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>
            {rating ? 'Update' : 'Create'} Rating
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
