"use client";
import React from 'react';

import { fetchIntervenantByKey } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useEffect, useState } from 'react';

export default function Page({ params }: { params: { key: string } }) {
  // Déballer params avec React.use()
  const { key } = React.use(params); // Utilisation de React.use() pour déballer params
  const [intervenant, setIntervenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!key || typeof key !== 'string') {
        notFound();
        return;
      }

      try {
        setLoading(true); // Démarrer le chargement
        const intervenantData = await fetchIntervenantByKey(key);

        if (!intervenantData) {
          notFound();
        } else if (new Date(intervenantData.enddate) < new Date()) {
          setIntervenant(null); // L'événement est expiré
        } else {
          setIntervenant(intervenantData); // Mettre à jour les données de l'intervenant
        }
      } catch (error) {
        console.error(error); // Afficher l'erreur
        notFound(); // Si une erreur se produit, afficher la page 404
      } finally {
        setLoading(false); // Assurez-vous de mettre à jour l'état de chargement
      }
    };

    if (key) {
      fetchData(); // Exécuter l'appel de données si `key` est définie
    }
  }, [key]); // Réexécuter le hook lorsque `key` change

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

  // Exemple de données d'événements (remplacer par des données réelles)
  const events = [
    { title: 'Événement 1', start: '2024-12-15', end: '2024-12-16' },
    { title: 'Événement 2', start: '2024-12-20' },
  ];

  return (
    <div>
      <h1>Bonjour {intervenant.firstname} {intervenant.lastname}</h1>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events} // Remplacer par des événements réels
        editable={true}
        selectable={true}
      />
    </div>
  );
}
