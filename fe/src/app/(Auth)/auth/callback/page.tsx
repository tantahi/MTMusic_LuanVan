'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import authservice from '@/services/auth.service';
import { UserType } from '@/types';
import { setCookie, getUserCookie } from '@/lib/utils';
import Loader from '@/components/common/Loader'; // Import the Loader component
import { notification } from 'antd';
import { useSetAtom, useAtomValue } from 'jotai';
import { userAtom, tokenAtom } from '@/lib/atom/user.atom';

const Callback = () => {
  const router = useRouter();
  const setUser = useSetAtom(userAtom)
  const setToken = useSetAtom(tokenAtom)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { token, user }: { token: string; user: UserType } =
          await authservice.fetchGoogleUser();

        setCookie('user', JSON.stringify(user), 10);
        setCookie('token', token, 10);
        setToken(token)
        setUser(user); // Set the user state in Jotai
        // Redirect based on user role
        notification.success({
          message: `Successfully logged in as a ${user.role}`,
          placement: 'bottomRight',
        });
        console.log(user.role);
        if (user.role === 'Admin') {
          router.push('/admin');
        } else if (user.role === 'Staff') {
          router.push('/admin/staff');
        } else {
          router.push('/home');
        }
      } catch (error) {
        // Error type and message handling
        const errorMessage =
          (error as { message: string })?.message ||
          'An unexpected error occurred';
        notification.error({ message: errorMessage, placement: 'bottomRight' });
        router.push('/auth/google');
      }
    };
    fetchUser();
  }, [router]);

  return (
    <div>
      {/* Replace the text with the Loader component */}
      <Loader />
    </div>
  );
};

export default Callback;
