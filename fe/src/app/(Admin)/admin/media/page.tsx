import DefaultLayout from '@/components/Layouts/DefaultLayout';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import MediaTable from '@/components/UserComponent/Admin/MediaTable';

export default function Page() {
  return (
    <>
    <DefaultLayout>
        <Breadcrumb pageName="Media" />
        <MediaTable/>
    </DefaultLayout>
    </>
  );
}
