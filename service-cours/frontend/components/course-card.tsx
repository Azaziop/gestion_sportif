'use client';

import Link from 'next/link';
import { Cours } from '@/lib/types';
import { getTypeIcon, getTypeColor } from '@/lib/course-utils';
import { Button } from '@/components/ui/button';

interface CourseCardProps {
  course: Cours;
  onDelete?: (id: number) => void;
  isLoading?: boolean;
}

export function CourseCard({ course, onDelete, isLoading }: CourseCardProps) {
  const availableSeats = course.capaciteMax - course.nombreInscrits;
  const occupancyPercent = (course.nombreInscrits / course.capaciteMax) * 100;
  const typeColor = getTypeColor(course.type);

  const handleDelete = () => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le cours "${course.titre}" ?`)) {
      onDelete?.(course.id);
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      {/* Card Content */}
      <div className="p-6 flex-1">
        {/* Header with type badge */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-2xl flex-shrink-0">{getTypeIcon(course.type)}</span>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-card-foreground line-clamp-2 mb-1">
                {course.titre}
              </h3>
              <span
                className="inline-block rounded-full px-2.5 py-1 text-xs font-medium text-white"
                style={{ backgroundColor: `var(${typeColor})` }}
              >
                {course.type}
              </span>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="mb-4 flex flex-wrap gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              course.niveau === 'BASIC'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
            }`}
          >
            {course.niveau}
          </span>
          {course.statut && (
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                course.statut === 'PLANIFIE'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                  : course.statut === 'EN_COURS'
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100'
                    : course.statut === 'TERMINE'
                      ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
              }`}
            >
              {course.statut}
            </span>
          )}
        </div>

        {/* Details grid */}
        <div className="mb-4 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Coach:</span>
            <span className="font-medium text-foreground">{course.coach}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Salle:</span>
            <span className="font-medium text-foreground">{course.salle}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Date & Heure:</span>
            <span className="font-medium text-foreground">
              {new Date(course.dateHeure).toLocaleDateString('fr-FR')} {new Date(course.dateHeure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Durée:</span>
            <span className="font-medium text-foreground">{course.duree} min</span>
          </div>
        </div>

        {/* Occupancy bar */}
        <div className="mb-0">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">Places:</span>
            <span className="text-muted-foreground">
              {course.nombreInscrits}/{course.capaciteMax}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
          {availableSeats > 0 ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {availableSeats} place{availableSeats > 1 ? 's' : ''} disponible{availableSeats > 1 ? 's' : ''}
            </p>
          ) : (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">
              Complet
            </p>
          )}
        </div>
      </div>

      {/* Actions Footer */}
      <div className="flex flex-col gap-2 p-4 bg-muted/30 border-t border-border">
        {/* Première ligne: Voir détails + Modifier */}
        <div className="flex gap-2">
          <Link href={`/courses/${course.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              Voir détails
            </Button>
          </Link>
          <Link href={`/courses/${course.id}/edit`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              Modifier
            </Button>
          </Link>
        </div>
        
        {/* Deuxième ligne: Supprimer en pleine largeur */}
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={handleDelete}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Suppression...
            </span>
          ) : (
            'Supprimer'
          )}
        </Button>
      </div>
    </div>
  );
}