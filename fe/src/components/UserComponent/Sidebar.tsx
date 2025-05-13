'use client';

import { FC, useEffect, useRef, useState } from 'react';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import {
  HomeOutlined,
  CompassOutlined,
  SearchOutlined,
  PlaySquareOutlined,
  HeartOutlined,
  PlayCircleOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MessageOutlined,
  AudioTwoTone
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSetAtom, useAtomValue } from 'jotai';
import { tokenAtom, userAtom } from '@/lib/atom/user.atom';
import { Modal, Button } from 'antd';

interface SidebarProps {
  setExpand: (value: boolean) => void;
}

const Sidebar: FC<SidebarProps> = ({ setExpand }) => {
  const user = useAtomValue(userAtom);
  const token = useAtomValue(tokenAtom);
  const setUser = useSetAtom(userAtom);
  const setToken = useSetAtom(tokenAtom);
  const router = useRouter();
  const realPath = usePathname();

  const [openedMenu, setOpenedMenu] = useState<Record<string, any>>({});
  const [activeName, setActiveName] = useState(realPath);
  const listRef = useRef<Record<string, HTMLUListElement | null>>({});

  const [isExpand, setIsExpand] = useState(true);
  const [isExpandOnHover, setIsExpandOnHover] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleHoverExpand = (value: boolean) => {
    if (!isExpand) {
      setIsExpandOnHover(value);
    }
  };

  useEffect(() => {
    setActiveName(realPath);
  }, [realPath]);

  const handleNavigate = (path: string) => {
    if (!user || !token) {
      if (path !== '/home' && path !== '/home/search-melody') {
        setShowLoginModal(true);
        return;
      }
    }
    router.push(path);
  };

  const handleToggle = (name: string) => {
    const rootEl = name.split('.')[0];

    if (openedMenu[name]?.open === true) {
      setOpenedMenu((prevState) => ({
        ...prevState,
        [name]: {
          open: false,
          height: '0px',
        },
        [rootEl]: {
          open: rootEl === name ? false : true,
          height: `${
            (listRef.current[rootEl]?.scrollHeight || 0) -
            (listRef.current[name]?.scrollHeight || 0)
          }px`,
        },
      }));
    } else {
      setOpenedMenu((prevState) => ({
        ...prevState,
        [name]: {
          open: true,
          height: `${listRef.current[name]?.scrollHeight || 0}px`,
        },
        [rootEl]: {
          open: true,
          height: `${
            (listRef.current[rootEl]?.scrollHeight || 0) +
            (listRef.current[name]?.scrollHeight || 0)
          }px`,
        },
      }));
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    router.push('/auth/signin');
  };

  const generateIcon = (icon: string) => {
    const icons_map: Record<string, JSX.Element> = {
      home: <HomeOutlined />,
      discover: <CompassOutlined />,
      library: <PlaySquareOutlined />,
      favourites: <HeartOutlined />,
      playlists: <PlayCircleOutlined />,
      profile: <UserOutlined />,
      settings: <SettingOutlined />,
      logout: <LogoutOutlined />,
      chat: <MessageOutlined />,
      search: <AudioTwoTone />,
    };

    return icons_map[icon] || null;
  };

  const generateMenu = (item: any, index: number, recursive: number = 0) => {
    if (activeName === '' && realPath.includes(item.link)) {
      setActiveName(item.name);
    }
    const classesActive = activeName === item.name ? 'active' : '';

    return (
      <li key={index}>
        <Link
          role="button"
          href={item.link || '/'}
          tabIndex={0}
          id={item.id}
          onClick={(e) => {
            e.preventDefault();
            if ('child' in item) {
              handleToggle(item.name);
            } else if ('link' in item) {
              handleNavigate(item.link);
            }
            if (item.id === 'logout') {
              handleLogout();
            }
          }}
          onKeyDown={(event) => {
            const { code } = event;
            if (code === 'Space') {
              if ('child' in item) {
                handleToggle(item.name);
              } else if ('link' in item) {
                handleNavigate(item.link);
              }
              if (item.id === 'logout') {
                handleLogout();
              }
            }
          }}
          className={[
            'group m-0 mb-1 flex h-12 cursor-pointer items-center justify-between rounded-lg py-0 pr-3 focus:outline-none',
            recursive === 0 ? 'pl-4' : recursive === 1 ? 'pl-11' : 'pl-16',
            activeName === item.name || activeName.split('.')[0] === item.name
              ? `font-semibold text-blue-600 ${
                  item.parent ? 'bg-blue-200/20 ' : 'bg-transparent'
                }`
              : `text-slate-500 ${item.parent && ''}`,
            'hover:bg-slate-300/20',
            classesActive,
          ].join(' ')}
        >
          <div className="flex items-center gap-3">
            {item.icon ? (
              item.icon === 'dot' ? (
                <div className="flex h-3 w-3 items-center justify-center">
                  <div
                    className={[
                      `${classesActive ? 'h-2 w-2' : 'h-1 w-1'}`,
                      'rounded-full bg-current transition duration-200',
                    ].join(' ')}
                  ></div>
                </div>
              ) : (
                generateIcon(item.icon)
              )
            ) : null}
            <div
              className={`truncate ${
                isExpand ? '' : isExpandOnHover ? '' : 'h-0 w-0 opacity-0'
              }`}
            >
              {item.title}
            </div>
          </div>
          {'child' in item ? (
            <div
              className={`${
                isExpand ? '' : isExpandOnHover ? '' : 'h-0 w-0 opacity-0'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          ) : (
            false
          )}
        </Link>
        {'child' in item ? (
          <ul
            ref={(el) => (listRef.current[item.name] = el)}
            className={[
              'transition-max-height overflow-hidden duration-300 ease-in-out',
              isExpand ? '' : isExpandOnHover ? '' : 'h-0',
            ].join(' ')}
            style={{ maxHeight: `${openedMenu[item.name]?.height || '0px'}` }}
            key={item.name}
          >
            {item.child.map((value: any, idx: number) =>
              generateMenu(value, idx, recursive + 1)
            )}
          </ul>
        ) : (
          false
        )}
      </li>
    );
  };

  return (
    <>
      <nav
        role="navigation"
        className={[
          'absolute inset-y-0 left-0 border-r border-slate-100 bg-neutralBgAlt shadow-sm',
          'transition-all duration-300 ease-in-out md:fixed',
          `${
            isExpand
              ? 'w-72 bg-neutralBgAlt'
              : isExpandOnHover
                ? 'w-72 bg-neutralBgAlt/70 backdrop-blur-md'
                : 'w-20 bg-neutralBgAlt'
          }`,
        ].join(' ')}
      >
        <button
          className="absolute -right-3 top-16 z-50 rounded-full border border-slate-200 bg-white p-0.5 text-slate-500 hover:bg-slate-100"
          onClick={() => {
            setIsExpand(!isExpand);
            setExpand(!isExpand);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`${
              isExpand ? 'rotate-0' : 'rotate-180'
            } h-4 w-4 transform transition duration-500`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <div
          onMouseEnter={() => handleHoverExpand(true)}
          onMouseLeave={() => handleHoverExpand(false)}
          className={`relative h-screen overflow-hidden`}
        >
          <SimpleBar style={{ height: '100%' }} autoHide>
            <div className="mb-0 list-none text-slate-500">
              <div
                className={`my-8 flex flex-col items-center overflow-x-hidden duration-300 ${
                  isExpand ? 'px-3' : isExpandOnHover ? 'px-3' : 'px-5'
                }`}
              >
                <Link
                  href={user && token ? "/home/profile" : "/auth/signin"}
                  className={`flex h-20 w-full items-center rounded-lg duration-300 ${
                    isExpand
                      ? 'gap-3 bg-slate-300/25 px-4'
                      : isExpandOnHover
                        ? 'gap-3 bg-slate-300/25 px-4'
                        : ''
                  }`}
                >
                  <div
                    className={`h-10 w-10 shrink-0 overflow-hidden rounded-full duration-300`}
                  >
                    <Image
                      src={user && token ? (user.img_url ? 'http://localhost:3001' + user.img_url : '/placeholder-user.jpg') : '/images/logo/logo.jpg'}
                      alt={user && token ? "User avatar" : "App logo"}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div
                    className={`flex flex-col ${
                      isExpand ? '' : isExpandOnHover ? '' : 'h-0 w-0 opacity-0'
                    }`}
                  >
                    <div
                      className={`truncate text-base font-semibold text-slate-700 duration-300`}
                    >
                      {user && token ? (user.full_name || 'User') : 'Guest'}
                    </div>
                    <div className={`truncate text-sm text-slate-500`}>
                      {user && token && user.role === 'Vip User' && (
                        <span className="inline-block rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-bold text-black">
                          VIP
                        </span>
                      )}
                      {(!user || !token) && (
                        <span className="text-xs">Click to sign in</span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>

              <div className="mb-10 mt-3 p-0 leading-10">
                <ul className="list-none px-3 text-sm font-normal">
                  {sidebarStructure.map((item, index) =>
                    generateMenu(item, index)
                  )}
                </ul>
              </div>
            </div>
          </SimpleBar>
        </div>
      </nav>
      <Modal
        title="Login Required"
        open={showLoginModal}
        onCancel={() => setShowLoginModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowLoginModal(false)}>
            Cancel
          </Button>,
          <Button
            key="login"
            type="primary"
            onClick={() => {
              router.push('/auth/signin');
              setShowLoginModal(false);
            }}
          >
            Go to Login
          </Button>,
        ]}
      >
        <p>You need to be logged in to access this page. Please log in to continue.</p>
      </Modal>
    </>
  );
};

export default Sidebar;

const sidebarStructure = [
  {
    id: 'home',
    title: 'Home',
    name: '/home',
    parent: false,
    icon: 'home',
    link: '/home',
  },
  {
    id: 'library',
    title: 'Library',
    name: '/home/library',
    parent: false,
    icon: 'library',
    link: '/home/library',
  },
  {
    id: 'favourites',
    title: 'Favourites',
    name: '/home/favourites',
    parent: false,
    icon: 'favourites',
    link: '/home/favourites',
  },
  {
    id: 'playlists',
    title: 'Playlists',
    name: '/home/playlist',
    parent: false,
    icon: 'playlists',
    link: '/home/playlist',
  },
  {
    id: 'chat',
    title: 'Chats',
    name: '/home/chat',
    parent: false,
    icon: 'chat',
    link: '/home/chat',
  },
  {
    id: 'search',
    title: 'Advance Search',
    name: '/home/search-melody',
    parent: false,
    icon: 'search',
    link: '/home/search-melody',
  },
];

