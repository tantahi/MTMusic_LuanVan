// src/components/UserLayout.tsx
'use client';

import Header from '@/components/UserComponent/Header';
import Sidebar from '@/components/UserComponent/Sidebar';
import { useState, ReactNode } from 'react';
import MyPlayer from '@/components/Player';
import SidebarRight from '@/components/UserComponent/SideRight';
import { PlayerProvider } from '@/contexts/PlayerContext';

interface UserLayoutProps {
  children: ReactNode;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  const [sideMenuIsExpand, setSideMenuIsExpand] = useState(true);

  return (
    <PlayerProvider>
      <div className="relative min-h-screen md:flex">
        <Sidebar setExpand={setSideMenuIsExpand} />
        <div
          className={`mx-0 min-h-screen flex-1 bg-slate-100 transition-all duration-300 ease-in-out ${
            sideMenuIsExpand ? 'md:ml-72' : 'md:ml-20'
          }`}
        >
          <main className="container relative w-full">
            <div className="flex">
              <div className="relative w-full">
                <Header />
                <div className="mb-18 px-4 py-8">{children}</div>
              </div>
              <div className="min-w-[280px]"></div>
              <div className="fixed right-0 top-0 h-full min-w-[280px] bg-neutralBgAlt">
                <SidebarRight />
              </div>
            </div>
          </main>
        </div>
        <div
          className={`fixed bottom-0 left-0 w-full transition-all duration-300 ease-in-out ${
            sideMenuIsExpand ? 'md:pl-72 pr-[280px]' : 'md:pl-20 pr-[280px]'
          }`}
        >
          <MyPlayer />
        </div>
      </div>
    </PlayerProvider>
  );
};

export default UserLayout;