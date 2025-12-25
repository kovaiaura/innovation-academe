import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, Plus, Calendar, Pencil, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateHolidayInput, HolidayType, HOLIDAY_TYPE_LABELS } from '@/types/leave';

interface Holiday {
  id: string;
  name: string;
  date: string;
  end_date?: string | null;
  description?: string | null;
  holiday_type: HolidayType;
  is_paid: boolean;
  year: number;
}

interface Props {
  holidays: Holiday[];
  isLoading?: boolean;
  onAddHoliday: (data: CreateHolidayInput) => void;
  onUpdateHoliday: (id: string, data: Partial<CreateHolidayInput>) => void;
  onDeleteHoliday: (id: string) => void;
  allowedTypes?: HolidayType[];
  title?: string;
  isMutating?: boolean;
}

const HOLIDAY_COLORS: Record<HolidayType, { bg: string; text: string; border: string }> = {
  company: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-l-blue-500' },
  national: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', border: 'border-l-green-500' },
  optional: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-l-yellow-500' },
  institution: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-l-purple-500' },
  academic: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-300', border: 'border-l-pink-500' },
  exam: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', border: 'border-l-orange-500' }
};

export function HolidayCalendar({
  holidays,
  isLoading,
  onAddHoliday,
  onUpdateHoliday,
  onDeleteHoliday,
  allowedTypes = ['company', 'national', 'optional'],
  title = 'Holiday Calendar',
  isMutating = false
}: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [formData, setFormData] = useState<CreateHolidayInput>({
    name: '',
    date: '',
    end_date: '',
    description: '',
    holiday_type: allowedTypes[0],
    year: new Date().getFullYear(),
    is_paid: true
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getHolidaysForDay = (day: Date) => {
    return holidays.filter(h => {
      const start = parseISO(h.date);
      const end = h.end_date ? parseISO(h.end_date) : start;
      return isWithinInterval(day, { start, end }) || isSameDay(day, start) || isSameDay(day, end);
    });
  };

  const upcomingHolidays = useMemo(() => {
    const today = new Date();
    return holidays
      .filter(h => parseISO(h.date) >= today)
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
      .slice(0, 5);
  }, [holidays]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    const dayHolidays = getHolidaysForDay(day);
    if (dayHolidays.length === 0) {
      openAddDialog(day);
    }
  };

  const openAddDialog = (date?: Date) => {
    setEditingHoliday(null);
    setFormData({
      name: '',
      date: date ? format(date, 'yyyy-MM-dd') : '',
      end_date: '',
      description: '',
      holiday_type: allowedTypes[0],
      year: date ? date.getFullYear() : currentDate.getFullYear(),
      is_paid: true
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (holiday: Holiday) => {
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
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingHoliday(null);
    setSelectedDate(null);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.date) return;
    const year = parseInt(formData.date.split('-')[0]);
    const submitData = { ...formData, year };

    if (editingHoliday) {
      onUpdateHoliday(editingHoliday.id, submitData);
    } else {
      onAddHoliday(submitData);
    }
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this holiday?')) {
      onDeleteHoliday(id);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,300px]">
      {/* Main Calendar */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <h2 className="text-xl font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
          </div>
          <Button onClick={() => openAddDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Holiday
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-96 text-muted-foreground">
              Loading calendar...
            </div>
          ) : (
            <div className="border-t">
              {/* Days of week header */}
              <div className="grid grid-cols-7 border-b bg-muted/50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar grid */}
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0">
                  {week.map((day, dayIndex) => {
                    const dayHolidays = getHolidaysForDay(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isToday = isSameDay(day, new Date());
                    const isSelected = selectedDate && isSameDay(day, selectedDate);

                    return (
                      <div
                        key={dayIndex}
                        onClick={() => handleDayClick(day)}
                        className={cn(
                          "min-h-[100px] p-1 border-r last:border-r-0 cursor-pointer transition-colors hover:bg-muted/50",
                          !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                          isSelected && "bg-primary/10",
                          dayHolidays.length > 0 && isCurrentMonth && "bg-accent/30"
                        )}
                      >
                        <div className={cn(
                          "flex items-center justify-center w-7 h-7 rounded-full text-sm mb-1",
                          isToday && "bg-primary text-primary-foreground font-bold"
                        )}>
                          {format(day, 'd')}
                        </div>
                        <div className="space-y-1">
                          {dayHolidays.slice(0, 2).map(holiday => {
                            const colors = HOLIDAY_COLORS[holiday.holiday_type];
                            return (
                              <div
                                key={holiday.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditDialog(holiday);
                                }}
                                className={cn(
                                  "text-xs px-1.5 py-0.5 rounded truncate border-l-2",
                                  colors.bg,
                                  colors.text,
                                  colors.border
                                )}
                                title={holiday.name}
                              >
                                {holiday.name}
                              </div>
                            );
                          })}
                          {dayHolidays.length > 2 && (
                            <div className="text-xs text-muted-foreground px-1">
                              +{dayHolidays.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Legend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Holiday Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {allowedTypes.map(type => {
              const colors = HOLIDAY_COLORS[type];
              return (
                <div key={type} className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded", colors.bg, colors.border, "border-l-2")} />
                  <span className="text-sm">{HOLIDAY_TYPE_LABELS[type]}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Upcoming Holidays */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming Holidays
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {upcomingHolidays.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No upcoming holidays</p>
              ) : (
                <div className="space-y-3">
                  {upcomingHolidays.map(holiday => {
                    const colors = HOLIDAY_COLORS[holiday.holiday_type];
                    return (
                      <div
                        key={holiday.id}
                        className={cn(
                          "p-3 rounded-lg border-l-4 cursor-pointer hover:bg-muted/50 transition-colors",
                          colors.bg,
                          colors.border
                        )}
                        onClick={() => openEditDialog(holiday)}
                      >
                        <p className={cn("font-medium text-sm", colors.text)}>{holiday.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(parseISO(holiday.date), 'EEE, MMM d, yyyy')}
                          {holiday.end_date && holiday.end_date !== holiday.date && (
                            <> - {format(parseISO(holiday.end_date), 'MMM d')}</>
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingHoliday ? 'Edit Holiday' : 'Add Holiday'}</DialogTitle>
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
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select 
                value={formData.holiday_type} 
                onValueChange={(v) => setFormData({ ...formData, holiday_type: v as HolidayType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allowedTypes.map(type => (
                    <SelectItem key={type} value={type}>{HOLIDAY_TYPE_LABELS[type]}</SelectItem>
                  ))}
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
                rows={2}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            {editingHoliday && (
              <Button variant="destructive" onClick={() => handleDelete(editingHoliday.id)} disabled={isMutating}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isMutating || !formData.name || !formData.date}>
              {editingHoliday ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
