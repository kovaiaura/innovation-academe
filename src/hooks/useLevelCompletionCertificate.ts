import { useEffect, useRef } from 'react';
import { gamificationDbService } from '@/services/gamification-db.service';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ModuleData {
  id: string;
  module?: { id: string; title: string };
  isModuleCompleted?: boolean;
}

export function useLevelCompletionCertificate(
  studentId: string | undefined,
  modules: ModuleData[] | undefined,
  institutionId: string | undefined,
  courseTitle: string | undefined
) {
  const issuedModulesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const checkAndIssueCertificates = async () => {
      if (!studentId || !modules || !institutionId) return;

      for (const moduleData of modules) {
        // Skip if module is not completed
        if (!moduleData.isModuleCompleted) continue;
        
        // Skip if we've already processed this module in this session
        if (issuedModulesRef.current.has(moduleData.id)) continue;

        const moduleId = moduleData.module?.id || moduleData.id;
        const moduleName = moduleData.module?.title || 'Level';

        // Check if certificate already exists in database
        const { data: existing } = await supabase
          .from('student_certificates')
          .select('id')
          .eq('student_id', studentId)
          .eq('activity_type', 'level')
          .eq('activity_id', moduleId)
          .maybeSingle();

        if (existing) {
          // Mark as processed so we don't check again
          issuedModulesRef.current.add(moduleData.id);
          continue;
        }

        // Get the level/module completion template
        const { data: template } = await supabase
          .from('certificate_templates')
          .select('id')
          .or('category.eq.module,category.eq.level')
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();

        if (!template) {
          console.warn('No active level/module certificate template found');
          issuedModulesRef.current.add(moduleData.id);
          continue;
        }

        try {
          // Issue certificate to database
          await gamificationDbService.issueCertificate({
            studentId,
            templateId: template.id,
            activityType: 'level',
            activityId: moduleId,
            activityName: `${moduleName}${courseTitle ? ` - ${courseTitle}` : ''}`,
            institutionId,
          });

          // Award XP for level completion
          await gamificationDbService.awardLevelCompletionXP(
            studentId, 
            institutionId, 
            moduleId, 
            moduleName
          );

          issuedModulesRef.current.add(moduleData.id);
          toast.success(`🎉 Certificate earned for completing ${moduleName}!`);
        } catch (error) {
          console.error('Failed to issue level certificate:', error);
          // Still mark as processed to avoid repeated errors
          issuedModulesRef.current.add(moduleData.id);
        }
      }
    };

    checkAndIssueCertificates();
  }, [studentId, modules, institutionId, courseTitle]);
}
