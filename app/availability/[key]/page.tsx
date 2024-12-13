"use client";
import React from 'react';

import { fetchIntervenantByKey } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useEffect, useState, useRef } from 'react';
import frLocale from '@fullcalendar/core/locales/fr'; // Import de la locale française

function parseAvailabilityToEvents(availability, startDate) {
  const events = [];
  const baseDate = new Date(startDate);

  // Mapper les jours de la semaine en index
  const dayMapping = {
    lundi: 0,
    mardi: 1,
    mercredi: 2,
    jeudi: 3,
    vendredi: 4,
    samedi: 5,
    dimanche: 6,
  };

  // Fonction pour ajuster l'année en fonction du mois
  const adjustYear = (date) => {
    const month = date.getMonth();
    return month >= 0 && month <= 7 ? 2025 : 2024;
  };

  function adjustWeekStartDateFor2025(date) {
    if (date.getFullYear() === 2025) {
      const adjustedDate = new Date(date);
      adjustedDate.setDate(date.getDate() - 2); // Ajuster pour que l'année 2025 commence le lundi 30 décembre 2024
      return adjustedDate;
    }
    return date;
  }

  // Extraire les disponibilités par défaut
  const defaultSchedules = availability.default || [];

  // Identifier les semaines spécifiées
  const specifiedWeeks = Object.keys(availability)
    .filter((key) => key.startsWith('S'))
    .map((key) => parseInt(key.substring(1)));

  // Parcourir chaque semaine de l'année
  for (let week = 1; week <= 52; week++) {
    const weekKey = `S${week}`;
    const schedules = availability[weekKey] || defaultSchedules;

    // Calculer la date de début de la semaine
    const weekStartDate = new Date(baseDate);
    weekStartDate.setDate(baseDate.getDate() + (week - 1) * 7);

    // Appliquer les disponibilités
    schedules.forEach((schedule) => {
      const { days, from, to } = schedule;
      const dayList = days.split(',').map((d) => d.trim().toLowerCase());

      dayList.forEach((day) => {
        const dayOffset = dayMapping[day];
        if (dayOffset !== undefined) {
          let eventDate = new Date(weekStartDate);
          eventDate = adjustWeekStartDateFor2025(eventDate);
          eventDate.setDate(eventDate.getDate() + dayOffset);

          // Ajuster l'année selon le mois
          const adjustedYear = adjustYear(eventDate);
          eventDate.setFullYear(adjustedYear);

          // Générer les heures de début et de fin
          const [fromHour, fromMinute] = from.split(':').map(Number);
          const [toHour, toMinute] = to.split(':').map(Number);

          const startDateTime = new Date(eventDate);
          const endDateTime = new Date(eventDate);

          startDateTime.setHours(fromHour, fromMinute, 0, 0);
          endDateTime.setHours(toHour, toMinute, 0, 0);

          // Ajouter l'événement
          events.push({
            title: `Disponibilité (${from} - ${to})`,
            start: startDateTime.toISOString(),
            end: endDateTime.toISOString(),
          });
        }
      });
    });
  }

  return events;
}


export default function Page({ params }: { params: { key: string } }) {
  const { key } = React.use(params);
  const [intervenant, setIntervenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const calendarRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!key || typeof key !== 'string') {
        notFound();
        return;
      }

      try {
        setLoading(true); // Démarrer le chargement
        const intervenantData = await fetchIntervenantByKey(key);
        console.log(intervenantData);

        if (!intervenantData) {
          notFound();
        } else if (new Date(intervenantData.enddate) < new Date()) {
          setIntervenant(null); // L'événement est expiré
        } else {
          const startDate = '2024-01-01'; // Définir une date de référence
          const events = parseAvailabilityToEvents(intervenantData.availability, startDate);
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
      fetchData(); // Exécuter l'appel de données si `key` est définie
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
      <h1>Bonjour {intervenant.firstname} {intervenant.lastname}</h1>
      <FullCalendar
        innerRef={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
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
