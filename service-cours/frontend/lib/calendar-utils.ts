export function getWeekDates(startDate: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);
  const dayOfWeek = current.getDay();
  const diff = current.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday

  const monday = new Date(current.setDate(diff));
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }
  return dates;
}

export function getMonthDates(year: number, month: number): Date[] {
  const dates: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Add previous month's days to fill the first week
  const dayOfWeek = firstDay.getDay();
  const diff = firstDay.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const startDate = new Date(firstDay);
  startDate.setDate(diff);

  // Add all days
  let current = new Date(startDate);
  while (current <= lastDay) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // Add next month's days to complete the last week
  while (dates.length % 7 !== 0) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatDateRange(startDate: Date, endDate: Date): string {
  const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
  const start = startDate.toLocaleDateString('fr-FR', options);
  const end = endDate.toLocaleDateString('fr-FR', {
    ...options,
    year: 'numeric',
  });
  return `${start} - ${end}`;
}

export function getTimeSlots(): string[] {
  const slots: string[] = [];
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0');
    slots.push(`${hour}:00`);
    slots.push(`${hour}:30`);
  }
  return slots;
}
