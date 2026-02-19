'use client';

import { CourseType, CourseLevel } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface CourseFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedType?: CourseType;
  onTypeChange: (type?: CourseType) => void;
  selectedLevel?: CourseLevel;
  onLevelChange: (level?: CourseLevel) => void;
  selectedCoach?: string;
  onCoachChange: (coach?: string) => void;
  coaches: string[];
}

const courseTypes: CourseType[] = ['YOGA', 'FOOTBALL', 'MUSCULATION', 'NATATION', 'BOXE', 'PILATES', 'CROSSFIT'];
const courseLevels: CourseLevel[] = ['BASIC', 'PREMIUM'];

export function CourseFilters({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedLevel,
  onLevelChange,
  selectedCoach,
  onCoachChange,
  coaches,
}: CourseFiltersProps) {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      {/* Search */}
      <div>
        <label className="mb-2 block text-sm font-medium">Rechercher</label>
        <input
          type="text"
          placeholder="Titre, description..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Type filter */}
      <div>
        <label className="mb-2 block text-sm font-medium">Type de cours</label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!selectedType ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTypeChange(undefined)}
            className="text-xs"
          >
            Tous
          </Button>
          {courseTypes.map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTypeChange(type)}
              className="text-xs"
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Level filter */}
      <div>
        <label className="mb-2 block text-sm font-medium">Niveau d'accès</label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!selectedLevel ? 'default' : 'outline'}
            size="sm"
            onClick={() => onLevelChange(undefined)}
            className="text-xs"
          >
            Tous
          </Button>
          {courseLevels.map((level) => (
            <Button
              key={level}
              variant={selectedLevel === level ? 'default' : 'outline'}
              size="sm"
              onClick={() => onLevelChange(level)}
              className={`text-xs ${
                level === 'BASIC'
                  ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100'
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-100'
              }`}
            >
              {level}
            </Button>
          ))}
        </div>
      </div>

      {/* Coach filter */}
      {coaches.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium">Coach</label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={!selectedCoach ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCoachChange(undefined)}
              className="text-xs"
            >
              Tous
            </Button>
            {coaches.map((coach) => (
              <Button
                key={coach}
                variant={selectedCoach === coach ? 'default' : 'outline'}
                size="sm"
                onClick={() => onCoachChange(coach)}
                className="text-xs"
              >
                {coach}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
