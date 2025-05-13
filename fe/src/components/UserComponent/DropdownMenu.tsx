import { ChangeEvent, Fragment, ReactNode, useRef, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { classNames } from '@/lib/utils';
import { AppDropdownMenu as DropdownMenu } from '@/components/UserComponent/DropdownMenu';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Button from '@/components/buttons/Button';
import Icon from '../Icon';

const Searchbar = () => {
  const router = useRouter();
  const { pathname } = router;
  const [input, setInput] = useState<string>('');
  const ref = useRef<HTMLInputElement>(null);

  const { getSearchRef } = useAppUtil();
  const { getToggleSearch, toggleSearch } = useAppUtil();
  const [theme] = useTheme();

  useEffect(() => {
    const query = new URL(window.location.href).searchParams.get('q');
    if (query) {
      setInput(query);
    }
    if (!pathname.includes('/search')) {
      setInput('');
    }
  }, [pathname]);

  useEffect(() => {
    getSearchRef(ref.current);
  }, [ref]);

  const handleSearch = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!isEmpty(input.trim()) && input.trim().length >= 3) {
        const path = pathname;

        if (path === '/search') {
          router.push('?q=' + input);
        } else {
          router.push('search?q=' + input);
        }
      }
    }
  };

  return (
    <>
      <div
        className={classNames(
          'h-full w-full',
          theme?.isMobile
            ? classNames(
                'absolute left-0 p-3 transition-all duration-300',
                toggleSearch ? 'bg-card top-0' : '-top-navbar'
              )
            : 'flex items-center'
        )}
      >
        <div
          className={classNames(
            'flex_justify_between h-full w-full',
            theme?.isMobile &&
              'border-divider bg-main rounded border px-3 duration-500 hover:border-onNeutralBg'
          )}
        >
          {theme?.isMobile && <Icon name="BiSearch" />}
          <input
            placeholder="Search songs, albums ..."
            className="focus:bg-card h-12 w-full flex-1 rounded border-onNeutralBg bg-transparent px-4 text-sm text-onNeutralBg outline-0"
            value={input}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setInput(e.target.value)
            }
            onKeyDown={handleSearch}
            ref={ref}
          />
          {theme?.isMobile && (
            <button
              className="flex_justify_center bg-sidebar hover:bg-red-500 h-8 w-8 rounded transition-colors duration-500"
              onClick={() => getToggleSearch(false)}
            >
              <Icon name="MdCancel" />
            </button>
          )}
        </div>
      </div>
      <div className="flex h-full items-center lg:hidden">
        <button
          className="flex_justify_center group h-12 w-12 rounded bg-primary-opacity transition-colors duration-500 hover:bg-primary"
          onClick={() => getToggleSearch(true)}
        >
          <Icon name="BiSearch" className="group-hover:!text-white" />
        </button>
      </div>
    </>
  );
};

const SignUpButtons = () => {
  const router = useRouter();

  return (
    <div className="flex items-center gap-0 px-4">
      <Button
        label="Sign Up"
        onClick={() => router.push('/register')}
        className="!border-onNeutralBg !text-onNeutralBg"
      />
      <Button
        variant="contained"
        label="Log In"
        onClick={() => router.push('/login')}
      />
    </div>
  );
};

export default SignUpButtons;

const notificationList = [
  {
    id: '1',
    content:
      'Mark Smith reacted to your recent added playlist - My first playlist',
    time: '1 minute ago',
  },
  {
    id: '2',
    content: 'Sarah Johnson created a new playlist - Downtown Music',
    time: '1 day ago',
  },
  {
    id: '3',
    content: 'Bob Manuel sent you a private message',
    time: '1 week ago',
  },
];

const NotificationButton = () => {
  return (
    <div className="flex h-full items-center">
      <DropdownMenu
        DropdownTrigger={() => (
          <div className="group relative">
            <div className="absolute right-2 top-2 flex h-4 w-4 animate-bounce items-center justify-center rounded-full bg-primary group-hover:bg-white">
              <span className="text-xs text-white group-hover:text-primary">
                {notificationList?.length}
              </span>
            </div>
            <div className="flex_justify_center h-12 w-12 rounded bg-primary-opacity transition-colors duration-500 group-hover:bg-primary">
              {/* <Icon
                  name="IoMdNotificationsOutline"
                  className="group-hover:!text-white"
                /> */}
            </div>
          </div>
        )}
        DropdownContent={() => (
          <div className="space-y-2 p-2">
            <div className="bg-main flex items-center gap-3 rounded p-3">
              <p className="text-base">All notifications</p>
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary group-hover:bg-white">
                <span className="text-xs text-white group-hover:text-primary">
                  {3}
                </span>
              </div>
            </div>
            <ul className="divide-divider list-none divide-y">
              {notificationList.map((item) => (
                <li
                  className="hover:bg-main cursor-pointer rounded p-3"
                  key={item.id}
                >
                  <Link className="flex gap-3" href="/notifications">
                    {/* <Icon name="IoMdNotificationsOutline" /> */}
                    <div className="flex flex-1 flex-col gap-1">
                      <p className="text-sm">{item.content}</p>
                      <span className="text-xs text-secondary">
                        {item.time}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <hr className="border-divider w-full border-t" />

            <Link
              className="inline-block w-full p-3 text-center text-sm hover:text-primary"
              href={'/notifications'}
            >
              See all notifications
            </Link>
          </div>
        )}
        contentClassName="w-[300px]"
      />
    </div>
  );
};
interface AppDropdownMenuProps {
  DropdownTrigger: () => ReactNode;
  DropdownContent: () => ReactNode;
  contentClassName?: string;
}

export function AppDropdownMenu({
  DropdownTrigger,
  DropdownContent,
  contentClassName,
}: AppDropdownMenuProps) {
  return (
    <Menu as="div" className="relative">
      <div>
        <Menu.Button className="w-full text-left">
          <DropdownTrigger />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={classNames(
            'bg-card shadow-box absolute right-0 z-10 mt-2 origin-top-right rounded text-onNeutralBg',
            contentClassName
          )}
        >
          <div className="p-1 text-sm">
            {DropdownContent && <DropdownContent />}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
function useAppUtil(): { getSearchRef: any } {
  throw new Error('Function not implemented.');
}
