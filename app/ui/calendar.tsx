"use client";

import React, { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import { saveAvailability } from "@/app/lib/actions";
import {
    parseAvailabilityToEvents,
    getWeekNumber,
} from "@/app/lib/utils"; // Assurez-vous d'extraire ces fonctions dans un fichier utils
import { SelectInfo, Availability, CalendarProps } from "@/app/lib/definitions/availability";

const Calendar: React.FC<CalendarProps> = ({ intervenant, startDate, endDate }: CalendarProps) => {
    const [events, setEvents] = useState(
        parseAvailabilityToEvents(intervenant.availability, startDate, endDate)
    );
    const calendarRef = useRef(null);

    const handleSelect = async (selectInfo: SelectInfo) => {
        const { start, end } = selectInfo;

        // Ajuster les heures pour correspondre à l'heure locale
        const adjustedStart = new Date(start);
        const adjustedEnd = new Date(end);

        const from = adjustedStart.toTimeString().slice(0, 5); // Format HH:mm
        const to = adjustedEnd.toTimeString().slice(0, 5);

        const newAvailability: Availability = {
            days: adjustedStart.toLocaleDateString("fr-FR", { weekday: "long" }).toLowerCase(),
            from,
            to,
        };

        const currentAvailability = intervenant.availability || {};
        const weekNumber = getWeekNumber(new Date(start));
        const availabilityForWeek = currentAvailability[`S${weekNumber}`] || [];
        availabilityForWeek.push(newAvailability);

        const updatedAvailability = {
            ...currentAvailability,
            [`S${weekNumber}`]: availabilityForWeek,
        };

        try {
            const response = await saveAvailability(intervenant.id, updatedAvailability);
            console.log(response.message);

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
};

export default Calendar;
