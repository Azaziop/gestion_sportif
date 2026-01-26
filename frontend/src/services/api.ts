import axios from 'axios';
import type { Adherent, AdherentCreateRequest, AdherentUpdateRequest, PaginatedResponse, AuthResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', { username, password });
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', { username, password });
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
  },
  getCurrentProfile: async (): Promise<Adherent> => {
    const response = await apiClient.get<Adherent>('/profile');
    return response.data;
  },
  updateProfile: async (updates: Partial<Adherent>): Promise<Adherent> => {
    const response = await apiClient.put<Adherent>('/profile', updates);
    return response.data;
  },
  changePassword: async (oldPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>('/profile/password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  },
  getUserRole: (): string | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch {
      return null;
    }
  },
};

// Gestion des adhérents
export const adherentService = {
  // Créer un adhérent
  createAdherent: async (data: AdherentCreateRequest): Promise<Adherent> => {
    const response = await apiClient.post<Adherent>('/adherents', data);
    return response.data;
  },

  // Récupérer un adhérent par ID
  getAdherent: async (id: number): Promise<Adherent> => {
    const response = await apiClient.get<Adherent>(`/adherents/${id}`);
    return response.data;
  },

  // Récupérer un adhérent par email
  getAdherentByEmail: async (email: string): Promise<Adherent> => {
    const response = await apiClient.get<Adherent>(`/adherents/email/${email}`);
    return response.data;
  },

  // Mettre à jour un adhérent
  updateAdherent: async (id: number, data: AdherentUpdateRequest): Promise<Adherent> => {
    const response = await apiClient.put<Adherent>(`/adherents/${id}`, data);
    return response.data;
  },

  // Supprimer un adhérent
  deleteAdherent: async (id: number): Promise<void> => {
    await apiClient.delete(`/adherents/${id}`);
  },

  // Lister tous les adhérents (avec pagination)
  getAllAdherents: async (page: number = 0, size: number = 10): Promise<PaginatedResponse<Adherent>> => {
    const response = await apiClient.get<PaginatedResponse<Adherent>>('/adherents', {
      params: { page, size },
    });
    return response.data;
  },

  // Rechercher par statut
  getAdherentsByStatus: async (status: string, page: number = 0, size: number = 10): Promise<PaginatedResponse<Adherent>> => {
    const response = await apiClient.get<PaginatedResponse<Adherent>>(`/adherents/status/${status}`, {
      params: { page, size },
    });
    return response.data;
  },

  // Rechercher par type d'abonnement
  getAdherentsBySubscriptionType: async (type: string, page: number = 0, size: number = 10): Promise<PaginatedResponse<Adherent>> => {
    const response = await apiClient.get<PaginatedResponse<Adherent>>(`/adherents/subscription-type/${type}`, {
      params: { page, size },
    });
    return response.data;
  },

  // Suspendre un adhérent
  suspendAdherent: async (id: number, reason: string): Promise<Adherent> => {
    const response = await apiClient.post<Adherent>(`/adherents/${id}/suspend`, null, { params: { reason } });
    return response.data;
  },

  // Réactiver un adhérent
  reactivateAdherent: async (id: number): Promise<Adherent> => {
    const response = await apiClient.post<Adherent>(`/adherents/${id}/reactivate`);
    return response.data;
  },

  // Statistiques
  getStatistics: async () => {
    const response = await apiClient.get('/adherents/statistics');
    return response.data;
  },
};

export default apiClient;
