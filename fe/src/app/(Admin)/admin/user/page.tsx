import DefaultLayout from '@/components/Layouts/DefaultLayout';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import UserTable from '@/components/UserComponent/Admin/UserTable';

export default function Page() {
  return (
    <DefaultLayout>
      <div>
        <Breadcrumb pageName="User" />
        <UserTable></UserTable>
      </div>
    </DefaultLayout>
  );
}
