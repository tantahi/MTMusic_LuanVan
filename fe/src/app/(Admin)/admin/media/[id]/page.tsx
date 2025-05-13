import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import MediaForm from '@/components/UserComponent/Admin/MediaForm';

export default function Page({ params }: { params: { id: number } }) {
  return (
    <DefaultLayout>
      <div>
        <Breadcrumb pageName="Edit Media" />
        <MediaForm mediaId={params.id}></MediaForm>
      </div>
    </DefaultLayout>
  );
}
