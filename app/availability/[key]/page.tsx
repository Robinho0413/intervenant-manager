import { fetchIntervenantByKey } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { key: string } }) {
  const { key } = params;

  if (!key || typeof key !== 'string') {
    notFound();
  }

  try {
    const intervenant = await fetchIntervenantByKey(key);

    if (!intervenant) {
      notFound();
    } else if (new Date(intervenant.enddate) < new Date()) {
      return (
        <div>
          <h1>La clé est expirée.</h1>
        </div>
      );
    } else {
      return (
        <div>
          <h1>Bonjour {intervenant.firstname} {intervenant.lastname}</h1>
        </div>
      );
    }
  } catch (error) {
    notFound();
  }
}