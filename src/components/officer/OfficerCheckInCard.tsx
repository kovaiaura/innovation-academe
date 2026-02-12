/**
 * Officer Check-in/Check-out Card with GPS Validation
 * Persists to Supabase officer_attendance table
 */

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Loader2, AlertCircle, CheckCircle2, XCircle, Building2, MapPinOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentLocation } from '@/utils/locationHelpers';
import { toast } from 'sonner';
import { format, startOfWeek, addDays, isToday, isBefore } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  useOfficerTodayAttendance,
  useCheckIn,
  useCheckOut,
  useInstitutionGPSSettings,
} from '@/hooks/useOfficerAttendance';
import { leaveSettingsService } from '@/services/leaveSettings.service';

interface OfficerCheckInCardProps {
  officerId: string;
  institutionId: string;
  onStatusChange?: (status: 'checked_in' | 'checked_out' | 'not_checked_in') => void;
}

export function OfficerCheckInCard({ officerId, institutionId, onStatusChange }: OfficerCheckInCardProps) {
  const { user } = useAuth();
  const [hoursWorked, setHoursWorked] = useState(0);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [loadingGpsSetting, setLoadingGpsSetting] = useState(true);

  // Fetch GPS enabled setting
  useEffect(() => {
    const loadGpsSetting = async () => {
      try {
        const enabled = await leaveSettingsService.isGpsEnabled();
        setGpsEnabled(enabled);
      } catch (error) {
        console.error('Failed to load GPS setting:', error);
      } finally {
        setLoadingGpsSetting(false);
      }
    };
    loadGpsSetting();
  }, []);

  // Fetch today's attendance
  const { data: todayAttendance, isLoading: isLoadingAttendance } = useOfficerTodayAttendance(
    officerId,
    institutionId
  );

  // Fetch institution GPS settings
  const { data: institutionSettings } = useInstitutionGPSSettings(institutionId);

  // Mutations
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

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
      const interval = setInterval(calculateHours, 60000); // Update every minute

      return () => clearInterval(interval);
    } else if (todayAttendance?.status === 'checked_out') {
      setHoursWorked(todayAttendance.total_hours_worked || 0);
    }
  }, [todayAttendance]);

  // Notify parent of status changes
  useEffect(() => {
    if (todayAttendance?.status && onStatusChange) {
      onStatusChange(todayAttendance.status as 'checked_in' | 'checked_out' | 'not_checked_in');
    }
  }, [todayAttendance?.status, onStatusChange]);

  const handleCheckIn = async () => {
    setIsLoadingLocation(true);

    try {
      // If GPS is disabled globally, skip location fetching
      if (!gpsEnabled) {
        const result = await checkInMutation.mutateAsync({
          officer_id: officerId,
          institution_id: institutionId,
          latitude: 0,
          longitude: 0,
          institution_latitude: 0,
          institution_longitude: 0,
          attendance_radius_meters: 0,
          skip_gps: true,
        });

        if (result.success) {
          toast.success('Check-in Successful', {
            description: 'Time recorded (GPS verification disabled)',
          });
        } else {
          toast.error('Check-in Failed', {
            description: result.error || 'Please try again',
          });
        }
        return;
      }

      // GPS is enabled - normal flow
      if (!institutionSettings?.gps_location) {
        toast.error('Institution GPS coordinates not configured');
        return;
      }

      const location = await getCurrentLocation();

      const result = await checkInMutation.mutateAsync({
        officer_id: officerId,
        institution_id: institutionId,
        latitude: location.latitude,
        longitude: location.longitude,
        institution_latitude: institutionSettings.gps_location.latitude,
        institution_longitude: institutionSettings.gps_location.longitude,
        attendance_radius_meters: institutionSettings.attendance_radius_meters,
      });

      if (result.success) {
        if (result.validated) {
          toast.success('Check-in Successful', {
            description: `Location verified - ${result.distance}m from institution`,
          });
        } else {
          toast.warning('Check-in Recorded (Location Unverified)', {
            description: `You are ${result.distance}m from institution (allowed: ${institutionSettings.attendance_radius_meters}m)`,
          });
        }
      } else {
        toast.error('Check-in Failed', {
          description: result.error || 'Please try again',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get location';
      toast.error('Location Error', {
        description: errorMessage,
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleCheckOut = async () => {
    setIsLoadingLocation(true);

    try {
      // If GPS is disabled globally, skip location fetching
      if (!gpsEnabled) {
        const result = await checkOutMutation.mutateAsync({
          officer_id: officerId,
          institution_id: institutionId,
          latitude: 0,
          longitude: 0,
          institution_latitude: 0,
          institution_longitude: 0,
          attendance_radius_meters: 0,
          normal_working_hours: institutionSettings?.normal_working_hours || 8,
          skip_gps: true,
        });

        if (result.success) {
          toast.success('Check-out Successful', {
            description: `Total hours: ${result.hoursWorked.toFixed(2)}h | Overtime: ${result.overtimeHours.toFixed(2)}h`,
          });
        } else {
          toast.error('Check-out Failed', {
            description: result.error || 'Please try again',
          });
        }
        return;
      }

      // GPS is enabled - normal flow
      if (!institutionSettings?.gps_location) {
        toast.error('Institution GPS coordinates not configured');
        return;
      }

      const location = await getCurrentLocation();

      const result = await checkOutMutation.mutateAsync({
        officer_id: officerId,
        institution_id: institutionId,
        latitude: location.latitude,
        longitude: location.longitude,
        institution_latitude: institutionSettings.gps_location.latitude,
        institution_longitude: institutionSettings.gps_location.longitude,
        attendance_radius_meters: institutionSettings.attendance_radius_meters,
        normal_working_hours: institutionSettings.normal_working_hours,
      });

      if (result.success) {
        toast.success('Check-out Successful', {
          description: `Total hours: ${result.hoursWorked.toFixed(2)}h | Overtime: ${result.overtimeHours.toFixed(2)}h`,
        });
      } else {
        toast.error('Check-out Failed', {
          description: result.error || 'Please try again',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get location';
      toast.error('Location Error', {
        description: errorMessage,
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };


  const getStatusBadge = () => {
    if (!todayAttendance || todayAttendance.status === 'not_checked_in') {
      return (
        <Badge variant="outline" className="gap-1">
          <XCircle className="h-3 w-3" />
          Not Checked In
        </Badge>
      );
    }
    if (todayAttendance.status === 'checked_out') {
      return (
        <Badge variant="secondary" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Checked Out
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="gap-1 bg-green-500">
        <Clock className="h-3 w-3" />
        Working
      </Badge>
    );
  };

  const getLocationBadge = () => {
    if (!todayAttendance) return null;

    const validated = todayAttendance.check_in_validated;
    if (validated === null || validated === undefined) return null;

    return validated ? (
      <Badge variant="default" className="gap-1 bg-green-500">
        <CheckCircle2 className="h-3 w-3" />
        Location Verified
      </Badge>
    ) : (
      <Badge variant="destructive" className="gap-1">
        <AlertCircle className="h-3 w-3" />
        Location Unverified
      </Badge>
    );
  };

  const isCheckedIn = todayAttendance?.status === 'checked_in';
  const isCheckedOut = todayAttendance?.status === 'checked_out';
  const isLoading = isLoadingLocation || checkInMutation.isPending || checkOutMutation.isPending;

  if (isLoadingAttendance) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-1.5 text-base">
            <Clock className="h-4 w-4 shrink-0" />
            Daily Attendance
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4 pt-0">
        {/* Institution + GPS inline */}
        {institutionSettings && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate font-medium">{institutionSettings.name}</span>
            {!gpsEnabled ? (
              <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 gap-0.5 shrink-0">
                <MapPinOff className="h-2.5 w-2.5" />
                GPS Off
              </Badge>
            ) : institutionSettings.gps_location ? (
              <Badge variant="outline" className="ml-auto text-[10px] px-1.5 py-0 gap-0.5 shrink-0">
                <MapPin className="h-2.5 w-2.5" />
                GPS
              </Badge>
            ) : (
              <Badge variant="destructive" className="ml-auto text-[10px] px-1.5 py-0 shrink-0">
                No GPS
              </Badge>
            )}
          </div>
        )}

        {/* Time Display - compact */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Check-in</p>
            <p className="text-sm font-semibold">
              {todayAttendance?.check_in_time
                ? format(new Date(todayAttendance.check_in_time), 'hh:mm a')
                : '--:--'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Check-out</p>
            <p className="text-sm font-semibold">
              {todayAttendance?.check_out_time
                ? format(new Date(todayAttendance.check_out_time), 'hh:mm a')
                : '--:--'}
            </p>
          </div>
        </div>

        {/* Hours worked - inline text */}
        {(isCheckedIn || isCheckedOut) && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Hours worked</span>
            <span className="font-semibold">
              {hoursWorked.toFixed(2)}h
              {isCheckedOut && (todayAttendance?.overtime_hours || 0) > 0 && (
                <span className="text-amber-600 dark:text-amber-400 ml-1">
                  (+{todayAttendance!.overtime_hours!.toFixed(1)}h OT)
                </span>
              )}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={handleCheckIn}
            disabled={isLoading || isCheckedIn || isCheckedOut || (gpsEnabled && (!institutionSettings?.gps_location || (institutionSettings.gps_location.latitude === 0 && institutionSettings.gps_location.longitude === 0)))}
            className="flex-1 min-w-[100px]"
            size="default"
          >
            {isLoading && !isCheckedIn ? (
              <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Locating...</>
            ) : (
              <><Clock className="h-4 w-4 mr-1.5" />Check In</>
            )}
          </Button>
          <Button
            onClick={handleCheckOut}
            disabled={isLoading || !isCheckedIn || isCheckedOut || (gpsEnabled && (!institutionSettings?.gps_location || (institutionSettings.gps_location.latitude === 0 && institutionSettings.gps_location.longitude === 0)))}
            variant="outline"
            className="flex-1 min-w-[100px]"
            size="default"
          >
            {isLoading && isCheckedIn ? (
              <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Locating...</>
            ) : (
              <><Clock className="h-4 w-4 mr-1.5" />Check Out</>
            )}
          </Button>
        </div>

        {/* This Week Attendance Dots */}
        <WeeklyAttendanceDots officerId={officerId} institutionId={institutionId} />
      </CardContent>
    </Card>
  );
}

function WeeklyAttendanceDots({ officerId, institutionId }: { officerId: string; institutionId: string }) {
  const weekDays = useMemo(() => {
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 6 }, (_, i) => ({
      date: addDays(monday, i),
      label: ['M', 'T', 'W', 'T', 'F', 'S'][i],
    }));
  }, []);

  const mondayStr = format(weekDays[0].date, 'yyyy-MM-dd');
  const saturdayStr = format(weekDays[5].date, 'yyyy-MM-dd');

  const { data: weekRecords } = useQuery({
    queryKey: ['officer-week-attendance', officerId, mondayStr],
    queryFn: async () => {
      const { data } = await supabase
        .from('officer_attendance')
        .select('date, status')
        .eq('officer_id', officerId)
        .eq('institution_id', institutionId)
        .gte('date', mondayStr)
        .lte('date', saturdayStr);
      return data || [];
    },
    enabled: !!officerId && !!institutionId,
  });

  const attendedDates = new Set(
    (weekRecords || [])
      .filter(r => r.status === 'checked_in' || r.status === 'checked_out')
      .map(r => r.date)
  );

  return (
    <div className="pt-2 border-t border-border/50">
      <p className="text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wider">This Week</p>
      <div className="flex items-center justify-between gap-1">
        {weekDays.map(({ date, label }) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const attended = attendedDates.has(dateStr);
          const today = isToday(date);
          const past = isBefore(date, new Date()) && !today;

          return (
            <div key={dateStr} className="flex flex-col items-center gap-1">
              <div
                className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-colors
                  ${attended
                    ? 'bg-green-500 text-white'
                    : past
                      ? 'bg-muted text-muted-foreground/50'
                      : 'bg-muted/50 text-muted-foreground/30'
                  }
                  ${today ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}
                `}
              >
                {attended ? '✓' : ''}
              </div>
              <span className={`text-[9px] ${today ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
