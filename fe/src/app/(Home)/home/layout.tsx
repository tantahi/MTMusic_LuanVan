import UserLayout from '@/components/Layouts/UserLayout';
export default function Layout({ children }: { children: React.ReactNode }) {
  return <UserLayout>{children}</UserLayout>;
}
