// Enums as constants
export const AdherentStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  EXPIRED: 'EXPIRED',
  DEACTIVATED: 'DEACTIVATED',
} as const;

export type AdherentStatusType = typeof AdherentStatus[keyof typeof AdherentStatus];

export const SubscriptionType = {
  BASIC: 'BASIC',
  PREMIUM: 'PREMIUM',
} as const;

export type SubscriptionTypeType = typeof SubscriptionType[keyof typeof SubscriptionType];

// Interfaces
export interface Subscription {
  id: number;
  type: SubscriptionTypeType;
  price: number;
  weeklySessions?: number;
  weeklySessionsUsed?: number;
  durationMonths?: number;
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  active: boolean;
}

export interface Adherent {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  status: AdherentStatusType;
  currentSubscription: Subscription | null;
  medicalCertificate?: string; // base64
  photo?: string; // base64
  createdAt: string;
  updatedAt: string;
  suspendedReason?: string;
  suspendedDate?: string;
}

export interface AdherentCreateRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  medicalCertificate: string; // base64
  photo?: string; // base64
  status?: AdherentStatusType;
}

export interface AdherentUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  photo?: string; // base64
  medicalCertificate?: string; // base64
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface AuthResponse {
  token: string;
}
