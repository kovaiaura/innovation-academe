import { useState, useMemo, useEffect } from 'react';
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
import { ChevronLeft, ChevronRight, Plus, Calendar, Wand2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateHolidayInput, HolidayType, HOLIDAY_TYPE_LABELS, CalendarDayType, CalendarType } from '@/types/leave';
import { calendarDayTypeService } from '@/services/calendarDayType.service';
import { toast } from 'sonner';

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
  onYearChange?: (year: number) => void;
  // Day type marking props
  calendarType?: CalendarType;
  institutionId?: string;
  enableDayTypeMarking?: boolean;
}

const HOLIDAY_COLORS: Record<HolidayType, { bg: string; text: string; border: string }> = {
  company: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-l-blue-500' },
  national: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', border: 'border-l-green-500' },
  optional: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-l-yellow-500' },
  institution: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-l-purple-500' },
  academic: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-300', border: 'border-l-pink-500' },
  exam: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', border: 'border-l-orange-500' }
};

const DAY_TYPE_COLORS: Record<CalendarDayType, { bg: string; text: string; border: string }> = {
  working: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-500' },
  weekend: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', border: 'border-red-500' },
  holiday: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-500' }
};

const DAY_TYPE_LABELS: Record<CalendarDayType, string> = {
  working: 'Working Day',
  weekend: 'Weekend',
  holiday: 'Holiday/Leave'
};

