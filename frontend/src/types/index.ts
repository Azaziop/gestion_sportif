// Enums as constants
export const AdherentStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;

export type AdherentStatusType = typeof AdherentStatus[keyof typeof AdherentStatus];

export const SubscriptionType = {
  BASIC: 'BASIC',
  STANDARD: 'STANDARD',
  PREMIUM: 'PREMIUM',
} as const;

export type SubscriptionTypeType = typeof SubscriptionType[keyof typeof SubscriptionType];

// Interfaces
export interface Subscription {
  id: number;
  type: SubscriptionTypeType;
  startDate: string;
  endDate: string;
  price: number;
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
  medicalCertificateExpiryDate?: string;
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
  medicalCertificateExpiryDate: string; // YYYY-MM-DD
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
