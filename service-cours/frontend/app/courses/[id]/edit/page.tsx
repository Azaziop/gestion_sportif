'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Cours } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { CourseForm } from '@/components/course-form';
import { Button } from '@/components/ui/button';

export default function EditCoursePage() {
  const params = useParams();
  const courseId = parseInt(params.id as string);

  const [course, setCourse] = useState<Cours | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getCourseById(courseId);
        setCourse(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load course';
        console.error('[v0] Error loading course:', message);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary" />
            <p className="mt-4 text-muted-foreground">Chargement du cours...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Link href="/">
            <Button variant="outline" className="mb-6 bg-transparent">
              ← Retour
            </Button>
          </Link>
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
            <p className="font-semibold">Erreur</p>
            <p className="text-sm">{error || 'Cours non trouvé'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href={`/courses/${course.id}`}>
            <Button variant="outline">← Retour</Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Modifier le cours</h1>
        </div>

        {/* Form */}
        <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
          <CourseForm initialCourse={course} isEditing />
        </div>
      </div>
    </div>
  );
}
