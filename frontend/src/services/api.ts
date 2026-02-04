import axios from 'axios';
import type { Adherent, AdherentCreateRequest, AdherentUpdateRequest, PaginatedResponse, AuthResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

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

// Intercepteur de réponse pour gérer les erreurs 401 (token expiré)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Ne pas rediriger si c'est une erreur de login (credentials invalides)
    const isAuthEndpoint = error.config?.url?.includes('/auth/');
    
    if (error.response?.status === 401 && !isAuthEndpoint) {
      console.log('Token expiré ou invalide, déconnexion...');
      // Token expiré ou invalide - déconnecter l'utilisateur
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      // Notifier l'app pour une déconnexion propre (sans manipulation DOM directe)
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', { username, password });
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  login: async (username: string, password: string): Promise<AuthResponse> => {
    console.log('Tentative de login avec:', { username, password: '***' });
    console.log('URL complète:', `${API_BASE_URL}/auth/login`);
    const response = await apiClient.post<AuthResponse>('/auth/login', { username, password });
    console.log('Réponse reçue:', response);
    console.log('Token dans réponse:', response.data?.token);
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
      console.log('Token stocké dans localStorage');
    } else {
      console.error('Pas de token dans la réponse!');
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
    const token = localStorage.getItem('token');
    const response = await apiClient.put<Adherent>('/profile', updates, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
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
  getUsername: (): string | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || null;
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
    const token = localStorage.getItem('token');
    const response = await apiClient.put<Adherent>(`/adherents/${id}`, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
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

  // Mettre à jour le certificat médical
  updateMedicalCertificate: async (id: number, expiryDate: string): Promise<Adherent> => {
    const response = await apiClient.put<Adherent>(`/adherents/${id}/medical-certificate`, null, {
      params: { expiryDate }
    });
    return response.data;
  },

  // Créer une abonnement
  createSubscription: async (data: { type: string; price: number; durationMonths?: number; startDate?: string }): Promise<any> => {
    const response = await apiClient.post('/subscriptions', data);
    return response.data;
  },

  // Récupérer tous les abonnements
  getAllSubscriptions: async (): Promise<any[]> => {
    const response = await apiClient.get('/subscriptions');
    // La réponse est paginée, extraire le tableau 'content'
    return Array.isArray(response.data) ? response.data : (response.data.content || []);
  },

  // Récupérer un abonnement par ID
  getSubscription: async (id: number): Promise<any> => {
    const response = await apiClient.get(`/subscriptions/${id}`);
    return response.data;
  },

  // Mettre à jour un abonnement
  updateSubscription: async (
    id: number,
    data: { type?: string; price?: number; weeklySessions?: number; durationMonths?: number; startDate?: string }
  ): Promise<any> => {
    const response = await apiClient.put(`/subscriptions/${id}`, data);
    return response.data;
  },

  // Supprimer un abonnement
  deleteSubscription: async (id: number): Promise<void> => {
    await apiClient.delete(`/subscriptions/${id}`);
  },

  // Récupérer les abonnements par type
  getSubscriptionsByType: async (type: string): Promise<any[]> => {
    const response = await apiClient.get(`/subscriptions/type/${type}`);
    return response.data;
  },
  // Récupérer les types d'abonnement disponibles
  getSubscriptionTypes: async (): Promise<string[]> => {
    const response = await apiClient.get('/subscriptions/types/available');
    return response.data;
  },

  // Assigner un abonnement à un adhérent
  assignSubscriptionToAdherent: async (adherentId: number, subscriptionId: number): Promise<any> => {
    const response = await apiClient.post(`/adherents/${adherentId}/subscription/${subscriptionId}`);
    return response.data;
  },

  // Retirer l'abonnement d'un adhérent
  removeSubscriptionFromAdherent: async (adherentId: number): Promise<any> => {
    const response = await apiClient.delete(`/adherents/${adherentId}/subscription`);
    return response.data;
  },
  // Rapports - Statistiques générales
  getGeneralStatistics: async (): Promise<any> => {
    const response = await apiClient.get('/reports/general-statistics');
    return response.data;
  },

  // Rapports - Statistiques abonnements
  getSubscriptionStatistics: async (): Promise<any> => {
    const response = await apiClient.get('/reports/subscription-statistics');
    return response.data;
  },

  // Rapports - Adhérents par statut
  getAdherentsByStatusReport: async (): Promise<any> => {
    const response = await apiClient.get('/reports/adherents-by-status');
    return response.data;
  },

  // Rapports - Rapport mensuel
  getMonthlyReport: async (month: number, year: number): Promise<any> => {
    const response = await apiClient.get('/reports/monthly', {
      params: { month, year }
    });
    return response.data;
  },

  // ===== GESTION DES RÔLES =====
  
  // Assigner un rôle à un utilisateur
  assignRole: async (userId: number, role: string, reason?: string): Promise<any> => {
    const response = await apiClient.patch(`/users/${userId}/role`, null, {
      params: { role, reason }
    });
    return response.data;
  },

  // Changement de rôle en masse
  bulkUpdateRoles: async (userIds: number[], role: string, reason?: string): Promise<any> => {
    const response = await apiClient.post('/users/bulk/role', {
      userIds,
      role,
      reason
    });
    return response.data;
  },

  // Rechercher des utilisateurs par rôle
  getUsersByRole: async (role: string): Promise<any> => {
    const response = await apiClient.get(`/users/by-role/${role}`);
    return response.data;
  },

  // Désactiver un utilisateur
  disableUser: async (userId: number, reason?: string): Promise<any> => {
    const response = await apiClient.post(`/users/${userId}/disable`, null, {
      params: { reason }
    });
    return response.data;
  },

  // Activer un utilisateur
  enableUser: async (userId: number, role?: string, reason?: string): Promise<any> => {
    const response = await apiClient.post(`/users/${userId}/enable`, null, {
      params: { roleStr: role, reason }
    });
    return response.data;
  },

  // Désactivation en masse
  bulkDisableUsers: async (userIds: number[], reason?: string): Promise<any> => {
    const response = await apiClient.post('/users/bulk/disable', {
      userIds,
      reason
    });
    return response.data;
  },

  // ===== RÔLES ET HIÉRARCHIE =====
  
  // Liste les rôles disponibles
  getAvailableRoles: async (): Promise<string[]> => {
    const response = await apiClient.get('/users/roles/available');
    return response.data;
  },

  // Liste les rôles assignables par l'utilisateur actuel
  getAssignableRoles: async (): Promise<any[]> => {
    const response = await apiClient.get('/users/roles/assignable');
    return response.data;
  },

  // Obtient la hiérarchie des rôles
  getRoleHierarchy: async (): Promise<any> => {
    const response = await apiClient.get('/users/roles/hierarchy');
    return response.data;
  },

  // ===== HISTORIQUE DES CHANGEMENTS =====
  
  // Historique des changements de rôles pour un utilisateur
  getRoleHistory: async (userId: number, page = 0, size = 10): Promise<any> => {
    const response = await apiClient.get(`/users/${userId}/role-history`, {
      params: { page, size }
    });
    return response.data;
  },

  // Historique de tous les changements de rôles
  getAllRoleHistory: async (page = 0, size = 10): Promise<any> => {
    const response = await apiClient.get('/users/role-history/all', {
      params: { page, size }
    });
    return response.data;
  },

  // Derniers changements de rôles
  getRecentRoleChanges: async (): Promise<any> => {
    const response = await apiClient.get('/users/role-history/recent');
    return response.data;
  },

  // Nombre de changements de rôles pour un utilisateur
  countRoleChanges: async (userId: number): Promise<number> => {
    const response = await apiClient.get(`/users/${userId}/role-history/count`);
    return response.data;
  },

  // ===== STATISTIQUES =====
  
  // Statistiques par rôle
  getUserStatistics: async (): Promise<any> => {
    const response = await apiClient.get('/users/stats/by-role');
    return response.data;
  },
};

export default apiClient;
