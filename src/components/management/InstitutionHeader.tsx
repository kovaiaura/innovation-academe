import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2, MapPin, Calendar, Users, GraduationCap, BookOpen } from "lucide-react";

interface InstitutionHeaderProps {
  institutionName?: string;
  establishedYear?: string;
  location?: string;
  totalStudents?: number;
  totalFaculty?: number;
  totalDepartments?: number;
  academicYear?: string;
  userRole?: string;
}

export const InstitutionHeader = ({
  institutionName = "Springfield Technical College",
  establishedYear = "1995",
  location = "Delhi, India",
  totalStudents = 2845,
  totalFaculty = 186,
  totalDepartments = 5,
  academicYear = "2024-25 (Semester 2)",
  userRole = "Management Portal"
}: InstitutionHeaderProps) => {
  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {institutionName.split(' ').map(word => word[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-3 flex-1">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{institutionName}</h2>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    <span>Est. {establishedYear}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{location}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-md border">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="font-semibold">{totalStudents.toLocaleString()}</span>
                  <span className="text-muted-foreground">Students</span>
                </div>
                <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-md border">
                  <GraduationCap className="h-4 w-4 text-green-500" />
                  <span className="font-semibold">{totalFaculty}</span>
                  <span className="text-muted-foreground">Faculty</span>
                </div>
                <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-md border">
                  <BookOpen className="h-4 w-4 text-purple-500" />
                  <span className="font-semibold">{totalDepartments}</span>
                  <span className="text-muted-foreground">Departments</span>
                </div>
                <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-md border">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  <span className="text-muted-foreground">Academic Year:</span>
                  <span className="font-semibold">{academicYear}</span>
                </div>
              </div>
            </div>
          </div>

          <Badge variant="outline" className="text-sm px-3 py-1">
            {userRole}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
