import { getApiClient } from '@repo/shared';
import {
  CreateEmergencyHotlineDTO,
  CreateInterventionResourceDTO,
  EmergencyHotlineDTO,
  InterventionResourceDTO,
  UpdateEmergencyHotlineDTO,
  UpdateInterventionResourceDTO,
} from '@/models/emotion/adminInterventionDTO';

// --- Emergency Hotlines API Actions ---

export const getEmergencyHotlines = async (
  token: string,
): Promise<EmergencyHotlineDTO[]> => {
  try {
    const response = await getApiClient().get<EmergencyHotlineDTO[]>(
      '/admin/interventions/hotlines',
    );
    return response as any;
  } catch (error) {
    console.error('getEmergencyHotlines error:', error);
    throw error;
  }
};

export const createEmergencyHotline = async (
  token: string,
  dto: CreateEmergencyHotlineDTO,
): Promise<EmergencyHotlineDTO> => {
  try {
    const response = await getApiClient().post<EmergencyHotlineDTO>(
      '/admin/interventions/hotlines',
      dto,
    );
    return response as any;
  } catch (error) {
    console.error('createEmergencyHotline error:', error);
    throw error;
  }
};

export const updateEmergencyHotline = async (
  token: string,
  id: string,
  dto: UpdateEmergencyHotlineDTO,
): Promise<EmergencyHotlineDTO> => {
  try {
    const response = await getApiClient().put<EmergencyHotlineDTO>(
      `/admin/interventions/hotlines/${id}`,
      dto,
    );
    return response as any;
  } catch (error) {
    console.error('updateEmergencyHotline error:', error);
    throw error;
  }
};

export const deleteEmergencyHotline = async (
  token: string,
  id: string,
): Promise<{ success: boolean; deletedId: string }> => {
  try {
    const response = await getApiClient().delete<{
      success: boolean;
      deletedId: string;
    }>(`/admin/interventions/hotlines/${id}`);
    return response as any;
  } catch (error) {
    console.error('deleteEmergencyHotline error:', error);
    throw error;
  }
};

// --- Intervention Resources API Actions ---

export const getInterventionResources = async (
  token: string,
): Promise<InterventionResourceDTO[]> => {
  try {
    const response = await getApiClient().get<InterventionResourceDTO[]>(
      '/admin/interventions/resources',
    );
    return response as any;
  } catch (error) {
    console.error('getInterventionResources error:', error);
    throw error;
  }
};

export const createInterventionResource = async (
  token: string,
  dto: CreateInterventionResourceDTO,
): Promise<InterventionResourceDTO> => {
  try {
    const response = await getApiClient().post<InterventionResourceDTO>(
      '/admin/interventions/resources',
      dto,
    );
    return response as any;
  } catch (error) {
    console.error('createInterventionResource error:', error);
    throw error;
  }
};

export const updateInterventionResource = async (
  token: string,
  id: string,
  dto: UpdateInterventionResourceDTO,
): Promise<InterventionResourceDTO> => {
  try {
    const response = await getApiClient().put<InterventionResourceDTO>(
      `/admin/interventions/resources/${id}`,
      dto,
    );
    return response as any;
  } catch (error) {
    console.error('updateInterventionResource error:', error);
    throw error;
  }
};

export const deleteInterventionResource = async (
  token: string,
  id: string,
): Promise<{ success: boolean; deletedId: string }> => {
  try {
    const response = await getApiClient().delete<{
      success: boolean;
      deletedId: string;
    }>(`/admin/interventions/resources/${id}`);
    return response as any;
  } catch (error) {
    console.error('deleteInterventionResource error:', error);
    throw error;
  }
};
