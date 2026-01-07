import { useEffect, useRef, useCallback } from 'react';
import { gamificationDbService } from '@/services/gamification-db.service';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ModuleData {
  id: string; // This is class_module_assignment.id
  module?: { id: string; title: string }; // The actual course_modules record
  isModuleCompleted?: boolean;
}

export function useLevelCompletionCertificate(
  studentId: string | undefined,
  modules: ModuleData[] | undefined,
  institutionId: string | undefined,
  courseTitle: string | undefined
) {
  // Track processed modules by course_modules.id (not class_module_assignment.id)
  const processedModulesRef = useRef<Set<string>>(new Set());

  const checkAndIssueCertificates = useCallback(async () => {
    if (!studentId || !modules || !institutionId) {
      console.log('[Certificate Hook] Missing required params:', { studentId: !!studentId, modules: modules?.length, institutionId: !!institutionId });
      return;
    }

    console.log('[Certificate Hook] Checking', modules.length, 'modules for student:', studentId);

    for (const moduleData of modules) {
      // Get the actual course module ID (not class assignment ID)
      const courseModuleId = moduleData.module?.id;
      const moduleName = moduleData.module?.title || 'Level';

      // Skip if no course module ID
      if (!courseModuleId) {
        console.log('[Certificate Hook] Skipping module without course_module.id:', moduleData.id);
        continue;
      }

      // Skip if module is not completed
      if (!moduleData.isModuleCompleted) {
        console.log('[Certificate Hook] Module not completed:', moduleName);
        continue;
      }
      
      // Skip if we've already processed this module in this session
      if (processedModulesRef.current.has(courseModuleId)) {
        console.log('[Certificate Hook] Already processed this session:', moduleName);
        continue;
      }

      console.log('[Certificate Hook] Checking certificate for completed module:', moduleName, '(', courseModuleId, ')');

      // Check if certificate already exists in database
      const { data: existing, error: checkError } = await supabase
        .from('student_certificates')
        .select('id')
        .eq('student_id', studentId)
        .eq('activity_type', 'level')
        .eq('activity_id', courseModuleId)
        .maybeSingle();

      if (checkError) {
        console.error('[Certificate Hook] Error checking existing certificate:', checkError);
        continue;
      }

      if (existing) {
        console.log('[Certificate Hook] Certificate already exists:', existing.id);
        processedModulesRef.current.add(courseModuleId);
        continue;
      }

      // Get the level/module completion template
      const { data: template, error: templateError } = await supabase
        .from('certificate_templates')
        .select('id, name')
        .or('category.eq.module,category.eq.level')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (templateError) {
        console.error('[Certificate Hook] Error fetching template:', templateError);
        continue;
      }

      if (!template) {
        console.warn('[Certificate Hook] No active level/module certificate template found');
        processedModulesRef.current.add(courseModuleId);
        continue;
      }

      console.log('[Certificate Hook] Issuing certificate with template:', template.name);

      try {
        // Issue certificate to database
        await gamificationDbService.issueCertificate({
          studentId,
          templateId: template.id,
          activityType: 'level',
          activityId: courseModuleId,
          activityName: `${moduleName}${courseTitle ? ` - ${courseTitle}` : ''}`,
          institutionId,
        });

        // Award XP for level completion
        await gamificationDbService.awardLevelCompletionXP(
          studentId, 
          institutionId, 
          courseModuleId, 
          moduleName
        );

        processedModulesRef.current.add(courseModuleId);
        toast.success(`🎉 Certificate earned for completing ${moduleName}!`);
        console.log('[Certificate Hook] Certificate issued successfully for:', moduleName);
      } catch (error) {
        console.error('[Certificate Hook] Failed to issue level certificate:', error);
        // Still mark as processed to avoid repeated errors
        processedModulesRef.current.add(courseModuleId);
      }
    }
  }, [studentId, modules, institutionId, courseTitle]);

  useEffect(() => {
    checkAndIssueCertificates();
  }, [checkAndIssueCertificates]);

  // Return a function that can be called manually to re-check
  return { recheckCertificates: checkAndIssueCertificates };
}
