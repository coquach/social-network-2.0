export type TargetRiskLevel =
  | 'MILD_STRESS'
  | 'MODERATE_RISK'
  | 'HIGH_RISK'
  | 'CRISIS';

export type InterventionMediaType =
  | 'IMAGE'
  | 'INFOGRAPHIC'
  | 'PDF_DOCUMENT'
  | 'VIDEO'
  | 'AUDIO'
  | 'EXTERNAL_LINK';

export interface OperatingHoursConfigDTO {
  is247?: boolean;
  startTime?: string;
  endTime?: string;
  daysOfWeek?: number[];
  timezone?: string;
  displayNote?: string;
}

export interface EmergencyHotlineDTO {
  _id: string;
  organizationName: string;
  hotlineNumber: string;
  is247?: boolean;
  operatingHours?: string;
  operatingHoursConfig?: OperatingHoursConfigDTO;
  description?: string;
  websiteUrl?: string;
  isPrimary?: boolean;
  isActive?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEmergencyHotlineDTO {
  organizationName: string;
  hotlineNumber: string;
  is247?: boolean;
  operatingHours?: string;
  operatingHoursConfig?: OperatingHoursConfigDTO;
  description?: string;
  websiteUrl?: string;
  isPrimary?: boolean;
  isActive?: boolean;
  displayOrder?: number;
}

export type UpdateEmergencyHotlineDTO = Partial<CreateEmergencyHotlineDTO>;

export interface InterventionResourceDTO {
  _id: string;
  title: string;
  description: string;
  targetRiskLevels: TargetRiskLevel[];
  mediaType: InterventionMediaType;
  mediaUrl: string;
  sourceOrganization?: string;
  referenceUrl?: string;
  thumbnailUrl?: string;
  isActive?: boolean;
  priority?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInterventionResourceDTO {
  title: string;
  description: string;
  targetRiskLevels: TargetRiskLevel[];
  mediaType: InterventionMediaType;
  mediaUrl: string;
  sourceOrganization?: string;
  referenceUrl?: string;
  thumbnailUrl?: string;
  isActive?: boolean;
  priority?: number;
}

export type UpdateInterventionResourceDTO = Partial<CreateInterventionResourceDTO>;
