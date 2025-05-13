import DefaultLayout from '@/components/Layouts/DefaultLayout';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import MediaApprovalTable from '@/components/UserComponent/Admin/MediaApprovalTable';

export default function Page() {
  return (
    <>
    <DefaultLayout>
        <Breadcrumb pageName="Pending Media" />
        <MediaApprovalTable/>
    </DefaultLayout>
    </>
  );
}
