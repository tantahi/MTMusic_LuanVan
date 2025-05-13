import DefaultLayout from '@/components/Layouts/DefaultLayout';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import ReportTable from '@/components/UserComponent/Admin/ReportTable';

export default function Page() {
  return (
    <>
    <DefaultLayout>
        <Breadcrumb pageName="Report" />
        <ReportTable/>
    </DefaultLayout>
    </>
  );
}
