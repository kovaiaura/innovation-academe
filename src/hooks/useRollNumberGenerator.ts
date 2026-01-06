import { supabase } from '@/integrations/supabase/client';

export function useRollNumberGenerator(institutionId: string) {
  const generateRollNumber = async (): Promise<string> => {
    try {
      // Get next counter from database (atomic operation)
      const { data: counter, error } = await supabase.rpc('get_next_id', {
        p_institution_id: institutionId,
        p_entity_type: 'roll_number',
      });

      if (error) throw error;

      // Get institution code for prefix
      const { data: instData } = await supabase
        .from('institutions')
        .select('code, slug')
        .eq('id', institutionId)
        .single();

      const prefix = instData?.code || instData?.slug?.toUpperCase() || 'STU';
      const year = new Date().getFullYear();
      const paddedCounter = String(counter).padStart(4, '0');

      return `${prefix}-${year}-${paddedCounter}`;
    } catch (error) {
      // Fallback to timestamp-based ID if database fails
      return `ROLL-${Date.now()}`;
    }
  };

  const generateRollNumbers = async (count: number): Promise<string[]> => {
    try {
      // Reserve a range of IDs
      const { data, error } = await supabase.rpc('reserve_id_range', {
        p_institution_id: institutionId,
        p_entity_type: 'roll_number',
        p_count: count,
      });

      if (error) throw error;

      // Get institution code for prefix
      const { data: instData } = await supabase
        .from('institutions')
        .select('code, slug')
        .eq('id', institutionId)
        .single();

      const prefix = instData?.code || instData?.slug?.toUpperCase() || 'STU';
      const year = new Date().getFullYear();
      
      const startCounter = data?.[0]?.start_counter || 1;
      const rollNumbers: string[] = [];
      
      for (let i = 0; i < count; i++) {
        const paddedCounter = String(startCounter + i).padStart(4, '0');
        rollNumbers.push(`${prefix}-${year}-${paddedCounter}`);
      }

      return rollNumbers;
    } catch (error) {
      // Fallback to timestamp-based IDs
      return Array.from({ length: count }, (_, i) => `ROLL-${Date.now()}-${i}`);
    }
  };

  return { generateRollNumber, generateRollNumbers };
}
