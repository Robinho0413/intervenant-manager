'use client';

import { IntervenantForm } from '@/app/lib/definitions/intervenant';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { updateIntervenant, State } from '@/app/lib/actions';
import { useActionState } from 'react';
import { formatDateToNumber } from '@/app/lib/utils';

export default function EditIntervenantForm({
  intervenant,
}: {
  intervenant: IntervenantForm;
}) {
  const initialState: State = { message: '', errors: {} };
  const updateIntervenantWithId = updateIntervenant.bind(null, intervenant.id);
  const [state, formAction] = useActionState(updateIntervenantWithId, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="email"
                name="email"
                type="text"
                defaultValue={intervenant.email}
                placeholder="Email de l'intervenant"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                required
                aria-describedby="email-error"
              />
            </div>
            <div id="email-error" aria-live="polite" aria-atomic="true">
              {state.errors?.email &&
                state.errors.email.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="firstname" className="mb-2 block text-sm font-medium">
            Prénom
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="firstname"
                name="firstname"
                type="text"
                defaultValue={intervenant.firstname}
                placeholder="Prénom de l'intervenant"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                required
                aria-describedby="firstname-error"
              />
            </div>
            <div id="firstname-error" aria-live="polite" aria-atomic="true">
              {state.errors?.firstname &&
                state.errors.firstname.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="lastname" className="mb-2 block text-sm font-medium">
            Nom
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="lastname"
                name="lastname"
                type="text"
                defaultValue={intervenant.lastname}
                placeholder="Nom de l'intervenant"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                required
                aria-describedby="lastname-error"
              />
            </div>
            <div id="lastname-error" aria-live="polite" aria-atomic="true">
              {state.errors?.lastname &&
                state.errors.lastname.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="enddate" className="mb-2 block text-sm font-medium">
              Date expiration de validité
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="enddate"
                  name="enddate"
                  type="date"
                  defaultValue={formatDateToNumber(intervenant.enddate)}
                  placeholder="Date d'expiration de validité"
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                  required
                  aria-describedby="enddate-error"
                />
              </div>
              <div id="enddate-error" aria-live="polite" aria-atomic="true">
                {state.errors?.enddate &&
                  state.errors.enddate.map((error: string) => (
                    <p className="mt-2 text-sm text-red-500" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/interveners"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Modifier</Button>
      </div>
    </form>
  );
}
