import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import SidebarItem from '@/components/Sidebar/SidebarItem';
import ClickOutside from '@/components/ClickOutside';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useAtomValue } from 'jotai'
import { userAtom, tokenAtom } from '@/lib/atom/user.atom'
import {
  DashboardOutlined,
  UserOutlined,
  PlaySquareOutlined,
  ProfileOutlined,
  SolutionOutlined,
  DollarOutlined,
  FlagOutlined,
  OrderedListOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const menuGroups = [
  {
    name: 'MAIN PANEL',
    menuItems: [
      {
        icon: <DashboardOutlined />,
        label: 'Dashboard',
        route: '/admin',
        // children: [{ label: 'Overview', route: '/admin' }],
        staffAccess: false,
      },
      {
        icon: <UserOutlined />,
        label: 'User Management',
        route: '/admin/user',
        children: [
          { label: 'VIP Users', route: '/admin/vip-user' },
          { label: 'Staff Members', route: '/admin/staff' },
        ],
        staffAccess: false,
      },
      {
        icon: <PlaySquareOutlined />,
        label: 'Media Management',
        route: '/admin/media',
        staffAccess: true,
      },
      {
        icon: <OrderedListOutlined />,
        label: 'Album Management',
        route: '/admin/playlist',
        staffAccess: true,
      },
      {
        icon: <CreditCardOutlined />,
        label: 'Payment Management',
        route: '/admin/payment/all',
        staffAccess: false,
      },
    ],
  },
  {
    name: 'Processing Features',
    menuItems: [
      {
        icon: <ProfileOutlined />,
        label: 'Media Approvals',
        route: '/admin/media/approval',
        staffAccess: true,
      },
      {
        icon: <DollarOutlined />,
        label: 'Payment Processing',
        route: '/admin/payment',
        staffAccess: false,
      },
      {
        icon: <FlagOutlined />,
        label: 'Report Handling',
        route: '/admin/report',
        staffAccess: true,
      },
    ],
  },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const pathname = usePathname();
  const [pageName, setPageName] = useLocalStorage('selectedMenu', 'dashboard');
  const user = useAtomValue(userAtom)
  const token = useAtomValue(tokenAtom)

  const isStaff = user?.role === 'Staff';

  const filteredMenuGroups = menuGroups.map(group => ({
    ...group,
    menuItems: group.menuItems.filter(item => !isStaff || item.staffAccess)
  })).filter(group => group.menuItems.length > 0);

  return (
    <ClickOutside onClick={() => setSidebarOpen(false)}>
      <aside
        className={`fixed left-0 top-0 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
          <Link href="/">
            <Image width={120} height={32} src={'/images/logo/logo.jpg'} alt="Logo" priority />
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            className="block lg:hidden"
          >
            <svg
              className="fill-current"
              width="20"
              height="18"
              viewBox="0 0 20 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
                fill=""
              />
            </svg>
          </button>
        </div>
        {/* Sidebar Header */}

        {/* Sidebar Menu */}
        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
          <nav className="mt-5 px-4 py-4 lg:mt-9 lg:px-6">
            {filteredMenuGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
                  {group.name}
                </h3>
                <ul className="mb-6 flex flex-col gap-1.5">
                  {group.menuItems.map((menuItem, menuIndex) => (
                    <SidebarItem
                      key={menuIndex}
                      item={menuItem}
                      pageName={pageName}
                      setPageName={setPageName}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </ClickOutside>
  );
};

export default Sidebar;

