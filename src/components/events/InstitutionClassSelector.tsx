import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Building, GraduationCap, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Institution {
  id: string;
  name: string;
  classes: { id: string; class_name: string; section?: string }[];
}

export interface ClassSelection {
  institution_id: string;
  class_id: string | null;
}

interface InstitutionClassSelectorProps {
  selectedClasses: ClassSelection[];
  onSelectionChange: (selections: ClassSelection[]) => void;
  height?: string;
  idPrefix?: string;
}

export function InstitutionClassSelector({
  selectedClasses,
  onSelectionChange,
  height = '250px',
  idPrefix = 'ics',
}: InstitutionClassSelectorProps) {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedInstitutions, setExpandedInstitutions] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchInstitutionsAndClasses();
  }, []);

  const fetchInstitutionsAndClasses = async () => {
    setLoading(true);
    try {
      const { data: institutionsData, error: instError } = await supabase
        .from('institutions')
        .select('id, name')
        .eq('status', 'active')
        .order('name');

      if (instError) throw instError;

      const institutionsWithClasses: Institution[] = [];

      for (const inst of institutionsData || []) {
        const { data: classesData } = await supabase
          .from('classes')
          .select('id, class_name, section')
          .eq('institution_id', inst.id)
          .eq('status', 'active')
          .order('display_order');

        institutionsWithClasses.push({
          id: inst.id,
          name: inst.name,
          classes: classesData || [],
        });
      }

      setInstitutions(institutionsWithClasses);
    } catch (error) {
      console.error('Error fetching institutions:', error);
      toast.error('Failed to load institutions');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (instId: string) => {
    const newExpanded = new Set(expandedInstitutions);
    if (newExpanded.has(instId)) {
      newExpanded.delete(instId);
    } else {
      newExpanded.add(instId);
    }
    setExpandedInstitutions(newExpanded);
  };

  const toggleClass = (institutionId: string, classId: string) => {
    const exists = selectedClasses.find(
      (c) => c.institution_id === institutionId && c.class_id === classId
    );

    if (exists) {
      onSelectionChange(
        selectedClasses.filter(
          (c) => !(c.institution_id === institutionId && c.class_id === classId)
        )
      );
    } else {
      onSelectionChange([...selectedClasses, { institution_id: institutionId, class_id: classId }]);
    }
  };

  const toggleAllClassesInInstitution = (institution: Institution) => {
    if (institution.classes.length === 0) {
      // No classes — toggle institution-wide assignment with null class_id
      const exists = selectedClasses.some(
        (s) => s.institution_id === institution.id && s.class_id === null
      );
      if (exists) {
        onSelectionChange(selectedClasses.filter((s) => s.institution_id !== institution.id));
      } else {
        const filtered = selectedClasses.filter((s) => s.institution_id !== institution.id);
        onSelectionChange([...filtered, { institution_id: institution.id, class_id: null }]);
      }
      return;
    }

    const allSelected = institution.classes.every((cls) =>
      selectedClasses.some((s) => s.institution_id === institution.id && s.class_id === cls.id)
    );

    if (allSelected) {
      onSelectionChange(selectedClasses.filter((s) => s.institution_id !== institution.id));
    } else {
      const newSelections = institution.classes.map((cls) => ({
        institution_id: institution.id,
        class_id: cls.id,
      }));
      const filtered = selectedClasses.filter((s) => s.institution_id !== institution.id);
      onSelectionChange([...filtered, ...newSelections]);
    }
  };

  const isClassSelected = (institutionId: string, classId: string) => {
    return selectedClasses.some(
      (c) => c.institution_id === institutionId && c.class_id === classId
    );
  };

  const isAllClassesSelected = (institution: Institution) => {
    return institution.classes.length > 0 && institution.classes.every((cls) =>
      selectedClasses.some((s) => s.institution_id === institution.id && s.class_id === cls.id)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <ScrollArea style={{ height }}>
      <div className="space-y-3">
        {institutions.map((institution) => (
          <div key={institution.id} className="border rounded-lg p-3">
            <div className="flex items-center gap-3">
              <Checkbox
                id={`${idPrefix}-inst-${institution.id}`}
                checked={isAllClassesSelected(institution)}
                onCheckedChange={() => toggleAllClassesInInstitution(institution)}
              />
              <div
                className="flex items-center gap-2 flex-1 cursor-pointer"
                onClick={() => toggleExpand(institution.id)}
              >
                <Building className="h-4 w-4 text-muted-foreground" />
                <Label className="cursor-pointer font-medium text-sm">
                  {institution.name}
                </Label>
                <span className="text-xs text-muted-foreground">
                  ({institution.classes.length} classes)
                </span>
                {expandedInstitutions.has(institution.id) ? (
                  <ChevronDown className="h-4 w-4 ml-auto" />
                ) : (
                  <ChevronRight className="h-4 w-4 ml-auto" />
                )}
              </div>
            </div>

            {expandedInstitutions.has(institution.id) && institution.classes.length > 0 && (
              <div className="ml-8 mt-3 space-y-2">
                {institution.classes.map((cls) => (
                  <div key={cls.id} className="flex items-center gap-3">
                    <Checkbox
                      id={`${idPrefix}-class-${cls.id}`}
                      checked={isClassSelected(institution.id, cls.id)}
                      onCheckedChange={() => toggleClass(institution.id, cls.id)}
                    />
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor={`${idPrefix}-class-${cls.id}`} className="cursor-pointer text-sm">
                      {cls.class_name} {cls.section ? `- ${cls.section}` : ''}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {institutions.length === 0 && (
          <p className="text-center text-muted-foreground py-4 text-sm">
            No institutions found
          </p>
        )}
      </div>
    </ScrollArea>
  );
}
