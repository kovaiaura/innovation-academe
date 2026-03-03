import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useOfficerByUserId } from '@/hooks/useOfficerProfile';
import { OfficerDailyAttendanceDetails } from '@/components/officer/OfficerDailyAttendanceDetails';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Award,
  Code,
  Building2,
  Briefcase,
  CreditCard,
  Shield,
  Calendar,
  ChevronDown,
} from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  
  const { data: officer, isLoading, error } = useOfficerByUserId(user?.id);

  const currentDate = new Date();
  const currentMonthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  
  useEffect(() => {
    if (!selectedMonth && officer) {
      setSelectedMonth(currentMonthYear);
    }
  }, [officer, selectedMonth, currentMonthYear]);

  // Resolve institution names from UUIDs
  const assignedInstitutionIds = Array.isArray(officer?.assigned_institutions) ? officer.assigned_institutions : [];
  const { data: institutionNames } = useQuery({
    queryKey: ['institution-names', assignedInstitutionIds],
    queryFn: async () => {
      if (assignedInstitutionIds.length === 0) return {};
      const { data, error } = await supabase
        .from('institutions')
        .select('id, name')
        .in('id', assignedInstitutionIds);
      if (error) throw error;
      const map: Record<string, string> = {};
      data?.forEach((inst) => { map[inst.id] = inst.name; });
      return map;
    },
    enabled: assignedInstitutionIds.length > 0,
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const qualifications = Array.isArray((officer as any)?.qualifications) ? (officer as any).qualifications : [];
  const certifications = Array.isArray((officer as any)?.certifications) ? (officer as any).certifications : [];
  const skills = Array.isArray((officer as any)?.skills) ? (officer as any).skills : [];

  const maskAccountNumber = (acc: string | null) => {
    if (!acc) return 'Not provided';
    if (acc.length <= 4) return acc;
    return 'XXXX' + acc.slice(-4);
  };

  const statutoryInfo = officer?.statutory_info as Record<string, any> | null;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!officer) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Officer profile not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">View your personal and professional information</p>
        </div>

        {/* Profile Header Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="h-24 w-24">
                <AvatarImage src={officer.profile_photo_url || undefined} alt={officer.full_name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {getInitials(officer.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-2xl font-bold">{officer.full_name}</h2>
                  <p className="text-muted-foreground">{officer.employee_id || 'No Employee ID'}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant={officer.status === 'active' ? 'default' : 'secondary'}>
                    {officer.status === 'active' ? 'Active' : officer.status}
                  </Badge>
                  {officer.employment_type && (
                    <Badge variant="outline">{officer.employment_type.replace('_', ' ').toUpperCase()}</Badge>
                  )}
                  {officer.department && (
                    <Badge variant="outline" className="gap-1">
                      <Building2 className="h-3 w-3" />
                      {officer.department}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-6 text-sm">
                  {officer.join_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Joined:</span>
                      <span className="font-medium">{new Date(officer.join_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{officer.email}</span>
                  </div>
                  {officer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{officer.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {officer.date_of_birth && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{new Date(officer.date_of_birth).toLocaleDateString()}</p>
                  </div>
                  <Separator />
                </>
              )}
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </p>
                <p className="font-medium">{officer.address || 'Not specified'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Professional Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Professional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Qualifications</p>
                {qualifications.length > 0 ? (
                  <ul className="space-y-1">
                    {qualifications.map((qual: string, idx: number) => (
                      <li key={idx} className="text-sm font-medium">• {qual}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No qualifications listed</p>
                )}
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Certifications
                </p>
                {certifications.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {certifications.map((cert: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">{cert}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No certifications listed</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Employment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Employee ID</p>
                  <p className="font-medium">{officer.employee_id || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{officer.department || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Designation</p>
                  <p className="font-medium capitalize">{officer.designation || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={officer.status === 'active' ? 'default' : 'secondary'}>
                    {officer.status}
                  </Badge>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Skills
                </p>
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">{skill}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No skills listed</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="hidden lg:block" />
        </div>

        {/* Full Width Cards */}
        <div className="space-y-6">
          {/* Daily Attendance Details */}
          {officer && selectedMonth && (
            <OfficerDailyAttendanceDetails
              officerId={officer.id}
              officerName={officer.full_name}
              month={selectedMonth}
              onMonthChange={setSelectedMonth}
              institutionId={assignedInstitutionIds[0] || undefined}
            />
          )}

          {/* Assigned Institutions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Assigned Institutions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignedInstitutionIds.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {assignedInstitutionIds.map((instId, idx) => (
                    <Badge key={idx} variant="secondary" className="text-sm">
                      {institutionNames?.[instId] || instId}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No institutions assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Bank Details - Collapsible */}
          <Collapsible>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Bank Details
                  </CardTitle>
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Bank Name</p>
                      <p className="font-medium">{officer.bank_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Account Number</p>
                      <p className="font-medium">{maskAccountNumber(officer.bank_account_number)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">IFSC Code</p>
                      <p className="font-medium">{officer.bank_ifsc || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Branch</p>
                      <p className="font-medium">{officer.bank_branch || 'Not provided'}</p>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Statutory Information - Collapsible */}
          <Collapsible>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Statutory Information
                  </CardTitle>
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">PF Number</p>
                      <p className="font-medium">{statutoryInfo?.pf_number || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">UAN Number</p>
                      <p className="font-medium">{statutoryInfo?.uan_number || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">PAN Number</p>
                      <p className="font-medium">{statutoryInfo?.pan_number || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">PT Registration</p>
                      <p className="font-medium">{statutoryInfo?.pt_registration || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ESI Number</p>
                      <p className="font-medium">{statutoryInfo?.esi_number || 'Not provided'}</p>
                    </div>
                    {statutoryInfo?.pf_applicable !== undefined && (
                      <div>
                        <p className="text-sm text-muted-foreground">PF Applicable</p>
                        <Badge variant={statutoryInfo.pf_applicable ? 'default' : 'secondary'}>
                          {statutoryInfo.pf_applicable ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    )}
                    {statutoryInfo?.esi_applicable !== undefined && (
                      <div>
                        <p className="text-sm text-muted-foreground">ESI Applicable</p>
                        <Badge variant={statutoryInfo.esi_applicable ? 'default' : 'secondary'}>
                          {statutoryInfo.esi_applicable ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    )}
                    {statutoryInfo?.pt_applicable !== undefined && (
                      <div>
                        <p className="text-sm text-muted-foreground">PT Applicable</p>
                        <Badge variant={statutoryInfo.pt_applicable ? 'default' : 'secondary'}>
                          {statutoryInfo.pt_applicable ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>
      </div>
    </Layout>
  );
}
