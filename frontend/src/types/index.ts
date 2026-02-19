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
  // Nouvelles colonnes d'abonnement directement dans Adherent
  subscriptionType?: SubscriptionTypeType | null;
  subscriptionPrice?: number | null;
  subscriptionStartDate?: string | null; // ISO date
  subscriptionDurationMonths?: number | null;
  subscriptionEndDate?: string | null; // ISO date
  // Ancienne propriété maintenue pour rétrocompatibilité temporaire
  currentSubscription?: Subscription | null;
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

export interface ApiResponse<T> {
  data: T | null;
  message?: string;
  success?: boolean;
}

export interface Sport {
  id: number;
  nom: string;
  description?: string;
  lieu: string;
  dateDebut: string;
  dateFin?: string;
  coach?: string;
  capaciteMax: number;
  capaciteActuelle: number;
  statut: 'PREVU' | 'EN_COURS' | 'TERMINE' | 'ANNULE';
}

export interface Reservation {
  id: number;
  adherentId?: number;
  coursId?: number;
  sport?: Sport;
  statut: 'CONFIRMED' | 'WAITING_LIST' | 'CANCELLED' | 'ATTENDED';
  dateReservation?: string;
  dateAnnulation?: string;
  motifAnnulation?: string;
  updatedAt?: string;
}

export type CourseType = 'YOGA' | 'FOOTBALL' | 'MUSCULATION' | 'NATATION' | 'BOXE' | 'PILATES' | 'CROSSFIT';
export type CourseLevel = 'BASIC' | 'PREMIUM';

export interface Cours {
  id: number;
  titre: string;
  description: string;
  type: string;
  coach: string;
  salle: string;
  capaciteMax: number;
  niveau: CourseLevel;
  dateHeure: string;
  duree: number;
  nombreInscrits: number;
  actif?: boolean;
  placesRestantes?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCoursRequest {
  titre: string;
  description: string;
  type: string;
  coach: string;
  salle: string;
  capaciteMax: number;
  niveau: CourseLevel;
  dateHeure: string;
  duree: number;
}

export interface UpdateCoursRequest {
  titre?: string;
  description?: string;
  type?: string;
  coach?: string;
  salle?: string;
  capaciteMax?: number;
  niveau?: CourseLevel;
  dateHeure?: string;
  duree?: number;
}
