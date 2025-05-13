import DefaultLayout from '@/components/Layouts/DefaultLayout';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import RequestPaymentTable from '@/components/UserComponent/Admin/RequestPaymentTable';

export default function Page() {
  return (
    <>
    <DefaultLayout>
        <Breadcrumb pageName="Requested Payment" />
        <RequestPaymentTable/>
    </DefaultLayout>
    </>
  );
}
