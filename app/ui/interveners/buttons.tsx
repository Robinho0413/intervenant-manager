'use client';

import { PencilIcon, PlusIcon, TrashIcon, KeyIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { deleteIntervenant, regenerateKeyIntervenant, regenerateAllKeysIntervenant } from '@/app/lib/actions';
import React from 'react';

export function CreateIntervenant() {
  return (
    <Link
      href="/dashboard/interveners/create"
      className="flex h-10 items-center rounded-lg bg-teal-600 px-4 text-sm font-medium text-white transition-colors hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
    >
      <span className="hidden md:block">Ajouter un intervenant</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateIntervenant({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/interveners/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteIntervenant({ id }: { id: string }) {
  const deleteIntervenantWithId = deleteIntervenant.bind(null, id);

  return (
    <form action={deleteIntervenantWithId}>
      <button className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Delete</span>
        <TrashIcon className="w-5" />
      </button>
    </form>
  );
}

export function RegenerateKeyIntervenant({ id }: { id: string }) {
  const regenerateKeyIntervenantWithId = regenerateKeyIntervenant.bind(null, id);

  return (
    <form action={regenerateKeyIntervenantWithId}>
      <button className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">Regénérer clé</span>
        <KeyIcon className="w-5" />
      </button>
    </form>
  );
}

export function RegenerateAllKeysButton() {
  const handleRegenerateAllKeys = async () => {
    await regenerateAllKeysIntervenant();
    // Optionally, you can add some logic to handle the response or update the UI
  };

  return (
    <button onClick={handleRegenerateAllKeys} className="flex h-10 items-center rounded-lg bg-teal-500 px-4 text-sm font-medium text-white transition-colors hover:bg-teal-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500">
      Régénérer toutes les clés
      <KeyIcon className="w-5 ml-3" />
    </button>
  );
}