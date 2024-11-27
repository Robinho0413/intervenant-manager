import Form from '@/app/ui/interveners/create-form';
import Breadcrumbs from '@/app/ui/interveners/breadcrumbs';
import { fetchCustomers } from '@/app/lib/data';
 
export default async function Page() {
  const customers = await fetchCustomers();
 
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Intervenants', href: '/dashboard/interveners' },
          {
            label: 'Créer Intervenant',
            href: '/dashboard/interveners/create',
            active: true,
          },
        ]}
      />
      <Form customers={customers} />
    </main>
  );
}