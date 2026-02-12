export type CourseType = 'YOGA' | 'FOOTBALL' | 'MUSCULATION' | 'NATATION' | 'BOXE' | 'PILATES' | 'CROSSFIT';
export type CourseLevel = 'BASIC' | 'PREMIUM';
export type CourseStatus = 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'ANNULE';

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

// ✅ CORRIGÉ : Suppression de statut, type devient string
export interface CreateCoursRequest {
  titre: string;
  description: string;
  type: string;
  coach: string;
  salle: string;
  capaciteMax: number;
  niveau: CourseLevel;
  dateHeure: string;  // Format ISO: "2026-01-30T14:30:00"
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