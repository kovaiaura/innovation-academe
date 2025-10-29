import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GraduationCap, Award, Briefcase, Building2 } from 'lucide-react';
import { OfficerDetails } from '@/services/systemadmin.service';

interface OfficerSidebarProfileProps {
  officer: OfficerDetails;
  collapsed: boolean;
}

export function OfficerSidebarProfile({ officer, collapsed }: OfficerSidebarProfileProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (collapsed) {
    // Collapsed view - only show avatar
    return (
      <div className="border-t border-meta-dark-lighter p-2">
        <Avatar className="h-10 w-10 mx-auto">
          <AvatarImage src={officer.profile_photo_url} alt={officer.name} />
          <AvatarFallback className="bg-meta-accent text-meta-dark">
            {getInitials(officer.name)}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  // Expanded view - full profile card
  return (
    <div className="border-t border-meta-dark-lighter p-4">
      <Card className="bg-meta-dark-lighter border-meta-dark-lighter">
        <CardContent className="p-4">
          {/* Header with Avatar and Name */}
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={officer.profile_photo_url} alt={officer.name} />
              <AvatarFallback className="bg-meta-accent text-meta-dark font-semibold">
                {getInitials(officer.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {officer.name}
              </p>
              <p className="text-xs text-gray-400">{officer.employee_id}</p>
            </div>
          </div>

          {/* Assigned Institution */}
          <div className="mb-3 pb-3 border-b border-meta-dark">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-3 w-3 text-meta-accent" />
              <span className="text-xs font-medium text-gray-300">Assigned To</span>
            </div>
            <p className="text-xs text-white ml-5 capitalize">
              {officer.assigned_institutions.join(', ')}
            </p>
          </div>

          {/* Qualifications */}
          {officer.qualifications && officer.qualifications.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="h-3 w-3 text-meta-accent" />
                <span className="text-xs font-medium text-gray-300">Education</span>
              </div>
              <ScrollArea className="max-h-20">
                <div className="space-y-1 ml-5">
                  {officer.qualifications.map((qual, idx) => (
                    <p key={idx} className="text-xs text-gray-400 leading-relaxed">
                      • {qual}
                    </p>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Skills */}
          {officer.skills && officer.skills.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-3 w-3 text-meta-accent" />
                <span className="text-xs font-medium text-gray-300">Expertise</span>
              </div>
              <div className="flex flex-wrap gap-1 ml-5">
                {officer.skills.slice(0, 3).map((skill, idx) => (
                  <Badge 
                    key={idx} 
                    variant="secondary" 
                    className="text-xs bg-meta-dark text-gray-300"
                  >
                    {skill}
                  </Badge>
                ))}
                {officer.skills.length > 3 && (
                  <Badge variant="secondary" className="text-xs bg-meta-dark text-gray-400">
                    +{officer.skills.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Certifications Count */}
          {officer.certifications && officer.certifications.length > 0 && (
            <div>
              <div className="flex items-center gap-2">
                <Award className="h-3 w-3 text-meta-accent" />
                <span className="text-xs text-gray-400">
                  {officer.certifications.length} Certifications
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
