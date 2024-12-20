import Pagination from '@/app/ui/interveners/pagination';
import Table from '@/app/ui/interveners/table';
import { fetchIntervenantsPages, fetchIntervenants } from '@/app/lib/data';
import { CreateIntervenant, RegenerateAllKeysButton } from '@/app/ui/interveners/buttons';

export default async function IntervenerPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  const totalPages = await fetchIntervenantsPages(query);


  return (
    <div className='w-full'>
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl">Gestion des intervenants</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        {/* <Search placeholder="Rechercher un intervenant..." /> */}
        <CreateIntervenant />
        <RegenerateAllKeysButton />
      </div>
      <Table query={query} currentPage={currentPage} />
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}