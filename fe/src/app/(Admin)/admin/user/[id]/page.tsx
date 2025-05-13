import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import UserForm from '@/components/UserComponent/Admin/UserForm';

export default function Page({ params }: { params: { id: number } }) {
  return (
    <DefaultLayout>
      <div>
        <Breadcrumb pageName="Edit User" />
        <UserForm userId={params.id}></UserForm>
      </div>
    </DefaultLayout>
  );
}
