import DefaultLayout from '@/components/Layouts/DefaultLayout';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import AllPaymentTable from '@/components/UserComponent/Admin/AllPaymentTable';

export default function Page() {
  return (
    <>
    <DefaultLayout>
        <Breadcrumb pageName="All Payment" />
        <AllPaymentTable/>
    </DefaultLayout>
    </>
  );
}
