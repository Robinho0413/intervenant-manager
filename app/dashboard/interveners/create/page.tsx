import Form from '@/app/ui/interveners/create-form';
import Breadcrumbs from '@/app/ui/interveners/breadcrumbs';
 
export default async function Page() {
 
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
      <Form />
    </main>
  );
}