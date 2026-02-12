import { CourseType } from '@/lib/types';

export function getTypeIcon(type: CourseType): string {
  const icons: Record<CourseType, string> = {
    YOGA: '🧘',
    FOOTBALL: '⚽',
    MUSCULATION: '💪',
    NATATION: '🏊',
    BOXE: '🥊',
    PILATES: '🤸',
    CROSSFIT: '🏃',
  };
  return icons[type] || '📚';
}

export function getTypeColor(type: CourseType): string {
  const colors: Record<CourseType, string> = {
    YOGA: '--course-yoga',
    FOOTBALL: '--course-football',
    MUSCULATION: '--course-musculation',
    NATATION: '--course-natation',
    BOXE: '--course-boxe',
    PILATES: '--course-pilates',
    CROSSFIT: '--primary',
  };
  return colors[type] || '--primary';
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(dateString: string): string {
  return `${formatDate(dateString)} à ${formatTime(dateString)}`;
}
