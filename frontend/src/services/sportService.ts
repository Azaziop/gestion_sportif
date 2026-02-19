import apiClient from './api';
import type { Reservation, Sport, Cours } from '../types';

const mapCoursToSport = (cours: Cours): Sport => {
  const now = new Date();
  const start = new Date(cours.dateHeure);
  let statut: Sport['statut'] = 'PREVU';

  if (cours.actif === false) {
    statut = 'ANNULE';
  } else if (start.getTime() < now.getTime()) {
    statut = 'TERMINE';
  }

  return {
    id: cours.id,
    nom: cours.titre,
    description: cours.description,
    lieu: cours.salle,
    dateDebut: cours.dateHeure,
    coach: cours.coach,
    capaciteMax: cours.capaciteMax,
    capaciteActuelle: cours.nombreInscrits ?? 0,
    statut,
  };
};

export const sportService = {
  getAll: async (): Promise<Sport[]> => {
    const response = await apiClient.get<Cours[]>('/cours');
    return response.data.map(mapCoursToSport);
  },

  getMyReservations: async (adherentId: number): Promise<Reservation[]> => {
    const response = await apiClient.get<Reservation[]>(`/reservations/adherent/${adherentId}`);
    return response.data;
  },

  getAllReservations: async (): Promise<Reservation[]> => {
    const response = await apiClient.get<Reservation[]>('/reservations');
    return response.data;
  },

  getById: async (id: number): Promise<Reservation> => {
    const response = await apiClient.get<Reservation>(`/reservations/${id}`);
    return response.data;
  },

  create: async (sportId: number, adherentId: number): Promise<Reservation> => {
    const response = await apiClient.post<Reservation>('/reservations', {
      coursId: sportId,
      adherentId,
    });
    return response.data;
  },

  cancel: async (id: number): Promise<Reservation> => {
    const response = await apiClient.delete<Reservation>(`/reservations/${id}`, {
      data: { motif: "Annulation utilisateur" },
    });
    return response.data;
  },

  getAvailableSports: async (): Promise<Sport[]> => {
    const response = await apiClient.get<Cours[]>('/cours/disponibles');
    return response.data.map(mapCoursToSport);
  },

  getAllSports: async (): Promise<Sport[]> => {
    const response = await apiClient.get<Cours[]>('/cours');
    return response.data.map(mapCoursToSport);
  },

  getSportById: async (id: number): Promise<Sport> => {
    const response = await apiClient.get<Cours>(`/cours/${id}`);
    return mapCoursToSport(response.data);
  },
};

export default sportService;
