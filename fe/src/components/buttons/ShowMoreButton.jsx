import { classNames } from '@/lib/utils';

import { Icon } from '..';

export default function ShowMoreButton({ className, ...props }) {
  return (
    <button
      className={classNames(
        'hover:bg-sidebar mt-4 flex items-center justify-between gap-1 rounded-full border border-secondary p-2 text-sm text-secondary hover:text-onNeutralBg',
        className
      )}
      {...props}
    >
      See more
      <Icon name="BiChevronsRight" className="text-secondary" />
    </button>
  );
}
