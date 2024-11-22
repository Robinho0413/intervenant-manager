"use client";

import { useEffect, useState } from 'react';
import { fetchIntervenants } from '../../lib/data';
import { Intervenant } from '@/app/lib/definitions/intervenant';

export default function IntervenerPage() {
  const [intervenants, setIntervenants] = useState<Intervenant[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useEffect triggered');
    fetchIntervenants()
      .then((data) => {
        console.log('Fetched data:', data);
        setIntervenants(data);
      })
      .catch((e) => {
        console.error('Error fetching intervenants:', e);
        setError(e.message);
      });
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1 className='text-2xl font-semibold'>Gestion des intervenants</h1>
      <ul>
        {intervenants.map((intervenant) => (
          <li key={intervenant.id}>
            <p>
              {intervenant.id} - {intervenant.email}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}