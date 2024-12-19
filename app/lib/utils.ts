import { Availability } from "./definitions/availability";
import { v4 as uuid } from 'uuid';

export const formatCurrency = (amount: number) => {
  return (amount / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
};

export const formatDateToLocal = (
  dateStr: string,
  locale: string = 'en-US',
) => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};

export const formatDateToNumber = (dateStr: string) => {
  return new Date(dateStr).toISOString().split('T')[0];
};

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};

export function parseAvailabilityToEvents(
  availability: Record<string, Availability[]>,
  startDate: Date,
  endDate: Date
) {
  const events: { id: string; title: string; start: string; end: string }[] = [];
  const baseDate = new Date(startDate);
  const endPeriod = new Date(endDate);

  const dayMapping: Record<string, number> = {
    lundi: 0,
    mardi: 1,
    mercredi: 2,
    jeudi: 3,
    vendredi: 4,
    samedi: 5,
    dimanche: 6,
  };

  const defaultSchedules = availability.default || [];
  let currentWeekStart = new Date(baseDate);

  while (currentWeekStart <= endPeriod) {
    const weekNumber = getWeekNumber(currentWeekStart);
    const currentYear = currentWeekStart.getFullYear();

        // Filtrer la semaine 52 de 2024 et la semaine 1 de 2025
        if (
          (weekNumber === 52 && currentYear === 2024)
        ) {
          currentWeekStart.setDate(currentWeekStart.getDate() + 14);
          continue; // Passer à la semaine suivante
        }

    const weekSchedules =
      availability[`S${weekNumber}`] || defaultSchedules;

    weekSchedules.forEach((schedule) => {
      const { days, from, to } = schedule;
      const dayList = days.split(",").map((d) => d.trim().toLowerCase());

      dayList.forEach((day) => {
        const dayOffset = dayMapping[day];
        if (dayOffset !== undefined) {
          const eventDate = new Date(currentWeekStart);
          eventDate.setDate(eventDate.getDate() + dayOffset);

          if (eventDate >= baseDate && eventDate <= endPeriod) {
            const [fromHour, fromMinute] = from.split(":").map(Number);
            const [toHour, toMinute] = to.split(":").map(Number);

            const startDateTime = new Date(eventDate);
            const endDateTime = new Date(eventDate);

            startDateTime.setHours(fromHour, fromMinute, 0, 0);
            endDateTime.setHours(toHour, toMinute, 0, 0);

            events.push({
              id: uuid(),
              title: `Disponibilité (${from} - ${to})`,
              start: startDateTime.toISOString(),
              end: endDateTime.toISOString(),
            });
          }
        }
      });
    });

    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }

  return events;
}

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((Number(d) - Number(yearStart)) / 86400000 + 1) / 7);
}