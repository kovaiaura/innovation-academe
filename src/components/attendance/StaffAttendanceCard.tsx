import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Loader2, AlertCircle, CheckCircle2, XCircle, MapPinOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentLocation } from '@/utils/locationHelpers';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import {
  useStaffTodayAttendance,
  useStaffCheckIn,
  useStaffCheckOut,
  useStaffAttendanceRealtime,
} from '@/hooks/useStaffAttendance';

interface StaffAttendanceCardProps {
  className?: string;
}

export function StaffAttendanceCard({ className }: StaffAttendanceCardProps) {
  const { user } = useAuth();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [hoursWorked, setHoursWorked] = useState(0);

  // Fetch individual GPS setting from profile
  const { data: profileSettings } = useQuery({
    queryKey: ['profile-gps-setting', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('enable_gps_tracking, enable_notifications, normal_working_hours')
        .eq('id', user!.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const gpsEnabled = profileSettings?.enable_gps_tracking ?? true;

  // DB-backed attendance
  const { data: todayAttendance, isLoading: isLoadingAttendance } = useStaffTodayAttendance(user?.id || '');
  const checkInMutation = useStaffCheckIn();
  const checkOutMutation = useStaffCheckOut();

  // Real-time subscription
  useStaffAttendanceRealtime(user?.id);

  // Calculate live hours worked
  useEffect(() => {
    if (todayAttendance?.status === 'checked_in' && todayAttendance.check_in_time) {
      const calculateHours = () => {
        const checkInDate = new Date(todayAttendance.check_in_time!);
        const now = new Date();
        const hours = (now.getTime() - checkInDate.getTime()) / (1000 * 60 * 60);
        setHoursWorked(Math.round(hours * 100) / 100);
      };
      calculateHours();
      const interval = setInterval(calculateHours, 60000);
      return () => clearInterval(interval);
    } else if (todayAttendance?.status === 'checked_out') {
      setHoursWorked(todayAttendance.total_hours_worked || 0);
    } else {
      setHoursWorked(0);
    }
  }, [todayAttendance]);

  const handleCheckIn = async () => {
    if (!user?.id) return;
    setIsLoadingLocation(true);

    try {
      let location = null;
      if (gpsEnabled) {
        location = await getCurrentLocation();
      }

      await checkInMutation.mutateAsync({
        user_id: user.id,
        location,
        skip_gps: !gpsEnabled,
      });

      toast.success('Check-in Successful', {
        description: gpsEnabled ? 'Location verified and time recorded' : 'Time recorded (GPS verification disabled)',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check in';
      toast.error('Check-in Failed', { description: errorMessage });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user?.id || !todayAttendance?.id) return;
    setIsLoadingLocation(true);

    try {
      let location = null;
      if (gpsEnabled) {
        location = await getCurrentLocation();
      }

      const result = await checkOutMutation.mutateAsync({
        attendance_id: todayAttendance.id,
        user_id: user.id,
        location,
        skip_gps: !gpsEnabled,
        normal_working_hours: profileSettings?.normal_working_hours || 8,
      });

      toast.success('Check-out Successful', {
        description: `Total hours: ${result.totalHours.toFixed(2)}h | Overtime: ${result.overtimeHours.toFixed(2)}h`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check out';
      toast.error('Check-out Failed', { description: errorMessage });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const isCheckedIn = todayAttendance?.status === 'checked_in';
  const isCheckedOut = todayAttendance?.status === 'checked_out';
  const isLoading = isLoadingLocation || checkInMutation.isPending || checkOutMutation.isPending;

  const getStatusBadge = () => {
    if (isCheckedOut) {
      return (
        <Badge variant="secondary" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Checked Out
        </Badge>
      );
    }
    if (isCheckedIn) {
      return (
        <Badge variant="default" className="gap-1 bg-green-500">
          <Clock className="h-3 w-3" />
          Working
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        <XCircle className="h-3 w-3" />
        Not Checked In
      </Badge>
    );
  };

  if (isLoadingAttendance) {
    return (
      <Card className={cn(className)}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Daily Attendance</CardTitle>
            <CardDescription>Track your check-in and check-out times</CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* GPS Status */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {!gpsEnabled ? (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-0.5">
              <MapPinOff className="h-2.5 w-2.5" />
              GPS Off
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-0.5">
              <MapPin className="h-2.5 w-2.5" />
              GPS
            </Badge>
          )}
        </div>

        {/* Time Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Check-in Time</p>
            <p className="text-lg font-semibold">
              {todayAttendance?.check_in_time
                ? format(new Date(todayAttendance.check_in_time), 'hh:mm a')
                : '--:--'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Check-out Time</p>
            <p className="text-lg font-semibold">
              {todayAttendance?.check_out_time
                ? format(new Date(todayAttendance.check_out_time), 'hh:mm a')
                : '--:--'}
            </p>
          </div>
        </div>

        {/* Hours Worked */}
        {(isCheckedIn || isCheckedOut) && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Hours Worked Today</span>
            </div>
            <span className="text-lg font-bold">
              {hoursWorked.toFixed(2)} hrs
              {isCheckedOut && (todayAttendance?.overtime_hours || 0) > 0 && (
                <span className="text-amber-600 dark:text-amber-400 ml-1 text-sm">
                  (+{todayAttendance!.overtime_hours!.toFixed(1)}h OT)
                </span>
              )}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleCheckIn}
            disabled={isLoading || isCheckedIn || isCheckedOut}
            className="flex-1"
            size="lg"
          >
            {isLoading && !isCheckedIn ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Checking In...
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Check In
              </>
            )}
          </Button>

          <Button
            onClick={handleCheckOut}
            disabled={isLoading || !isCheckedIn || isCheckedOut}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            {isLoading && isCheckedIn ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Checking Out...
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Check Out
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {gpsEnabled
            ? 'Check in when you arrive at the office. Your GPS location will be verified.'
            : 'Check in when you arrive. GPS verification is disabled for your profile.'}
        </p>
      </CardContent>
    </Card>
  );
}
