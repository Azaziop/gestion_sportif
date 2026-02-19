import { Cours, CreateCoursRequest, UpdateCoursRequest, CourseLevel } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log('🚀 API Request:', {
      url,
      method: options.method || 'GET',
      body: options.body,
    });

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log('📥 API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      let errorDetails;
      const contentType = response.headers.get('content-type');
      
      try {
        if (contentType?.includes('application/json')) {
          errorDetails = await response.json();
        } else {
          errorDetails = await response.text();
        }
      } catch (e) {
        errorDetails = 'No error details available';
      }

      console.error('❌ API Error Details:', errorDetails);
      
      // 🔍 AJOUT : Afficher spécifiquement les erreurs de validation
      if (errorDetails?.errors) {
        console.error('🔴 Validation Errors:', errorDetails.errors);
      }

      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      if (typeof errorDetails === 'object' && errorDetails !== null) {
        if (errorDetails.errors) {
          // Extraire les erreurs de validation Spring Boot
          const validationErrors = Object.entries(errorDetails.errors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join('\n');
          errorMessage = `Erreurs de validation:\n${validationErrors}`;
        } else if (errorDetails.message) {
          errorMessage = errorDetails.message;
        } else if (errorDetails.error) {
          errorMessage = errorDetails.error;
        }
      } else if (typeof errorDetails === 'string') {
        errorMessage = errorDetails;
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  async getAllCours(): Promise<Cours[]> {
    return this.request<Cours[]>('/cours');
  }

  async getCourseById(id: number): Promise<Cours> {
    return this.request<Cours>(`/cours/${id}`);
  }

  async createCourse(data: CreateCoursRequest): Promise<Cours> {
    return this.request<Cours>('/cours', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCourse(id: number, data: UpdateCoursRequest): Promise<Cours> {
    return this.request<Cours>(`/cours/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCourse(id: number): Promise<void> {
    return this.request<void>(`/cours/${id}`, {
      method: 'DELETE',
    });
  }

  async getCoursesByLevel(level: CourseLevel): Promise<Cours[]> {
    return this.request<Cours[]>(`/cours/niveau/${level}`);
  }

  async getAvailableCourses(): Promise<Cours[]> {
    return this.request<Cours[]>('/cours/disponibles');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);