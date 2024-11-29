import Form from '@/app/ui/interveners/edit-form';
import Breadcrumbs from '@/app/ui/interveners/breadcrumbs';
import { fetchIntervenantById } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;
  const [intervenant] = await Promise.all([
    fetchIntervenantById(id),
  ]);

  if (!intervenant) {
    notFound();
  }
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Intervenants', href: '/dashboard/interveners' },
          {
            label: 'Editer',
            href: `/dashboard/interveners/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form intervenant={intervenant} />
    </main>
  );
}