import DefaultLayout from '@/components/Layouts/DefaultLayout';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import VipUserTable from '@/components/UserComponent/Admin/VipUserTable';

export default function Page() {
  return (
    <DefaultLayout>
      <div>
        <Breadcrumb pageName="Vip User" />
        <VipUserTable></VipUserTable>
      </div>
    </DefaultLayout>
  );
}
