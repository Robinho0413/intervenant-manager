"use client";
import React, { useEffect, useState, useRef } from "react";
import { fetchIntervenantByKey } from "@/app/lib/data";
import { notFound } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";

function parseAvailabilityToEvents(availability, startDate, endDate) {
  const events = [];
  const baseDate = new Date(startDate);
  const endPeriod = new Date(endDate);

  const dayMapping = {
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
      (weekNumber === 52 && currentYear === 2024) ||
      (weekNumber === 1 && currentYear === 2025)
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
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

export default function Page({ params }: { params: { key: string } }) {
  const { key } = React.use(params);
  const [intervenant, setIntervenant] = useState(null);
  const [loading, setLoading] = useState(true);
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
        console.log(intervenantData);

        if (!intervenantData) {
          notFound();
        } else {
          // Définir la période souhaitée
          const startDate = new Date(new Date().getFullYear(), 8, 2); // 2 Septembre
          const endDate = new Date(new Date().getFullYear() + 1, 5, 30); // 30 Juin prochain

          const events = parseAvailabilityToEvents(
            intervenantData.availability,
            startDate,
            endDate
          );
          setIntervenant({ ...intervenantData, events });
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
        events={intervenant?.events || []}
        editable={true}
        selectable={true}
        weekNumbers={true}
        weekends={false}
      />
    </div>
  );
}
