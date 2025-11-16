import { IdConfiguration, GeneratedId, IdEntityType, IdGenerationRequest } from '@/types/id-configuration';
import { ApiResponse } from '@/types';
import { mockIdConfigurations } from '@/data/mockIdConfigurations';
import { generateIdFromPattern } from '@/utils/idGenerationHelpers';

export const idGenerationService = {
  /**
   * Get ID configuration for entity type
   */
  async getIdConfiguration(
    entityType: IdEntityType,
    institutionId?: string
  ): Promise<ApiResponse<IdConfiguration>> {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let config = mockIdConfigurations.find(c => c.entity_type === entityType);
    
    // For students, check institution-specific config
    if (entityType === 'student' && institutionId) {
      const instConfig = mockIdConfigurations.find(
        c => c.entity_type === 'student' && c.institution_id === institutionId
      );
      if (instConfig) {
        config = instConfig;
      }
    }

    if (!config) {
      return {
        success: false,
        message: 'Configuration not found',
        data: null as any,
      };
    }

    return {
      success: true,
      message: 'Configuration retrieved',
      data: config,
    };
  },

  /**
   * Get all configurations (for admin management)
   */
  async getAllConfigurations(): Promise<ApiResponse<IdConfiguration[]>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      message: 'Configurations retrieved',
      data: mockIdConfigurations,
    };
  },

  /**
   * Save or update ID configuration
   */
  async saveIdConfiguration(
    config: Partial<IdConfiguration>
  ): Promise<ApiResponse<IdConfiguration>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const existingIndex = mockIdConfigurations.findIndex(
      c => c.entity_type === config.entity_type && 
      c.institution_id === config.institution_id
    );

    let savedConfig: IdConfiguration;

    if (existingIndex >= 0) {
      // Update existing
      savedConfig = {
        ...mockIdConfigurations[existingIndex],
        ...config,
        updated_at: new Date().toISOString(),
      } as IdConfiguration;
      mockIdConfigurations[existingIndex] = savedConfig;
    } else {
      // Create new
      savedConfig = {
        id: `config-${Date.now()}`,
        ...config,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as IdConfiguration;
      mockIdConfigurations.push(savedConfig);
    }

    return {
      success: true,
      message: 'Configuration saved successfully',
      data: savedConfig,
    };
  },

  /**
   * Generate new ID
   */
  async generateId(
    request: IdGenerationRequest
  ): Promise<ApiResponse<{ id: string; counter: number }>> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const configResponse = await this.getIdConfiguration(
      request.entity_type,
      request.institution_id
    );

    if (!configResponse.success || !configResponse.data) {
      return {
        success: false,
        message: 'Configuration not found',
        data: null as any,
      };
    }

    const config = configResponse.data;
    const generatedId = generateIdFromPattern(config, request.custom_values);

    // Increment counter (in real app, this would be atomic in database)
    config.current_counter += 1;

    return {
      success: true,
      message: 'ID generated successfully',
      data: {
        id: generatedId,
        counter: config.current_counter - 1,
      },
    };
  },

  /**
   * Check if ID is unique
   */
  async isIdUnique(
    id: string,
    entityType: IdEntityType
  ): Promise<ApiResponse<boolean>> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Mock implementation - in real app, check database
    // For now, assume all generated IDs are unique
    return {
      success: true,
      message: 'ID checked',
      data: true,
    };
  },

  /**
   * Get generated IDs history
   */
  async getGeneratedIds(
    entityType?: IdEntityType,
    institutionId?: string
  ): Promise<ApiResponse<GeneratedId[]>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock implementation
    const mockGeneratedIds: GeneratedId[] = [];

    return {
      success: true,
      message: 'Generated IDs retrieved',
      data: mockGeneratedIds,
    };
  },

  /**
   * Reset counter for configuration
   */
  async resetCounter(
    entityType: IdEntityType,
    institutionId?: string
  ): Promise<ApiResponse<IdConfiguration>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const config = mockIdConfigurations.find(
      c => c.entity_type === entityType && 
      (!institutionId || c.institution_id === institutionId)
    );

    if (!config) {
      return {
        success: false,
        message: 'Configuration not found',
        data: null as any,
      };
    }

    config.current_counter = 1;
    config.updated_at = new Date().toISOString();

    return {
      success: true,
      message: 'Counter reset successfully',
      data: config,
    };
  },
};
