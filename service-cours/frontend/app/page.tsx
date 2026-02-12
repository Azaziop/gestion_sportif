'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Cours, CourseType, CourseLevel } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { CourseCard } from '@/components/course-card';
import { CourseFilters } from '@/components/course-filters';
import { Button } from '@/components/ui/button';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Cours[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<CourseType>();
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel>();
  const [selectedCoach, setSelectedCoach] = useState<string>();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Load courses
  useEffect(() => {
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

    loadCourses();
  }, []);

  // Get unique coaches from courses
  const coaches = useMemo(() => {
    return Array.from(new Set(courses.map((c) => c.coach))).sort();
  }, [courses]);

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        if (
          !course.titre.toLowerCase().includes(query) &&
          !course.description.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Type filter
      if (selectedType && course.type !== selectedType) {
        return false;
      }

      // Level filter
      if (selectedLevel && course.niveau !== selectedLevel) {
        return false;
      }

      // Coach filter
      if (selectedCoach && course.coach !== selectedCoach) {
        return false;
      }

      return true;
    });
  }, [courses, searchQuery, selectedType, selectedLevel, selectedCoach]);

  // Handle course deletion
  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await apiClient.deleteCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete course';
      console.error('[v0] Error deleting course:', message);
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header amélioré */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-8 shadow-xl border border-primary/20 backdrop-blur-sm">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
                <span className="text-5xl">🏋️</span>
                Gestion des Cours
              </h1>
              <p className="mt-3 text-lg text-muted-foreground">
                {filteredCourses.length} cours
                {searchQuery || selectedType || selectedLevel || selectedCoach
                  ? ' trouvé(s)'
                  : ' au total'}
              </p>
            </div>
            <Link href="/courses/new">
              <Button 
                size="lg" 
                className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nouveau Cours
              </Button>
            </Link>
          </div>
        </div>

        {/* Error message amélioré */}
        {error && (
          <div className="mb-6 rounded-xl border-2 border-red-500 bg-red-50 dark:bg-red-950/30 p-5 shadow-lg animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <svg 
                className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <div className="flex-1">
                <p className="font-semibold text-red-800 dark:text-red-200">Erreur</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Layout: Filters + Courses */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          
          {/* Filters sidebar avec sticky */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8">
              <CourseFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedType={selectedType}
                onTypeChange={setSelectedType}
                selectedLevel={selectedLevel}
                onLevelChange={setSelectedLevel}
                selectedCoach={selectedCoach}
                onCoachChange={setSelectedCoach}
                coaches={coaches}
              />
            </div>
          </aside>

          {/* Courses grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-16 shadow-xl">
                <div className="relative">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-border border-t-primary shadow-lg" />
                  <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border-4 border-primary opacity-20" />
                </div>
                <p className="mt-6 text-lg font-medium text-muted-foreground animate-pulse">
                  Chargement des cours...
                </p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/50 bg-card/30 backdrop-blur-sm p-16 shadow-xl">
                <div className="text-7xl mb-4 animate-bounce">🔍</div>
                <p className="text-2xl font-semibold text-foreground">Aucun cours trouvé</p>
                <p className="mt-3 text-muted-foreground text-center max-w-md">
                  {searchQuery || selectedType || selectedLevel || selectedCoach
                    ? 'Essayez de modifier vos filtres'
                    : 'Créez un nouveau cours pour commencer'}
                </p>
                {!searchQuery && !selectedType && !selectedLevel && !selectedCoach && (
                  <Link href="/courses/new" className="mt-6">
                    <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Créer un cours
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {filteredCourses.map((course, index) => (
                  <div 
                    key={course.id}
                    className="animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CourseCard
                      course={course}
                      onDelete={handleDelete}
                      isLoading={deletingId === course.id}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}