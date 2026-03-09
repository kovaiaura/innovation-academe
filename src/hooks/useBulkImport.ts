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
        // Reserve ID range for student IDs
        const { start: startCounter } = await reserveIdRange('student', validStudents.length);
        
        // Reserve ID range for roll numbers
        const { data: rollRangeData } = await supabase.rpc('reserve_id_range', {
          p_institution_id: institutionId,
          p_entity_type: 'roll_number',
          p_count: validStudents.length,
        });
        const rollStartCounter = rollRangeData?.[0]?.start_counter || 1;
        
        const currentYear = new Date().getFullYear();
        
        // Get institution settings for prefix/suffix
        const { data: instData } = await supabase
          .from('institutions')
          .select('code, slug, settings')
          .eq('id', institutionId)
          .single();
        
        const settings = (instData?.settings || {}) as { student_id_prefix?: string; student_id_suffix?: string };
        const rollPrefix = settings.student_id_prefix || 'STU';
        const rollSuffix = settings.student_id_suffix || '';
        const institutionCode = instData?.code || instData?.slug?.toUpperCase() || 'STU';

        // Check for existing students by email if needed
        let existingEmails: Set<string> = new Set();
        
        if (options.skipDuplicates) {
          const { data: existingStudents } = await supabase
            .from('students')
            .select('email')
            .eq('institution_id', institutionId);
          
          if (existingStudents) {
            existingEmails = new Set(
              existingStudents
                .map(s => s.email?.toLowerCase())
                .filter((email): email is string => Boolean(email))
            );
          }
        }

        // Process students in batches
        const batchSize = 50;
        const batches = [];
        for (let i = 0; i < validStudents.length; i += batchSize) {
          batches.push(validStudents.slice(i, i + batchSize));
        }

        let processedCount = 0;
        let counterOffset = 0;
        
        for (const batch of batches) {
          // Prepare student records and collect those needing auth
          const studentsNeedingAuth: Array<{
            email: string;
            password: string;
            student_name: string;
            institution_id: string;
            class_id: string;
            batchIndex: number;
          }> = [];
          
          const studentsToInsert: any[] = [];
          const batchUserIds: Map<string, string> = new Map(); // email -> user_id
          
          for (let i = 0; i < batch.length; i++) {
            const student = batch[i];
            
            const studentEmail = student.email?.toLowerCase();
            const isDuplicate = studentEmail && existingEmails.has(studentEmail);
            
            if (isDuplicate && options.skipDuplicates) {
              result.skipped++;
              result.duplicates.push(student.email || student.student_name);
              continue;
            }

            if (studentEmail) {
              existingEmails.add(studentEmail);
            }

            const counter = startCounter + counterOffset;
            const rollCounter = rollStartCounter + counterOffset;
            counterOffset++;

            const studentId = `${institutionCode}-${currentYear}-${String(counter).padStart(4, '0')}`;
            const rollNumber = rollSuffix 
              ? `${rollPrefix}-${currentYear}-${String(rollCounter).padStart(4, '0')}-${rollSuffix}`
              : `${rollPrefix}-${currentYear}-${String(rollCounter).padStart(4, '0')}`;

            // Collect students needing auth creation
            if (options.createAuthUsers && student.email && student.password) {
              studentsNeedingAuth.push({
                email: student.email,
                password: student.password,
                student_name: student.student_name,
                institution_id: institutionId,
                class_id: classId,
                batchIndex: studentsToInsert.length,
              });
            }

            studentsToInsert.push({
              institution_id: institutionId,
              class_id: classId,
              student_id: studentId,
              student_name: student.student_name,
              email: student.email || null,
              user_id: null, // Will be filled from batch response
              roll_number: rollNumber,
              admission_number: `ADM-${currentYear}-${String(counter).padStart(4, '0')}`,
              date_of_birth: student.date_of_birth || null,
              gender: student.gender?.toLowerCase() || 'male',
              blood_group: student.blood_group || null,
              admission_date: new Date().toISOString().split('T')[0],
              parent_name: student.parent_name || null,
              parent_phone: student.parent_phone || null,
              address: student.address || null,
              previous_school: student.previous_school || null,
              status: 'active',
            });
          }

          // Batch create auth users if any need it
          if (studentsNeedingAuth.length > 0) {
            try {
              const response = await supabase.functions.invoke('create-student-users-batch', {
                body: {
                  students: studentsNeedingAuth.map(s => ({
                    email: s.email,
                    password: s.password,
                    student_name: s.student_name,
                    institution_id: s.institution_id,
                    class_id: s.class_id,
                  })),
                },
              });

              if (response.data?.results) {
                for (const r of response.data.results) {
                  if (r.success && r.user_id) {
                    batchUserIds.set(r.email.toLowerCase(), r.user_id);
                  }
                }
              }
            } catch (err) {
              console.error('[BulkImport] Batch auth creation error:', err);
            }

            // Map user_ids back to student records
            for (const authStudent of studentsNeedingAuth) {
              const userId = batchUserIds.get(authStudent.email.toLowerCase());
              if (userId && studentsToInsert[authStudent.batchIndex]) {
                studentsToInsert[authStudent.batchIndex].user_id = userId;
              }
            }
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
