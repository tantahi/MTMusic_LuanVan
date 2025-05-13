'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, ChevronDown, Music, User, Settings, LogOut, Receipt, CreditCard, ListCheck } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentModal } from '@/components/UserComponent/PaymentModal';
import { useSetAtom, useAtomValue } from 'jotai';
import { tokenAtom, userAtom } from '@/lib/atom/user.atom';
import { UserType } from '@/types';
import { deleteCookie } from '@/lib/utils';
import authService from '@/services/auth.service';

const stripePromise = loadStripe(
  'pk_test_51Ptwd9RuwfSTMxXEDOg4yP9eGWjHnxiOMVxnkUgTHVe8XHuY5yuVa13zSlX6sR1PGNqnHidjAGFzS4HiSIkDrDXB00gbiW5VjL'
);

export default function Header() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const user = useAtomValue(userAtom)
    const setUser = useSetAtom(userAtom)
    const setToken = useSetAtom(tokenAtom)
    const token = useAtomValue(tokenAtom);
    const router = useRouter();
  
    useEffect(() => {
      const fetchUser = async () => {
        const data = await authService.getMe(token);
        setUser(data.user);
      };
    
      if (token) {
        fetchUser();
      }
    }, [token, setUser]);
  
    const showModal = () => {
      setIsModalVisible(true);
    };
  
    const handleCancel = () => {
      setIsModalVisible(false);
    };
  
    const handleLogout = () => {
      setUser(null);
      setToken(null)
      deleteCookie('token')
      deleteCookie('user')
      router.push('/auth/signin');
    };
  
    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/home/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    };

  return (
    <header className="sticky top-0 z-99 bg-switchBg p-2 text-onNeutralBg shadow-lg dark:bg-dark-switchBg dark:text-dark-onNeutralBg">
      <Elements stripe={stripePromise}>
        <PaymentModal visible={isModalVisible} onCancel={handleCancel} />
      </Elements>
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex flex-grow items-center space-x-4">
          <Music
            className="h-8 w-8 text-primary dark:text-dark-primary"
            aria-label="Music Icon"
          />
          <form onSubmit={handleSearch} className="relative max-w-2xl flex-grow">
            <input
              type="text"
              placeholder="Search for songs, artists, or albums..."
              className="w-full rounded-full bg-neutralBgAlt bg-opacity-20 px-4 py-2 pl-10 text-sm placeholder-onNeutralBgSecondary focus:outline-none focus:ring-2 focus:ring-primary dark:bg-dark-neutralBgAlt dark:bg-opacity-20 dark:placeholder-dark-onNeutralBgSecondary dark:focus:ring-dark-primary"
              aria-label="Search input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute left-3 top-2.5">
              <Search
                className="h-5 w-5 text-onNeutralBgSecondary dark:text-dark-onNeutralBgSecondary"
                aria-hidden="true"
              />
            </button>
          </form>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {user.role !== 'Vip User' && (
                <button
                  className="transform rounded-full bg-primary px-4 py-2 font-bold text-neutralBgAlt transition duration-300 ease-in-out hover:scale-105 hover:bg-primary-light-gray dark:bg-dark-primary dark:text-dark-neutralBgAlt dark:hover:bg-dark-primary-light-gray"
                  aria-label="Update VIP"
                  onClick={showModal}
                >
                  Update VIP
                </button>
              )}

              <button
                className="relative rounded-full p-2 transition duration-300 hover:bg-cardBgHover hover:bg-opacity-10 dark:hover:bg-dark-cardBgHover dark:hover:bg-opacity-10"
                aria-label="Notifications"
              >
                <Bell className="h-6 w-6" />
                <span
                  className="bg-red-500 absolute right-0 top-0 block h-2 w-2 rounded-full ring-2 ring-switchBg dark:ring-dark-switchBg"
                  aria-hidden="true"
                ></span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 rounded-full p-2 transition duration-300 hover:bg-cardBgHover hover:bg-opacity-10 dark:hover:bg-dark-cardBgHover dark:hover:bg-opacity-10"
                  aria-haspopup="true"
                  aria-expanded={isDropdownOpen}
                >
                  <Image
                    src={user.img_url? 'http://localhost:3001'+ user?.img_url : ''}
                    alt="User avatar"
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                  <span className="font-medium">
                    {user.full_name || 'User'}
                    {user.role === 'Vip User' && (
                      <span className="ml-1 inline-block rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-bold text-black">
                        VIP
                      </span>
                    )}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md bg-cardBg py-1 shadow-lg dark:bg-dark-cardBg">
                                        <Link
                      href="/home/purchase-list"
                      className="block flex items-center px-4 py-2 text-sm text-onNeutralBg hover:bg-cardBgHover dark:text-dark-onNeutralBg dark:hover:bg-dark-cardBgHover"
                    >
                      <ListCheck className="mr-2 h-4 w-4" />
                      Your media purchase list
                    </Link>
                    <Link
                      href="/home/payment"
                      className="block flex items-center px-4 py-2 text-sm text-onNeutralBg hover:bg-cardBgHover dark:text-dark-onNeutralBg dark:hover:bg-dark-cardBgHover"
                    >
                      <Receipt className="mr-2 h-4 w-4" />
                      Your Payouts
                    </Link>
                    <Link
                      href="/home/payment/receipt"
                      className="block flex items-center px-4 py-2 text-sm text-onNeutralBg hover:bg-cardBgHover dark:text-dark-onNeutralBg dark:hover:bg-dark-cardBgHover"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Payment Receipts
                    </Link>
                    <Link
                      href="/home/myaccount"
                      className="block flex items-center px-4 py-2 text-sm text-onNeutralBg hover:bg-cardBgHover dark:text-dark-onNeutralBg dark:hover:bg-dark-cardBgHover"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Account
                    </Link>

                    {/* {user.role !== "Vip User" && (
                      <Link
                        href="/home/payment"
                        className="block flex items-center px-4 py-2 text-sm text-onNeutralBg hover:bg-cardBgHover dark:text-dark-onNeutralBg dark:hover:bg-dark-cardBgHover"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Upgrade to VIP
                      </Link>
                    )} */}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-left text-sm text-onNeutralBg hover:bg-cardBgHover dark:text-dark-onNeutralBg dark:hover:bg-dark-cardBgHover"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                className="rounded-full bg-primary px-4 py-2 font-bold text-neutralBgAlt transition duration-300 hover:scale-105 hover:bg-primary-light-gray dark:bg-dark-primary dark:text-dark-neutralBgAlt dark:hover:bg-dark-primary-light-gray"
                onClick={() => router.push('/auth/signin')}
                aria-label="Login"
              >
                Login
              </button>
              <button
                className="rounded-full border-2 border-primary px-4 py-2 font-bold text-primary transition duration-300 hover:scale-105 hover:bg-primary dark:border-dark-primary dark:text-dark-primary"
                onClick={() => router.push('/auth/signup')}
                aria-label="Register"
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

