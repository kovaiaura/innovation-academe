import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AssessmentPublishing } from '@/types/assessment';
import { mockInstitutionClasses } from '@/data/mockClassData';

// Simple mock institutions for selector
const mockInstitutions = [
  { id: '1', name: 'Springfield High School', location: 'Springfield, IL' },
  { id: '2', name: 'Riverside Academy', location: 'Riverside, CA' },
  { id: '3', name: 'Metro Tech Institute', location: 'New York, NY' }
];
import { Search, Building2, GraduationCap } from 'lucide-react';

interface PublishingSelectorProps {
  value: AssessmentPublishing[];
  onChange: (publishing: AssessmentPublishing[]) => void;
}

export const PublishingSelector = ({ value, onChange }: PublishingSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitutions, setSelectedInstitutions] = useState<Map<string, Set<string>>>(new Map());

  // Initialize from value prop
  useEffect(() => {
    const institutionMap = new Map<string, Set<string>>();
    value.forEach((pub) => {
      institutionMap.set(pub.institution_id, new Set(pub.class_ids));
    });
    setSelectedInstitutions(institutionMap);
  }, [value]);

  const filteredInstitutions = mockInstitutions.filter((inst) =>
    inst.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleInstitution = (institutionId: string, checked: boolean) => {
    const newMap = new Map(selectedInstitutions);
    
    if (checked) {
      newMap.set(institutionId, new Set());
    } else {
      newMap.delete(institutionId);
    }
    
    setSelectedInstitutions(newMap);
    updatePublishing(newMap);
  };

  const toggleClass = (institutionId: string, classId: string, checked: boolean) => {
    const newMap = new Map(selectedInstitutions);
    const classes = newMap.get(institutionId) || new Set();
    
    if (checked) {
      classes.add(classId);
    } else {
      classes.delete(classId);
    }
    
    newMap.set(institutionId, classes);
    setSelectedInstitutions(newMap);
    updatePublishing(newMap);
  };

  const updatePublishing = (institutionMap: Map<string, Set<string>>) => {
    const publishing: AssessmentPublishing[] = [];
    
    institutionMap.forEach((classIds, institutionId) => {
      if (classIds.size > 0) {
        const institution = mockInstitutions.find((i) => i.id === institutionId);
        const selectedClasses = mockInstitutionClasses.filter(
          (c) => c.institution_id === institutionId && classIds.has(c.id)
        );
        
        if (institution) {
          publishing.push({
            institution_id: institutionId,
            institution_name: institution.name,
            class_ids: Array.from(classIds),
            class_names: selectedClasses.map((c) => c.class_name)
          });
        }
      }
    });
    
    onChange(publishing);
  };

  const getInstitutionClasses = (institutionId: string) => {
    return mockInstitutionClasses.filter((c) => c.institution_id === institutionId);
  };

  const getTotalSelectedCount = () => {
    let totalClasses = 0;
    selectedInstitutions.forEach((classes) => {
      totalClasses += classes.size;
    });
    return {
      institutions: selectedInstitutions.size,
      classes: totalClasses
    };
  };

  const counts = getTotalSelectedCount();

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{counts.institutions}</p>
                <p className="text-sm text-muted-foreground">Institutions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{counts.classes}</p>
                <p className="text-sm text-muted-foreground">Classes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search institutions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Institution List */}
      <ScrollArea className="h-[400px] rounded-md border p-4">
        <div className="space-y-4">
          {filteredInstitutions.map((institution) => {
            const isSelected = selectedInstitutions.has(institution.id);
            const selectedClassIds = selectedInstitutions.get(institution.id) || new Set();
            const classes = getInstitutionClasses(institution.id);

            return (
              <Card key={institution.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`inst-${institution.id}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => toggleInstitution(institution.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={`inst-${institution.id}`} className="text-base font-semibold cursor-pointer">
                        {institution.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">{institution.location}</p>
                      {selectedClassIds.size > 0 && (
                        <Badge variant="secondary" className="mt-2">
                          {selectedClassIds.size} {selectedClassIds.size === 1 ? 'class' : 'classes'} selected
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                {isSelected && classes.length > 0 && (
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 pl-8">
                      {classes.map((classItem) => (
                        <div key={classItem.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`class-${classItem.id}`}
                            checked={selectedClassIds.has(classItem.id)}
                            onCheckedChange={(checked) =>
                              toggleClass(institution.id, classItem.id, checked as boolean)
                            }
                          />
                          <Label htmlFor={`class-${classItem.id}`} className="text-sm cursor-pointer">
                            {classItem.class_name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
