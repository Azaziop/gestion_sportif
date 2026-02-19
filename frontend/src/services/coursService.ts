import apiClient from './api';
import type { Cours, CreateCoursRequest, UpdateCoursRequest, CourseLevel } from '../types';

export const coursService = {
  getAllCours: async (): Promise<Cours[]> => {
    const response = await apiClient.get<Cours[]>('/cours');
    return response.data;
  },

  getCourseById: async (id: number): Promise<Cours> => {
    const response = await apiClient.get<Cours>(`/cours/${id}`);
    return response.data;
  },

  createCourse: async (data: CreateCoursRequest): Promise<Cours> => {
    const response = await apiClient.post<Cours>('/cours', data);
    return response.data;
  },

  updateCourse: async (id: number, data: UpdateCoursRequest): Promise<Cours> => {
    const response = await apiClient.put<Cours>(`/cours/${id}`, data);
    return response.data;
  },

  deleteCourse: async (id: number): Promise<void> => {
    await apiClient.delete(`/cours/${id}`);
  },

  getCoursesByLevel: async (level: CourseLevel): Promise<Cours[]> => {
    const response = await apiClient.get<Cours[]>(`/cours/niveau/${level}`);
    return response.data;
  },

  getAvailableCourses: async (): Promise<Cours[]> => {
    const response = await apiClient.get<Cours[]>('/cours/disponibles');
    return response.data;
  },
};

export default coursService;
