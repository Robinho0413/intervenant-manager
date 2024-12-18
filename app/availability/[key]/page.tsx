"use client";
import React, { useEffect, useState, useRef } from "react";
import { fetchIntervenantByKey } from "@/app/lib/data";
import { notFound } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import { saveAvailability } from "@/app/lib/actions";
import { SelectInfo, Availability, WeekNumberFunction } from "@/app/lib/definitions/availability";

function parseAvailabilityToEvents(availability: Record<string, Availability[]>, startDate: Date, endDate: Date) {
  const events: { title: string; start: string; end: string; }[] = [];
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
              title: `Disponibilité (${from} - ${to})`,
              start: startDateTime.toISOString(),
              end: endDateTime.toISOString(),
            });
          }
        }
      });
    });

    // Passer à la semaine suivante
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }

  return events;
}


// Fonction pour obtenir le numéro de semaine
const getWeekNumber: WeekNumberFunction = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((Number(d) - Number(yearStart)) / 86400000 + 1) / 7);
};

export default function Page({ params }: { params: { key: string } }) {
  const { key } = React.use(params);
  const [intervenant, setIntervenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const calendarRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!key || typeof key !== "string") {
        notFound();
        return;
      }

      try {
        setLoading(true);
        const intervenantData = await fetchIntervenantByKey(key);

        if (!intervenantData) {
          notFound();
        } else {
          // Définir la période souhaitée
          const startDate = new Date(new Date().getFullYear(), 8, 2); // 2 Septembre
          const endDate = new Date(new Date().getFullYear() + 1, 5, 30); // 30 Juin prochain

          const events = parseAvailabilityToEvents(
            intervenantData.availability as unknown as Record<string, Availability[]>,
            startDate,
            endDate
          );
          setIntervenant({ ...intervenantData, events });
          setEvents(events);
        }
      } catch (error) {
        console.error(error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    if (key) {
      fetchData();
    }
  }, [key]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!intervenant) {
    return (
      <div>
        <h1>La clé est expirée ou invalide.</h1>
      </div>
    );
  }

  const handleSelect = async (selectInfo: SelectInfo) => {
    const { start, end } = selectInfo;
    const intervenantId: string = intervenant.id;

    // Ajuster les heures pour correspondre à l'heure locale
    const adjustedStart = new Date(start);
    const adjustedEnd = new Date(end);

    // Convertir en heure locale (format HH:mm)
    const from: string = adjustedStart.toTimeString().slice(0, 5); // Format HH:mm
    const to: string = adjustedEnd.toTimeString().slice(0, 5);

    // Créer une nouvelle disponibilité
    const newAvailability: Availability = {
      days: adjustedStart.toLocaleDateString("fr-FR", { weekday: "long" }).toLowerCase(),
      from,
      to,
    };

    // Charger les disponibilités existantes de l'intervenant
    const currentAvailability: Record<string, Availability[]> = intervenant.availability || {};

    // Vérifier si cette disponibilité existe déjà et ajouter/modifier la plage
    const weekNumber: number = getWeekNumber(new Date(start)); // Calculer le numéro de la semaine

    const availabilityForWeek: Availability[] = currentAvailability[`S${weekNumber}`] || [];
    availabilityForWeek.push(newAvailability);

    // Mettre à jour les disponibilités dans l'objet
    const updatedAvailability: Record<string, Availability[]> = {
      ...currentAvailability,
      [`S${weekNumber}`]: availabilityForWeek,
    };

    try {
      // Sauvegarder les disponibilités mises à jour dans la base de données
      const response = await saveAvailability(intervenantId, updatedAvailability);
      console.log(response.message);

      // Mettre à jour l'état des événements
      const newEvent = {
        title: `Disponibilité (${from} - ${to})`,
        start: start.toISOString(),
        end: end.toISOString(),
      };
      setEvents([...events, newEvent]);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la disponibilité :", error);
    }
    selectInfo.view.calendar.unselect();
  };


  return (
    <div>
      <h1>
        Bonjour {intervenant.firstname} {intervenant.lastname}
      </h1>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        locale="fr"
        locales={[frLocale]}
        initialView="timeGridWeek"
        events={events}
        editable={true}
        selectable={true}
        weekNumbers={true}
        weekends={false}
        select={handleSelect}
      />
    </div>
  );
}