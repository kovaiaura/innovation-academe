import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { holidayService } from '@/services/holiday.service';
import { CompanyHoliday, CreateHolidayInput, HOLIDAY_TYPE_LABELS, HolidayType } from '@/types/leave';

export default function CompanyHolidays() {
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<CompanyHoliday | null>(null);
  const [formData, setFormData] = useState<CreateHolidayInput>({
    name: '',
    date: '',
    end_date: '',
    description: '',
    holiday_type: 'company',
    year: currentYear,
    is_paid: true
  });

  const { data: holidays = [], isLoading } = useQuery({
    queryKey: ['company-holidays', selectedYear],
    queryFn: () => holidayService.getCompanyHolidays(selectedYear)
  });

  const createMutation = useMutation({
    mutationFn: holidayService.createCompanyHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-holidays'] });
      toast.success('Holiday added successfully');
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateHolidayInput> }) => 
      holidayService.updateCompanyHoliday(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-holidays'] });
      toast.success('Holiday updated successfully');
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: holidayService.deleteCompanyHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-holidays'] });
      toast.success('Holiday deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const handleOpenDialog = (holiday?: CompanyHoliday) => {
    if (holiday) {
      setEditingHoliday(holiday);
      setFormData({
        name: holiday.name,
        date: holiday.date,
        end_date: holiday.end_date || '',
        description: holiday.description || '',
        holiday_type: holiday.holiday_type,
        year: holiday.year,
        is_paid: holiday.is_paid
      });
    } else {
      setEditingHoliday(null);
      setFormData({
        name: '',
        date: '',
        end_date: '',
        description: '',
        holiday_type: 'company',
        year: selectedYear,
        is_paid: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingHoliday(null);
    setFormData({
      name: '',
      date: '',
      end_date: '',
      description: '',
      holiday_type: 'company',
      year: selectedYear,
      is_paid: true
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.date) {
      toast.error('Please fill in required fields');
      return;
    }

    const year = parseInt(formData.date.split('-')[0]);
    const submitData = { ...formData, year };

    if (editingHoliday) {
      updateMutation.mutate({ id: editingHoliday.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this holiday?')) {
      deleteMutation.mutate(id);
    }
  };

  const getHolidayTypeBadge = (type: HolidayType) => {
    const colors: Record<HolidayType, string> = {
      company: 'bg-blue-500/20 text-blue-600',
      national: 'bg-green-500/20 text-green-600',
      optional: 'bg-yellow-500/20 text-yellow-600',
      institution: 'bg-purple-500/20 text-purple-600',
      academic: 'bg-pink-500/20 text-pink-600',
      exam: 'bg-orange-500/20 text-orange-600'
    };
    return <Badge className={colors[type]}>{HOLIDAY_TYPE_LABELS[type]}</Badge>;
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Company Holidays</h1>
              <p className="text-muted-foreground">Manage holiday calendar for Meta staff</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Holiday
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {selectedYear} Holiday Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : holidays.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No holidays added for {selectedYear}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holidays.map((holiday) => (
                    <TableRow key={holiday.id}>
                      <TableCell>
                        {format(parseISO(holiday.date), 'MMM dd, yyyy')}
                        {holiday.end_date && ` - ${format(parseISO(holiday.end_date), 'MMM dd, yyyy')}`}
                      </TableCell>
                      <TableCell className="font-medium">{holiday.name}</TableCell>
                      <TableCell>{getHolidayTypeBadge(holiday.holiday_type)}</TableCell>
                      <TableCell>
                        <Badge variant={holiday.is_paid ? 'default' : 'secondary'}>
                          {holiday.is_paid ? 'Paid' : 'Unpaid'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{holiday.description || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(holiday)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(holiday.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Holiday Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Diwali, Christmas"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date (optional)</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Holiday Type</Label>
                <Select 
                  value={formData.holiday_type} 
                  onValueChange={(v) => setFormData({ ...formData, holiday_type: v as HolidayType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company">Company Holiday</SelectItem>
                    <SelectItem value="national">National Holiday</SelectItem>
                    <SelectItem value="optional">Optional Holiday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Paid Holiday</Label>
                <Switch
                  checked={formData.is_paid}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_paid: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                {editingHoliday ? 'Update' : 'Add'} Holiday
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}