import { forwardRef } from 'react';

import { classNames } from '@/lib/utils';

import { Icon } from '@/components';

const IconButton = forwardRef(
  (
    {
      type = 'button',
      name,
      size,
      className,
      iconClassName,
      disabled,

      ...props
    },
    ref
  ) => {
    return (
      <button
        type={type}
        className={classNames(
          'flex h-10 w-10 items-center justify-center rounded-full outline-none transition-all duration-300 ease-linear hover:scale-[1.1] disabled:cursor-not-allowed disabled:opacity-50 ',
          className
        )}
        disabled={disabled}
        ref={ref}
        {...props}
      >
        <Icon name={name} size={size} className={iconClassName} />
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;
