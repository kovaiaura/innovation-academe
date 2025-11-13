import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Building2, Users } from 'lucide-react';

export interface PublishingSelection {
  institution_id: string;
  institution_name: string;
  class_ids: string[];
}

interface Institution {
  id: string;
  name: string;
  classes: Array<{ id: string; name: string }>;
}

interface AssignmentPublishingSelectorProps {
  institutions: Institution[];
  value: PublishingSelection[];
  onChange: (selections: PublishingSelection[]) => void;
}

export function AssignmentPublishingSelector({
  institutions,
  value,
  onChange,
}: AssignmentPublishingSelectorProps) {
  const isInstitutionSelected = (institutionId: string) => {
    return value.some(s => s.institution_id === institutionId);
  };

  const isClassSelected = (institutionId: string, classId: string) => {
    const selection = value.find(s => s.institution_id === institutionId);
    return selection?.class_ids.includes(classId) || false;
  };

  const getSelectedClassesCount = (institutionId: string) => {
    const selection = value.find(s => s.institution_id === institutionId);
    return selection?.class_ids.length || 0;
  };

  const handleInstitutionToggle = (institution: Institution) => {
    const isSelected = isInstitutionSelected(institution.id);
    
    if (isSelected) {
      // Remove institution
      onChange(value.filter(s => s.institution_id !== institution.id));
    } else {
      // Add institution with all classes
      onChange([
        ...value,
        {
          institution_id: institution.id,
          institution_name: institution.name,
          class_ids: institution.classes.map(c => c.id),
        },
      ]);
    }
  };

  const handleClassToggle = (institution: Institution, classId: string, className: string) => {
    const existingSelection = value.find(s => s.institution_id === institution.id);
    
    if (!existingSelection) {
      // Add institution with this class
      onChange([
        ...value,
        {
          institution_id: institution.id,
          institution_name: institution.name,
          class_ids: [classId],
        },
      ]);
    } else {
      const isSelected = existingSelection.class_ids.includes(classId);
      
      if (isSelected) {
        // Remove class
        const updatedClassIds = existingSelection.class_ids.filter(id => id !== classId);
        
        if (updatedClassIds.length === 0) {
          // Remove institution if no classes left
          onChange(value.filter(s => s.institution_id !== institution.id));
        } else {
          // Update class list
          onChange(
            value.map(s =>
              s.institution_id === institution.id
                ? { ...s, class_ids: updatedClassIds }
                : s
            )
          );
        }
      } else {
        // Add class
        onChange(
          value.map(s =>
            s.institution_id === institution.id
              ? { ...s, class_ids: [...s.class_ids, classId] }
              : s
          )
        );
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Institutions & Classes</CardTitle>
        <CardDescription>
          Choose which institutions and classes will receive this assignment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {institutions.map((institution) => (
              <div key={institution.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`inst-${institution.id}`}
                    checked={isInstitutionSelected(institution.id)}
                    onCheckedChange={() => handleInstitutionToggle(institution)}
                  />
                  <Label
                    htmlFor={`inst-${institution.id}`}
                    className="flex items-center gap-2 font-semibold cursor-pointer"
                  >
                    <Building2 className="h-4 w-4" />
                    {institution.name}
                    {isInstitutionSelected(institution.id) && (
                      <span className="text-xs text-muted-foreground font-normal">
                        ({getSelectedClassesCount(institution.id)} classes)
                      </span>
                    )}
                  </Label>
                </div>

                {isInstitutionSelected(institution.id) && (
                  <div className="ml-8 space-y-2">
                    {institution.classes.map((cls) => (
                      <div key={cls.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`class-${cls.id}`}
                          checked={isClassSelected(institution.id, cls.id)}
                          onCheckedChange={() =>
                            handleClassToggle(institution, cls.id, cls.name)
                          }
                        />
                        <Label
                          htmlFor={`class-${cls.id}`}
                          className="flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <Users className="h-3 w-3" />
                          {cls.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}

                <Separator />
              </div>
            ))}
          </div>
        </ScrollArea>

        {value.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-sm font-medium">Selected:</p>
            <p className="text-sm text-muted-foreground">
              {value.length} institution(s),{' '}
              {value.reduce((sum, s) => sum + s.class_ids.length, 0)} class(es)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
