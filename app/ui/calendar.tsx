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
} from "@/app/lib/utils";
import { SelectInfo, Availability, CalendarProps } from "@/app/lib/definitions/availability";
import { TrashIcon } from '@heroicons/react/24/outline';


const Calendar: React.FC<CalendarProps> = ({ intervenant, startDate, endDate }: CalendarProps) => {
    const [events, setEvents] = useState(
        parseAvailabilityToEvents(intervenant.availability, startDate, endDate)
    );

    const updateAvailabilityAndEvents = (updatedAvailability: any) => {
        intervenant.availability = updatedAvailability; // Mettez à jour les disponibilités de l'intervenant
        setEvents(parseAvailabilityToEvents(updatedAvailability, startDate, endDate)); // Recréez les événements
    };

    const handleSelect = async (selectInfo: SelectInfo) => {
        const { start, end } = selectInfo;

        const adjustedStart = new Date(start);
        const adjustedEnd = new Date(end);

        const formatTime = (date: Date) => {
            const hours = date.getHours();
            const minutes = date.getMinutes();
            return `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
        };

        const from = formatTime(adjustedStart);
        const to = formatTime(adjustedEnd);

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
            updateAvailabilityAndEvents(updatedAvailability);
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de la disponibilité :", error);
        }

        selectInfo.view.calendar.unselect();
    };

    const handleDeleteEvent = async (eventId: string) => {
    const event = events.find((event: { id: string }) => event.id === eventId);

    if (!event) {
        console.error("Événement introuvable.");
        return;
    }

    const adjustedStart = new Date(event.start);
    const adjustedEnd = new Date(event.end);

    const formatTime = (date: Date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
    };

    const from = formatTime(adjustedStart);
    const to = formatTime(adjustedEnd);
    const dayToDelete = adjustedStart
        .toLocaleDateString("fr-FR", { weekday: "long" })
        .toLowerCase();
    const weekKey = `S${getWeekNumber(new Date(event.start))}`;

    try {
        const currentAvailability = intervenant.availability || {};

        const updatedAvailability = {
            ...currentAvailability,
            [weekKey]: (currentAvailability[weekKey] || []).flatMap((slot: any) => {
                // Si les plages horaires correspondent
                if (slot.from === from && slot.to === to) {
                    // Retirer le jour supprimé
                    const daysArray = slot.days.split(', ').filter((day: string) => day !== dayToDelete);
                    if (daysArray.length > 0) {
                        // Conserver la plage avec les jours restants
                        return [{ ...slot, days: daysArray.join(', ') }];
                    } else {
                        // Supprimer la plage entière si aucun jour ne reste
                        return [];
                    }
                }
                // Conserver les autres plages
                return [slot];
            }),
        };

        // Supprimer la semaine si elle est vide
        if (updatedAvailability[weekKey]?.length === 0) {
            delete updatedAvailability[weekKey];
        }

        const response = await saveAvailability(intervenant.id, updatedAvailability);
        console.log(response.message);

        // Mettre à jour les disponibilités et les événements
        updateAvailabilityAndEvents(updatedAvailability);
    } catch (error) {
        console.error("Erreur lors de la suppression de la disponibilité :", error);
    }
};


    const renderEventContent = (eventInfo: any) => {
        return (
            <div className="flex items-center justify-between">
                <span>{eventInfo.event.title}</span>
                <button
                    className="flex items-center justify-center rounded-sm p-0.5 hover:bg-red-500 hover:text-white"
                    onClick={() => handleDeleteEvent(eventInfo.event.id)}
                >
                    <TrashIcon className="w-4" />
                </button>
            </div>
        );
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">
                {intervenant.firstname} {intervenant.lastname}
            </h1>
            <FullCalendar
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
                eventContent={renderEventContent}
            />
        </div>
    );
};


export default Calendar;
