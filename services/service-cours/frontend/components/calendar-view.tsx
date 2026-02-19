'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Cours } from '@/lib/types';
import { getWeekDates, formatDateKey } from '@/lib/calendar-utils';
import { getTypeIcon, getTypeColor } from '@/lib/course-utils';
import { Button } from '@/components/ui/button';

interface CalendarViewProps {
  courses: Cours[];
}

export function CalendarView({ courses }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);

  // Group courses by date and time
  const coursesByDateTime = useMemo(() => {
    const grouping: Record<string, Record<string, Cours[]>> = {};

    courses.forEach((course) => {
      const courseDate = new Date(course.dateHeure);
      const dateKey = formatDateKey(courseDate);
      const timeKey = `${courseDate.getHours().toString().padStart(2, '0')}:00`;

      if (!grouping[dateKey]) {
        grouping[dateKey] = {};
      }
      if (!grouping[dateKey][timeKey]) {
        grouping[dateKey][timeKey] = [];
      }
      grouping[dateKey][timeKey].push(course);
    });

    return grouping;
  }, [courses]);

  const timeSlots = useMemo(() => {
    const slots = new Set<string>();
    Object.values(coursesByDateTime).forEach((daySchedule) => {
      Object.keys(daySchedule).forEach((time) => slots.add(time));
    });
    return Array.from(slots).sort();
  }, [coursesByDateTime]);

  const handlePrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
        <h2 className="text-lg font-semibold text-foreground">
          Semaine du {weekDates[0].toLocaleDateString('fr-FR')} au{' '}
          {weekDates[6].toLocaleDateString('fr-FR')}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevWeek}>
            ← Semaine précédente
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Aujourd'hui
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextWeek}>
            Semaine suivante →
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <div className="inline-block w-full min-w-full">
          {/* Header with days */}
          <div className="grid gap-0 border-b border-border" style={{ gridTemplateColumns: '100px repeat(7, 1fr)' }}>
            <div className="border-r border-border p-3 text-xs font-semibold text-muted-foreground">
              Heure
            </div>
            {weekDates.map((date) => (
              <div
                key={formatDateKey(date)}
                className="border-r border-border p-3 text-center text-xs font-semibold text-foreground"
              >
                <div>{date.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                <div>{date.getDate()}</div>
              </div>
            ))}
          </div>

          {/* Time slots */}
          {timeSlots.length > 0 ? (
            timeSlots.map((timeSlot) => (
              <div
                key={timeSlot}
                className="grid gap-0 border-b border-border"
                style={{ gridTemplateColumns: '100px repeat(7, 1fr)' }}
              >
                <div className="border-r border-border p-3 text-xs font-semibold text-muted-foreground">
                  {timeSlot}
                </div>
                {weekDates.map((date) => {
                  const dateKey = formatDateKey(date);
                  const daySchedule = coursesByDateTime[dateKey]?.[timeSlot] || [];

                  return (
                    <div key={`${dateKey}-${timeSlot}`} className="border-r border-border p-2 min-h-[100px]">
                      <div className="space-y-2">
                        {daySchedule.map((course) => {
                          const typeColor = getTypeColor(course.type);
                          const availableSeats = course.capaciteMax - course.nombreInscrits;

                          return (
                            <Link
                              key={course.id}
                              href={`/courses/${course.id}`}
                              className="block rounded-md p-2 text-xs transition-all hover:shadow-md"
                              style={{ backgroundColor: `var(${typeColor})` }}
                            >
                              <div className="font-semibold text-white line-clamp-2">
                                {getTypeIcon(course.type)} {course.titre}
                              </div>
                              <div className="mt-1 text-white/90">
                                {course.coach}
                              </div>
                              <div className="mt-1 flex items-center gap-1">
                                <span className="text-white/70">👥</span>
                                <span className="text-white/90">
                                  {course.nombreInscrits}/{course.capaciteMax}
                                </span>
                              </div>
                              {availableSeats > 0 && (
                                <div className="mt-1 text-xs text-white/70">
                                  {availableSeats} place{availableSeats > 1 ? 's' : ''}
                                </div>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Aucun cours cette semaine
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-3 text-sm font-semibold text-foreground">Légende des types de cours</p>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
          {['YOGA', 'FOOTBALL', 'MUSCULATION', 'NATATION', 'BOXE', 'PILATES'].map((type) => {
            const typeColor = getTypeColor(type as any);
            return (
              <div key={type} className="flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded-md"
                  style={{ backgroundColor: `var(${typeColor})` }}
                />
                <span className="text-xs text-foreground">{type}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
