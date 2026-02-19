// app/calendar/page.tsx (ou le chemin de ta page)
'use client';

import { useState, useEffect } from 'react';
import { Cours } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { CalendarView } from '@/components/calendar-view';
import { CourseForm } from '@/components/course-form';

export default function CalendarPage() {
  const [courses, setCourses] = useState<Cours[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getAllCours();
      setCourses(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load courses';
      console.error('[v0] Error loading courses:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // Callback pour rafraîchir la liste après création
  const handleCourseCreated = () => {
    setShowForm(false);
    loadCourses();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Planning des Cours</h1>
            <p className="mt-2 text-muted-foreground">
              Visualisez et gérez tous les cours
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90"
          >
            {showForm ? 'Annuler' : '+ Nouveau cours'}
          </button>
        </div>

        {/* Formulaire de création (conditionnel) */}
        {showForm && (
          <div className="mb-8">
            <CourseForm onSuccess={handleCourseCreated} />
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
            <p className="font-semibold">Erreur</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary" />
            <p className="mt-4 text-muted-foreground">Chargement du planning...</p>
          </div>
        ) : (
          <CalendarView courses={courses} />
        )}
      </div>
    </div>
  );
}