export function HolidayCalendar({
  holidays,
  isLoading,
  onAddHoliday,
  onUpdateHoliday,
  onDeleteHoliday,
  allowedTypes = ['company', 'national', 'optional'],
  title = 'Holiday Calendar',
  isMutating = false,
  onYearChange,
  calendarType = 'company',
  institutionId,
  enableDayTypeMarking = true
}: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMarkDayDialogOpen, setIsMarkDayDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [dayTypes, setDayTypes] = useState<Map<string, CalendarDayType>>(new Map());
  const [isLoadingDayTypes, setIsLoadingDayTypes] = useState(false);
  const [markDayForm, setMarkDayForm] = useState<{
    date: string;
    dayType: CalendarDayType;
    holidayName: string;
    description: string;
  }>({
    date: '',
    dayType: 'working',
    holidayName: '',
    description: ''
  });
  const [formData, setFormData] = useState<CreateHolidayInput>({
    name: '',
    date: '',
    end_date: '',
    description: '',
    holiday_type: allowedTypes[0],
    year: new Date().getFullYear(),
    is_paid: true
  });

  // Fetch day types when month or institution changes
  useEffect(() => {
    if (!enableDayTypeMarking) return;
    
    const fetchDayTypes = async () => {
      setIsLoadingDayTypes(true);
      try {
        const year = currentDate.getFullYear();
        const types = await calendarDayTypeService.getDayTypesForRange(
          calendarType,
          year - 1,
          year + 2,
          calendarType === 'institution' ? institutionId : undefined
        );
        setDayTypes(types);
      } catch (error) {
        console.error('Error fetching day types:', error);
      } finally {
        setIsLoadingDayTypes(false);
      }
    };
    
    fetchDayTypes();
  }, [currentDate, calendarType, institutionId, enableDayTypeMarking]);

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

  const getDayTypeForDate = (day: Date): CalendarDayType | null => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return dayTypes.get(dateStr) || null;
  };

  const upcomingHolidays = useMemo(() => {
    const today = new Date();
    return holidays
      .filter(h => parseISO(h.date) >= today)
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
      .slice(0, 5);
  }, [holidays]);

  const handlePrevMonth = () => {
    const newDate = subMonths(currentDate, 1);
    setCurrentDate(newDate);
    if (onYearChange && newDate.getFullYear() !== currentDate.getFullYear()) {
      onYearChange(newDate.getFullYear());
    }
  };
  
  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    setCurrentDate(newDate);
    if (onYearChange && newDate.getFullYear() !== currentDate.getFullYear()) {
      onYearChange(newDate.getFullYear());
    }
  };
  
  const handleToday = () => {
    const today = new Date();
    if (onYearChange && today.getFullYear() !== currentDate.getFullYear()) {
      onYearChange(today.getFullYear());
    }
    setCurrentDate(today);
  };

  // Toggle day type on right-click or shift+click
  const handleDayTypeToggle = async (day: Date, e: React.MouseEvent) => {
    if (!enableDayTypeMarking) return;
    if (!isSameMonth(day, currentDate)) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const dateStr = format(day, 'yyyy-MM-dd');
    const currentType = dayTypes.get(dateStr);
    
    // Cycle: working -> weekend -> holiday -> working
    let newType: CalendarDayType;
    if (!currentType || currentType === 'working') {
      newType = 'weekend';
    } else if (currentType === 'weekend') {
      newType = 'holiday';
    } else {
      newType = 'working';
    }
    
    try {
      await calendarDayTypeService.setDayType(
        calendarType,
        dateStr,
        newType,
        calendarType === 'institution' ? institutionId : undefined
      );
      
      // Update local state
      const newDayTypes = new Map(dayTypes);
      newDayTypes.set(dateStr, newType);
      setDayTypes(newDayTypes);
      
      toast.success(`Marked as ${DAY_TYPE_LABELS[newType]}`);
    } catch (error) {
      toast.error('Failed to update day type');
    }
  };

  const handleDayClick = (day: Date) => {
    if (!isSameMonth(day, currentDate)) return;
    setSelectedDate(day);
    const dayHolidays = getHolidaysForDay(day);
    if (dayHolidays.length === 0 && enableDayTypeMarking) {
      openMarkDayDialog(day);
    } else if (dayHolidays.length === 0) {
      openAddDialog(day);
    }
  };

  const openMarkDayDialog = (date?: Date) => {
    const d = date || new Date();
    const dateStr = format(d, 'yyyy-MM-dd');
    const currentType = dayTypes.get(dateStr) || 'working';
    
    // Check if there's a holiday on this date
    const dayHolidays = getHolidaysForDay(d);
    const holidayName = dayHolidays.length > 0 ? dayHolidays[0].name : '';
    const description = dayHolidays.length > 0 ? (dayHolidays[0].description || '') : '';
    
    setMarkDayForm({
      date: dateStr,
      dayType: currentType,
      holidayName,
      description
    });
    setIsMarkDayDialogOpen(true);
  };

  const handleMarkDaySubmit = async () => {
    if (!markDayForm.date) return;
    
    try {
      await calendarDayTypeService.setDayType(
        calendarType,
        markDayForm.date,
        markDayForm.dayType,
        calendarType === 'institution' ? institutionId : undefined,
        markDayForm.dayType === 'holiday' ? markDayForm.description : undefined
      );
      
      // Update local state
      const newDayTypes = new Map(dayTypes);
      newDayTypes.set(markDayForm.date, markDayForm.dayType);
      setDayTypes(newDayTypes);
      
      // If marking as holiday with a name, also add to holidays table
      if (markDayForm.dayType === 'holiday' && markDayForm.holidayName) {
        const year = parseInt(markDayForm.date.split('-')[0]);
        onAddHoliday({
          name: markDayForm.holidayName,
          date: markDayForm.date,
          end_date: '',
          description: markDayForm.description,
          holiday_type: calendarType === 'institution' ? 'institution' : 'company',
          year,
          is_paid: true
        });
      }
      
      toast.success(`Day marked as ${DAY_TYPE_LABELS[markDayForm.dayType]}`);
      setIsMarkDayDialogOpen(false);
    } catch (error) {
      toast.error('Failed to mark day');
    }
  };

  const handleQuickSetup = async () => {
    if (!enableDayTypeMarking) return;
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    try {
      await calendarDayTypeService.quickSetupMonth(
        calendarType,
        year,
        month,
        calendarType === 'institution' ? institutionId : undefined
      );
      
      // Refresh day types
      const types = await calendarDayTypeService.getDayTypesForRange(
        calendarType,
        year - 1,
        year + 2,
        calendarType === 'institution' ? institutionId : undefined
      );
      setDayTypes(types);
      
      toast.success('Quick setup complete! Saturdays and Sundays marked as weekends.');
    } catch (error) {
      toast.error('Failed to set up calendar');
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
          <div className="flex items-center gap-2">
            {enableDayTypeMarking && (
              <>
                <Button variant="outline" onClick={handleQuickSetup} size="sm">
                  <Wand2 className="h-4 w-4 mr-2" />
                  Quick Setup
                </Button>
                <Button onClick={() => openMarkDayDialog()}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Mark Day
                </Button>
              </>
            )}
            {!enableDayTypeMarking && (
              <Button onClick={() => openAddDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Holiday
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading || isLoadingDayTypes ? (
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
                    const dayType = getDayTypeForDate(day);
                    
                    // Get background color based on day type
                    let dayTypeBg = '';
                    let dayTypeBorder = '';
                    if (enableDayTypeMarking && isCurrentMonth && dayType) {
                      const colors = DAY_TYPE_COLORS[dayType];
                      dayTypeBg = colors.bg;
                      dayTypeBorder = `border-l-4 ${colors.border}`;
                    }

                    return (
                      <div
                        key={dayIndex}
                        onClick={() => handleDayClick(day)}
                        onContextMenu={(e) => handleDayTypeToggle(day, e)}
                        className={cn(
                          "min-h-[100px] p-1 border-r last:border-r-0 cursor-pointer transition-colors",
                          !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                          isSelected && "ring-2 ring-primary ring-inset",
                          dayHolidays.length > 0 && isCurrentMonth && !dayType && "bg-accent/30",
                          dayTypeBg,
                          dayTypeBorder,
                          "hover:opacity-80"
                        )}
                        title={enableDayTypeMarking ? "Right-click to toggle day type" : undefined}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className={cn(
                            "flex items-center justify-center w-7 h-7 rounded-full text-sm",
                            isToday && "bg-primary text-primary-foreground font-bold"
                          )}>
                            {format(day, 'd')}
                          </div>
                          {enableDayTypeMarking && isCurrentMonth && dayType && (
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-[10px] px-1 py-0 h-4",
                                DAY_TYPE_COLORS[dayType].text
                              )}
                            >
                              {dayType === 'working' ? 'W' : dayType === 'weekend' ? 'WE' : 'H'}
                            </Badge>
                          )}
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
        {/* Day Type Legend */}
        {enableDayTypeMarking && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Day Types (Right-click to toggle)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(['working', 'weekend', 'holiday'] as CalendarDayType[]).map(type => {
                const colors = DAY_TYPE_COLORS[type];
                return (
                  <div key={type} className="flex items-center gap-2">
                    <div className={cn("w-4 h-4 rounded border-l-4", colors.bg, colors.border)} />
                    <span className="text-sm">{DAY_TYPE_LABELS[type]}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Holiday Types Legend */}
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
            <ScrollArea className="h-[200px]">
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

      {/* Add/Edit Holiday Dialog */}
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

      {/* Mark Day Dialog */}
      <Dialog open={isMarkDayDialogOpen} onOpenChange={setIsMarkDayDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Day Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={markDayForm.date}
                onChange={(e) => setMarkDayForm({ ...markDayForm, date: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Day Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['working', 'weekend', 'holiday'] as CalendarDayType[]).map(type => {
                  const colors = DAY_TYPE_COLORS[type];
                  const isSelected = markDayForm.dayType === type;
                  const label = type === 'holiday' 
                    ? (calendarType === 'institution' ? 'Institution Holiday' : 'Company Holiday')
                    : DAY_TYPE_LABELS[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setMarkDayForm({ ...markDayForm, dayType: type })}
                      className={cn(
                        "p-3 rounded-lg border-2 transition-all text-center",
                        colors.bg,
                        isSelected ? `${colors.border} ring-2 ring-offset-2` : "border-transparent",
                        "hover:opacity-80"
                      )}
                    >
                      <div className={cn("text-sm font-medium", colors.text)}>
                        {label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {markDayForm.dayType === 'holiday' && (
              <>
                <div className="space-y-2">
                  <Label>Holiday Name (Optional)</Label>
                  <Input
                    value={markDayForm.holidayName}
                    onChange={(e) => setMarkDayForm({ ...markDayForm, holidayName: e.target.value })}
                    placeholder="e.g., Diwali, Christmas"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Textarea
                    value={markDayForm.description}
                    onChange={(e) => setMarkDayForm({ ...markDayForm, description: e.target.value })}
                    placeholder="Optional description"
                    rows={2}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMarkDayDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleMarkDaySubmit} disabled={!markDayForm.date}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
