import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useIdCounter } from './useTimetable';
import { ParsedRow } from '@/utils/csvParser';

export interface BulkImportResult {
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: string[];
  duplicates: string[];
}

export interface BulkImportOptions {
  skipDuplicates: boolean;
  updateExisting: boolean;
  createAuthUsers: boolean;
}

export function useBulkImportStudents(institutionId: string, classId: string) {
  const queryClient = useQueryClient();
  const { reserveIdRange } = useIdCounter(institutionId);
  const [progress, setProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);

  const bulkImportMutation = useMutation({
    mutationFn: async ({
      students,
      options,
    }: {
      students: ParsedRow[];
      options: BulkImportOptions;
    }): Promise<BulkImportResult> => {
      setIsImporting(true);
      setProgress(0);
      
      const result: BulkImportResult = {
        imported: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
        errors: [],
        duplicates: [],
      };

      const validStudents = students.filter(s => s.student_name?.trim());
      if (validStudents.length === 0) {
        throw new Error('No valid students to import');
      }

      try {
        // Reserve ID range for all students
        const { start: startCounter } = await reserveIdRange('student', validStudents.length);
        const currentYear = new Date().getFullYear();
        
        // Get institution code for student IDs
        const { data: instData } = await supabase
          .from('institutions')
          .select('code, slug')
          .eq('id', institutionId)
          .single();
        
        const institutionCode = instData?.code || instData?.slug?.toUpperCase() || 'STU';

        // Check for existing students if needed
        let existingRollNumbers: Set<string> = new Set();
        let existingAdmissionNumbers: Set<string> = new Set();
        
        if (options.skipDuplicates || options.updateExisting) {
          const { data: existingStudents } = await supabase
            .from('students')
            .select('roll_number, admission_number')
            .eq('institution_id', institutionId);
          
          if (existingStudents) {
            existingRollNumbers = new Set(existingStudents.map(s => s.roll_number).filter(Boolean));
            existingAdmissionNumbers = new Set(existingStudents.map(s => s.admission_number).filter(Boolean));
          }
        }

        // Process students in batches
        const batchSize = 50;
        const batches = [];
        for (let i = 0; i < validStudents.length; i += batchSize) {
          batches.push(validStudents.slice(i, i + batchSize));
        }

        let processedCount = 0;
        
        for (const batch of batches) {
          const studentsToInsert: any[] = [];
          
          for (let i = 0; i < batch.length; i++) {
            const student = batch[i];
            const globalIndex = processedCount + i;
            const counter = startCounter + globalIndex;
            
            // Check for duplicates
            const isDuplicate = 
              (student.roll_number && existingRollNumbers.has(student.roll_number)) ||
              (student.admission_number && existingAdmissionNumbers.has(student.admission_number));
            
            if (isDuplicate) {
              if (options.skipDuplicates) {
                result.skipped++;
                result.duplicates.push(student.roll_number || student.admission_number || student.student_name);
                continue;
              }
              // TODO: Handle updateExisting case
            }

            // Generate student ID
            const studentId = `${institutionCode}-${currentYear}-${String(counter).padStart(4, '0')}`;

            studentsToInsert.push({
              institution_id: institutionId,
              class_id: classId,
              student_id: studentId,
              student_name: student.student_name,
              roll_number: student.roll_number || null,
              admission_number: student.admission_number || null,
              date_of_birth: student.date_of_birth || null,
              gender: student.gender?.toLowerCase() || 'male',
              blood_group: student.blood_group || null,
              admission_date: new Date().toISOString().split('T')[0],
              parent_name: student.parent_name || null,
              parent_phone: student.parent_phone || null,
              parent_email: student.parent_email || null,
              address: student.address || null,
              previous_school: student.previous_school || null,
              status: 'active',
            });
          }

          if (studentsToInsert.length > 0) {
            const { data, error } = await supabase
              .from('students')
              .insert(studentsToInsert)
              .select();

            if (error) {
              result.failed += studentsToInsert.length;
              result.errors.push(error.message);
            } else {
              result.imported += data?.length || 0;
            }
          }

          processedCount += batch.length;
          setProgress(Math.round((processedCount / validStudents.length) * 100));
        }

        return result;
      } finally {
        setIsImporting(false);
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['students', institutionId] });
      queryClient.invalidateQueries({ queryKey: ['classes-with-counts', institutionId] });
      
      if (result.imported > 0) {
        toast.success(`Successfully imported ${result.imported} students`);
      }
      if (result.skipped > 0) {
        toast.info(`Skipped ${result.skipped} duplicate entries`);
      }
      if (result.failed > 0) {
        toast.error(`Failed to import ${result.failed} students`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Bulk import failed: ${error.message}`);
    },
  });

  return {
    bulkImport: bulkImportMutation.mutateAsync,
    progress,
    isImporting,
    reset: () => {
      setProgress(0);
      setIsImporting(false);
    },
  };
}
