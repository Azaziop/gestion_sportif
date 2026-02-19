'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Cours } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { getTypeIcon, formatDateTime } from '@/lib/course-utils';
import { Button } from '@/components/ui/button';

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = parseInt(params.id as string);

  const [course, setCourse] = useState<Cours | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!course) return;
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le cours "${course.titre}" ?`)) {
      return;
    }

    try {
      setDeleting(true);
      await apiClient.deleteCourse(course.id);
      router.push('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete course';
      console.error('[v0] Error deleting course:', message);
      setError(message);
    } finally {
      setDeleting(false);
    }
  };

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

  const availableSeats = course.capaciteMax - course.nombreInscrits;
  const occupancyPercent = (course.nombreInscrits / course.capaciteMax) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with back button */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/">
            <Button variant="outline">← Retour</Button>
          </Link>
          <Link href={`/courses/${course.id}/edit`}>
            <Button>Modifier ce cours</Button>
          </Link>
        </div>

        {/* Main card */}
        <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
          {/* Title section */}
          <div className="mb-8 flex items-start gap-4">
            <span className="text-5xl">{getTypeIcon(course.type)}</span>
            <div className="flex-1">
              <h1 className="mb-4 text-3xl font-bold text-foreground">{course.titre}</h1>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1 font-medium text-white ${
                    course.niveau === 'BASIC'
                      ? 'bg-green-600 dark:bg-green-700'
                      : 'bg-amber-600 dark:bg-amber-700'
                  }`}
                >
                  {course.niveau}
                </span>
                <span
                  className={`rounded-full px-3 py-1 font-medium text-white ${
                    course.statut === 'PLANIFIE'
                      ? 'bg-blue-600 dark:bg-blue-700'
                      : course.statut === 'EN_COURS'
                        ? 'bg-orange-600 dark:bg-orange-700'
                        : course.statut === 'TERMINE'
                          ? 'bg-gray-600 dark:bg-gray-700'
                          : 'bg-red-600 dark:bg-red-700'
                  }`}
                >
                  {course.statut}
                </span>
                <span className="rounded-full bg-primary px-3 py-1 font-medium text-primary-foreground">
                  {course.type}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="mb-3 text-lg font-semibold text-foreground">Description</h2>
            <p className="text-muted-foreground leading-relaxed">{course.description}</p>
          </div>

          {/* Details grid */}
          <div className="mb-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg bg-secondary/50 p-4">
              <p className="text-xs font-medium text-muted-foreground">Coach</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{course.coach}</p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4">
              <p className="text-xs font-medium text-muted-foreground">Salle</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{course.salle}</p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4">
              <p className="text-xs font-medium text-muted-foreground">Date et heure</p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {formatDateTime(course.dateHeure)}
              </p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4">
              <p className="text-xs font-medium text-muted-foreground">Durée</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{course.duree} minutes</p>
            </div>
          </div>

          {/* Occupancy section */}
          <div className="mb-8 rounded-lg bg-secondary/50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Réservations</h3>
              <span className="text-sm font-medium text-muted-foreground">
                {course.nombreInscrits}/{course.capaciteMax} places
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${occupancyPercent}%` }}
              />
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {occupancyPercent.toFixed(1)}% de capacité utilisée
              </span>
              <span
                className={`font-semibold ${
                  availableSeats > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {availableSeats > 0
                  ? `${availableSeats} place${availableSeats > 1 ? 's' : ''} libre${availableSeats > 1 ? 's' : ''}`
                  : 'Cours complet'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link href={`/courses/${course.id}/edit`} className="flex-1">
              <Button size="lg" className="w-full">
                Modifier le cours
              </Button>
            </Link>
            <Button
              size="lg"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1"
            >
              {deleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
