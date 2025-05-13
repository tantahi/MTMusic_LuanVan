import DefaultLayout from '@/components/Layouts/DefaultLayout';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import StaffTable from '@/components/UserComponent/Admin/StaffTable';

export default function Page() {
  return (
    <DefaultLayout>
      <div>
        <Breadcrumb pageName="Staff" />
        <StaffTable></StaffTable>
      </div>
    </DefaultLayout>
  );
}
