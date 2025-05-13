'use client';
import React, { useEffect, useState } from 'react';
import Loader from '@/components/common/Loader';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState<boolean>(true);

  // const pathname = usePathname();

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <DefaultLayout>
      {loading ? <Loader /> : children}
    </DefaultLayout>
  );
}
